from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Optional
import os
import json
import google.generativeai as genai
from supabase import create_client, Client
from collections import Counter
from routers.deps import get_current_user_id


# --- CONFIGURACIÓN DB (SUPABASE) ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
else:
    print("⚠️ ADVERTENCIA: No se configuró Supabase. El guardado no funcionará.")

# --- CONFIGURACIÓN IA ---
MODEL_NAME = "gemini-2.5-flash"
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("⚠️ ERROR: No se encontró GOOGLE_API_KEY en el .env")
genai.configure(api_key=api_key)

router = APIRouter(prefix="/analizador", tags=["Analizador Cognitivo"])

class AnalisisRequest(BaseModel):
    objetivo_aprendizaje: str
    texto_evaluacion: str

# user_id ya NO va en el body — se extrae del JWT en el servidor
class GuardarAnalisisRequest(BaseModel):
    objetivo_aprendizaje: str
    texto_evaluacion: str = ""
    resultado_analisis: dict


def build_analysis_prompt(oa: str, evaluacion: str) -> str:
    return f"""Eres un Coach Pedagógico experto en la Taxonomía DOK de Norman Webb. Tu rol es el de un MENTOR: propositivo, constructivo, nunca un juez.

## MARCO DOK (referencia obligatoria para clasificar)
- DOK 1: Recordar/reproducir un hecho. Respuesta única directa en el texto o memoria. Ej: "¿Quién es el personaje principal?"
- DOK 2: Interpretar, comparar, explicar usando un concepto conocido. Ej: "¿Por qué el personaje tomó esa decisión?"
- DOK 3: Argumentar, evaluar, construir con evidencia propia. Más de una respuesta válida posible. Ej: "Justifica con evidencia del texto si el personaje actuó correctamente."
- DOK 4: Crear/investigar integrando disciplinas en proyectos extendidos (días/semanas).

## REGLAS CLAVE
1. Clasifica por la DEMANDA COGNITIVA REAL (lo que el estudiante debe hacer mentalmente), nunca por los verbos usados.
2. Si hay duda entre dos niveles, usa el menor (conservador).
3. **CRÍTICO**: La comparación es SIEMPRE contra el OA declarado principal, NO contra etiquetas de sección del instrumento (ej: si una sección dice "Habilidad: Extraer información" pero el OA pide "Analizar", la habilidad base sigue siendo "Analizar").
4. Determina el nivel DOK que el OA exige implícitamente (ej: "Analizar" → DOK 3, "Comprender" → DOK 2, "Identificar" → DOK 1).
5. ESTADO "Logrado": SOLO si dok_real >= dok_exigido_por_el_OA Y el reactivo genera evidencia directa de que ese OA específico fue alcanzado.
6. ESTADO "Mejorable": si dok_real < dok_exigido_por_el_OA. Un reactivo DOK 1 o 2 para un OA que exige análisis/argumentación SIEMPRE es "Mejorable", aunque el tema sea correcto.
7. Tono siempre propositivo: "Para fortalecer este reactivo..." nunca "Error:" o "Incorrecto:".
8. Cuando el estado sea "Mejorable", la "sugerencia_reingenieria" es OBLIGATORIA: escribe una versión concreta del reactivo que eleve su exigencia cognitiva al DOK que el OA requiere (generalmente DOK 3: argumentar, justificar con evidencia, evaluar una decisión del personaje).

## INPUTS
OA declarado: {oa}

Instrumento:
{evaluacion}

## RESPONDE SOLO CON UN JSON (sin markdown, sin texto extra):
{{
    "metadata": {{
        "asignatura_detectada": "...",
        "nivel_detectado": "..."
    }},
    "diagnostico_global": "Diagnóstico breve con tono de mentor...",
    "score_coherencia": 0,
    "feed_forward": "2-3 pasos concretos para mejorar la alineación entre el instrumento y el OA...",
    "pregunta_cierre": "Una pregunta de coaching poderosa para que el docente reflexione...",
    "niveles_data": [
        {{"nivel": "DOK 1", "nombre": "Memoria", "cantidad": 0, "esperado": 15, "color": "#94a3b8"}},
        {{"nivel": "DOK 2", "nombre": "Aplicación", "cantidad": 0, "esperado": 40, "color": "#60a5fa"}},
        {{"nivel": "DOK 3", "nombre": "Estratégico", "cantidad": 0, "esperado": 35, "color": "#2b546e"}},
        {{"nivel": "DOK 4", "nombre": "Extendido", "cantidad": 0, "esperado": 10, "color": "#f2ae60"}}
    ],
    "items_analizados": [
        {{
            "id": 1,
            "pregunta_extracto": "Texto corto (máx 80 chars)...",
            "pregunta_completa": "Texto completo del reactivo...",
            "habilidad_declarada": "Habilidad que el OA exige para este reactivo, o 'No declarada explícitamente'",
            "habilidad_real": "Habilidad que el reactivo realmente evidencia (lenguaje simple y directo)",
            "proceso_mental_estudiante": "Lo que el estudiante hace mentalmente para responder (lenguaje simple)",
            "dok_real": "DOK 1",
            "estado": "Logrado",
            "analisis": "Diagnóstico propositivo citando el descriptor DOK...",
            "sugerencia_reingenieria": "Versión mejorada del reactivo (solo si estado=Mejorable, si no dejar vacío)",
            "pregunta_reflexion": "Una pregunta de coaching para que el docente reflexione sobre este reactivo"
        }}
    ],
    "conclusion": {{
        "texto": "Resumen pedagógico con tono mentor...",
        "accion": "Acción directa y constructiva para el docente..."
    }}
}}"""


