from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
import os
import json
import httpx
import google.generativeai as genai


# --- CONFIGURACIÓN IA ---
MODEL_NAME = "gemini-2.5-flash" 
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("⚠️ ERROR: No se encontró GOOGLE_API_KEY en el .env")

genai.configure(api_key=api_key)
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
CONTEXTO_FALLBACK = "UBICACIÓN: Chile."

router = APIRouter(
    prefix="/lectura-inteligente",
    tags=["Lectura Inteligente"]
)

# --- MODELOS DE DATOS ---
class GenerarTextoRequest(BaseModel):
    nivel: str
    asignatura: str
    oa: str
    tipo_texto: str = "Informativo"
    extension_texto: str = "Media (300-500 palabras)"

class GenerarPreguntasRequest(BaseModel):
    nivel: str
    asignatura: str
    oa: str
    texto: str
    num_preguntas: int = 10

class PreguntaContexto(BaseModel):
    nivel_taxonomico: str
    tipo: str = "seleccion_multiple"  # 'seleccion_multiple' | 'desarrollo'
    pregunta: str
    alternativas: Optional[List[str]] = None
    respuesta_correcta: Optional[str] = None
    justificacion: str
    rubrica: Optional[dict] = None  # Solo para preguntas de desarrollo

class RegenerarPreguntaRequest(BaseModel):
    nivel: str
    asignatura: str
    oa: str
    texto: str
    nivel_taxonomico_deseado: str # Ej: "Nivel I (Local)"

# --- ENDPOINTS ---

@router.post("/generar-texto")
async def generar_texto(request: GenerarTextoRequest, authorization: Optional[str] = Header(None)):
    try:
        print(f"🧠 Generando texto con {MODEL_NAME}...")
        
        # Contexto institucional dinámico
        contexto_institucional = CONTEXTO_FALLBACK
        if authorization:
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    ctx_resp = await client.get(
                        f"{API_BASE_URL}/profile/context",
                        headers={"Authorization": authorization}
                    )
                    if ctx_resp.status_code == 200:
                        block = ctx_resp.json().get("context_block", "")
                        if block:
                            contexto_institucional = block
            except Exception:
                pass

        model = genai.GenerativeModel(model_name=MODEL_NAME)

        prompt = f"""
        ACTÚA COMO: Un experto creador de material pedagógico para estudiantes de {request.nivel} de la asignatura de {request.asignatura}.
        
        CONTEXTO INSTITUCIONAL (para localizar el texto si es pertinente):
        {contexto_institucional}
        
        OBJETIVO:
        El docente seleccionó el siguiente Objetivo de Aprendizaje (OA):
        "{request.oa}"

        TAREA:
        Escribe un texto de tipo {request.tipo_texto} (siempre que tenga sentido con la asignatura y el OA) 
        que sirva como base para una actividad de comprensión lectora.
        
        REQUISITOS:
        1. El vocabulario y la complejidad deben ser adecuados para estudiantes de {request.nivel}.
        2. El texto debe tener una extensión {request.extension_texto}.
        3. Debe conectar clara y directamente con el Objetivo de Aprendizaje.
        4. Debe ser original, atractivo e interesante para los estudiantes.
        
        RETORNO:
        Devuelve ÚNICAMENTE el texto generado, sin introducciones ni comentarios adicionales. No uses formato Markdown como ```texto, solo el contenido directamente.
        """

        response = await model.generate_content_async(prompt)
        texto_generado = response.text.strip()
            
        return {"texto": texto_generado}

    except Exception as e:
        print(f"❌ Error en IA (generar texto): {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generar-preguntas")
