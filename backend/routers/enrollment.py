import os
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Dict, Any, Tuple
from supabase import create_client, Client
from .deps import get_current_user_id

router = APIRouter(prefix="/api/v1/admin/enrollment", tags=["Admin"])

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

class StudentEnrollment(BaseModel):
    rut: str
    nombres: str
    apellidos: str
    nivel: str
    letra: str

# Mapping for sort_index
LEVEL_SORT_MAP = {
    "Pre-Kínder": 1,
    "Kínder": 2,
    "1° Básico": 3,
    "2° Básico": 4,
    "3° Básico": 5,
    "4° Básico": 6,
    "5° Básico": 7,
    "6° Básico": 8,
    "7° Básico": 9,
    "8° Básico": 10,
    "I Medio": 11,
    "II Medio": 12,
    "III Medio": 13,
    "IV Medio": 14
}

def get_sort_index(nivel: str) -> int:
    """Calcula el sort_index según el nombre del nivel."""
    for key, value in LEVEL_SORT_MAP.items():
        if key.lower() in nivel.lower():
            return value
    return 99

@router.get("/directory")
async def get_student_directory(
    user_id: str = Depends(get_current_user_id)
):
    """
    Obtiene el directorio de estudiantes agrupado por curso.
    Salida: [{"id": "...", "nivel": "...", "letra": "...", "students": [...]}]
    """
    try:
        # 1. Obtener school_id
        profile_res = supabase.table("profiles").select("school_id").eq("id", user_id).single().execute()
        school_id = profile_res.data.get("school_id")
        
        if not school_id:
            raise HTTPException(status_code=400, detail="El usuario no tiene un colegio asociado.")

        # 2. Obtener todos los cursos del colegio
        courses_res = supabase.table("courses")\
            .select("*")\
            .eq("school_id", school_id)\
            .order("sort_index", desc=False)\
            .order("letra", desc=False)\
            .execute()
        
        courses = courses_res.data or []
        course_ids = [c["id"] for c in courses]

        if not course_ids:
            return {
                "status": "success",
                "directory": [],
                "total_courses": 0,
                "total_students": 0
            }

        # 3. Obtener todos los estudiantes de esos cursos
        students_res = supabase.table("students")\
            .select("rut, nombres, apellidos, course_id")\
            .in_("course_id", course_ids)\
            .order("apellidos", desc=False)\
            .execute()
        
        all_students = students_res.data or []

        # 4. Agrupar estudiantes por course_id
        students_by_course = {}
        for s in all_students:
            c_id = s["course_id"]
            if c_id not in students_by_course:
                students_by_course[c_id] = []
            students_by_course[c_id].append({
                "rut": s["rut"],
                "nombres": s["nombres"],
                "apellidos": s["apellidos"]
            })

        # 5. Construir respuesta final manteniendo el orden de cursos
        directory = []
        total_students = 0
        for c in courses:
            course_students = students_by_course.get(c["id"], [])
            directory.append({
                "id": c["id"],
                "nivel": c["nivel"],
                "letra": c["letra"],
                "students": course_students
            })
            total_students += len(course_students)

        return {
            "status": "success",
            "directory": directory,
            "total_courses": len(directory),
            "total_students": total_students
        }

    except Exception as e:
        print(f"❌ Error Get Directory: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/bulk-upload")
async def bulk_upload_enrollment(
    students: List[StudentEnrollment],
    user_id: str = Depends(get_current_user_id)
):
    """
    Carga masiva de estudiantes.
    1. Agrupa alumnos por (nivel, letra).
    2. Crea cursos faltantes en batch.
    3. Upsert de estudiantes usando RUT como llave primaria.
    """
    try:
        # 1. Obtener school_id del perfil del director
        profile_res = supabase.table("profiles").select("school_id").eq("id", user_id).single().execute()
        school_id = profile_res.data.get("school_id")
        
        if not school_id:
            raise HTTPException(status_code=400, detail="El usuario no tiene un colegio asociado en su perfil.")

        # 2. Identificar cursos únicos necesarios
        unique_courses_req = set((s.nivel, s.letra) for s in students)
        
        # 3. Batch find/create courses
        existing_courses_res = supabase.table("courses")\
            .select("id, nivel, letra")\
            .eq("school_id", school_id)\
            .execute()
        
        existing_courses_map = {(c["nivel"], c["letra"]): c["id"] for c in existing_courses_res.data}
        
        needed_courses = []
        for nivel, letra in unique_courses_req:
            if (nivel, letra) not in existing_courses_map:
                needed_courses.append({
                    "school_id": school_id,
                    "nivel": nivel,
                    "letra": letra,
                    "sort_index": get_sort_index(nivel)
                })
        
        if needed_courses:
            new_courses_res = supabase.table("courses").insert(needed_courses).execute()
            if new_courses_res.data:
                for c in new_courses_res.data:
                    existing_courses_map[(c["nivel"], c["letra"])] = c["id"]

        # 4. Preparar payload de estudiantes
        students_to_upsert = []
        for s in students:
            course_id = existing_courses_map.get((s.nivel, s.letra))
            if not course_id: continue # Seguridad adicional
            
            students_to_upsert.append({
                "rut": s.rut,
                "school_id": school_id,
                "course_id": course_id,
                "nombres": s.nombres,
                "apellidos": s.apellidos
            })
        
        if not students_to_upsert:
            return {"status": "success", "message": "No hay estudiantes nuevos para procesar.", "count": 0}

        # 5. Upsert masivo en tabla students (PK: rut)
        res = supabase.table("students").upsert(students_to_upsert, on_conflict="rut").execute()
        
        return {
            "status": "success", 
            "message": f"Se procesaron {len(students)} registros. {len(res.data)} estudiantes actualizados/creados.",
            "count": len(res.data)
        }

    except Exception as e:
        print(f"❌ Error Bulk Enrollment: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
