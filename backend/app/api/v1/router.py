from fastapi import APIRouter
from app.api.v1.endpoints import planificador, evaluacion, library, profile, mejora_continua

api_router = APIRouter()
api_router.include_router(planificador.router, tags=["planificador"])
api_router.include_router(evaluacion.router, tags=["evaluacion"])
api_router.include_router(library.router, tags=["library"])
api_router.include_router(profile.router, tags=["profile"])
api_router.include_router(mejora_continua.router, prefix="/mejora-continua", tags=["mejora-continua"])
