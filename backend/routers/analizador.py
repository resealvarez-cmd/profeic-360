from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
import os
import json
import asyncio
import google.generativeai as genai
from dotenv import load_dotenv
from supabase import create_client, Client

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
# PROMPTS ANCLADOS EN WEBB (RIGOR PEDAGÓGICO)
# ==============================================================================
WEBB_DESCRIPTORS = """
## MARCO DE REFERENCIA: TAXONOMÍA WEBB (DOK) — DESCRIPTORES OFICIALES

DOK 1 — RECUERDO Y REPRODUCCIÓN
- El estudiante recuerda, recupera o reproduce información o procedimientos memorizados.
- Verbos clave: definir, enlistar, nombrar, recordar, repetir, completar, identificar (un hecho directo).
- Ejemplo de pregunta DOK 1: "¿En qué año ocurrió la Batalla de Boyacá?" / "Define fotosíntesis."
- Señal clave: La respuesta única y directa está en el texto o en la memoria. No hay interpretación.

DOK 2 — HABILIDADES Y CONCEPTOS
- El estudiante interpreta, clasifica, organiza, identifica patrones o aplica un procedimiento en un contexto conocido.
- Verbos clave: clasificar, resumir, interpretar, explicar (cómo), predecir, comparar, inferir (desde texto).
- Ejemplo DOK 2: "¿Por qué el pH afecta la velocidad de la reacción?" / "Compara las causas de la I y II Guerra Mundial."
- Señal clave: La respuesta requiere más de un paso o implica usar una idea, pero sigue dentro de un procedimiento conocido.

DOK 3 — RAZONAMIENTO ESTRATÉGICO
- El estudiante razona, argumenta, construye, evalúa o diseña usando múltiples fuentes o perspectivas. Hay más de una respuesta posible válida.
- Verbos clave: argumentar, evaluar, justificar (con evidencia), analizar (causas complejas), construir, formular hipótesis.
- Ejemplo DOK 3: "Argumenta si el modelo económico actual es sostenible. Usa al menos 2 fuentes provistas."
- Señal clave: No hay una única respuesta correcta; exige juicio, evidencia y razonamiento extendido.

DOK 4 — PENSAMIENTO EXTENDIDO
- El estudiante diseña, investiga, crea o sintetiza conocimiento en proyectos que integran múltiples disciplinas o fuentes durante un período prolongado.
- Verbos clave: diseñar (un proyecto), investigar, crear, sintetizar (entre disciplinas).
- Ejemplo DOK 4: "Diseña un plan de acción comunitario para reducir la contaminación local usando biología, matemáticas y ciencias sociales."
- Señal clave: Requiere tiempo extendido (días/semanas), es multidisciplinario y produce un producto original.
"""

SYSTEM_PROMPT = f"""
Eres un Coach Pedagógico Senior especializado en la Taxonomía de Profundidad del Conocimiento (DOK) de Norman Webb.
Tu análisis debe ser riguroso, pedagógicamente fundamentado y AUDITABLEMENTE justificado.

{WEBB_DESCRIPTORS}

## REGLAS DE CLASIFICACIÓN ESTRICTAS
1. Clasifica SIEMPRE según la DEMANDA COGNITIVA REAL de la tarea (lo que el cerebro del estudiante debe hacer), no por las palabras o verbos usados.
2. Si un reactivo usa verbos de orden superior (argumentar, evaluar) pero la respuesta puede obtenerse directamente de una fuente sin razonar, es DOK 2 como máximo.
3. Fundamenta CADA clasificación citando el descriptor DOK correspondiente.
4. Si hay duda entre dos niveles, opta por el menor (más conservador).
5. Antes de dar el nivel final, escribe explícitamente qué proceso cognitivo realiza el estudiante.
"""

