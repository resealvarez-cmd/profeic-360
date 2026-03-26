from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from .deps import get_current_user_id_optional
from services.vision_service import OMRVisionService
from pydantic import BaseModel
from typing import Dict, Optional
import logging

router = APIRouter(prefix="/api/v1/omr", tags=["OMR Vision"])

logger = logging.getLogger(__name__)

class OMRProcessResponse(BaseModel):
    evaluation_instance_id: str
    rut: str
    answers: Dict[str, Optional[str]]
    status: str = "success"

@router.post("/process", response_model=OMRProcessResponse)
async def process_omr_scan(
    file: UploadFile = File(...),
    current_user_id: Optional[str] = Depends(get_current_user_id_optional)
):
    """
    Recibe un archivo de imagen, procesa el OMR y el QR, y retorna los resultados.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo cargado no es una imagen.")

    try:
        contents = await file.read()
        result = OMRVisionService.process_image(contents)
        
        return OMRProcessResponse(
            evaluation_instance_id=result["evaluation_instance_id"],
            rut=result["rut"],
            answers=result["answers"],
            status=result.get("status", "success")
        )
    except ValueError as ve:
        logger.error(f"Error de validación OMR: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        import traceback
        error_msg = f"Error inesperado en OMR: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=f"Detalle del error: {str(e)}")

