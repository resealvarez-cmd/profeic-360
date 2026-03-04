from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from supabase import create_client, Client
from collections import Counter

load_dotenv()

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

router = APIRouter(
    prefix="/analizador",
    tags=["Analizador Cognitivo"]
)

# --- MODELOS DE DATOS ---
class AnalisisRequest(BaseModel):
    objetivo_aprendizaje: str
    texto_evaluacion: str

class GuardarAnalisisRequest(BaseModel):
    user_id: str = "33964953-b929-4d89-913a-592f026903d6"
    objetivo_aprendizaje: str
    texto_evaluacion: str = ""
    resultado_analisis: dict


# ==============================================================================
# MARCO PEDAGÓGICO COMPLETO
# ==============================================================================

WEBB_DESCRIPTORS = """
## TAXONOMÍA WEBB (DOK) — DESCRIPTORES OFICIALES

DOK 1 — RECUERDO Y REPRODUCCIÓN
- El estudiante recuerda, recupera o reproduce información o procedimientos memorizados.
- Señal clave: La respuesta única está en el texto o en la memoria. Sin interpretación.
- Ejemplos: "¿En qué año ocurrió X?" / "Define fotosíntesis." / "Identifica la alternativa correcta según el texto."

DOK 2 — HABILIDADES Y CONCEPTOS
- El estudiante interpreta, clasifica, organiza o aplica un procedimiento en contexto conocido.
- Señal clave: Requiere más de un paso o aplicación de una idea, pero dentro de un procedimiento conocido.
- Ejemplos: "Explica por qué X…" / "Compara las causas de X e Y." / "Predice qué sucederá si…"

DOK 3 — RAZONAMIENTO ESTRATÉGICO
- El estudiante razona, argumenta, evalúa usando múltiples perspectivas. Más de una respuesta válida posible.
- Señal clave: Exige juicio, evidencia propia y razonamiento extendido. No hay única respuesta correcta.
- Ejemplos: "Argumenta si X es sostenible usando al menos 2 fuentes." / "Evalúa la decisión de X justificando con evidencia."

DOK 4 — PENSAMIENTO EXTENDIDO
- El estudiante diseña o sintetiza conocimiento entre disciplinas en un plazo extendido (días/semanas).
- Señal clave: Multidisciplinario, produce un producto original, requiere tiempo extendido.
- Ejemplos: "Diseña un plan comunitario integrando biología y ciencias sociales."
"""

MENTOR_TONE = """
## TONO Y ENFOQUE: MENTORÍA PEDAGÓGICA (OBLIGATORIO)

Eres un MENTOR, no un juez. Tu función es:
1. CELEBRAR primero lo que funciona bien. Siempre identificar al menos 1-2 fortalezas reales del instrumento.
2. PROPONER mejoras en tono constructivo, nunca declarar "Error" o "Incorrecto".
3. Usar lenguaje de ACOMPAÑAMIENTO: "Para fortalecer este reactivo…", "Una oportunidad de mejora sería…", "Te propongo…"
4. El foco NO es juzgar el nivel DOK como bueno o malo. El foco es la COHERENCIA: ¿el reactivo mide lo que el OA declara querer medir?
5. CRUCIAL: NO catalogues DOK 1 como malo ni DOK 4 como superior. Un instrumento puede requerir DOK 1 y estar perfectamente alineado.
6. La pregunta central siempre es: ¿Este reactivo genera evidencia de que el estudiante logró el OA declarado?
"""

CLASSIFICATION_RULES = """
## REGLAS DE CLASIFICACIÓN (TEMPERATURA=0, RESULTADOS DETERMINISTAS)

1. Clasifica según la DEMANDA COGNITIVA REAL (lo que el cerebro del estudiante debe hacer), nunca por verbos o palabras sofisticadas.
2. Si hay duda entre dos niveles DOK, opta por el MENOR (posición conservadora).
3. Fundamenta CADA clasificación citando el descriptor DOK correspondiente textualmente.
4. La "habilidad declarada" es lo que el OA exige que el estudiante demuestre.
5. La "habilidad real" es lo que el reactivo REALMENTE puede evidenciar dado cómo está redactado.
"""