@router.post("/audit")
async def auditar_instrumento(request: AnalisisRequest):
    try:
        print(f"🧠 Analizando DOK con {MODEL_NAME} (temperatura=0, Webb+Mentoría)...")

        prompt = build_analysis_prompt(request.objetivo_aprendizaje, request.texto_evaluacion)

        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            generation_config={
                "response_mime_type": "application/json",
                "temperature": 0.0,
            }
        )

        response = model.generate_content(
            prompt,
            request_options={"timeout": 120}
        )
        texto = response.text.strip()

        # Limpieza robusta de markdown
        if texto.startswith("```json"):
            texto = texto[7:]
        if texto.startswith("```"):
            texto = texto[3:]
        if texto.endswith("```"):
            texto = texto[:-3]

        resultado = json.loads(texto.strip())

        # === SCORE DETERMINÍSTICO ===
        # El score NO lo decide la IA (varía entre llamadas).
        # Lo calculamos nosotros: % de ítems marcados como "Logrado".
        items = resultado.get("items_analizados", [])
        if items:
            logrado_count = sum(1 for i in items if i.get("estado") == "Logrado")
            resultado["score_coherencia"] = round((logrado_count / len(items)) * 100)
        else:
            resultado["score_coherencia"] = 0

        # Recalcular niveles_data desde los ítems reales
        conteo = Counter(item.get("dok_real", "DOK 2") for item in items)
        for nivel_entry in resultado.get("niveles_data", []):
            nivel_entry["cantidad"] = conteo.get(nivel_entry["nivel"], 0)

        # Asegurar campos opcionales
        resultado.setdefault("feed_forward", "")
        resultado.setdefault("pregunta_cierre", "")
        resultado.setdefault("reconocimiento_fortalezas", [])

        print(f"✅ Análisis completado. Score: {resultado.get('score_coherencia')} | Items: {len(resultado.get('items_analizados', []))}")
        return resultado

    except Exception as e:
        print(f"❌ Error en auditoría DOK: {type(e).__name__}: {str(e)}")
        if "404" in str(e):
            raise HTTPException(status_code=500, detail="Modelo no encontrado. Verifica tu API Key o librería.")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save")
async def guardar_analisis(
    request: GuardarAnalisisRequest,
    user_id: str = Depends(get_current_user_id)   # ← JWT verificado server-side
):
    if not supabase:
        raise HTTPException(status_code=503, detail="Base de datos no disponible")

    try:
        author_name = "Profe IC"
        try:
            profile = supabase.table("profiles").select("full_name").eq("id", user_id).single().execute()
            if profile.data and profile.data.get("full_name"):
                author_name = profile.data["full_name"]
        except Exception as e:
            print(f"⚠️ Error fetching profile: {e}")

        data = {
            "user_id": user_id,
            "tipo": "AUDITORIA",
            "titulo": f"Auditoría: {request.resultado_analisis.get('metadata', {}).get('asignatura_detectada', 'General')}",
            "asignatura": request.resultado_analisis.get('metadata', {}).get('asignatura_detectada'),
            "nivel": request.resultado_analisis.get('metadata', {}).get('nivel_detectado'),
            "contenido": request.resultado_analisis,
            "is_public": False,
            "author_name": author_name
        }

        res = supabase.table("biblioteca_recursos").insert(data).execute()

        if res.data:
            return {"success": True, "id": res.data[0]['id']}
        else:
            raise HTTPException(status_code=500, detail="Error al guardar en Supabase")

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error saving: {e}")
        raise HTTPException(status_code=500, detail=str(e))