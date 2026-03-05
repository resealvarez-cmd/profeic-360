"""
Router: profile.py
Propósito: Gestionar el contexto institucional del profesor (colegio + preferencias personales)
para inyectarlo en todos los módulos de generación de IA.
"""

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter(prefix="/profile", tags=["Profile"])

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Optional[Client] = None
try:
    if SUPABASE_URL and SUPABASE_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"❌ [PROFILE] Error conectando a Supabase: {e}")


class UpdateContextRequest(BaseModel):
    usar_contexto_geografico: bool = True


# ─────────────────────────────────────────────
# GET /profile/context
# Devuelve el contexto institucional completo del usuario autenticado:
# datos del colegio (nombre, ciudad, sello, valores) + preferencia geográfica personal
# ─────────────────────────────────────────────
@router.get("/context")
async def get_institutional_context(authorization: str = Header(...)):
    """
    Recupera el contexto institucional del usuario.
    Se usa en todos los módulos de IA para personalizar los prompts.
    """
    if not supabase:
        return {"context_block": "", "school": None, "usar_contexto_geografico": True}

    try:
        # 1. Obtener usuario actual desde el token
        token = authorization.split("Bearer ")[-1]
        user_resp = supabase.auth.get_user(token)
        if not user_resp or not user_resp.user:
            raise HTTPException(status_code=401, detail="Token inválido")

        user = user_resp.user
        user_id = user.id
        user_meta = user.user_metadata or {}

        # 2. Obtener datos del perfil (school_id + preferencia geográfica)
        profile_resp = supabase.table("profiles").select(
            "school_id, usar_contexto_geografico"
        ).eq("id", user_id).maybe_single().execute()

        profile_data = profile_resp.data or {}
        school_id = profile_data.get("school_id")
        usar_geo = profile_data.get("usar_contexto_geografico", True)

        # 3. Obtener datos del colegio si existe
        school_data = None
        if school_id:
            school_resp = supabase.table("schools").select(
                "name, city, region, sello_institucional, valores, proyecto_educativo"
            ).eq("id", school_id).maybe_single().execute()
            school_data = school_resp.data

        # 4. Construir el bloque de contexto para el prompt
        context_parts = []

        if school_data:
            nombre_colegio = school_data.get("name", "")
            ciudad = school_data.get("city", "")
            region = school_data.get("region", "")
            sello = school_data.get("sello_institucional", "")
            valores = school_data.get("valores", "")
            proyecto = school_data.get("proyecto_educativo", "")

            if nombre_colegio:
                context_parts.append(f"INSTITUCIÓN: {nombre_colegio}")
            if sello:
                context_parts.append(f"SELLO INSTITUCIONAL: {sello}")
            if valores:
                context_parts.append(f"VALORES DEL COLEGIO: {valores}")
            if proyecto:
                context_parts.append(f"PROYECTO EDUCATIVO: {proyecto}")
            if usar_geo and ciudad:
                context_parts.append(f"UBICACIÓN: {ciudad}{', ' + region if region else ''}, Chile.")
                context_parts.append(
                    "INSTRUCCIÓN DE LOCALIZACIÓN: Cuando sea pertinente, usa ejemplos, "
                    "contextos y situaciones cotidianas de esta localidad para hacer el contenido "
                    "más cercano y significativo para los estudiantes."
                )
        else:
            # Fallback si el profesor no tiene colegio asignado
            if usar_geo:
                context_parts.append("UBICACIÓN: Chile.")

        context_block = "\n".join(context_parts)

        return {
            "context_block": context_block,
            "school": school_data,
            "usar_contexto_geografico": usar_geo
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [PROFILE] Error obteniendo contexto: {e}")
        # Retornar vacío en vez de fallar — los módulos siguen funcionando sin contexto
        return {"context_block": "", "school": None, "usar_contexto_geografico": True}


# ─────────────────────────────────────────────
# PATCH /profile/context
# Actualiza la preferencia de contexto geográfico del profesor
# ─────────────────────────────────────────────
@router.patch("/context")
async def update_context_preference(
    req: UpdateContextRequest,
    authorization: str = Header(...)
):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase no configurado")

    try:
        token = authorization.split("Bearer ")[-1]
        user_resp = supabase.auth.get_user(token)
        if not user_resp or not user_resp.user:
            raise HTTPException(status_code=401, detail="Token inválido")

        user_id = user_resp.user.id

        supabase.table("profiles").update({
            "usar_contexto_geografico": req.usar_contexto_geografico
        }).eq("id", user_id).execute()

        return {"message": "Preferencia actualizada", "usar_contexto_geografico": req.usar_contexto_geografico}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
