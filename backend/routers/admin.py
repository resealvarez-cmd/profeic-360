import os
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from supabase import create_client, Client

router = APIRouter(prefix="/admin", tags=["SuperAdmin"])

# === CLIENTE SUPABASE CON SERVICE ROLE ===
# ATENCIÓN: Esta clave es 'admin' y se usa para crear usuarios o sobreescribir RLS.
# NO EXPORTAR NUNCA AL CLIENTE FRONTEND.
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("WARNING: SUPABASE_SERVICE_ROLE_KEY is missing. Admin endpoints will fail.")
    supabase_admin: Client = None
else:
    supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


# === MODELOS ===
class InviteRequest(BaseModel):
    email: str
    role: str = "teacher"  # o admin, director, utp
    school_id: str


# === DEPENDECIA DE SEGURIDAD ===
async def verify_super_admin(authorization: str = Header(...)):
    """Verifica que quien llama sea el SuperAdmin."""
    try:
        token = authorization.split("Bearer ")[1]
        
        # Ojo: aquí usamos un cliente normal temporal solo para verificar el token de quien llama
        from lib.supabase_client import get_supabase_client
        supabase = get_supabase_client()
        
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Token inválido")
            
        email = user_response.user.email
        
        # Hardcoded SuperAdmin Check or use authorized_users table
        if email != "re.se.alvarez@gmail.com":
            raise HTTPException(status_code=403, detail="Acceso denegado. No eres Super Administrador.")
            
        return user_response.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Autenticación fallida: {str(e)}")


@router.post("/invite")
async def invite_user(req: InviteRequest, _ = Depends(verify_super_admin)):
    """
    1. Invita a un usuario a crear una cuenta.
    2. Lo asocia inmediatamente a un colegio.
    3. Le asigna un rol en authorized_users.
    """
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="El servidor no está configurado para acciones de administrador (falta Service Role Key)")

    try:
        # 1. Invite User (Supabase manda el correo mágico con un Magic Link)
        invite_res = supabase_admin.auth.admin.invite_user_by_email(req.email)
        user_id = invite_res.user.id
        
        # 2. Add to authorized_users ONLY IF we use strong RLS and custom roles
        # Insert into authorized_users
        try:
             supabase_admin.table('authorized_users').insert({
                 "email": req.email,
                 "role": req.role
             }).execute()
        except:
             pass # might already exist

        # 3. Associate with School (Profiles table trigger might race this, so we update instead)
        # Because we are using Service Role Key, RLS is bypassed and this update is guaranteed
        supabase_admin.table('profiles').update({
            "school_id": req.school_id
        }).eq("id", user_id).execute()

        return {"message": f"Invitación enviada exitosamente a {req.email}", "user_id": user_id}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error invitando usuario: {str(e)}")