def build_analysis_prompt(oa: str, evaluacion: str) -> str:
    return f"""
{WEBB_DESCRIPTORS}

{MENTOR_TONE}

{CLASSIFICATION_RULES}

## INPUTS DEL DOCENTE
- **Objetivo de Aprendizaje (OA):** {oa}
- **Instrumento de evaluación:**
{evaluacion}

## PROCESO DE ANÁLISIS (para cada reactivo, en este orden):
1. Copia el texto completo del reactivo.
2. Identifica: ¿qué habilidad dice medir el OA para este reactivo? ¿La declaró el docente explícitamente o está implícita?
3. Describe en lenguaje simple: ¿qué proceso cognitivo realiza el estudiante para responder? (ej: "solo recuerda un dato del texto")
4. Asigna el nivel DOK citando el descriptor correspondiente.
5. Evalúa coherencia: ¿este reactivo genera evidencia de que el OA fue logrado?
6. Si hay desalineación, propone una mejora concreta con tono de mentor.
7. Formula UNA pregunta de coaching que invite al docente a reflexionar sobre este reactivo.

## AL FINAL DEL ANÁLISIS COMPLETO:
- Identifica 1-3 fortalezas concretas del instrumento (reactivos o aspectos que funcionan bien).
- Proporciona 2-3 pasos concretos de feed forward (acciones específicas para mejorar la alineación).
- Formula UNA pregunta de cierre de alto impacto para provocar reflexión del docente.
- Calcula el % de cobertura del OA (cuántas sub-habilidades del OA aparecen evidenciadas en la prueba).

## FORMATO JSON (ESTRICTO, sin bloques markdown):
{{
    "metadata": {{
        "asignatura_detectada": "...",
        "nivel_detectado": "...",
        "subhabilidades_oa": ["sub-habilidad 1 del OA", "sub-habilidad 2...", "..."],
        "cobertura_oa_porcentaje": 0,
        "cobertura_oa_descripcion": "texto explicando qué sub-habilidades están cubiertas y cuáles no"
    }},
    "diagnostico_global": "Frase ejecutiva corta con tono mentor...",
    "score_coherencia": 0,
    "reconocimiento_fortalezas": [
        {{
            "descripcion": "Texto celebrando lo que funciona bien en el instrumento...",
            "reactivos_destacados": [1, 3]
        }}
    ],
    "feed_forward": [
        "Acción concreta 1 para mejorar la alineación...",
        "Acción concreta 2...",
        "Acción concreta 3 (opcional)..."
    ],
    "pregunta_cierre": "Una pregunta de coaching poderosa para que el docente reflexione al finalizar...",
    "niveles_data": [
        {{"nivel": "DOK 1", "nombre": "Memoria", "cantidad": 0, "esperado": 15, "color": "#94a3b8"}},
        {{"nivel": "DOK 2", "nombre": "Aplicación", "cantidad": 0, "esperado": 40, "color": "#60a5fa"}},
        {{"nivel": "DOK 3", "nombre": "Estratégico", "cantidad": 0, "esperado": 35, "color": "#2b546e"}},
        {{"nivel": "DOK 4", "nombre": "Extendido", "cantidad": 0, "esperado": 10, "color": "#f2ae60"}}
    ],
    "items_analizados": [
        {{
            "id": 1,
            "pregunta_extracto": "Texto corto máx 80 chars...",
            "pregunta_completa": "Texto completo del reactivo...",
            "habilidad_declarada": "Lo que el OA exige demostrar para este reactivo (o 'No declarada explícitamente' si el docente no lo especificó)",
            "habilidad_real": "Lo que el reactivo realmente evidencia, en lenguaje simple y directo...",
            "proceso_mental_estudiante": "Descripción simple de lo que el estudiante hace mentalmente: ej. 'El estudiante solo recuerda un dato del texto sin necesidad de interpretarlo'",
            "dok_real": "DOK X",
            "estado": "Logrado | Mejorable",
            "analisis": "Diagnóstico mentor, propositivo, justificado. Celebra si está logrado. Propone si es mejorable...",
            "sugerencia_reingenieria": "Versión mejorada del reactivo con tono propositivo. Obligatorio si estado = Mejorable. Vacío si Logrado.",
            "pregunta_reflexion": "Una pregunta de coaching específica para este reactivo que invite al docente a reflexionar..."
        }}
    ],
    "conclusion": {{
        "texto": "Resumen pedagógico con tono de mentor, destacando el balance general...",
        "accion": "Consejo directo y constructivo al docente..."
    }}
}}
"""


# ==============================================================================
# ENDPOINT: AUDITAR
# ==============================================================================
@router.post("/audit")
async def auditar_instrumento(request: AnalisisRequest):
    try:
        print(f"🧠 Iniciando análisis DOK con {MODEL_NAME} (temperatura=0, Webb+Mentoría)...")

        prompt = build_analysis_prompt(request.objetivo_aprendizaje, request.texto_evaluacion)

        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            generation_config={
                "response_mime_type": "application/json",
                "temperature": 0.0,   # DETERMINISMO TOTAL
                "top_p": 1.0,
                "top_k": 1,
            }
        )

        response = model.generate_content(prompt)
        texto = response.text.strip()

        # Limpieza robusta de markdown
        if texto.startswith("```json"):
            texto = texto[7:]
        if texto.startswith("```"):
            texto = texto[3:]
        if texto.endswith("```"):
            texto = texto[:-3]

        resultado = json.loads(texto.strip())

        # Recalcular niveles_data desde los ítems reales (garantiza consistencia)
        conteo = Counter(item.get("dok_real", "DOK 2") for item in resultado.get("items_analizados", []))
        for nivel_entry in resultado.get("niveles_data", []):
            nivel_entry["cantidad"] = conteo.get(nivel_entry["nivel"], 0)

        # Asegurar campos opcionales existen (para compatibilidad con frontend)
        resultado.setdefault("reconocimiento_fortalezas", [])
        resultado.setdefault("feed_forward", [])
        resultado.setdefault("pregunta_cierre", "")

        print(f"✅ Análisis completado. Score: {resultado.get('score_coherencia')} | Items: {len(resultado.get('items_analizados', []))}")
        return resultado

    except Exception as e:
        print(f"❌ Error en auditoría DOK: {type(e).__name__}: {str(e)}")
        if "404" in str(e):
            raise HTTPException(status_code=500, detail="Modelo no encontrado. Verifica tu API Key o librería.")
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# ENDPOINT: GUARDAR
# ==============================================================================
@router.post("/save")
async def guardar_analisis(request: GuardarAnalisisRequest, authorization: Optional[str] = Header(None)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Base de datos no disponible")

    try:
        user_id = request.user_id
        author_name = "Profe IC"

        if authorization:
            token = authorization.replace("Bearer ", "")
            user_response = supabase.auth.get_user(token)
            if user_response and user_response.user:
                user_id = user_response.user.id
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

    except Exception as e:
        print(f"Error saving: {e}")
        raise HTTPException(status_code=500, detail=str(e))