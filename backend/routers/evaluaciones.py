from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List, Union, Optional
import google.generativeai as genai
import json
import re
import os
import httpx
import asyncio

router = APIRouter()

api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# --- CONTEXTO INSTITUCIONAL FALLBACK ---
# Solo se usa si el profesor no tiene colegio configurado en su perfil
CONTEXTO_FALLBACK = """
UBICACIÓN: Chile.
"""

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

# --- MODELOS DE DATOS ---
class DokDistribution(BaseModel):
    dok1: int
    dok2: int
    dok3: int

class Quantities(BaseModel):
    multiple_choice: int
    true_false: int
    short_answer: int
    essay: int

class PointsPerType(BaseModel):
    multiple_choice: int
    true_false: int
    short_answer: int
    essay: int

class AssessmentConfig(BaseModel):
    grade: str
    subject: str
    oaIds: List[Union[str, int]] 
    oaTexts: Optional[List[str]] = None
    customOa: str
    context_text: Optional[str] = None
    archivo_base64: Optional[str] = None  # Base64 del PDF para Gemini vision
    archivo_mime_type: Optional[str] = "application/pdf"
    archivo_nombre: Optional[str] = None
    dokDistribution: DokDistribution
    quantities: Quantities
    points: PointsPerType
    num_alternatives: Optional[int] = 4

# --- LIMPIEZA JSON ---
def limpiar_json(texto):
    texto = re.sub(r'```json\s*', '', texto)
    texto = re.sub(r'```\s*', '', texto)
    try:
        return json.loads(texto)
    except Exception:
        inicio = texto.find("{")
        fin = texto.rfind("}")
        if inicio != -1 and fin != -1:
            try:
                return json.loads(texto[inicio:fin+1])
            except Exception:
                pass
        return None

