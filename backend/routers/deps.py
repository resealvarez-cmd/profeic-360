"""
deps.py — Dependencias compartidas de autenticación para FastAPI.

Uso:
    from routers.deps import get_current_user_id

    @router.post("/mi-endpoint")
    async def endpoint(user_id: str = Depends(get_current_user_id)):
        ...
"""
import os
from fastapi import HTTPException, Header
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY", "")


async def get_current_user_id(authorization: str = Header(...)) -> str:
    """
    Extrae y valida el JWT del header Authorization: Bearer <token>.
    Devuelve el user_id (sub) del usuario autenticado.
    Lanza 401 si el token es inválido o falta.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token de autorización faltante o malformado.")

    token = authorization.split("Bearer ")[1].strip()

    try:
        # Validar contra Supabase (verifica firma, expiración, etc.)
        supabase_anon = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        user_response = supabase_anon.auth.get_user(token)

        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Token inválido o expirado.")

        return user_response.user.id

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Error validando token: {str(e)}")


async def get_current_user_id_optional(authorization: str = Header(None)) -> str | None:
    """
    Igual que get_current_user_id pero devuelve None si no hay token
    (para endpoints que funcionan con o sin autenticación).
    """
    if not authorization:
        return None
    try:
        return await get_current_user_id(authorization)
    except HTTPException:
        return None
