from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

# --- PREVENCIÓN DE CRASHES EN CLOUD RUN ---
# Solo seteamos fallbacks si la variable NO EXISTE en absoluto.
if not os.getenv("SUPABASE_URL"):
    os.environ["SUPABASE_URL"] = "https://falsesupabase.supabase.co"
if not os.getenv("SUPABASE_KEY"):
    os.environ["SUPABASE_KEY"] = "missing_key"
if not os.getenv("SUPABASE_SERVICE_ROLE_KEY"):
    # Intentamos reusar la KEY si existe antes de poner un placeholder roto
    os.environ["SUPABASE_SERVICE_ROLE_KEY"] = os.getenv("SUPABASE_KEY") or "missing_role_key"
if not os.getenv("GOOGLE_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = "missing_gemini_key"

# 1. IMPORTAMOS TUS ROUTERS
# (Basado en el árbol de archivos que me mostraste, TIENES TODOS ESTOS)
from routers import (
    planificador, 
    rubricas, 
    curriculum, 
    export,
    evaluaciones, 
    mentor, 
    contexto, 
    elevador, 
    nee, 
    login,
    analizador,
    biblioteca,
    community,
    social,
    acompanamiento, 
    lectura_inteligente,
    telemetry,
    admin,
    profile,
    insights,
    simce,
    simce_generator,         # ← Generador SIMCE con IA (blueprint + RAG + LLM)
    omr_vision,
    enrollment,
    teachers,
    mejora_continua,
    pme
)
from simce_router import router as simce_router

app = FastAPI(title="API ProfeIC", version="4.0.0")

# 2. SEGURIDAD (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://profeic.cl",
        "https://www.profeic.cl",
        "https://profeic-360.vercel.app",  # Preview deployments
        "http://localhost:3000",            # Dev local frontend
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. REGISTRO DE RUTAS (Encendemos todos los interruptores)
app.include_router(planificador.router)
app.include_router(rubricas.router)
app.include_router(curriculum.router)
app.include_router(export.router)      # <--- ¡ESTO ARREGLA LA DESCARGA!
app.include_router(evaluaciones.router)
app.include_router(mentor.router)
app.include_router(contexto.router)
app.include_router(elevador.router)
app.include_router(nee.router)
app.include_router(login.router)
app.include_router(analizador.router)
app.include_router(biblioteca.router)
app.include_router(community.router) # <--- Public Market
app.include_router(social.router)    # <--- Social Engine
app.include_router(acompanamiento.router)
app.include_router(lectura_inteligente.router)
app.include_router(telemetry.router)
app.include_router(admin.router)
app.include_router(profile.router)
app.include_router(insights.router)
# app.include_router(simce.router)
# app.include_router(simce_generator.router)  # POST /api/v1/simce/generate
app.include_router(omr_vision.router)
app.include_router(enrollment.router)
app.include_router(teachers.router)
app.include_router(mejora_continua.router)
app.include_router(pme.router)
app.include_router(simce_router) # Nuevo router híbrido


@app.get("/")
def read_root():
    return {"status": "ProfeIC API is running smoothly!"}

@app.get("/version")
def read_version():
    return {"version": "v1.2.6-BuildFix", "message": "🚀 SISTEMA PROFEIC OPERATIVO - ANALÍTICAS SINCRONIZADAS"}

# Esto permite correrlo directamente con Python si quisieras
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)