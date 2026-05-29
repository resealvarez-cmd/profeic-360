"""
Router: contexto.py
Propósito: Subir documentos institucionales (PEI, RICE, Reglamentos) por colegio
y vectorizarlos para búsqueda semántica (RAG multi-tenant) de forma segura y optimizada.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Header, Depends
from pydantic import BaseModel
from typing import Optional
import google.generativeai as genai
from supabase import create_client, Client
import os
from pypdf import PdfReader
import io
from routers.deps import get_current_user_id

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
# Acepta school_id para separar documentos por colegio de forma segura.
# ─────────────────────────────────────────────────────────
@router.post("/upload-contexto")
async def upload_contexto_pdf(
    file: UploadFile = File(...),
    school_id: str = Form(...),  # school_id obligatorio para garantizar multitenancy
    tipo_documento: Optional[str] = Form("general"),
    user_id: str = Depends(get_current_user_id)  # Requiere token válido!
):
    """
    Parámetros:
    - file: PDF a procesar
    - school_id: UUID del colegio (requerido para multitenancy)
    - tipo_documento: 'pei' | 'rice' | 'reglamento_evaluacion' | 'reglamento_convivencia' | 'general'
    """
    print(f"📂 [CONTEXTO] Procesando: {file.filename} | Colegio: {school_id} | Tipo: {tipo_documento} | Usuario: {user_id}")
    
    try:
        # 1. Validar multitenancy (comprobar que el usuario pertenece al colegio solicitado)
        profile_res = supabase.table("profiles").select("school_id").eq("id", user_id).single().execute()
        user_school_id = profile_res.data.get("school_id") if profile_res.data else None
        
        if not user_school_id or str(user_school_id) != str(school_id):
            # Opcional: Permitir si es Super Admin (puedes verificar en authorized_users si es admin)
            # Pero para seguridad estricta, limitamos el acceso por defecto
            raise HTTPException(
                status_code=403, 
                detail="Acceso denegado. No tienes permisos para administrar los archivos de esta institución."
            )

        # 2. Leer el PDF
        contents = await file.read()
        pdf_reader = PdfReader(io.BytesIO(contents))
        
        full_text = ""
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"

        if not full_text.strip():
            raise HTTPException(status_code=400, detail="No se pudo extraer texto del PDF. ¿Está escaneado como imagen?")

        # 3. Fragmentar (Chunking) — 1000 chars con 100 chars de overlap
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

        # 4. Vectorizar y guardar en lote (Bulk Insert)
        bulk_data = []
        for chunk in chunks:
            if not chunk.strip():
                continue
            
            vector = get_embedding(chunk)
            
            bulk_data.append({
                "content": chunk,
                "metadata": {
                    "source": file.filename,
                    "tipo": tipo_documento,
                    "school_id": school_id
                },
                "embedding": vector,
                "tipo_documento": tipo_documento,
                "school_id": school_id
            })

        # Ejecutamos una única petición HTTP masiva (Bulk Insert)
        if bulk_data:
            supabase.table("documentos_institucionales").insert(bulk_data).execute()

        print(f"   → [OK] Insertados {len(bulk_data)} fragmentos de forma masiva para colegio {school_id}.")

        return {
            "status": "success",
            "message": f"Procesados {len(bulk_data)} fragmentos de '{file.filename}'",
            "chunks": len(bulk_data),
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
async def list_school_documents(school_id: str, user_id: str = Depends(get_current_user_id)):
    """Lista documentos únicos (por nombre de archivo) de un colegio de forma segura."""
    try:
        # Validar multitenancy
        profile_res = supabase.table("profiles").select("school_id").eq("id", user_id).single().execute()
        user_school_id = profile_res.data.get("school_id") if profile_res.data else None
        
        if not user_school_id or str(user_school_id) != str(school_id):
            raise HTTPException(status_code=403, detail="Acceso denegado a esta institución.")

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

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error listando documentos: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────
# DELETE /documentos/{school_id}/{filename}
# Elimina todos los fragmentos de un documento
# ─────────────────────────────────────────────────────────
@router.delete("/documentos/{school_id}/{filename}")
async def delete_school_document(school_id: str, filename: str, user_id: str = Depends(get_current_user_id)):
    """Elimina todos los fragmentos de un archivo de un colegio de forma segura."""
    try:
        # Validar multitenancy
        profile_res = supabase.table("profiles").select("school_id").eq("id", user_id).single().execute()
        user_school_id = profile_res.data.get("school_id") if profile_res.data else None
        
        if not user_school_id or str(user_school_id) != str(school_id):
            raise HTTPException(status_code=403, detail="Acceso denegado a esta institución.")

        # Eliminar fragmentos
        result = supabase.table("documentos_institucionales").delete().eq(
            "school_id", school_id
        ).filter("metadata->>source", "eq", filename).execute()

        return {"status": "deleted", "filename": filename}

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error eliminando documento: {e}")
        raise HTTPException(status_code=500, detail=str(e))