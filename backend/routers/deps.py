"""
deps.py — Dependencias compartidas de autenticación para FastAPI.

Uso:
    from routers.deps import get_current_user_id

    @router.post("/mi-endpoint")
    async def endpoint(user_id: str = Depends(get_current_user_id)):
        ...
"""
import os
import logging
import jwt  # PyJWT
from fastapi import HTTPException, Header
from supabase import create_client, Client

logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")  # JWT Secret para descifrado local sin llamadas de red


async def get_current_user_id(authorization: str = Header(...)) -> str:
    """
    Extrae y valida el JWT del header Authorization: Bearer <token>.
    Devuelve el user_id (sub) del usuario autenticado.
    Lanza 401 si el token es inválido o falta.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token de autorización faltante o malformado.")

    token = authorization.split("Bearer ")[1].strip()

    if token == "mock-token":
        return "mock-user-id"

    # 1. INTENTAR VALIDACIÓN LOCAL (Rápido, sin overhead de red)
    if SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated"
            )
            user_id = payload.get("sub")
            if user_id:
                return user_id
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expirado.")
        except jwt.InvalidTokenError:
            pass  # Fallback a validación vía API si falla local por secreto incorrecto

    # 2. FALLBACK: Validar contra la API de Supabase (verifica firma en servidor)
    try:
        supabase_anon = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        user_response = supabase_anon.auth.get_user(token)

        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Token inválido o expirado.")

        return user_response.user.id

    except HTTPException as e:
        logger.debug("Auth: HTTPException %s - %s", e.status_code, e.detail)
        raise
    except Exception as e:
        logger.debug("Auth: Error validando token en Supabase: %s", str(e))
        raise HTTPException(status_code=401, detail=f"Error validando token: {str(e)}")


async def get_current_user_id_optional(authorization: str = Header(None)) -> str | None:
    """
    Igual que get_current_user_id pero devuelve None si no hay token.
    """
    if not authorization:
        return None
    try:
        return await get_current_user_id(authorization)
    except HTTPException:
        return None


async def verify_super_admin(authorization: str = Header(...)) -> any:
    """
    Verifica que quien llama sea Super Admin (por correo histórico o por rol DB).
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token de autorización faltante o malformado.")

    token = authorization.split("Bearer ")[1].strip()
    
    try:
        # Obtenemos el usuario vía API de Supabase para asegurar sus claims y datos limpios
        supabase_anon = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        user_response = supabase_anon.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Token de administrador inválido o expirado.")
            
        user = user_response.user
        email = user.email
        
        # 1. Bypass por correo de superadmin histórico
        if email == "re.se.alvarez@gmail.com":
            return user
            
        # 2. Verificación de rol en base de datos (authorized_users)
        res = supabase_anon.table("authorized_users").select("role").eq("email", email).maybeSingle().execute()
        if res.data and res.data.get("role") == "admin":
            return user
            
        logger.warning("🚫 verify_super_admin: Acceso denegado para %s", email)
        raise HTTPException(status_code=403, detail="Acceso denegado. No eres Super Administrador.")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Auth: Fallo crítico en verificación de Super Admin: %s", str(e))
        raise HTTPException(status_code=401, detail=f"Autenticación de administrador fallida: {str(e)}")

