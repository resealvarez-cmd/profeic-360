from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import UploadFile, File, Form
from app.services.storage import storage
from app.services.file_engine import extract_text_from_pdf

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

# --- 1.5 UPLOAD & EXTRACT (INGESTA) ---
@router.post("/upload")
async def upload_resource(
    file: UploadFile = File(...),
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

        # 2. Subir a Supabase Storage (usamos el servicio storage.py)
        # file.read() mueve el puntero, storage.upload_file hace seek(0) antes de subir?
        # storage.upload_file usa file.file.read(), así que mejor le pasamos el UploadFile reseteado.
        await file.seek(0) 
        
        # Usamos un ID genérico temp o del usuario si tuviéramos auth. 
        # Por ahora hardcodeamos 'general' o recibimos user_id.
        # El requerimiento no especifica user_id en params, así que usaremos 'guest' o 'profesor'.
        user_id = "profesor_invitado" 
        
        upload_result = storage.upload_file(file, user_id)
        
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