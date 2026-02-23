from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

router = APIRouter(prefix="/social", tags=["Social Engine"])

# --- CONFIGURACIÓN DB ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("⚠️ ADVERTENCIA SOCIAL: No se configuró Supabase.")

# --- MODELOS ---
class NoticiaRequest(BaseModel):
    titulo: str
    cuerpo: str
    es_importante: bool = False
    etiqueta: str = "Información"
    autor_id: str

class ComentarioRequest(BaseModel):
    recurso_id: str
    usuario_id: str
    usuario_nombre: str
    contenido: str

class LikeRequest(BaseModel):
    recurso_id: str
    usuario_id: str

# --- ENDPOINTS NOTICIAS ---
@router.post("/noticias")
async def crear_noticia(noticia: NoticiaRequest):
    if not supabase: raise HTTPException(500, "DB no configurada")
    try:
        res = supabase.table("noticias").insert(noticia.dict()).execute()
        return res.data
    except Exception as e:
        print(f"❌ Error creando noticia: {e}")
        raise HTTPException(500, str(e))

@router.get("/noticias")
async def obtener_noticias():
    if not supabase: raise HTTPException(500, "DB no configurada")
    try:
        # Traer últimas 5, ordenadas por fecha descendente
        res = supabase.table("noticias").select("*").order("created_at", desc=True).limit(5).execute()
        return res.data
    except Exception as e:
        print(f"❌ Error noticias: {e}")
        return []

# --- ENDPOINTS INTERACCIONES ---
@router.post("/comentar")
async def comentar_recurso(comentario: ComentarioRequest):
    if not supabase: raise HTTPException(500, "DB no configurada")
    try:
        res = supabase.table("comentarios").insert(comentario.dict()).execute()
        return res.data
    except Exception as e:
        print(f"❌ Error comentando: {e}")
        raise HTTPException(500, str(e))

@router.get("/comentarios/{recurso_id}")
async def ver_comentarios(recurso_id: str):
    if not supabase: raise HTTPException(500, "DB no configurada")
    try:
        res = supabase.table("comentarios").select("*").eq("recurso_id", recurso_id).order("created_at", desc=False).execute()
        return res.data
    except Exception as e:
        print(f"❌ Error obteniendo comentarios: {e}")
        return []

@router.post("/like")
async def toggle_like(like: LikeRequest):
    if not supabase: raise HTTPException(500, "DB no configurada")
    try:
        # 1. Verificar si ya existe 
        existing = supabase.table("reacciones").select("*").eq("recurso_id", like.recurso_id).eq("usuario_id", like.usuario_id).execute()
        
        if existing.data and len(existing.data) > 0:
            # 2a. Si existe, BORRAR (Unlike)
            print(f"💔 Unlike: {like.usuario_id} -> {like.recurso_id}")
            supabase.table("reacciones").delete().eq("id", existing.data[0]['id']).execute()
            return {"status": "unliked"}
        else:
            # 2b. Si no existe, CREAR (Like)
            print(f"❤️ Like: {like.usuario_id} -> {like.recurso_id}")
            supabase.table("reacciones").insert({"recurso_id": like.recurso_id, "usuario_id": like.usuario_id, "tipo": "like"}).execute()
            return {"status": "liked"}
            
    except Exception as e:
        print(f"❌ Error like: {e}")
        raise HTTPException(500, str(e))
