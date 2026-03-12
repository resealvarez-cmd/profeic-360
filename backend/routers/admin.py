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


from typing import Optional

# === MODELOS ===
class InviteRequest(BaseModel):
    email: str
    role: str = "teacher"  # o admin, director, utp
    school_id: Optional[str] = None
    individual_plan_active: bool = False

class UpdateSchoolPlanRequest(BaseModel):
    school_id: str
    subscription_plan: str

class UpdateProfilePlanRequest(BaseModel):
    profile_id: str
    individual_plan_active: bool
    school_id: Optional[str] = None

class CreateUserRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "teacher"
    school_id: Optional[str] = None
    individual_plan_active: bool = False

class DeleteUserRequest(BaseModel):
    email: str

# === DEPENDECIA DE SEGURIDAD ===
async def verify_super_admin(authorization: str = Header(...)):
    """Verifica que quien llama sea el SuperAdmin."""
    try:
        token = authorization.split("Bearer ")[1]
        
        # Validar el token usando un cliente limpio de fastapi request 
        anon_key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY")
        supabase_anon = create_client(SUPABASE_URL, anon_key)
        
        user_response = supabase_anon.auth.get_user(token)
        if not user_response or not hasattr(user_response, 'user') or not user_response.user:
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
    2. Lo asocia inmediatamente a un colegio (o no, si es Individual).
    3. Le asigna un rol en authorized_users.
    """
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="El servidor no está configurado para acciones de administrador (falta Service Role Key)")

    try:
        # 1. Invite User (Supabase manda el correo mágico con un Magic Link)
        invite_res = supabase_admin.auth.admin.invite_user_by_email(req.email)
        user_id = invite_res.user.id
        
        # 2. Add to authorized_users ONLY IF we use strong RLS and custom roles
        try:
             supabase_admin.table('authorized_users').insert({
                 "email": req.email,
                 "role": req.role
             }).execute()
        except Exception:
             pass # might already exist

        # 3. Associate with School and set Individual Plan
        supabase_admin.table('profiles').update({
            "school_id": req.school_id if req.school_id else None,
            "individual_plan_active": req.individual_plan_active
        }).eq("id", user_id).execute()

        return {"message": f"Invitación enviada exitosamente a {req.email}", "user_id": user_id}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error invitando usuario: {str(e)}")

@router.post("/create-user")
async def create_user(req: CreateUserRequest, _ = Depends(verify_super_admin)):
    """
    1. Administrador crea un usuario directamente con clave.
    2. Se marca el correo como confirmado.
    3. Lo asocia inmediatamente a un colegio.
    4. Le asigna un rol y actualiza 'authorized_users'.
    """
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Falta Service Role Key")

    try:
        # 1. Create User
        nuevo_user = supabase_admin.auth.admin.create_user({
            "email": req.email,
            "password": req.password,
            "email_confirm": True,
            "user_metadata": {
                "full_name": req.full_name,
                "role": req.role
            }
        })
        user_id = nuevo_user.user.id
        
        # 2. Add/Update authorized_users
        try:
            supabase_admin.table('authorized_users').insert({
                "email": req.email,
                "full_name": req.full_name,
                "role": req.role,
                "status": "active"
            }).execute()
        except Exception:
            # might already exist, so update
            supabase_admin.table('authorized_users').update({
                "full_name": req.full_name,
                "role": req.role,
                "status": "active"
            }).eq("email", req.email).execute()

        # 3. Associate with School and set Individual Plan
        supabase_admin.table('profiles').update({
            "school_id": req.school_id if req.school_id else None,
            "individual_plan_active": req.individual_plan_active,
            "full_name": req.full_name
        }).eq("id", user_id).execute()

        return {"message": f"Usuario {req.email} creado exitosamente con contraseña.", "user_id": user_id}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creando usuario: {str(e)}")


@router.post("/delete-user")
async def delete_user(req: DeleteUserRequest, _ = Depends(verify_super_admin)):
    """
    1. Administrador elimina a un usuario completamente.
    2. Se borra de Supabase Auth (Identity Provider).
    3. Se borra de `authorized_users`.
    """
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Falta Service Role Key")

    try:
        # Supabase API python no tiene admin.delete_user_by_email, buscamos su ID primero
        # o en este caso, podemos sacar el ID buscando en Auth. Para más simplificación, 
        # consultaremos la db interna (profiles/authorized_users si tuviéramos id)
        
        # Estrategia: Listar usuarios auth (limite de 50 o paginar) y buscarlo
        # (Idealmente, el front nos pasaría el ID, pero como a veces no lo tiene si solo está en authorized_users...)
        users_resp = supabase_admin.auth.admin.list_users()
        user_to_delete = next((u for u in users_resp.users if u.email == req.email), None)

        if user_to_delete:
            supabase_admin.auth.admin.delete_user(user_to_delete.id)
        
        # Eliminar de las tablas DB
        supabase_admin.table('authorized_users').delete().eq("email", req.email).execute()

        return {"message": f"Usuario {req.email} eliminado de Auth y BD."}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error eliminando usuario: {str(e)}")


@router.post("/school-plan")
async def update_school_plan(req: UpdateSchoolPlanRequest, _ = Depends(verify_super_admin)):
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Falta Service Role Key")
    try:
        supabase_admin.table('schools').update({
            "subscription_plan": req.subscription_plan
        }).eq("id", req.school_id).execute()
        return {"message": "Plan actualizado correctamente."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al actualizar colegio: {str(e)}")

@router.post("/profile-plan")
async def update_profile_plan(req: UpdateProfilePlanRequest, _ = Depends(verify_super_admin)):
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Falta Service Role Key")
    try:
        supabase_admin.table('profiles').update({
            "individual_plan_active": req.individual_plan_active,
            "school_id": req.school_id if req.school_id else None
        }).eq("id", req.profile_id).execute()
        return {"message": "Perfil individual actualizado correctamente."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al actualizar perfil: {str(e)}")

# === DASHBOARD DE ESTADÍSTICAS (SAAS ENGAGEMENT) ===
# Pesos para cálculo de horas ahorradas (minutos)
SAVED_MINUTES_MAP = {
    "planificador": 85,
    "lectura-inteligente": 55,
    "rubricas": 40,
    "analizador": 35,
    "evaluaciones": 60,
    "nee": 50,
    "mentor": 15
}

@router.get("/stats")
async def get_admin_stats(_ = Depends(verify_super_admin)):
    """
    Agrega métricas de uso global para el SuperAdmin:
    - Adopción, Horas Ahorradas, Usuarios Activos, Top Módulos.
    """
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Falta Service Role Key")

    try:
        # 1. Usuarios autorizados vs perfiles activos
        res_auth = supabase_admin.table('authorized_users').select('email', count='exact').execute()
        total_authorized = res_auth.count or 1

        # 2. Telemetría y Biblioteca
        res_events = supabase_admin.table('telemetry_events').select('*').order('created_at', desc=True).limit(1000).execute()
        events = res_events.data or []

        res_lib = supabase_admin.table('biblioteca_recursos').select('tipo, user_id, created_at').execute()
        lib_items = res_lib.data or []

        # 3. Mapeo de UUIDs a emails para legibilidad
        res_profiles = supabase_admin.table('profiles').select('id, email, full_name').execute()
        profile_map = {p['id']: {"email": p.get('email', 'anon'), "name": p.get('full_name', 'Docente')} for p in (res_profiles.data or [])}

        # 4. Procesamiento
        total_saved_minutes = 0
        module_usage = {}
        user_activity = {}
        unique_active_users = set()

        LIB_TYPE_TO_MODULE = {
            "PLANIFICACION": "planificador",
            "RUBRICA": "rubricas",
            "EVALUACION": "evaluaciones",
            "AUDITORIA": "analizador",
            "LECTURA": "lectura-inteligente",
            "ESTRATEGIA": "nee",
            "ELEVADOR": "mentor"
        }

        # Procesar items de biblioteca (histórico de éxito)
        for item in lib_items:
            tipo = str(item.get('tipo', '')).upper()
            uid = item.get('user_id')
            user_info = profile_map.get(uid, {"email": "anonymous", "name": "Anónimo"})
            email = user_info["email"]
            
            if email != "anonymous":
                unique_active_users.add(email)
                user_activity[email] = user_activity.get(email, 0) + 1
            
            mod_key = LIB_TYPE_TO_MODULE.get(tipo, "unknown")
            if mod_key != "unknown":
                total_saved_minutes += SAVED_MINUTES_MAP.get(mod_key, 0)
                module_usage[mod_key] = module_usage.get(mod_key, 0) + 1

        # Procesar telemetría (interacciones en tiempo real)
        for ev in events:
            mod = ev.get('module', 'unknown')
            mod_clean = mod.split('/')[-1] if '/' in mod else mod
            email = ev.get('email', 'anonymous')
            
            if email != "anonymous":
                unique_active_users.add(email)
                user_activity[email] = user_activity.get(email, 0) + 1

            if mod_clean in SAVED_MINUTES_MAP and 'success' in ev.get('event_name', '').lower():
                # Evitar doble conteo si ya se contó en biblioteca? 
                # La telemetría cuenta 'intentos' y 'éxitos' visuales, la biblioteca cuenta 'guardados'.
                # Para simplificar, si es éxito en telemetría pero no se guardó, igual ahorró algo de tiempo.
                pass 

        # 5. Formatear resultados
        adoption_pct = round((len(unique_active_users) / total_authorized) * 100, 1) if total_authorized > 0 else 0
        
        top_users = sorted(
            [{"email": k, "count": v, "name": next((v['name'] for uid, v in profile_map.items() if v['email'] == k), k)} 
             for k, v in user_activity.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:10]

        sorted_modules = sorted(
            [{"name": k.capitalize(), "val": v} for k, v in module_usage.items()],
            key=lambda x: x["val"],
            reverse=True
        )

        # 6. Usuarios por Colegio
        res_profiles_school = supabase_admin.table('profiles').select('school_id').execute()
        school_counts = {}
        for p in (res_profiles_school.data or []):
            sid = p.get('school_id') or "individual"
            school_counts[sid] = school_counts.get(sid, 0) + 1

        res_schools = supabase_admin.table('schools').select('id, name').execute()
        schools_map = {s['id']: s['name'] for s in (res_schools.data or [])}
        schools_map["individual"] = "Profesores Independientes"

        school_stats = sorted(
            [{"name": schools_map.get(sid, sid), "count": count} for sid, count in school_counts.items()],
            key=lambda x: x["count"],
            reverse=True
        )

        return {
            "summary": {
                "total_authorized": total_authorized,
                "active_users": len(unique_active_users),
                "adoption_percent": adoption_pct,
                "saved_hours": round(total_saved_minutes / 60, 1),
                "total_resources": len(lib_items)
            },
            "top_modules": sorted_modules,
            "power_users": top_users,
            "school_stats": school_stats,
            "recent_events": events[:10]
        }

    except Exception as e:
        print(f"❌ Error en stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