async def generar_preguntas(request: GenerarPreguntasRequest):
    try:
        print(f"🧠 Generando {request.num_preguntas} preguntas con {MODEL_NAME}...")
        
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            generation_config={"response_mime_type": "application/json"}
        )

        n1 = max(1, int(round((request.num_preguntas - 2) * 0.3)))
        n2 = max(1, int(round((request.num_preguntas - 2) * 0.4)))
        n3 = max(1, (request.num_preguntas - 2) - n1 - n2)
        n_desarrollo = 2  # Siempre 2 preguntas de desarrollo

        prompt = f"""
        ACTÚA COMO: Evaluador experto en diseño instruccional y construcción de instrumentos de evaluación.
        
        NIVEL: {request.nivel}
        ASIGNATURA: {request.asignatura}
        OBJETIVO DE APRENDIZAJE: {request.oa}
        
        TEXTO BASE:
        "{request.texto}"
        
        TAREA:
        A partir del TEXTO BASE, diseña {request.num_preguntas} ítems en total:
        
        PARTE 1 - SELECCIÓN MÚLTIPLE ({request.num_preguntas - n_desarrollo} preguntas con 4 alternativas A, B, C, D):
        DISTRIBUCIÓN TAXONÓMICA:
        - {n1} preguntas de Nivel I (Local / Extracción de información explícita).
        - {n2} preguntas de Nivel II (Relacional / Inferencia, relación de ideas).
        - {n3} preguntas de Nivel III (Reflexivo / Evaluación, propósito, reflexión crítica).
        
        PARTE 2 - DESARROLLO ({n_desarrollo} preguntas abiertas de alto nivel cognitivo, Nivel III):
        Genera preguntas que exijan al estudiante construir una respuesta escrita fundamentada (mínimo 3-5 oraciones).
        Cada pregunta de desarrollo DEBE incluir una rúbrica de evaluación con exactamente 3 niveles de desempeño,
        usando ESTRICTAMENTE los indicadores nacionales SIMCE de Chile:
        
        FORMATO DE SALIDA JSON ESTRICTO:
        {{
            "preguntas": [
                {{
                    "id": "1",
                    "tipo": "seleccion_multiple",
                    "nivel_taxonomico": "Nivel I (Local)",
                    "pregunta": "Texto de la pregunta...",
                    "alternativas": ["opcion A", "opcion B", "opcion C", "opcion D"],
                    "respuesta_correcta": "opcion C",
                    "justificacion": "Explicación pedagógica..."
                }},
                {{
                    "id": "{request.num_preguntas - 1}",
                    "tipo": "desarrollo",
                    "nivel_taxonomico": "Nivel III (Reflexivo)",
                    "pregunta": "Texto de la pregunta de desarrollo...",
                    "alternativas": null,
                    "respuesta_correcta": null,
                    "justificacion": "Criterio pedagógico de esta pregunta abierta...",
                    "rubrica": {{
                        "criterio": "Nombre del criterio principal de evaluación",
                        "niveles": [
                            {{"nivel": 3, "label": "Adecuado", "descriptor": "El estudiante responde de forma completa, con argumentos claros y evidencia del texto..."}},
                            {{"nivel": 2, "label": "Elemental", "descriptor": "El estudiante responde parcialmente, con argumentos básicos o sin evidencia suficiente..."}},
                            {{"nivel": 1, "label": "Insuficiente", "descriptor": "El estudiante no responde, responde de forma incorrecta o no demuestra comprensión..."}}
                        ]
                    }}
                }}
            ]
        }}
        """

        response = await model.generate_content_async(prompt)
        resultado = response.text.strip()
        
        if resultado.startswith("```"):
            resultado = resultado.replace("```json", "").replace("```", "").strip()
            
        return json.loads(resultado)

    except Exception as e:
        print(f"❌ Error en IA (generar preguntas): {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/regenerar-pregunta")
async def regenerar_pregunta(request: RegenerarPreguntaRequest):
    try:
        print(f"🧠 Regenerando pregunta ({request.nivel_taxonomico_deseado}) con {MODEL_NAME}...")
        
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            generation_config={"response_mime_type": "application/json"}
        )

        prompt = f"""
        ACTÚA COMO: Evaluador experto en diseño instruccional.
        
        NIVEL: {request.nivel}
        ASIGNATURA: {request.asignatura}
        OBJETIVO DE APRENDIZAJE: {request.oa}
        
        TEXTO BASE:
        "{request.texto}"
        
        TAREA:
        El docente ha solicitado generar UNA (1) nueva pregunta de selección múltiple basada en el TEXTO BASE.
        Esta nueva pregunta DEBE SER estrictamente de Nivel Taxonómico: {request.nivel_taxonomico_deseado}.
        Debe tener 4 alternativas (A, B, C, D).
        
        DEFINICIÓN DEL NIVEL SOLICITADO:
        - Nivel I (Local): Extracción de información explícita.
        - Nivel II (Relacional): Inferencia, relación de ideas, deducción.
        - Nivel III (Reflexivo): Evaluación, propósito, reflexión crítica, aplicación.
        
        FORMATO DE SALIDA ESTRICTAMENTE JSON:
        {{
            "pregunta_nueva": {{
                "id": "temporal",
                "nivel_taxonomico": "{request.nivel_taxonomico_deseado}", 
                "pregunta": "Texto de la NUEVA pregunta...",
                "alternativas": ["opcion A", "opcion B", "opcion C", "opcion D"],
                "respuesta_correcta": "opcion B",
                "justificacion": "Explicación pedagógica de por qué esta es la respuesta correcta basada en el texto..."
            }}
        }}
        """

        response = await model.generate_content_async(prompt)
        resultado = response.text.strip()
        
        # Limpieza robusta
        if resultado.startswith("```"):
            resultado = resultado.replace("```json", "").replace("```", "").strip()
            
        return json.loads(resultado)

    except Exception as e:
        print(f"❌ Error en IA (regenerar pregunta): {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
