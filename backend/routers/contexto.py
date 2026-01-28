from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from pypdf import PdfReader
import io

load_dotenv()
router = APIRouter()

# --- CONFIGURACIÓN ---
api_key = os.getenv("GOOGLE_API_KEY")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if api_key:
    genai.configure(api_key=api_key)

supabase: Client = create_client(supabase_url, supabase_key)

# --- UTILIDAD: GENERAR EMBEDDING ---
def get_embedding(text: str):
    # Usamos el modelo de embedding de Gemini
    result = genai.embed_content(
        model="models/text-embedding-004",
        content=text,
        task_type="retrieval_document",
        title="Contexto Institucional"
    )
    return result['embedding']

# --- ENDPOINT DE CARGA ---
@router.post("/upload-contexto")
async def upload_contexto_pdf(file: UploadFile = File(...)):
    print(f"📂 [CONTEXTO] Procesando archivo: {file.filename}")
    
    try:
        # 1. Leer el PDF
        contents = await file.read()
        pdf_reader = PdfReader(io.BytesIO(contents))
        
        full_text = ""
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"

        # 2. Fragmentar (Chunking)
        # Cortamos el texto en trozos de ~1000 caracteres para que sean digeribles
        chunk_size = 1000
        chunks = [full_text[i:i+chunk_size] for i in range(0, len(full_text), chunk_size)]
        
        print(f"   -> Texto extraído. Generando {len(chunks)} vectores...")

        # 3. Vectorizar y Guardar
        count = 0
        for chunk in chunks:
            if not chunk.strip(): continue
            
            # Generar Vector
            vector = get_embedding(chunk)
            
            # Guardar en Supabase
            data = {
                "content": chunk,
                "metadata": {"source": file.filename},
                "embedding": vector
            }
            supabase.table("documentos_institucionales").insert(data).execute()
            count += 1

        return {"status": "success", "message": f"Procesados {count} fragmentos del documento {file.filename}"}

    except Exception as e:
        print(f"❌ Error subiendo contexto: {e}")
        raise HTTPException(status_code=500, detail=str(e))