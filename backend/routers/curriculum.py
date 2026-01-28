from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
from supabase import create_client, Client

router = APIRouter()

# --- CARGA DE VARIABLES ---
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# --- CONEXIÓN ---
supabase: Optional[Client] = None
try:
    if SUPABASE_URL and SUPABASE_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    else:
        print("❌ [CURRICULUM] Faltan credenciales en .env")
except Exception as e:
    print(f"🔥 ERROR CRÍTICO SUPABASE: {e}")

# --- ORDEN LÓGICO PEDAGÓGICO ---
ORDEN_OFICIAL = {
    "NT1": 1, "Pre-Kinder": 1,
    "NT2": 2, "Kinder": 2,
    "1° Básico": 3,
    "2° Básico": 4,
    "3° Básico": 5,
    "4° Básico": 6,
    "5° Básico": 7,
    "6° Básico": 8,
    "7° Básico": 9,
    "8° Básico": 10,
    "1° Medio": 11,
    "2° Medio": 12,
    "3° Medio": 13,
    "4° Medio": 14,
    "3° y 4° Medio": 15
}

# --- LISTAS DE RESPALDO ---
FALLBACK_NIVELES = [
    "NT1", "NT2", 
    "1° Básico", "2° Básico", "3° Básico", "4° Básico", "5° Básico", "6° Básico", "7° Básico", "8° Básico", 
    "1° Medio", "2° Medio", "3° Medio", "4° Medio"
]
FALLBACK_ASIGNATURAS = ["Lenguaje", "Matemática", "Historia", "Ciencias", "Inglés", "Artes", "Música", "Tecnología"]

def fetch_all_rows(table: str, select_cols: str, filters: dict = None):
    if not supabase: return []
    all_data = []
    current_start = 0
    batch_size = 1000
    
    while True:
        query = supabase.table(table).select(select_cols)
        if filters:
            for col, val in filters.items():
                query = query.eq(col, val)
        
        response = query.range(current_start, current_start + batch_size - 1).execute()
        batch_data = response.data
        all_data.extend(batch_data)
        if len(batch_data) < batch_size:
            break
        current_start += batch_size
    return all_data

class OptionsRequest(BaseModel):
    nivel: Optional[str] = None
    asignatura: Optional[str] = None

@router.post("/curriculum/options")
async def get_curriculum_options(req: OptionsRequest):
    if not supabase:
        if not req.nivel: return {"type": "niveles", "data": FALLBACK_NIVELES}
        if not req.asignatura: return {"type": "asignaturas", "data": FALLBACK_ASIGNATURAS}
        return {"type": "oas", "data": []}

    try:
        # A. NIVELES (ORDENADOS)
        if not req.nivel:
            raw_data = fetch_all_rows('curriculum_oas', 'nivel')
            # Extraer únicos
            niveles_unicos = list(set([item['nivel'] for item in raw_data if item['nivel']]))
            
            # ORDENAR USANDO EL DICCIONARIO 'ORDEN_OFICIAL'
            # Si un nivel no está en el diccionario, se va al final (99)
            niveles_ordenados = sorted(niveles_unicos, key=lambda x: ORDEN_OFICIAL.get(x, 99))
            
            if not niveles_ordenados: 
                return {"type": "niveles", "data": FALLBACK_NIVELES}
            return {"type": "niveles", "data": niveles_ordenados}

        # B. ASIGNATURAS (Alfabético está bien)
        if req.nivel and not req.asignatura:
            raw_data = fetch_all_rows('curriculum_oas', 'asignatura', {'nivel': req.nivel})
            asignaturas = sorted(list(set([item['asignatura'] for item in raw_data if item['asignatura']])))
            if not asignaturas:
                 return {"type": "asignaturas", "data": FALLBACK_ASIGNATURAS}
            return {"type": "asignaturas", "data": asignaturas}

        # C. OBJETIVOS
        if req.nivel and req.asignatura:
            raw_data = fetch_all_rows('curriculum_oas', 'id, oa_codigo, descripcion', {'nivel': req.nivel, 'asignatura': req.asignatura})
            return {"type": "oas", "data": raw_data}

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        if not req.nivel: return {"type": "niveles", "data": FALLBACK_NIVELES}
        return {"type": "error", "data": [], "details": str(e)}