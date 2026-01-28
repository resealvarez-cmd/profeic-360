from pydantic import BaseModel, Field
from typing import List, Optional
from app.models.common import NivelesDesempeno

# --- RÚBRICAS ---
class RubricRequest(BaseModel):
    nivel: str
    asignatura: str
    oaId: str
    oaDescripcion: str
    actividad: str

class CriterioRubrica(BaseModel):
    criterio: str = Field(alias="name") # Acepta "name" o "criterio"
    porcentaje: int = 0
    niveles: NivelesDesempeno

class RubricResult(BaseModel):
    titulo: str = Field(alias="title")
    descripcion: str = Field(alias="description")
    tabla: List[CriterioRubrica] = Field(alias="criteria")

# --- EVALUACIONES ---
class DokDistribution(BaseModel):
    dok1: int
    dok2: int
    dok3: int

class Quantities(BaseModel):
    multiple_choice: int
    true_false: int
    short_answer: int
    essay: int

class AssessmentRequest(BaseModel):
    grade: str
    subject: str
    oaIds: List[int]
    customOa: Optional[str] = ""
    dokDistribution: DokDistribution
    quantities: Quantities

class AssessmentItem(BaseModel):
    type: str = Field(alias="itemType") 
    dok_level: int = 1
    points: int
    stem: str = Field(alias="question") 
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None

class AssessmentResult(BaseModel):
    title: str = Field(alias="assessmentTitle")
    description: str = Field(default="Instrucciones generales")
    items: List[AssessmentItem]