@router.post("/generate-assessment")
async def generate_assessment(config: AssessmentConfig, authorization: Optional[str] = Header(None)):
    print(f"⚡ [EVALUACIONES] Generando prueba contextualizada para {config.grade} - {config.subject}")
    
    try:
        # ── 1. Obtener contexto institucional del profesor ──
        contexto_institucional = CONTEXTO_FALLBACK
        if authorization:
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    ctx_resp = await client.get(
                        f"{API_BASE_URL}/profile/context",
                        headers={"Authorization": authorization}
                    )
                    if ctx_resp.status_code == 200:
                        ctx_data = ctx_resp.json()
                        block = ctx_data.get("context_block", "")
                        if block:
                            contexto_institucional = block
            except Exception as ctx_err:
                print(f"⚠️ No se pudo obtener contexto institucional: {ctx_err}")
                # Continúa con el fallback, no falla la generación

        # ── 2. Construir texto de OAs ──
        if config.oaTexts and len(config.oaTexts) > 0:
            # Usar las descripciones completas del currículum
            oas_texto = "\n".join([f"- {t}" for t in config.oaTexts if t])
            oas_label = "DESCRIPCIONES COMPLETAS DE LOS OBJETIVOS DE APRENDIZAJE:"
        else:
            # Fallback: usar los IDs/códigos
            oa_ids_str = [str(x) for x in config.oaIds]
            oas_texto = " | ".join(oa_ids_str)
            oas_label = "Objetivos (Códigos):"
        
        if config.customOa:
            oas_texto += f"\n- Objetivo extra/personalizado: {config.customOa}"

        total_pts = (
            (config.quantities.multiple_choice * config.points.multiple_choice) +
            (config.quantities.true_false * config.points.true_false) +
            (config.quantities.short_answer * config.points.short_answer) +
            (config.quantities.essay * config.points.essay)
        )

        # PREPARAR BLOQUE DE CONTEXTO ESTRICTO (MODO ESTRICTO)
        if config.context_text:
            strict_block = f"""
=== REGLA DE ORO (MODO ESTRICTO CON EXCEPCIÓN DOK) ===
FUENTE ÚNICA DE VERDAD: {config.context_text}
Regla para DOK 1 y 2: Actúa como si SOLO supieras lo que está escrito en el texto. No inventes datos.
Regla para DOK 3: Tienes PERMISO para inventar escenarios hipotéticos o casos de aplicación, SIEMPRE Y CUANDO el estudiante deba utilizar los conceptos del texto base para resolverlos.
======================================================
            """
        else:
            strict_block = ""

        # PROMPT MAESTRO FINAL
        prompt = f"""
{strict_block}

ROL: Eres un Diseñador Instruccional y Experto en Evaluación Educativa del Mineduc (Chile).
TAREA: Crear una PRUEBA SUMATIVA de alta rigurosidad y precisión técnica (Total: {total_pts} pts).

CONTEXTO INSTITUCIONAL Y DE APLICACIÓN:
- Colegio: {contexto_institucional}
- Nivel/Curso: {config.grade}
- Asignatura: {config.subject}

OBJETIVOS DE APRENDIZAJE (OA) A EVALUAR:
{oas_texto}

INSTRUCCIÓN CRÍTICA: La prueba DEBE evaluar EXCLUSIVAMENTE estos contenidos. Alinea la mayor carga cognitiva (DOK 3) al verbo principal exigido por el OA.

--- MARCO DOK Y PREVENCIÓN DE CAMUFLAJE COGNITIVO ---
- DOK 1 & 2 (Memoria y Aplicación): Preguntas directas, extracción de datos, aplicación de fórmulas o comprensión literal.
- DOK 3 (Pensamiento Estratégico): PROHIBIDO hacer preguntas directas o usar "camuflaje cognitivo" (problemas rutinarios disfrazados de historias largas). Para crear un ítem DOK 3, DEBES forzar la argumentación usando una de estas 3 tipologías:
  1. El Tercero Equivocado: Presenta un personaje/texto que comete un error de procedimiento o concepto. El estudiante debe identificar el error y justificar la corrección.
  2. Múltiples Caminos: Presenta un escenario con varias soluciones posibles. El estudiante debe elegir la óptima y justificar por qué.
  3. Dato Contradictorio: Entrega información con sesgos o datos sobrantes que el estudiante debe discriminar para concluir.

--- CALIBRACIÓN EVOLUTIVA Y DISCIPLINAR ---
Adapta OBLIGATORIAMENTE la complejidad según el {config.grade} y la {config.subject}:
- Si el curso corresponde a Pre-Kínder, Kínder, 1°, 2° o 3° Básico: Límite de lectura de 25 palabras por escenario. Usa oraciones simples. Usa solo la tipología "El Tercero Equivocado" de forma muy concreta.
- Si el curso corresponde a 4°, 5° o 6° Básico: Límite de 50 palabras. Contextos cotidianos escolares.
- Si la asignatura es Lenguaje/Literatura: El DOK 3 NO debe inventar casos externos; debe exigir evaluación crítica sobre las motivaciones de los personajes, el autor o la estructura del texto mismo.
- Si la asignatura es Matemática/Ciencias/Física: El DOK 3 debe centrarse en encontrar errores en procedimientos o justificar matemáticamente una decisión, no solo en calcular.

--- ESTRUCTURA Y RESTRICCIONES DE FORMATO ---
Distribución Cognitiva Exigida: DOK 1: {config.dokDistribution.dok1}% | DOK 2: {config.dokDistribution.dok2}% | DOK 3: {config.dokDistribution.dok3}%
- Verdadero/Falso ({config.quantities.true_false} preguntas, {config.points.true_false} pts c/u): Úsalas EXCLUSIVAMENTE para DOK 1 y 2.
- Selección Múltiple ({config.quantities.multiple_choice} preguntas de EXACTAMENTE {config.num_alternatives} alternativas, {config.points.multiple_choice} pts c/u): Si haces una DOK 3 aquí, debe ser análisis de casos (las alternativas son diferentes justificaciones o caminos lógicos).
- Respuesta Breve ({config.quantities.short_answer} preguntas, {config.points.short_answer} pts c/u): Para DOK 1 y 2.
- Desarrollo ({config.quantities.essay} preguntas, {config.points.essay} pts c/u): Úsalas prioritariamente para asegurar los ítems DOK 3.

--- FORMATO DE SALIDA (JSON ESTRICTO) ---
{{
    "student_version": {{
        "title": "Título de la Prueba",
        "description": "Instrucciones...",
        "items": [
            {{
                "id": 1,
                "type": "multiple_choice",
                "dok_level": 1,
                "points": {config.points.multiple_choice},
                "stem": "Pregunta...",
                "options": ["A) Opción 1", "B) Opción 2"]
            }}
        ]
    }},
    "teacher_guide": {{
        "answers": [
            {{
                "related_item_id": 1,
                "correct_answer": "A) Opción 1",
                "explanation": "Justificación basada en el texto..."
            }}
        ]
    }}
}}
"""

        model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})
        
        # If a file was provided, use multimodal content (handles scanned PDFs via Gemini vision)
        if config.archivo_base64:
            import base64
            file_part = {
                "inline_data": {
                    "mime_type": config.archivo_mime_type or "application/pdf",
                    "data": config.archivo_base64
                }
            }
            content = [prompt, file_part]
            print(f"📄 Usando visión multimodal con archivo: {config.archivo_nombre}")
        else:
            content = prompt
        
        response = await asyncio.to_thread(
            model.generate_content,
            content,
            request_options={"timeout": 240}
        )
        resultado = limpiar_json(response.text)

        if not resultado:
            return {"title": "Error Generando", "description": "Intenta de nuevo con menos preguntas.", "items": []}

        return resultado

    except Exception as e:
        print(f"❌ Error Evaluación: {e}")
        raise HTTPException(status_code=500, detail=str(e))