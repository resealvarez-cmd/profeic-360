from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
router = APIRouter()

# --- CONEXIÓN SUPABASE ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = None

if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- MODELO DE DATOS ---
class LoginRequest(BaseModel):
    email: str
    password: str

# --- ENDPOINT LOGIN (YA LO TIENES) ---
@router.post("/auth/login")
def login_user(credentials: LoginRequest):
    if not supabase: raise HTTPException(status_code=500, detail="Error servidor")
    try:
        response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        return {"status": "success", "user": {"id": response.user.id, "email": response.user.email}, "session": {"access_token": response.session.access_token}}
    except Exception as e:
        print(f"❌ Error Login: {e}")
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

# --- ENDPOINT REGISTRO (NUEVO) ---
@router.post("/auth/register")
def register_user(credentials: LoginRequest):
    if not supabase: raise HTTPException(status_code=500, detail="Error servidor")
    try:
        # Crea el usuario en Supabase Auth
        response = supabase.auth.sign_up({
            "email": credentials.email,
            "password": credentials.password
        })
        
        # OJO: Supabase puede requerir confirmar email. 
        # Si response.user existe pero response.session es None, falta confirmar email.
        if response.user and not response.session:
            return {"status": "pending_confirmation", "message": "Usuario creado. Revisa tu correo para confirmar."}
            
        return {"status": "success", "user": {"id": response.user.id, "email": response.user.email}, "session": {"access_token": response.session.access_token}}
        
    except Exception as e:
        print(f"❌ Error Registro: {e}")
        raise HTTPException(status_code=400, detail="Error al crear usuario. Puede que ya exista.")