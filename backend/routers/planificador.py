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
from typing import List, Optional, Dict, Union

# ...

# --- MODELOS (COMPATIBLE CON TODAS LAS VERSIONES) ---
class GenerateRequest(BaseModel):
    nivel: str
    asignatura: str
    oas_mochila: List[str]            
    valor_panel: str
    actitud_especifica: str
    medio_usuario: Optional[str] = None  
    num_clases: int
    modo_distribucion: str
    perfil_usuario: Optional[Dict] = None # <--- DATO NUEVO

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
        
        # --- LOGICA DE CONTEXTO ---
        contexto_docente = ""
        instrucciones_extra = ""
        
        if request.perfil_usuario:
            p = request.perfil_usuario
            print(f"👤 [Contexto] Aplicando perfil de: {p.get('full_name', 'Docente')}")
            
            # 1. Estilo y Dinámica
            estilo_ia = p.get('estilo_ia', 'formal')
            estilo_trabajo = p.get('estilo_trabajo', 'colaborativo')
            
            if estilo_ia == 'cercano':
                instrucciones_extra += "- TONO: Usa un lenguaje cercano, motivador y cálido. Evita tecnicismos excesivos.\n"
            elif estilo_ia == 'socratico':
                instrucciones_extra += "- ENFOQUE: Prioriza preguntas reflexivas en el inicio y cierre. Guía al descubrimiento.\n"
                
            if estilo_trabajo == 'caos':
                instrucciones_extra += "- DINÁMICA: Propón actividades de alto movimiento, ruido productivo y debate.\n"
            elif estilo_trabajo == 'silencio':
                instrucciones_extra += "- DINÁMICA: Prioriza el trabajo individual enfocado y análisis profundo en silencio.\n"
            elif estilo_trabajo == 'movimiento':
                instrucciones_extra += "- DINÁMICA: Incluye pausas activas o aprendizaje kinestésico.\n"

            # 2. Infraestructura (Limitantes o Potenciadores)
            infra = p.get('infraestructura', [])
            if "pizarra" in infra and len(infra) == 1:
                instrucciones_extra += "- RECURSOS: El aula es ANÁLOGA. Solo usa pizarra y papel. NO sugieras videos ni apps.\n"
            elif "proyector" in infra or "internet" in infra:
                instrucciones_extra += "- RECURSOS: Aprovecha apoyo audiovisual y digital si es pertinente.\n"
                
            # 3. Desafíos (Prioridades)
            desafios = p.get('desafios', [])
            otro_desafio = p.get('otro_desafio', '')
            
            if "Disminuir carga administrativa" in desafios:
                instrucciones_extra += "- EVALUACIÓN: Diseña tickets de salida muy breves y fáciles de corregir.\n"
            if "Implementar DUA" in desafios:
                instrucciones_extra += "- INCLUSIÓN: Explicita múltiples formas de representación en el desarrollo.\n"
                
            if otro_desafio:
                instrucciones_extra += f"- META ESPECÍFICA DEL DOCENTE: {otro_desafio}\n"
                
            contexto_docente = f"""
            CONTEXTO DEL DOCENTE (PERSONALIZACIÓN):
            {instrucciones_extra}
            """

        # --- MODELO SOCIOCOGNITIVO & MBE (Marco para la Buena Enseñanza) ---
        ESTRUCTURA_UNIVERSAL = """
        ESTRUCTURA UNIVERSAL DE CLASE (MARCO PARA LA BUENA ENSEÑANZA):
        Independiente del modelo, TODA clase debe tener obligatoriamente:
        1. INICIO: Declaración de objetivo, motivación y activación.
        2. DESARROLLO: Experiencia de aprendizaje central.
        3. CIERRE: Verificación de logros y metacognición.
        """

        if request.modo_distribucion == "Ciclo Completo":
            ESTRATEGIA_CMP = f"""
            {ESTRUCTURA_UNIVERSAL}
            
            DISTRIBUCIÓN DE LOS 7 MOMENTOS CMP (CICLO COMPLETO):
            Cada clase debe contener los 7 momentos completos:
            1. INICIO (MBE): Contiene [1.Expectación] y [2.Activación].
            2. DESARROLLO (MBE): Contiene [3.Modelamiento], [4.Guiada] y [5.Independiente].
            3. CIERRE (MBE): Contiene [6.Feedback] y [7.Metacognición].
            """
        else: # Progresivo
            ESTRATEGIA_CMP = f"""
            {ESTRUCTURA_UNIVERSAL}

            DISTRIBUCIÓN DE LOS 7 MOMENTOS CMP (PROGRESIVO):
            Los momentos profundos se distribuyen, PERO respetando la estructura universal MBE:
            
            - Clases Iniciales: Inicio potente + Desarrollo enfocado en [Modelamiento].
            - Clases Intermedias: Inicio breve + Desarrollo enfocado en [Práctica].
            - Clases Finales: Inicio breve + Desarrollo breve + Cierre extendido de [Metacognición].
            """

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

        {contexto_docente}

        {ESTRATEGIA_CMP}

        REGLAS DE ORO (PEDAGOGÍA):
        1. ESTRATEGIA: Usa la fórmula: "Verbo (Habilidad OA) + Contenido + Medio + Actitud".
        2. ESTRUCTURA: Los textos de 'inicio', 'desarrollo' y 'cierre' deben reflejar explícitamente los 7 momentos descritos arriba.
        3. RECURSOS Y TICKETS: Escribe el ejercicio REAL o pregunta REAL.
        4. EVALUACIÓN: Enfoque en PRODUCTO (3ra persona), nunca en el alumno.
        5. MATEMÁTICAS/LATEX: Usa SIEMPRE DOBLE BARRA INVERTIDA para fórmulas. Ejemplo: $$ \\\\frac{{1}}{{2}} $$ (Esto es vital para no romper el JSON).
        6. PERSONALIZACIÓN: Si hay contexto docente, RESPETA fielmente su estilo y limitaciones.

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