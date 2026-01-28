from pydantic import BaseModel
from typing import Optional, Dict, Any

class NivelesDesempeno(BaseModel):
    insuficiente: str
    elemental: str
    adecuado: str
    destacado: Optional[str] = ""

class SaveWorkRequest(BaseModel):
    user_id: str
    type: str
    title: str
    subject: str
    grade: str
    content: Dict[str, Any]

class CurriculumRequest(BaseModel):
    asignatura: Optional[str] = None
    nivel: Optional[str] = None
