from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 1. IMPORTAMOS TUS ROUTERS
# (Basado en el árbol de archivos que me mostraste, TIENES TODOS ESTOS)
from routers import (
    planificador, 
    rubricas, 
    curriculum, 
    export,       # <--- CRÍTICO: Necesario para descargar Word
    evaluaciones, 
    mentor, 
    contexto, 
    elevador, 
    nee, 
    login,
    analizador,
    analizador,
    biblioteca,   # <--- CRÍTICO: Tu nueva estantería
    community,    # <--- FASE V: Mercado Interno
    social,       # <--- FASE SOCIAL: Noticias y Likes
    acompanamiento, 
    lectura_inteligente,
    telemetry,
    admin
)

app = FastAPI(title="API ProfeIC", version="4.0.0")

# 2. SEGURIDAD (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
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

@app.get("/")
def read_root():
    return {"status": "online", "message": "🚀 SISTEMA PROFEIC OPERATIVO"}

# Esto permite correrlo directamente con Python si quisieras
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)