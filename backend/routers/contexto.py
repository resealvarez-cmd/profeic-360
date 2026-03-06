"""
Router: contexto.py
Propósito: Subir documentos institucionales (PEI, RICE, Reglamentos) por colegio
y vectorizarlos para búsqueda semántica (RAG multi-tenant).
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Header
from pydantic import BaseModel
from typing import Optional
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
    result = genai.embed_content(
        model="models/text-embedding-004",
        content=text,
        task_type="retrieval_document",
        title="Contexto Institucional"
    )
    return result['embedding']


# ─────────────────────────────────────────────────────────
# POST /upload-contexto
# Sube un PDF institucional, lo fragmenta y vectoriza.
# Acepta school_id para separar documentos por colegio.
# ─────────────────────────────────────────────────────────
@router.post("/upload-contexto")
async def upload_contexto_pdf(
    file: UploadFile = File(...),
    school_id: Optional[str] = Form(None),
    tipo_documento: Optional[str] = Form("general"),
    authorization: Optional[str] = Header(None)
):
    """
    Parámetros:
    - file: PDF a procesar
    - school_id: UUID del colegio (requerido para multi-tenant)
    - tipo_documento: 'pei' | 'rice' | 'reglamento_evaluacion' | 'reglamento_convivencia' | 'general'
    """
    print(f"📂 [CONTEXTO] Procesando: {file.filename} | Colegio: {school_id} | Tipo: {tipo_documento}")
    
    try:
        # 1. Leer el PDF
        contents = await file.read()
        pdf_reader = PdfReader(io.BytesIO(contents))
        
        full_text = ""
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"

        if not full_text.strip():
            raise HTTPException(status_code=400, detail="No se pudo extraer texto del PDF. ¿Está escaneado con imagen?")

        # 2. Fragmentar (Chunking) — 1000 chars con 100 chars de overlap
        chunk_size = 1000
        overlap = 100
        chunks = []
        i = 0
        while i < len(full_text):
            chunk = full_text[i:i + chunk_size]
            if chunk.strip():
                chunks.append(chunk)
            i += chunk_size - overlap

        print(f"   → Texto extraído ({len(full_text)} chars). Generando {len(chunks)} vectores...")

        # 3. Vectorizar y guardar
        count = 0
        for chunk in chunks:
            if not chunk.strip():
                continue
            
            vector = get_embedding(chunk)
            
            data = {
                "content": chunk,
                "metadata": {
                    "source": file.filename,
                    "tipo": tipo_documento,
                    "school_id": school_id
                },
                "embedding": vector,
                "tipo_documento": tipo_documento
            }

            # Agregar school_id solo si se proporcionó (evita error de FK)
            if school_id:
                data["school_id"] = school_id

            supabase.table("documentos_institucionales").insert(data).execute()
            count += 1

        return {
            "status": "success",
            "message": f"Procesados {count} fragmentos de '{file.filename}'",
            "chunks": count,
            "school_id": school_id,
            "tipo_documento": tipo_documento
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error subiendo contexto: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────
# GET /documentos/{school_id}
# Lista los documentos subidos para un colegio
# ─────────────────────────────────────────────────────────
@router.get("/documentos/{school_id}")
async def list_school_documents(school_id: str):
    """Lista documentos únicos (por nombre de archivo) de un colegio."""
    try:
        # Obtener fuentes únicas con conteo de fragmentos
        result = supabase.table("documentos_institucionales").select(
            "metadata, tipo_documento, created_at"
        ).eq("school_id", school_id).order("created_at", desc=True).execute()

        docs = result.data or []

        # Agrupar por nombre de archivo
        seen = {}
        for doc in docs:
            source = doc.get("metadata", {}).get("source", "Desconocido")
            if source not in seen:
                seen[source] = {
                    "filename": source,
                    "tipo_documento": doc.get("tipo_documento", "general"),
                    "created_at": doc.get("created_at"),
                    "chunks": 1
                }
            else:
                seen[source]["chunks"] += 1

        return {"documents": list(seen.values())}

    except Exception as e:
        print(f"❌ Error listando documentos: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────
# DELETE /documentos/{school_id}/{filename}
# Elimina todos los fragmentos de un documento
# ─────────────────────────────────────────────────────────
@router.delete("/documentos/{school_id}/{filename}")
async def delete_school_document(school_id: str, filename: str):
    """Elimina todos los fragmentos de un archivo de un colegio."""
    try:
        # Supabase no soporta JSON contains en el filtro simple,
        # usamos texto directo en metadata->source
        result = supabase.table("documentos_institucionales").delete().eq(
            "school_id", school_id
        ).filter("metadata->>source", "eq", filename).execute()

        return {"status": "deleted", "filename": filename}

    except Exception as e:
        print(f"❌ Error eliminando documento: {e}")
        raise HTTPException(status_code=500, detail=str(e))