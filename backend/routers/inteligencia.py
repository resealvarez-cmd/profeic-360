import os
import json
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from supabase import create_client, Client
import google.generativeai as genai
from routers.deps import get_current_user_id

router = APIRouter(prefix="/api/v1/inteligencia", tags=["Inteligencia"])

logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY", "")

try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    logger.error(f"Error creating Supabase client in inteligencia router: {e}")
    supabase = None

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

class AskRequest(BaseModel):
    message: str
    context: Optional[dict] = None

@router.get("/metrics")
async def get_metrics(user_id: str = Depends(get_current_user_id)):
    """
    Consolidates data from school_asistencia, school_simce, school_paes, and observation_cycles.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
    
    try:
        # Get user's school_id
        profile_res = supabase.table("profiles").select("school_id").eq("id", user_id).single().execute()
        school_id = profile_res.data.get("school_id") if profile_res.data else None
        
        # 1. Fetch attendance
        asistencia_query = supabase.table("school_asistencia").select("*")
        if school_id:
            asistencia_query = asistencia_query.eq("school_id", school_id)
        asistencia_res = asistencia_query.execute()
        asistencia_data = asistencia_res.data or []
        
        # 2. Fetch SIMCE
        simce_query = supabase.table("school_simce").select("*")
        if school_id:
            simce_query = simce_query.eq("school_id", school_id)
        simce_res = simce_query.execute()
        simce_data = simce_res.data or []
        
        # 3. Fetch PAES
        paes_query = supabase.table("school_paes").select("*")
        if school_id:
            paes_query = paes_query.eq("school_id", school_id)
        paes_res = paes_query.execute()
        paes_data = paes_res.data or []
        
        # 4. Fetch PAES Proceso
        paes_proceso_query = supabase.table("school_paes_proceso").select("*")
        if school_id:
            paes_proceso_query = paes_proceso_query.eq("school_id", school_id)
        paes_proceso_res = paes_proceso_query.execute()
        paes_proceso_data = paes_proceso_res.data or []
        
        # 5. Fetch Acompañamiento
        cycles_query = supabase.table("observation_cycles").select("id, status, rubric_type")
        if school_id:
            cycles_query = cycles_query.eq("school_id", school_id)
        cycles_res = cycles_query.execute()
        cycles_data = cycles_res.data or []
        
        return {
            "asistencia": asistencia_data,
            "simce": simce_data,
            "paes": paes_data,
            "paes_proceso": paes_proceso_data,
            "observation_cycles": cycles_data
        }
    except Exception as e:
        logger.error(f"Error fetching intelligence metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ask")
async def ask_intelligence(req: AskRequest, user_id: str = Depends(get_current_user_id)):
    """
    Interactive LLM chat / analysis based on actual database metrics.
    """
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="Google API Key not configured")
        
    try:
        # Get user's school_id
        profile_res = supabase.table("profiles").select("school_id").eq("id", user_id).single().execute()
        school_id = profile_res.data.get("school_id") if profile_res.data else None
        
        # Fetch metrics for context
        metrics = await get_metrics(user_id)
        
        # Build prompt
        prompt = f"""
        Actúas como un Consultor e Intérprete Pedagógico de Inteligencia Escolar de la plataforma PROFEIC.
        Tu objetivo es realizar un análisis estratégico cruzando variables académicas, socioemocionales y de acompañamiento docente.

        DATOS REALES DEL COLEGIO:
        - Asistencia Mensual (Cursos): {json.dumps(metrics.get('asistencia'))}
        - Resultados SIMCE Oficiales e Internos: {json.dumps(metrics.get('simce'))}
        - PAES (Habilidades y Puntajes): {json.dumps(metrics.get('paes'))}
        - Acompañamiento Docente (Ciclos): {json.dumps(metrics.get('observation_cycles'))}

        CONSULTA DEL USUARIO:
        "{req.message}"

        INSTRUCCIONES DE RESPUESTA:
        1. Responde de manera profesional y directa, enfocada en la toma de decisiones pedagógicas y directivas.
        2. Detecta incongruencias o correlaciones (ej. baja asistencia de un curso correlacionada con bajo desempeño SIMCE, o brecha didáctica entre ensayos y oficial).
        3. Mantén un tono formal, analítico y constructivo (estética corporativa PROFEIC).
        4. Si te piden un resumen interpretativo (ej. la línea interpretativa de la portada), entrega un párrafo compacto de hasta 4 oraciones.
        5. Devuelve la respuesta en formato markdown enriquecido.
        """
        
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        answer = response.text.strip()
        
        return {"response": answer}
    except Exception as e:
        logger.error(f"Error in ask_intelligence: {e}")
        raise HTTPException(status_code=500, detail=str(e))