def build_analysis_prompt(oa: str, evaluacion: str) -> str:
    return f"""
{SYSTEM_PROMPT}

## INPUTS DEL DOCENTE
- **Objetivo de Aprendizaje (OA):** {oa}
- **Instrumento de evaluación:**
{evaluacion}

## TU TAREA (sigue este orden OBLIGATORIO por cada reactivo):
Para CADA pregunta o reactivo del instrumento:
1. COPIA el texto completo del reactivo.
2. RAZONA en voz alta: "El estudiante debe [describir el proceso cognitivo exacto]."
3. COMPARA ese proceso contra los 4 descriptores DOK.
4. ASIGNA el nivel DOK justificando con el descriptor.
5. PROPÓN una versión mejorada si el nivel es DOK 1 o 2 (para elevar a DOK 3).

Luego genera el JSON final con TODOS los campos completos.

## FORMATO DE RESPUESTA (JSON ESTRICTO, sin markdown):
{{
    "metadata": {{
        "asignatura_detectada": "...",
        "nivel_detectado": "...",
        "ejemplo_excelencia": {{
            "pregunta": "...",
            "explicacion": "Por qué es DOK 3: [citing descriptor]..."
        }}
    }},
    "diagnostico_global": "...",
    "score_coherencia": 0,
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
            "razonamiento_cognitivo": "El estudiante debe [proceso exacto]...",
            "dok_declarado": "DOK X (si el docente lo indicó, sino null)",
            "dok_real": "DOK X",
            "estado": "Alineado | Mejorable",
            "analisis": "Diagnóstico justificado citando el descriptor Webb...",
            "sugerencia_reingenieria": "Versión mejorada del reactivo (solo si Mejorable)..."
        }}
    ],
    "conclusion": {{
        "texto": "Resumen pedagógico fundamentado...",
        "accion": "Consejo directo al docente..."
    }}
}}
"""


async def _single_analysis_call(prompt: str) -> dict:
    """Hace UNA llamada a Gemini con temperature=0 y retorna el JSON parseado."""
    model = genai.GenerativeModel(
        model_name=MODEL_NAME,
        generation_config={
            "response_mime_type": "application/json",
            "temperature": 0.0,          # DETERMINISMO: sin aleatoriedad
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

    return json.loads(texto.strip())


def _compute_consensus(results: list[dict]) -> dict:
    """
    Toma 3 análisis y genera un consenso por mayoría de votos para cada reactivo.
    El resultado base es el del primer análisis; los niveles DOK se corrigen por consenso.
    """
    if len(results) == 1:
        return results[0]

    base = results[0]
    n_items = len(base.get("items_analizados", []))

    for i in range(n_items):
        votes = []
        for r in results:
            items = r.get("items_analizados", [])
            if i < len(items):
                votes.append(items[i].get("dok_real", "DOK 2"))

        # Mayoría
        from collections import Counter
        counter = Counter(votes)
        winner, count = counter.most_common(1)[0]

        # Si ninguno tiene mayoría absoluta (todos distintos), elegir el mayor nivel (conservador alto)
        if count < 2:
            dok_order = {"DOK 1": 1, "DOK 2": 2, "DOK 3": 3, "DOK 4": 4}
            winner = max(votes, key=lambda d: dok_order.get(d, 2))

        base["items_analizados"][i]["dok_real"] = winner
        base["items_analizados"][i]["analisis"] = (
            f"[Consenso {count}/{len(results)} análisis] " + base["items_analizados"][i].get("analisis", "")
        )
        base["items_analizados"][i]["estado"] = (
            "Alineado" if base["items_analizados"][i].get("dok_declarado") == winner else "Mejorable"
        )

    # Recalcular niveles_data con los DOK reales consolidados
    from collections import Counter
    final_levels = Counter(item["dok_real"] for item in base["items_analizados"])
    for nivel_entry in base["niveles_data"]:
        nivel_entry["cantidad"] = final_levels.get(nivel_entry["nivel"], 0)

    return base


# ==============================================================================
# ENDPOINT 1: AUDITAR — ENSEMBLE x3 + TEMPERATURE=0 + CHAIN-OF-THOUGHT
# ==============================================================================
@router.post("/audit")
async def auditar_instrumento(request: AnalisisRequest):
    try:
        print(f"🧠 Iniciando análisis DOK riguroso con {MODEL_NAME} (ensemble x3)...")

        prompt = build_analysis_prompt(request.objetivo_aprendizaje, request.texto_evaluacion)

        # ENSEMBLE x3: 3 llamadas paralelas independientes
        tasks = [_single_analysis_call(prompt) for _ in range(3)]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Filtrar errores (si alguna llamada falla, usamos las que sí funcionaron)
        valid_results = [r for r in results if isinstance(r, dict)]

        if not valid_results:
            raise Exception("Las 3 llamadas al modelo fallaron. Revisa la API Key o el modelo.")

        print(f"✅ {len(valid_results)}/3 análisis completados. Computando consenso...")

        # CONSENSO por mayoría
        consensus = _compute_consensus(valid_results)

        return consensus

    except Exception as e:
        print(f"❌ Error en auditoría DOK: {type(e).__name__}: {str(e)}")
        if "404" in str(e):
            raise HTTPException(status_code=500, detail="Modelo no encontrado. Verifica tu API Key o librería.")
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# ENDPOINT 2: GUARDAR (CONECTADO A DB)
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