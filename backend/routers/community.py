from fastapi import APIRouter, HTTPException, Body, Header
from typing import List, Optional, Union
from pydantic import BaseModel
from supabase import create_client, Client, ClientOptions
import os


router = APIRouter()

# Supabase Auth & Client
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
service_key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

# Prefer Service Role Key for Admin/Backend operations to bypass RLS
if service_key:
    print("🔐 Usando Service Role Key para operaciones de comunidad (Bypass RLS)")
    supabase: Client = create_client(url, service_key)
else:
    print("⚠️ Usando Anon Key. Es probable que RLS bloquee actualizaciones si no hay sesión.")
    supabase: Client = create_client(url, key)

# --- MODELS ---
class CommunityItem(BaseModel):
    id: Union[int, str]
    type: str 
    title: str
    description: Optional[str] = None
    author: Optional[str] = "Profe IC"
    level: Optional[str] = None
    subject: Optional[str] = None
    created_at: str
    file_url: Optional[str] = None

class ShareRequest(BaseModel):
    resource_id: Union[int, str]
    is_public: bool

class CloneRequest(BaseModel):
    resource_id: Union[int, str]
    new_author_id: str 
    # resource_type opcional

# --- ENDPOINTS ---

@router.get("/community/feed", response_model=List[CommunityItem])
async def get_community_feed():
    """
    Retorna las últimas 20 publicaciones públicas de biblioteca_recursos.
    """
    try:
        # Consultamos la tabla única
        response = supabase.table("biblioteca_recursos")\
            .select("id, tipo, titulo, contenido, nivel, asignatura, created_at, author_name")\
            .eq("is_public", True)\
            .order("created_at", desc=True)\
            .limit(20)\
            .execute()

        feed = []

        for item in response.data:
            # Intentamos extraer una descripción o resumen del contenido
            contenido = item.get('contenido') or {}
            
            # Lógica para extraer descripción basada en la estructura del JSON contenido
            descripcion = "Sin descripción"
            if isinstance(contenido, dict):
                # Intentar varios campos posibles dependiendo del tipo de recurso
                descripcion = (
                    contenido.get('estrategia_aprendizaje_sentencia') or 
                    contenido.get('description') or 
                    contenido.get('descripcion') or 
                    contenido.get('diagnosis') or
                    "Recurso compartido en la comunidad del Colegio Madre Paulina"
                )
            
            # Recortar descripción
            if len(descripcion) > 150:
                descripcion = descripcion[:150] + "..."

            feed.append(CommunityItem(
                id=item['id'],
                type=item.get('tipo', 'GENERAL'), # Ej: 'PLANIFICACION', 'EVALUACION'
                title=item.get('titulo', 'Sin Título'),
                description=descripcion,
                author=item.get('author_name', 'Profe Anónimo'),
                level=item.get('nivel'),
                subject=item.get('asignatura'),
                created_at=item['created_at'],
                file_url=contenido.get('file_url') or contenido.get('url_archivo')
            ))

        return feed

    except Exception as e:
        print(f"❌ Error Feed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/community/share")
async def share_resource(req: ShareRequest, authorization: Optional[str] = Header(None)):
    """
    Publica u oculta un recurso en biblioteca_recursos.
    Usa el token del usuario (si se provee) para respetar RLS.
    """
    try:
        current_client = supabase
        
        # Si recibimos token, creamos cliente autenticado (Scoped User Context)
        if authorization:
            token = authorization.replace("Bearer ", "")
            # Crear cliente temporal con el token del usuario usando ClientOptions
            current_client = create_client(
                url, 
                key, 
                options=ClientOptions(headers={"Authorization": f"Bearer {token}"})
            )
            print(f"🔐 Usando contexto de usuario autenticado para actualizar recurso {req.resource_id}")

        print(f"🔄 Intentando actualizar recurso {req.resource_id} a is_public={req.is_public}")
        
        # Prepare update data
        update_data = {"is_public": req.is_public}
        
        # Si estamos PUBLICANDO (is_public=True), actualizamos created_at para que aparezca primero en el feed
        if req.is_public:
            from datetime import datetime
            update_data["created_at"] = datetime.now().isoformat()
            
            # Intentar obtener el nombre actualizado del perfil del usuario
            try:
                # IMPORTANTE: Debemos pasar el token explícitamente a get_user para validar la sesión
                # Solo podemos hacer esto si 'authorization' vino en el request
                if authorization:
                   token = authorization.replace("Bearer ", "") # Redundant but safe if scope is weird, though token maps to outer scope if Python 3.
                   user_response = current_client.auth.get_user(token)
                   if user_response and user_response.user:
                       uid = user_response.user.id
                       # Usar service_role key para leer profiles si es necesario, o el cliente autenticado
                       profile = current_client.table("profiles").select("full_name").eq("id", uid).single().execute()
                       if profile.data and profile.data.get("full_name"):
                           update_data["author_name"] = profile.data["full_name"]
                           print(f"👤 Actualizando autor a: {update_data['author_name']}")
            except Exception as e_prof:
                print(f"⚠️ No se pudo actualizar nombre del autor: {e_prof}")

        # Ejecutar update
        response = current_client.table("biblioteca_recursos")\
            .update(update_data)\
            .eq("id", req.resource_id)\
            .execute()
        
        # Verificar si se actualizó algo (Opcional: Si RLS permite ver pero no editar, data podría venir vacía)
        if not response.data:
            print(f"⚠️ No se actualizó ninguna fila. ID: {req.resource_id}")
            # No lanzamos 404 estricto para evitar romper flujo si es un falso negativo de RLS
            # Pero logueamos.
        
        print(f"✅ Recurso actualizado: {response.data[0] if response.data else 'Sin data retornada'}")
        return {"success": True, "message": f"Recurso {req.is_public and 'Publicado' or 'Ocultado'}"}
    except Exception as e:
        print(f"❌ Error Share: {e}")
        # Retornar error genérico 500 pero loguear detalle
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/community/clone")
async def clone_resource(req: CloneRequest):
    """
    Clona un recurso público de biblioteca_recursos a la biblioteca personal del usuario.
    """
    try:
        # 1. Obtener original
        original = supabase.table("biblioteca_recursos").select("*").eq("id", req.resource_id).execute()
        
        if not original.data:
            raise HTTPException(status_code=404, detail="Recurso no encontrado")
            
        data = original.data[0]
        
        # 2. Limpiar campos únicos
        del data['id']
        del data['created_at']
        
        # 3. Asignar nuevo dueño y resetear público
        data['user_id'] = req.new_author_id
        data['is_public'] = False 
        
        # Añadir marca de clonado al título y actualizar autor
        data['titulo'] = f"{data.get('titulo', 'Copia')} (Clonado)"
        data['author_name'] = f"{data.get('author_name', 'Anon')} (Original)" 

        # 4. Insertar copia
        new_resource = supabase.table("biblioteca_recursos").insert(data).execute()
        
        if new_resource.data:
            return {"success": True, "new_id": new_resource.data[0]['id']}
        else:
            raise HTTPException(status_code=500, detail="Error al clonar")

    except Exception as e:
        print(f"❌ Error Clone: {e}")
        raise HTTPException(status_code=500, detail=str(e))
