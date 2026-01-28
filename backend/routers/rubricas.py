from fastapi import APIRouter
from pydantic import BaseModel
import google.generativeai as genai
import json
import re
import os
from dotenv import load_dotenv

# Configuración
load_dotenv()
router = APIRouter()

api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# --- MODELO COMPATIBLE CON PYTHON 3.14 ---
class RubricRequest(BaseModel):
    nivel: str
    asignatura: str
    oaId: str
    oaDescripcion: str
    actividad: str 

# Forzamos reconstrucción por seguridad
RubricRequest.model_rebuild()

def limpiar_rubrica_json(texto):
    # Limpieza básica
    texto = re.sub(r'```json\s*', '', texto)
    texto = re.sub(r'```\s*', '', texto)
    try:
        return json.loads(texto)
    except:
        # Intento de recuperación si falta una llave
        try:
            return json.loads(texto + "}")
        except:
            return {"titulo": "Error de Generación", "descripcion": "Intente nuevamente.", "tabla": []}

@router.post("/generate-rubric")
async def generar_rubrica(req: RubricRequest):
    print(f"⚡ [RÚBRICA] Generando para: {req.actividad}")
    
    try:
        # PROMPT V3: "PEDAGOGÍA DE HIERRO"
        prompt = f"""
        ROL: Experto en Evaluación Auténtica.
        TAREA: Crear Rúbrica Analítica para el PRODUCTO: "{req.actividad}".
        CONTEXTO: {req.nivel}, {req.asignatura}, OA: {req.oaDescripcion}.
        
        LISTA NEGRA (PALABRAS PROHIBIDAS):
        - Alumno, Estudiante, Él/Ella (NUNCA evaluar a la persona).
        - Logra, Entiende, Comprende (Son procesos internos, no observables).
        - Correctamente, Adecuadamente, Satisfactoriamente (Son subjetivos).
        - Elegancia, Belleza, Loable, Razonable (Son ambiguos).

        REGLAS DE ORO:
        1. SUJETO DE LA ORACIÓN = EL PRODUCTO.
           - Bien: "El ensayo presenta...", "El cálculo incluye...", "La maqueta respeta...".
        2. NIVELES DE DESEMPEÑO:
           - INSUFICIENTE: Errores críticos u omisiones que impiden el funcionamiento/comprensión.
           - ELEMENTAL: Cumple lo mínimo, pero con imprecisiones o falta de profundidad.
           - ADECUADO (Meta): Cumple el estándar completo sin errores técnicos.
           - DESTACADO: Aporta un plus (transferencia, análisis crítico, originalidad justificada).

        JSON OBLIGATORIO:
        {{
          "titulo": "Título Técnico del Instrumento",
          "descripcion": "Breve descripción del propósito.",
          "tabla": [
            {{ 
                "criterio": "Nombre del Criterio (Sustantivo)", 
                "porcentaje": 20, 
                "niveles": {{ 
                    "insuficiente": "...", 
                    "elemental": "...", 
                    "adecuado": "...", 
                    "destacado": "..." 
                }} 
            }}
          ]
        }}
        """
        model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})
        response = model.generate_content(prompt)
        return limpiar_rubrica_json(response.text)
    except Exception as e:
        print(f"❌ Error Rúbrica: {e}")
        return {"titulo": "Error Técnico", "descripcion": str(e), "tabla": []}