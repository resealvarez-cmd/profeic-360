from fastapi import APIRouter
from pydantic import BaseModel
# Eliminamos "List" y "Optional" de typing porque daban problemas en Python 3.14
import google.generativeai as genai
import json
import re
import os
from dotenv import load_dotenv

# Configuración Inicial
load_dotenv()
router = APIRouter()

api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# --- MODELOS (MODERNIZADOS PARA PYTHON 3.14) ---
class GenerateRequest(BaseModel):
    nivel: str
    asignatura: str
    oas_mochila: list[str]            # Cambio: list[str] en vez de List[str]
    valor_panel: str
    actitud_especifica: str
    medio_usuario: str | None = None  # Cambio: str | None en vez de Optional[str]
    num_clases: int
    modo_distribucion: str

# Forzamos la reconstrucción del modelo para evitar el error "not fully defined"
GenerateRequest.model_rebuild()

# --- HERRAMIENTA DE LIMPIEZA "QUIRÚRGICA" V4 ---
def limpiar_y_reparar_json(texto_sucio):
    print(f"🧹 [Planificador] Limpiando respuesta (len: {len(texto_sucio)})...")
    
    texto = re.sub(r'```json\s*', '', texto_sucio)
    texto = re.sub(r'```\s*', '', texto)
    
    inicio = texto.find("{")
    fin = texto.rfind("}")
    
    if inicio == -1 or fin == -1:
        return None
    
    texto_limpio = texto[inicio : fin + 1]
    
    # REPARACIÓN LATEX
    texto_limpio = re.sub(r'(?<!\\)\\(?!["\\/bfnrtu])', r'\\\\', texto_limpio)

    try:
        return json.loads(texto_limpio)
    except json.JSONDecodeError:
        try:
            return json.loads(texto_limpio + "}") 
        except:
            return None

# --- ENDPOINT ---
@router.post("/api/generate")
async def generar_planificacion(request: GenerateRequest):
    print(f"⚡ [PLANIFICADOR] Procesando: {request.nivel} | {request.asignatura}")
    
    try:
        if not api_key: return {"error": "Falta API Key"}
        
        prompt = f"""
        ROL: Jefe Técnico Pedagógico del Colegio Madre Paulina.
        TAREA: Diseñar una Unidad Didáctica en formato JSON estricto.
        
        INPUTS:
        - Nivel: {request.nivel}
        - Asignatura: {request.asignatura}
        - OAs: {', '.join(request.oas_mochila)}
        - Sello: {request.valor_panel} ({request.actitud_especifica})
        - Clases: {request.num_clases} ({request.modo_distribucion})
        - Medio: {request.medio_usuario or "Estrategia innovadora"}

        REGLAS DE ORO (PEDAGOGÍA):
        1. ESTRATEGIA: Usa la fórmula: "Verbo (Habilidad OA) + Contenido + Medio + Actitud".
        2. RECURSOS Y TICKETS: Escribe el ejercicio REAL o pregunta REAL.
        3. EVALUACIÓN: Enfoque en PRODUCTO (3ra persona), nunca en el alumno.
        4. MATEMÁTICAS/LATEX: Usa SIEMPRE DOBLE BARRA INVERTIDA para fórmulas. Ejemplo: $$ \\\\frac{{1}}{{2}} $$ (Esto es vital para no romper el JSON).

        ESTRUCTURA JSON DE RESPUESTA:
        {{
          "titulo_unidad_creativo": "Texto",
          "estrategia_aprendizaje_sentencia": "Texto",
          "planificacion_clases": [
            {{
              "numero_clase": 1,
              "foco_pedagogico": "Texto",
              "contenido_editable": {{
                "inicio": "Texto detallado...",
                "desarrollo": "Texto detallado (Usa $$...$$ para fórmulas)...",
                "cierre": "Texto detallado..."
              }},
              "recurso_practica": "Ejercicio...",
              "ticket_salida": "Pregunta...",
              "rubrica_tabla": {{
                "criterio": "...",
                "niveles": {{
                   "insuficiente": "...",
                   "elemental": "...",
                   "adecuado": "..."
                }}
              }}
            }}
          ]
        }}
        """

        model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})
        response = model.generate_content(prompt)

        resultado = limpiar_y_reparar_json(response.text)
        
        if not resultado:
            return {
                "result": {
                    "titulo_unidad_creativo": "Error de Formato Matemático",
                    "estrategia_aprendizaje_sentencia": "La IA generó fórmulas complejas que no pudieron procesarse. Intente reducir la cantidad de clases.",
                    "planificacion_clases": []
                }
            }

        return {"result": resultado}

    except Exception as e:
        print(f"❌ Error Crítico Planificador: {e}")
        return {"error": str(e)}