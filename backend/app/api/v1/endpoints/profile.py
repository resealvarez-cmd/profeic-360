from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
router = APIRouter()

# --- CONEXIÓN SUPABASE ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

# --- MODELOS ---
class ProfileUpdate(BaseModel):
    full_name: str | None = None
    asignatura_principal: str | None = None
    niveles: list[str] | None = None
    estilo_pedagogico: str | None = None
    objetivos_2026: str | None = None

class UserProfile(ProfileUpdate):
    id: str
    email: str | None = None
    avatar_url: str | None = None

# --- ENDPOINTS ---

@router.get("/api/profile/{user_id}")
async def get_profile(user_id: str):
    if not supabase: raise HTTPException(status_code=500, detail="Error de configuración del servidor (Supabase)")
    
    try:
        # 1. Intentar obtener el perfil de la tabla 'profiles'
        response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        else:
            # Si no existe perfil (ej: usuario antiguo), intentar crearlo o devolver 404
            # Por ahora, devolvemos un objeto vacío seguro
            return {"id": user_id, "message": "Perfil no encontrado, cree uno nuevo."}

    except Exception as e:
        print(f"❌ Error al obtener perfil: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/api/profile/{user_id}")
async def update_profile(user_id: str, profile: ProfileUpdate):
    if not supabase: raise HTTPException(status_code=500, detail="Error de configuración del servidor")

    try:
        # Filtrar campos no nulos para actualizar
        data_to_update = {k: v for k, v in profile.model_dump().items() if v is not None}
        
        # Upsert (Actualizar o Insertar)
        data_to_update["id"] = user_id
        data_to_update["updated_at"] = "now()"
        
        response = supabase.table("profiles").upsert(data_to_update).execute()
        
        return {"status": "success", "data": response.data}
        
    except Exception as e:
        print(f"❌ Error al actualizar perfil: {e}")
        raise HTTPException(status_code=500, detail=str(e))
