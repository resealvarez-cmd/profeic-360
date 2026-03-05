"""
Router: insights.py
Propósito: Analizar el historial de uso del profesor (biblioteca_recursos, 
evaluaciones, etc.) y generar insights pedagógicos accionables via Gemini.
"""

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from supabase import create_client, Client
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()
router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

supabase: Optional[Client] = None
try:
    if SUPABASE_URL and SUPABASE_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"❌ [INSIGHTS] Error conectando Supabase: {e}")

if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)


# ─────────────────────────────────────────────
# GET /dashboard/insights
# Analiza los recursos guardados del profesor y genera insights accionables
# ─────────────────────────────────────────────
@router.get("/insights")
async def get_dashboard_insights(authorization: str = Header(...)):
    """
    Genera insights pedagógicos personalizados basados en:
    - Recursos guardados en la Biblioteca (tipo, asignatura, fecha)
    - Distribución DOK de las evaluaciones
    - Cobertura de OAs por asignatura
    - Meses sin actividad por asignatura
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase no configurado")

    try:
        # 1. Obtener usuario
        token = authorization.split("Bearer ")[-1]
        user_resp = supabase.auth.get_user(token)
        if not user_resp or not user_resp.user:
            raise HTTPException(status_code=401, detail="Token inválido")

        user_id = user_resp.user.id

        # 2. Obtener recursos de la Biblioteca (últimos 90 días max 50)
        recursos_resp = supabase.table("biblioteca_recursos").select(
            "tipo, asignatura, nivel, titulo, created_at, contenido"
        ).eq("user_id", user_id).order("created_at", desc=True).limit(50).execute()

        recursos = recursos_resp.data or []

        # Si no hay recursos, devolver estado vacío
        if not recursos:
            return {
                "has_data": False,
                "insight_text": None,
                "stats": {
                    "total_recursos": 0,
                    "tipos": {},
                    "asignaturas": {},
                    "ultimo_recurso": None
                },
                "alerts": []
            }

        # 3. Calcular estadísticas base
        from collections import Counter
        from datetime import datetime, timezone

        tipos_counter = Counter(r.get("tipo", "GENERAL") for r in recursos)
        asig_counter = Counter(r.get("asignatura", "General") for r in recursos)
        
        # Fecha del último recurso vs hoy
        ultimo_recurso_str = recursos[0].get("created_at") if recursos else None
        
        # Detectar asignaturas sin actividad reciente (últimos 30 días)
        ahora = datetime.now(timezone.utc)
        asig_reciente = set()
        for r in recursos:
            fecha_str = r.get("created_at", "")
            if fecha_str:
                try:
                    fecha = datetime.fromisoformat(fecha_str.replace("Z", "+00:00"))
                    dias = (ahora - fecha).days
                    if dias <= 30:
                        asig_reciente.add(r.get("asignatura", ""))
                except:
                    pass

        asig_sin_actividad = [a for a in asig_counter.keys() if a and a not in asig_reciente]

        # Distribución DOK (si es EVALUACION, intentar extraer del contenido)
        dok_total = {"dok1": 0, "dok2": 0, "dok3": 0}
        evaluaciones = [r for r in recursos if r.get("tipo") == "EVALUACION"]
        for ev in evaluaciones:
            try:
                contenido = ev.get("contenido") or {}
                if isinstance(contenido, str):
                    contenido = json.loads(contenido)
                cfg = contenido.get("config", {})
                dok_total["dok1"] += cfg.get("dokDistribution", {}).get("dok1", 0)
                dok_total["dok2"] += cfg.get("dokDistribution", {}).get("dok2", 0)
                dok_total["dok3"] += cfg.get("dokDistribution", {}).get("dok3", 0)
            except:
                pass

        # 4. Construir contexto para Gemini
        tipos_str = ", ".join([f"{k}: {v}" for k, v in tipos_counter.most_common()])
        asig_str = ", ".join([f"{k} ({v} recursos)" for k, v in asig_counter.most_common()])
        sin_actividad_str = ", ".join(asig_sin_actividad) if asig_sin_actividad else "ninguna"
        
        total_evaluaciones = tipos_counter.get("EVALUACION", 0)
        prom_dok = (dok_total["dok1"] + dok_total["dok2"] + dok_total["dok3"])
        dok_promedio_str = ""
        if total_evaluaciones > 0 and prom_dok > 0:
            # Calcular % de cada nivel
            dok1_pct = round(dok_total["dok1"] / prom_dok * 100)
            dok2_pct = round(dok_total["dok2"] / prom_dok * 100)
            dok3_pct = round(dok_total["dok3"] / prom_dok * 100)
            dok_promedio_str = f"Distribución DOK promedio: DOK1={dok1_pct}%, DOK2={dok2_pct}%, DOK3={dok3_pct}%"

        prompt = f"""
        Eres un mentor pedagógico experto. Analiza el historial de uso de este docente y genera
        UN párrafo de insight pedagógico accionable (máximo 3 oraciones) en español.

        DATOS DEL DOCENTE:
        - Total de recursos generados: {len(recursos)}
        - Tipos de recursos: {tipos_str}
        - Asignaturas trabajadas: {asig_str}
        - Asignaturas sin actividad en los últimos 30 días: {sin_actividad_str}
        {dok_promedio_str}
        - Evaluaciones generadas: {total_evaluaciones}
        - Planificaciones: {tipos_counter.get("PLANIFICACION", 0)}
        - Rúbricas: {tipos_counter.get("RUBRICA", 0)}

        INSTRUCCIONES:
        1. Destaca lo positivo brevemente.
        2. Señala 1 oportunidad de mejora concreta (ej: "No has trabajado Historia este mes", "Tus evaluaciones son mayormente DOK 1-2, considera elevar la complejidad").
        3. Termina con UNA acción sugerida específica.
        4. Tono: cercano, positivo, motivador. Como un colega experto.
        5. Empieza con el nombre genérico "Profe" o referencia directa.
        6. NO uses bullets ni listas. Solo prosa fluida.

        Devuelve SOLO el párrafo de insight, sin títulos ni comillas.
        """

        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        insight_text = response.text.strip()

        # 5. Generar alertas accionables
        alerts = []
        if asig_sin_actividad:
            alerts.append({
                "tipo": "warning",
                "mensaje": f"Sin actividad reciente en: {', '.join(asig_sin_actividad[:2])}",
                "accion": "Genera una planificación"
            })
        if total_evaluaciones > 0 and dok_promedio_str:
            if dok1_pct > 50:
                alerts.append({
                    "tipo": "info",
                    "mensaje": "Tus evaluaciones tienen alta concentración en DOK 1",
                    "accion": "Prueba el Elevador Cognitivo"
                })
        if tipos_counter.get("RUBRICA", 0) == 0 and tipos_counter.get("EVALUACION", 0) > 2:
            alerts.append({
                "tipo": "tip",
                "mensaje": "Tienes evaluaciones pero ninguna rúbrica asociada",
                "accion": "Crea una rúbrica para complementar"
            })

        return {
            "has_data": True,
            "insight_text": insight_text,
            "stats": {
                "total_recursos": len(recursos),
                "tipos": dict(tipos_counter),
                "asignaturas": dict(asig_counter.most_common(5)),
                "ultimo_recurso": ultimo_recurso_str
            },
            "alerts": alerts
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [INSIGHTS] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
