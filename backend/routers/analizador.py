from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Optional
import os
import json
import google.generativeai as genai
from supabase import create_client, Client
from collections import Counter
from routers.deps import get_current_user_id


# --- CONFIGURACIÓN DB (SUPABASE) ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
else:
    print("⚠️ ADVERTENCIA: No se configuró Supabase. El guardado no funcionará.")

# --- CONFIGURACIÓN IA ---
MODEL_NAME = "gemini-2.5-flash"
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("⚠️ ERROR: No se encontró GOOGLE_API_KEY en el .env")
genai.configure(api_key=api_key)

router = APIRouter(prefix="/api/v1/analizador", tags=["Analizador Cognitivo"])

class AnalisisRequest(BaseModel):
    objetivo_aprendizaje: str
    texto_evaluacion: str
    contexto_escenario: str = "practicado" # Default: practicado o inédito

# user_id ya NO va en el body — se extrae del JWT en el servidor
class GuardarAnalisisRequest(BaseModel):
    objetivo_aprendizaje: str
    texto_evaluacion: str = ""
    resultado_analisis: dict


def build_analysis_prompt(oa: str, evaluacion: str, contexto_escenario: str) -> str:
    # Inyección del Contexto: Toma el valor seleccionado y reemplázalo en la llave {texto_nuevo_o_visto_en_clases}
    texto_nuevo_o_visto_en_clases = ""
    if contexto_escenario == "inedito":
        texto_nuevo_o_visto_en_clases = "El docente declara que los escenarios son inéditos, priorizar evaluación como DOK 3 si aplica."
    else:
        texto_nuevo_o_visto_en_clases = "El contenido evaluado fue practicado en clases con ejercicios similares."

    return f"""Eres un Coach Pedagógico experto en la Taxonomía DOK de Norman Webb. Tu rol es el de un MENTOR: propositivo, constructivo, nunca un juez. Eres un "Buscador de Evidencias" de alta demanda cognitiva.

## MARCO DOK Y PREVENCIÓN DE CAMUFLAJE COGNITIVO
- DOK 1 y 2: Recordar, reproducir, interpretar o aplicar mecánicamente. 
  *ATENCIÓN AL CAMUFLAJE*: Si un reactivo tiene una historia larga o un "caso", pero el estudiante solo debe extraer datos para aplicar una fórmula de rutina o recordar un concepto, SIGUE SIENDO DOK 1 o 2. El adorno narrativo no eleva la cognición.
- DOK 3: Argumentar, evaluar, justificar, tomar decisiones. Busca activamente EVIDENCIAS de estas 3 tipologías para validarlo como DOK 3: 1) Refutar/corregir a un "Tercero Equivocado", 2) Elegir y justificar entre "Múltiples Caminos", 3) Discriminar "Datos Contradictorios/Sobrantes".
- DOK 4: Crear/investigar integrando disciplinas en proyectos extendidos.

## REGLAS CLAVE DE AUDITORÍA (¡CRÍTICAS!)
1. CLASIFICACIÓN REAL: Clasifica por la fricción cognitiva real (lo que el estudiante hace mentalmente), NUNCA por los verbos usados en el enunciado.
2. EL PRINCIPIO DE ANDAMIAJE: Un reactivo DOK 1 o DOK 2 evaluando un OA de alta exigencia (ej. Analizar) NO es automáticamente un error. Considéralo ESTADO "Logrado" si funciona como un paso preparatorio (andamiaje) lógico dentro del instrumento.
3. DETECCIÓN DE ILUSIÓN DE COMPETENCIA: El estado es "Mejorable" SOLO SI: a) El reactivo es un falso positivo (camuflaje cognitivo), o b) El instrumento EN SU TOTALIDAD carece de reactivos DOK 3, estancando al estudiante en la memorización.
4. VALIDACIÓN DEL DISEÑO: Si encuentras al menos 2 preguntas que cumplan genuinamente con el estándar DOK 3, tu "diagnostico_global" DEBE iniciar felicitando explícitamente el buen diseño y la superación de la ilusión de competencia.
5. REINGENIERÍA OBLIGATORIA: Cuando el estado sea "Mejorable", la "sugerencia_reingenieria" DEBE transformar el reactivo utilizando obligatoriamente una de las 3 tipologías DOK 3 mencionadas arriba.

## INPUTS
- OA declarado: {oa}
- Contexto de Aplicación: {texto_nuevo_o_visto_en_clases}
- Instrumento a evaluar:
{evaluacion}

## RESPONDE SOLO CON UN JSON (sin markdown, sin texto extra):
{{
    "metadata": {{
        "asignatura_detectada": "...",
        "nivel_detectado": "..."
    }},
    "diagnostico_global": "Diagnóstico breve con tono de mentor...",
    "score_coherencia": 0,
    "feed_forward": "2-3 pasos concretos para mejorar la alineación...",
    "pregunta_cierre": "Una pregunta de coaching poderosa...",
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
            "habilidad_declarada": "Habilidad exigida",
            "habilidad_real": "Habilidad evidenciada",
            "proceso_mental_estudiante": "Lo que hace mentalmente...",
            "dok_real": "DOK 1",
            "estado": "Logrado o Mejorable",
            "analisis": "Diagnóstico propositivo...",
            "sugerencia_reingenieria": "Versión mejorada usando tipología DOK 3 (solo si Mejorable)",
            "pregunta_reflexion": "Pregunta de coaching"
        }}
    ],
    "conclusion": {{
        "texto": "Resumen pedagógico...",
        "accion": "Acción directa..."
    }}
}}"""


