from fastapi import APIRouter
from app.api.v1.endpoints import planificador, evaluacion, library

api_router = APIRouter()
api_router.include_router(planificador.router, tags=["planificador"])
api_router.include_router(evaluacion.router, tags=["evaluacion"])
api_router.include_router(library.router, tags=["library"])
