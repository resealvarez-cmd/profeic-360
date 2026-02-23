from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import google.generativeai as genai
import os
from datetime import datetime
import locale
from dotenv import load_dotenv
from supabase import create_client, Client

# Configurar idioma para la fecha (intento robusto)
try:
    locale.setlocale(locale.LC_TIME, 'es_ES.UTF-8')
except:
    try:
        locale.setlocale(locale.LC_TIME, 'es_ES')
    except:
        pass 

load_dotenv()
router = APIRouter()

# --- CONFIGURACIÓN DE APIS ---
api_key = os.getenv("GOOGLE_API_KEY")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if api_key:
    genai.configure(api_key=api_key)

# Cliente de Supabase
supabase: Client = create_client(supabase_url, supabase_key)

# --- MODELOS DE DATOS ---
class ChatMessage(BaseModel):
    role: str 
    content: str

class ChatRequest(BaseModel):
    history: List[ChatMessage]
    user_name: str | None = "Docente"

# --- UTILIDAD: GENERAR EMBEDDING ---
def get_query_embedding(text: str):
    # Usamos text-embedding-004 para búsquedas precisas
    # IMPORTANTE: task_type='retrieval_query' y SIN title
    result = genai.embed_content(
        model="models/text-embedding-004",
        content=text,
        task_type="retrieval_query"
    )
    return result['embedding']

# --- PERSONALIDAD REFORZADA (Con Pragmatismo Didáctico) ---
fecha_hoy = datetime.now().strftime("%A %d de %B de %Y")

def get_system_prompt(nombre_usuario="Docente"):
    return f"""
ROL: Eres 'Mentor IC', el consejero pedagógico y pastoral del Colegio Madre Paulina de Chiguayante.
FECHA: {fecha_hoy}.
USUARIO: Estás hablando con {nombre_usuario}. Llámalo por su nombre de vez en cuando para generar cercanía.

TUS 4 PILARES FUNDAMENTALES:

1. **RAÍCES Y ALAS:** Valora la identidad local (Chiguayante, Río Biobío), pero conéctala con lo universal para ampliar el bagaje cultural de los estudiantes.
2. **IDENTIDAD CATÓLICA:** Eres acogedor y ético. Si es pertinente al contexto, ofrece una breve "píldora de luz" basada en el Evangelio o valores cristianos, pero sin ser invasivo.
3. **EXPERTO INSTITUCIONAL (Rigor):** Tus respuestas se basan estrictamente en la DOCUMENTACIÓN OFICIAL (RICE, PEI) cuando está disponible.
   - *Regla de Honestidad:* Si no encuentras una norma específica en el texto recuperado, DILO claramente ("No encontré un artículo específico, pero..."). NO inventes citas.

4. **PRAGMATISMO DIDÁCTICO (Nuevo):**
   - Cuando sugieras una idea pedagógica, NO te quedes en la teoría. Propón una **Estrategia Didáctica Concreta** (ej: Rutina de Pensamiento, Debate, ABP, Cuadro Comparativo).
   - Explica el "Cómo": da un ejemplo breve de la actividad paso a paso.
   - Conexión Curricular: Si el tema es académico, vincúlalo implícitamente con los **Objetivos de Aprendizaje (OA)** del Currículum Nacional chileno (ej: "Esto tributa al OA de Lectura Crítica...").

ESTILO:
- Usa Markdown (Negritas, listas) para facilitar la lectura rápida.
- Sé breve, amable y siempre invita a la acción ("¿Te animas a probar esta estrategia?").
"""

@router.post("/chat-mentor")
async def chat_mentor(req: ChatRequest):
    try:
        # 1. Identificar la última pregunta del usuario
        if not req.history:
            return {"response": f"Hola {req.user_name}, soy Mentor IC. ¿En qué puedo ayudarte hoy?"}
            
        ultima_pregunta = req.history[-1].content
        
        # 2. BUSCAR EN SUPABASE (RAG)
        rag_data = []
        try:
            # Generamos el vector de búsqueda
            query_vector = get_query_embedding(ultima_pregunta)
            
            # Consultamos la Base de Datos
            matches = supabase.rpc(
                "match_documents", 
                {
                    "query_embedding": query_vector,
                    "match_threshold": 0.4, 
                    "match_count": 4
                }
            ).execute()
            
            rag_data = matches.data
        except Exception as e_rag:
            print(f"⚠️ Advertencia RAG (Continuando sin contexto): {e_rag}")
            rag_data = []

        # 3. Construir el Contexto Institucional
        contexto_institucional = ""
        if rag_data:
            contexto_institucional = "\n\n--- DOCUMENTACIÓN INSTITUCIONAL ENCONTRADA (Prioriza esta información para lo normativo) ---\n"
            for match in rag_data:
                source = match.get('metadata', {}).get('source', 'Documento Interno')
                content = match.get('content', '').replace("\n", " ")
                contexto_institucional += f"FUENTE: {source}\nFRAGMENTO: {content}\n\n"
        
        # 4. Armar el Prompt Completo
        SYSTEM_PROMPT = get_system_prompt(req.user_name)
        full_prompt = SYSTEM_PROMPT + contexto_institucional + "\n--- HISTORIAL DE CONVERSACIÓN ---\n"
        
        for msg in req.history:
            role_label = req.user_name.upper() if msg.role == "user" else "MENTOR IC"
            full_prompt += f"{role_label}: {msg.content}\n"
            
        full_prompt += "MENTOR IC (Responde con calidez, rigor técnico y estrategias prácticas):"

        # 5. Generar Respuesta con IA
        try:
            # INTENTO 1: GEMINI 2.5 FLASH
            model = genai.GenerativeModel('gemini-2.5-flash') 
            response = model.generate_content(full_prompt)
            return {"response": response.text}
        except Exception as e_primary:
            print(f"⚠️ Error con modelo principal: {e_primary}. Intentando fallback...")
            
            # INTENTO 2: GEMINI 1.5 FLASH (Fallback con Safety Settings)
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"},
            ]
            model = genai.GenerativeModel('gemini-1.5-flash', safety_settings=safety_settings) 
            response = model.generate_content(full_prompt)
            
            if response.parts:
                return {"response": response.text}
            else:
                print("⚠️ El modelo fallback devolvió una respuesta vacía.")
                return {"response": "Lo siento, mi conexión neuronal parpadeó. ¿Podrías reformular la pregunta?"}

    except Exception as e:
        print(f"❌ Error Crítico en Mentor: {e}")
        return {"response": "Lo siento, tuve un problema técnico procesando tu consulta. Por favor, inténtalo de nuevo en unos segundos."}