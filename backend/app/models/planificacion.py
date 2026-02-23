from pydantic import BaseModel
from typing import List, Optional
from app.models.common import NivelesDesempeno

class RutaAprendizaje(BaseModel):
    clase_numero: int
    foco_pedagogico: str

class EstrategiaUnidad(BaseModel):
    titulo_unidad: str
    sello_identitario: str
    meta_comprension_redactada: str
    ruta_aprendizaje: List[RutaAprendizaje]

class DetalleClase(BaseModel):
    numero: int
    meta_clase: str
    paso_1_expectacion: str
    paso_2_niveles: NivelesDesempeno
    paso_3_modelamiento: str
    paso_4_practica_guiada: str
    paso_5_practica_deliberada: List[str]
    paso_6_retroalimentacion: str
    paso_7_ticket: str

class UnitRequest(BaseModel):
    asignatura: str
    nivel: str
    horas: int
    oas: List[str]
    oas: List[str]
    contexto_manual: Optional[str] = ""
    # Community Fields
    is_public: bool = False
    author_name: Optional[str] = None

class ClassGenerationRequest(BaseModel):
    estrategia_unidad: EstrategiaUnidad
    numero_clase: int
    total_clases: int
