from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List, Union, Optional
import google.generativeai as genai
import json
import re
import os
import httpx
from dotenv import load_dotenv

load_dotenv()
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
    oaTexts: Optional[List[str]] = None  # Descripciones completas de los OAs seleccionados
    customOa: str
    context_text: Optional[str] = None # <--- RAG CTX
    dokDistribution: DokDistribution
    quantities: Quantities
    quantities: Quantities
    points: PointsPerType 
    num_alternatives: Optional[int] = 4 # Default 4  

# --- LIMPIEZA JSON ---
def limpiar_json(texto):
    texto = re.sub(r'```json\s*', '', texto)
    texto = re.sub(r'```\s*', '', texto)
    try:
        return json.loads(texto)
    except:
        inicio = texto.find("{")
        fin = texto.rfind("}")
        if inicio != -1 and fin != -1:
            try:
                return json.loads(texto[inicio:fin+1])
            except:
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

        # PREPARAR BLOQUE DE CONTEXTO ESTRICTO
        strict_block = ""
        if config.context_text:
            strict_block = f"""
        === REGLA DE ORO (MODO ESTRICTO) ===
        Tienes PROHIBIDO utilizar tu conocimiento general para responder las preguntas de contenido.
        Debes actuar como si SOLO supieras lo que está escrito en el texto proporcionado abajo.
        Si la respuesta a una pregunta no aparece explícitamente en el texto, NO la inventes.
        ====================================

        TEXTO DE REFERENCIA (FUENTE ÚNICA DE VERDAD):
        {config.context_text}
        =============================================
            """

        # PROMPT ENRIQUECIDO CON CONTEXTO INSTITUCIONAL REAL
        prompt = f"""
        {strict_block}

        ROL: Experto en Evaluación Educativa del Mineduc (Chile).
        TAREA: Crear una PRUEBA SUMATIVA rigurosa (Total: {total_pts} pts).
        
        CONTEXTO INSTITUCIONAL (úsalo para personalizar ejemplos y situaciones):
        {contexto_institucional}
        
        CONTEXTO DE LA PRUEBA:
        - Nivel: {config.grade}
        - Asignatura: {config.subject}
        - {oas_label}
{oas_texto}
        
        INSTRUCCION CRITICA: La prueba DEBE abordar EXCLUSIVAMENTE los contenidos descritos en los objetivos anteriores.
        NO uses otros contenidos de la asignatura. Si el objetivo habla de raíces cuadradas, la prueba es de raíces cuadradas.
        Si el objetivo habla de fracciones, la prueba es de fracciones. Respeta siempre el contenido exacto del OA.
        
        ESTRUCTURA OBLIGATORIA:
        ESTRUCTURA OBLIGATORIA:
        1. Selección Múltiple: {config.quantities.multiple_choice} preguntas ({config.points.multiple_choice} pts c/u). Cada una con EXACTAMENTE {config.num_alternatives} alternativas.
        2. Verdadero/Falso: {config.quantities.true_false} preguntas ({config.points.true_false} pts c/u).
        3. Respuesta Breve: {config.quantities.short_answer} preguntas ({config.points.short_answer} pts c/u).
        4. Desarrollo: {config.quantities.essay} preguntas ({config.points.essay} pts c/u).

        DISTRIBUCIÓN COGNITIVA (DOK):
        - DOK 1: {config.dokDistribution.dok1}%
        - DOK 2: {config.dokDistribution.dok2}%
        - DOK 3: {config.dokDistribution.dok3}%

        FORMATO JSON DE RESPUESTA:
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
                    }},
                     {{
                        "id": 2,
                        "type": "essay",
                        "dok_level": 3,
                        "points": {config.points.essay},
                        "stem": "Pregunta de desarrollo..."
                    }}
                ]
            }},
            "teacher_guide": {{
                "answers": [
                    {{
                        "related_item_id": 1,
                        "correct_answer": "A) Opción 1",
                        "explanation": "Justificación basada en el texto..."
                    }},
                    {{
                        "related_item_id": 2,
                        "rubric": {{
                            "logrado": "Describe correctamente...",
                            "medianamente": "Menciona parcialmente...",
                            "no_logrado": "No menciona..."
                        }}
                    }}
                ]
            }}
        }}
        """

        model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})
        response = model.generate_content(prompt)
        resultado = limpiar_json(response.text)

        if not resultado:
            return {"title": "Error Generando", "description": "Intenta de nuevo con menos preguntas.", "items": []}

        return resultado

    except Exception as e:
        print(f"❌ Error Evaluación: {e}")
        raise HTTPException(status_code=500, detail=str(e))