@router.post("/audit")
async def auditar_instrumento(request: AnalisisRequest):
    try:
        print(f"🧠 Analizando DOK con {MODEL_NAME} (temperatura=0, Webb+Mentoría)...")

        prompt = build_analysis_prompt(
            oa=request.objetivo_aprendizaje, 
            evaluacion=request.texto_evaluacion, 
            contexto_escenario=request.contexto_escenario
        )

        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            generation_config={
                "response_mime_type": "application/json",
                "temperature": 0.0,
            }
        )

        response = model.generate_content(
            prompt,
            request_options={"timeout": 120}
        )
        texto = response.text.strip()

        # Limpieza robusta de markdown
        if texto.startswith("```json"):
            texto = texto[7:]
        if texto.startswith("```"):
            texto = texto[3:]
        if texto.endswith("```"):
            texto = texto[:-3]

        resultado = json.loads(texto.strip())

        # === SCORE DETERMINÍSTICO ===
        # El score NO lo decide la IA (varía entre llamadas).
        # Lo calculamos nosotros: % de ítems marcados como "Logrado".
        items = resultado.get("items_analizados", [])
        if items:
            logrado_count = sum(1 for i in items if i.get("estado") == "Logrado")
            resultado["score_coherencia"] = round((logrado_count / len(items)) * 100)
        else:
            resultado["score_coherencia"] = 0

        # Recalcular niveles_data desde los ítems reales
        conteo = Counter(item.get("dok_real", "DOK 2") for item in items)
        for nivel_entry in resultado.get("niveles_data", []):
            nivel_entry["cantidad"] = conteo.get(nivel_entry["nivel"], 0)

        # Asegurar campos opcionales
        resultado.setdefault("feed_forward", "")
        resultado.setdefault("pregunta_cierre", "")
        resultado.setdefault("reconocimiento_fortalezas", [])

        print(f"✅ Análisis completado. Score: {resultado.get('score_coherencia')} | Items: {len(resultado.get('items_analizados', []))}")
        return resultado

    except Exception as e:
        print(f"❌ Error en auditoría DOK: {type(e).__name__}: {str(e)}")
        if "404" in str(e):
            raise HTTPException(status_code=500, detail="Modelo no encontrado. Verifica tu API Key o librería.")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save")
async def guardar_analisis(
    request: GuardarAnalisisRequest,
    user_id: str = Depends(get_current_user_id)   # ← JWT verificado server-side
):
    if not supabase:
        raise HTTPException(status_code=503, detail="Base de datos no disponible")

    try:
        author_name = "Profe IC"
        try:
            profile = supabase.table("profiles").select("full_name").eq("id", user_id).single().execute()
            if profile.data and profile.data.get("full_name"):
                author_name = profile.data["full_name"]
        except Exception as e:
            print(f"⚠️ Error fetching profile: {e}")

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

        res = supabase.table("biblioteca_recursos").insert(data).execute()

        if res.data:
            return {"success": True, "id": res.data[0]['id']}
        else:
            raise HTTPException(status_code=500, detail="Error al guardar en Supabase")

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error saving: {e}")
        raise HTTPException(status_code=500, detail=str(e))