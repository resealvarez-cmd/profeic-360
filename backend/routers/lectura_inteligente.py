from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# --- CONFIGURACIÓN IA ---
MODEL_NAME = "gemini-2.5-flash" 
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("⚠️ ERROR: No se encontró GOOGLE_API_KEY en el .env")

genai.configure(api_key=api_key)

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
    pregunta: str
    alternativas: List[str]
    respuesta_correcta: str
    justificacion: str

class RegenerarPreguntaRequest(BaseModel):
    nivel: str
    asignatura: str
    oa: str
    texto: str
    nivel_taxonomico_deseado: str # Ej: "Nivel I (Local)"

# --- ENDPOINTS ---

@router.post("/generar-texto")
async def generar_texto(request: GenerarTextoRequest):
    try:
        print(f"🧠 Generando texto con {MODEL_NAME}...")
        
        model = genai.GenerativeModel(model_name=MODEL_NAME)

        prompt = f"""
        ACTÚA COMO: Un experto creador de material pedagógico para estudiantes de {request.nivel} de la asignatura de {request.asignatura}.
        
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

        n1 = int(round(request.num_preguntas * 0.3))
        n2 = int(round(request.num_preguntas * 0.4))
        n3 = request.num_preguntas - n1 - n2

        prompt = f"""
        ACTÚA COMO: Evaluador experto en diseño instruccional y construcción de instrumentos de evaluación.
        
        NIVEL: {request.nivel}
        ASIGNATURA: {request.asignatura}
        OBJETIVO DE APRENDIZAJE: {request.oa}
        
        TEXTO BASE:
        "{request.texto}"
        
        TAREA:
        A partir del TEXTO BASE proporcionado, diseña {request.num_preguntas} ítems (preguntas) de selección múltiple con 4 alternativas (A, B, C, D) cada uno.
        
        DISTRIBUCIÓN TAXONÓMICA EXIGIDA:
        - {n1} preguntas de Nivel I (Local / Extracción de información explícita).
        - {n2} preguntas de Nivel II (Relacional / Inferencia, relación de ideas).
        - {n3} preguntas de Nivel III (Reflexivo / Evaluación, propósito, reflexión crítica).
        
        FORMATO DE SALIDA DEBE SER ESTRICTAMENTE JSON:
        {{
            "preguntas": [
                {{
                    "id": "1",
                    "nivel_taxonomico": "Nivel I (Local)", 
                    "pregunta": "Texto de la pregunta...",
                    "alternativas": ["opcion A", "opcion B", "opcion C", "opcion D"],
                    "respuesta_correcta": "opcion C",
                    "justificacion": "Explicación pedagógica de por qué esta es la respuesta correcta basada en el texto y el OA..."
                }}
            ]
        }}
        """

        response = await model.generate_content_async(prompt)
        resultado = response.text.strip()
        
        # Limpieza robusta
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
