from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# --- CONFIGURACIÓN DB (SUPABASE) ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("⚠️ ADVERTENCIA: No se configuró Supabase. El guardado no funcionará.")

# --- CONFIGURACIÓN IA ---
# Usamos el modelo estándar actual
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
    user_id: str = "33964953-b929-4d89-913a-592f026903d6" # ID temporal
    objetivo_aprendizaje: str
    texto_evaluacion: str = "" # Campo opcional por si quieres guardar el input
    resultado_analisis: dict

# --- ENDPOINT 1: AUDITAR (LÓGICA RESTAURADA) ---
@router.post("/audit")
async def auditar_instrumento(request: AnalisisRequest):
    try:
        print(f"🧠 Analizando con {MODEL_NAME}...")
        
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            generation_config={"response_mime_type": "application/json"}
        )

        prompt = f"""
        ACTÚA COMO: Auditor Pedagógico Forense (Taxonomía Webb DOK).
        
        INPUTS:
        1. OA: {request.objetivo_aprendizaje}
        2. Prueba: {request.texto_evaluacion}
        
        TAREA:
        1. Identifica la ASIGNATURA y NIVEL probables (Ej: Matemática 8° Básico).
        2. Escanea TODOS los reactivos. Clasifícalos como "Crítico" (si DOK ítem < DOK OA) o "Alineado".
        3. Genera un "Ejemplo de Excelencia": Crea UNA pregunta modelo DOK 3 perfecta para este tema específico.
        
        FORMATO JSON (ESTRICTO):
        {{
            "metadata": {{
                "asignatura_detectada": "Ej: Historia",
                "nivel_detectado": "Ej: II° Medio",
                "ejemplo_excelencia": {{
                    "pregunta": "Texto de la pregunta modelo...",
                    "explicacion": "Por qué es DOK 3..."
                }}
            }},
            "diagnostico_global": "Frase ejecutiva corta",
            "score_coherencia": 0-100,
            "niveles_data": [
                {{"nivel": "DOK 1", "nombre": "Memoria", "cantidad": 0, "esperado": 15, "color": "#94a3b8"}},
                {{"nivel": "DOK 2", "nombre": "Aplicación", "cantidad": 0, "esperado": 40, "color": "#60a5fa"}},
                {{"nivel": "DOK 3", "nombre": "Estratégico", "cantidad": 0, "esperado": 35, "color": "#2b546e"}},
                {{"nivel": "DOK 4", "nombre": "Extendido", "cantidad": 0, "esperado": 10, "color": "#f2ae60"}}
            ],
            "items_analizados": [
                {{
                   "id": 1,
                   "pregunta_extracto": "Texto corto...",
                   "pregunta_completa": "Texto completo...",
                   "dok_declarado": "DOK 3",
                   "dok_real": "DOK 1",
                   "estado": "Crítico", 
                   "analisis": "Breve diagnóstico...",
                   "sugerencia_reingenieria": "Texto corregido..."
                }}
            ],
            "conclusion": {{
                "texto": "Resumen pedagógico...",
                "accion": "Consejo directo..."
            }}
        }}
        """

        response = model.generate_content(prompt)
        texto = response.text.strip()
        
        # Limpieza robusta por si la IA incluye markdown
        if texto.startswith("```json"):
            texto = texto.replace("```json", "").replace("```", "")
            
        return json.loads(texto)

    except Exception as e:
        print(f"❌ Error en IA: {str(e)}")
        if "404" in str(e):
             raise HTTPException(status_code=500, detail="Modelo no encontrado. Verifica tu API Key o librería.")
        raise HTTPException(status_code=500, detail=str(e))


# --- ENDPOINT 2: GUARDAR (CONECTADO A DB) ---
@router.post("/save")
async def guardar_en_biblioteca(data: GuardarAnalisisRequest):
    if not supabase:
        raise HTTPException(status_code=500, detail="Base de datos no configurada.")

    try:
        print(f"💾 Guardando análisis en biblioteca...")

        # 1. Extraer metadatos
        metadata = data.resultado_analisis.get("metadata", {})
        asignatura = metadata.get("asignatura_detectada", "General")
        nivel = metadata.get("nivel_detectado", "No especificado")
        
        titulo = f"Auditoría: {asignatura}"
        if nivel != "No especificado":
            titulo += f" ({nivel})"

        # 2. Preparar registro
        registro = {
            "user_id": data.user_id,
            "tipo": "AUDITORIA",
            "titulo": titulo,
            "asignatura": asignatura,
            "nivel": nivel,
            "contenido": data.resultado_analisis 
        }

        # 3. Insertar
        response = supabase.table("biblioteca_recursos").insert(registro).execute()
        
        if response.data:
            return {"status": "success", "id": response.data[0]['id']}
        else:
            raise Exception("Error al insertar en Supabase")

    except Exception as e:
        print(f"❌ Error DB: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))