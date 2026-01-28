from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

router = APIRouter(
    prefix="/biblioteca",
    tags=["Biblioteca"]
)

# --- CONFIGURACIÓN SUPABASE ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("⚠️ ADVERTENCIA: Supabase no configurado en biblioteca.py")

# --- MODELO UNIVERSAL ---
class RecursoUniversal(BaseModel):
    user_id: str
    tipo: str        
    titulo: str      
    asignatura: str = "General"
    nivel: str = "General"
    contenido: dict  

# --- 1. LEER TODOS (GET) ---
@router.get("/all")
async def obtener_recursos():
    if not supabase:
        raise HTTPException(status_code=500, detail="Base de datos no conectada")
    
    try:
        # CORREGIDO: Volvemos a tu tabla real 'biblioteca_recursos'
        response = supabase.table("biblioteca_recursos")\
            .select("*")\
            .order("created_at", desc=True)\
            .execute()
            
        return response.data
    except Exception as e:
        print(f"Error leyendo biblioteca: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- 2. GUARDAR (POST) ---
@router.post("/save") 
async def guardar_recurso(data: RecursoUniversal):
    if not supabase:
        raise HTTPException(status_code=500, detail="DB no conectada")
    
    try:
        print(f"💾 Guardando {data.tipo} para usuario {data.user_id}")
        
        registro = {
            "user_id": data.user_id,
            "tipo": data.tipo,
            "titulo": data.titulo,
            "asignatura": data.asignatura,
            "nivel": data.nivel,
            "contenido": data.contenido
        }
        
        # CORREGIDO: Volvemos a tu tabla real 'biblioteca_recursos'
        res = supabase.table("biblioteca_recursos").insert(registro).execute()
        
        if res.data:
            return {"status": "success", "id": res.data[0]['id']}
        else:
            raise Exception("No se recibió confirmación de Supabase")
        
    except Exception as e:
        print(f"❌ Error guardando: {e}")
        raise HTTPException(status_code=500, detail=str(e))