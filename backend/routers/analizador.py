from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
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
        ACTÚA COMO: Coach Pedagógico Senior especializado en Taxonomía Webb (DOK).

        INSTRUCCIONES DE CALIBRACIÓN (CASO JASNNA):
        1. PRIORIDAD COGNITIVA: Evalúa la demanda cognitiva de la tarea (lo que debe hacer el cerebro del estudiante), NO la presencia de verbos específicos o palabras clave sofisticadas.
        2. FLEXIBILIDAD SEMÁNTICA: Si el docente pide 'inferir', 'concluir' o 'relacionar', asume DOK 3 (Estratégico) aunque la redacción sea simple. NO seas pedante con la terminología académica ni actúes como un "policía de palabras".
        3. TONO CONSTRUCTIVO: En lugar de decir 'Error: Nivel incorrecto', utiliza un lenguaje propositivo como 'Sugerencia: Para robustecer el DOK 3, podrías...'. Sé un aliado, no un juez auditor.
        
        INPUTS:
        1. OA: {request.objetivo_aprendizaje}
        2. Prueba: {request.texto_evaluacion}
        
        TAREA:
        1. Identifica la ASIGNATURA y NIVEL probables.
        2. Escanea los reactivos. Clasifica como "Alineado" o "Mejorable" (evita "Crítico" a menos que sea muy bajo).
        3. Genera un "Ejemplo de Excelencia": Crea UNA pregunta modelo DOK 3 perfecta.
        
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
async def guardar_analisis(request: GuardarAnalisisRequest, authorization: Optional[str] = Header(None)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Base de datos no disponible")

    try:
        user_id = request.user_id
        author_name = "Profe IC"

        # Validar usuario real si viene token
        if authorization:
            token = authorization.replace("Bearer ", "")
            user_response = supabase.auth.get_user(token)
            if user_response and user_response.user:
                user_id = user_response.user.id
                # Fetch profile name
                try:
                    profile = supabase.table("profiles").select("full_name").eq("id", user_id).single().execute()
                    if profile.data and profile.data.get("full_name"):
                        author_name = profile.data["full_name"]
                except Exception as e:
                    print(f"⚠️ Error fetching profile: {e}")
        
        # Preparar data
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

        # Insertar
        res = supabase.table("biblioteca_recursos").insert(data).execute()
        
        if res.data:
            return {"success": True, "id": res.data[0]['id']}
        else:
            raise HTTPException(status_code=500, detail="Error al guardar en Supabase")

    except Exception as e:
        print(f"Error saving: {e}")
        raise HTTPException(status_code=500, detail=str(e))