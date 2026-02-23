from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Union, Optional
import google.generativeai as genai
import json
import re
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# --- CONFIGURACIÓN DE IDENTIDAD LOCAL ---
# Esto le da el "Sello" a todas las pruebas generadas
CONTEXTO_LOCAL = """
UBICACIÓN: Chiguayante, Región del Biobío, Chile.
ENTORNO: Cercanía al Río Biobío, Cerro Manquimávida, clima templado.
SELLO INSTITUCIONAL: Colegio Madre Paulina (Humanista-Cristiano, Excelencia, Respeto).
INSTRUCCIÓN DE LOCALIZACIÓN: 
Siempre que sea pertinente al OA, utiliza ejemplos locales.
- En lugar de "Un águila come serpientes", usa "Un Peuco caza una lagartija".
- En lugar de "Un bosque de pinos", prefiere "Bosque esclerófilo o Selva Valdiviana".
- Contextualiza problemas matemáticos o físicos en situaciones cotidianas de la zona (ej: el Biotren, la Costanera).
"""

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
async def generate_assessment(config: AssessmentConfig):
    print(f"⚡ [EVALUACIONES] Generando prueba contextualizada para {config.grade} - {config.subject}")
    
    try:
        oa_ids_str = [str(x) for x in config.oaIds]
        oas_texto = " | ".join(oa_ids_str)
        
        if config.customOa:
            oas_texto += f" | OA Extra: {config.customOa}"

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

        # PROMPT ENRIQUECIDO CON CONTEXTO LOCAL
        prompt = f"""
        {strict_block}

        ROL: Experto en Evaluación Educativa del Mineduc (Chile).
        TAREA: Crear una PRUEBA SUMATIVA rigurosa (Total: {total_pts} pts).
        
        {CONTEXTO_LOCAL}
        
        CONTEXTO DE LA PRUEBA:
        - Nivel: {config.grade}
        - Asignatura: {config.subject}
        - Objetivos (IDs/Textos): {oas_texto}
        
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