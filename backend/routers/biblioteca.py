from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import os
from supabase import create_client, Client
from fastapi import UploadFile, File, Form
from app.services.storage import storage
from app.services.file_engine import extract_text_from_pdf
from routers.deps import get_current_user_id


router = APIRouter(
    prefix="/biblioteca",
    tags=["Biblioteca"]
)

# --- CONFIGURACIÓN SUPABASE ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
# Usar Service Role Key para operaciones admin (bypassea RLS)
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("⚠️ ADVERTENCIA: Supabase no configurado en biblioteca.py")

# --- MODELO UNIVERSAL ---
# NOTA: user_id ya NO va en el body — se extrae del JWT en el servidor
class RecursoUniversal(BaseModel):
    tipo: str
    titulo: str
    asignatura: str = "General"
    nivel: str = "General"
    contenido: dict

# --- 1. LEER TODOS (GET) — requiere auth, filtra por el usuario autenticado ---
@router.get("/all")
async def obtener_recursos(user_id: str = Depends(get_current_user_id)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Base de datos no conectada")
    
    try:
        response = supabase.table("biblioteca_recursos")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
            
        return response.data
    except Exception as e:
        print(f"Error leyendo biblioteca: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- 1.5 UPLOAD & EXTRACT (INGESTA) ---
@router.post("/upload")
async def upload_resource(
    file: UploadFile = File(...),
    authorization: str = Header(None),
):
    """
    Recibe un PDF, lo sube a Storage y extrae su texto.
    """
    print(f"📂 Recibiendo archivo: {file.filename}")
    
    try:
        # 1. Leer contenido (para extracción)
        content = await file.read()
        
        if not content:
            raise HTTPException(status_code=400, detail="Archivo vacío")

        # 2. Subir a Supabase Storage
        await file.seek(0)
        
        # Extraer user_id del token si viene, si no usar 'anonymous' como carpeta
        upload_user_id = "anonymous"
        if authorization and supabase:
            try:
                token = authorization.replace("Bearer ", "").strip()
                user_resp = supabase.auth.get_user(token)
                if user_resp and user_resp.user:
                    upload_user_id = user_resp.user.id
            except Exception as auth_err:
                print(f"⚠️ No se pudo validar token en upload: {auth_err}")
        
        upload_result = storage.upload_file(file, upload_user_id)
        
        # 3. Extraer Texto
        # Necesitamos los bytes de nuevo. storage.upload_file hizo seek(0) al final?
        # Revisando storage.py: "file.file.seek(0)" al final. Sí.
        # Pero await file.read() es async, storage.py usa file.file.read() que es sync wrapper.
        # Vamos a leerlo de nuevo o usar el content que ya leímos.
        # Usaremos 'content' que ya leímos en paso 1.
        
        extracted_text = await extract_text_from_pdf(content)
        
        if not extracted_text:
            print("⚠️ No se pudo extraer texto o PDF vacío/imagen.")
            
        # 4. Respuesta
        return {
            "filename": file.filename,
            "storage_path": upload_result.get("full_path"),
            "extracted_text_preview": extracted_text[:200] + "...",
            "full_text": extracted_text, # <--- CRÍTICO: Texto completo para RAG
            "char_count": len(extracted_text)
        }

    except Exception as e:
        print(f"❌ Error en upload: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- 2. GUARDAR (POST) — user_id desde JWT, nunca del body ---
@router.post("/save") 
async def guardar_recurso(
    data: RecursoUniversal,
    user_id: str = Depends(get_current_user_id)  # ← JWT verificado server-side
):
    if not supabase:
        raise HTTPException(status_code=500, detail="DB no conectada")
    
    try:
        print(f"💾 Guardando {data.tipo} para usuario {user_id}")
        
        registro = {
            "user_id": user_id,   # ← viene del JWT verificado, no del body
            "tipo": data.tipo,
            "titulo": data.titulo,
            "asignatura": data.asignatura,
            "nivel": data.nivel,
            "contenido": data.contenido
        }
        
        res = supabase.table("biblioteca_recursos").insert(registro).execute()
        
        if res.data:
            recurso_id = res.data[0]['id']
            
            # --- NUEVO: Registrar en cobertura_curricular ---
            try:
                oas_a_registrar = set()
                contenido = data.contenido
                
                # 1. Extraer oas de oaId o oaDescripcion (Rúbricas, etc)
                if "oaId" in contenido and contenido["oaId"] and str(contenido["oaId"]).lower() != "manual":
                    oas_a_registrar.add(str(contenido["oaId"]))
                elif "oaDescripcion" in contenido and contenido["oaDescripcion"]:
                    oas_a_registrar.add(str(contenido["oaDescripcion"])[:255])
                    
                # 2. Extraer de oaTexts (usado en Evaluaciones)
                if "oaTexts" in contenido and isinstance(contenido["oaTexts"], list):
                    for oa in contenido["oaTexts"]:
                        if oa: oas_a_registrar.add(str(oa)[:255])
                        
                # 3. Extraer de customOa
                if "customOa" in contenido and contenido["customOa"]:
                    oas_a_registrar.add(str(contenido["customOa"])[:255])

                # 4. Planificador / Otros que envían su propio array
                # Si en el futuro planificador envía `mochila` o la IA devuelve `oas_asociados`
                if "oas_asociados" in contenido and isinstance(contenido["oas_asociados"], list):
                    for oa in contenido["oas_asociados"]:
                        if oa: oas_a_registrar.add(str(oa)[:255])
                
                # Para planificador, la lista de OAs seleccionados suele estar en 'mochila'
                if "mochila" in contenido and isinstance(contenido["mochila"], list):
                    for oa_item in contenido["mochila"]:
                        if isinstance(oa_item, dict) and "descripcion" in oa_item:
                            oas_a_registrar.add(str(oa_item["descripcion"])[:255])
                
                # Para evitar basura
                if data.asignatura.lower() not in ["", "general", "manual"] and \
                   data.nivel.lower() not in ["", "general", "manual"]:
                    
                    cobertura_records = []
                    for oa in oas_a_registrar:
                        cobertura_records.append({
                            "user_id": user_id,   # ← JWT verificado
                            "nivel": data.nivel,
                            "asignatura": data.asignatura,
                            "oa_id": str(oa),
                            "recurso_id": recurso_id,
                            "tipo_recurso": data.tipo
                        })
                    
                    if cobertura_records:
                        supabase.table("cobertura_curricular").insert(cobertura_records).execute()
                        print(f"✅ Registrados {len(cobertura_records)} OAs en la cobertura curricular.")
                        
            except Exception as ex:
                print(f"⚠️ Error al registrar cobertura curricular: {ex}")
                # No bloqueamos el guardado del recurso principal si falla el registro de cobertura
                
            return {"status": "success", "id": recurso_id}
        else:
            raise Exception("No se recibió confirmación de Supabase")
        
    except Exception as e:
        print(f"❌ Error guardando en biblioteca_recursos: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=str(e))