import os
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from uuid import UUID
from supabase import create_client, Client
from .deps import get_current_user_id

router = APIRouter(prefix="/api/v1/admin/teachers", tags=["Admin - Teachers"])

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

class AssignmentRequest(BaseModel):
    course_ids: List[UUID]

@router.get("/")
async def get_teachers(user_id: str = Depends(get_current_user_id)):
    """
    Obtiene la lista de profesores del colegio del administrador.
    """
    try:
        # 1. Obtener school_id del admin
        profile_res = supabase.table("profiles").select("school_id").eq("id", user_id).single().execute()
        school_id = profile_res.data.get("school_id")
        
        if not school_id:
            raise HTTPException(status_code=400, detail="El usuario no tiene un colegio asociado.")

        # 2. Consultar perfiles con rol 'teacher' o 'profesor' en ese colegio
        # Nota: Ajustamos a 'teacher' basado en el esquema común detectado en admin.py
        teachers_res = supabase.table("profiles")\
            .select("id, full_name, email")\
            .eq("school_id", school_id)\
            .eq("role", "teacher")\
            .execute()
            
        return teachers_res.data or []

    except Exception as e:
        print(f"❌ Error Get Teachers: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{teacher_id}/courses")
async def get_teacher_courses(teacher_id: str):
    """
    Devuelve los IDs de los cursos asignados a un profesor.
    """
    try:
        res = supabase.table("teacher_courses")\
            .select("course_id")\
            .eq("teacher_id", teacher_id)\
            .execute()
        
        return [item["course_id"] for item in res.data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{teacher_id}/assignments")
async def save_teacher_assignments(teacher_id: str, req: AssignmentRequest):
    """
    Reemplazo total de asignaciones (Transaccional lógico).
    """
    try:
        # 1. Eliminar asignaciones previas
        supabase.table("teacher_courses").delete().eq("teacher_id", teacher_id).execute()
        
        # 2. Insertar nuevas si existen
        if req.course_ids:
            payload = [{"teacher_id": teacher_id, "course_id": str(cid)} for cid in req.course_ids]
            supabase.table("teacher_courses").insert(payload).execute()
            
        return {"status": "success", "message": "Asignaciones actualizadas correctamente."}
    except Exception as e:
        print(f"❌ Error Saving Assignments: {e}")
        raise HTTPException(status_code=500, detail=str(e))
