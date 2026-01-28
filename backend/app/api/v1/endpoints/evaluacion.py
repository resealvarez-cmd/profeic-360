from fastapi import APIRouter, HTTPException, Response
from app.services.ai_core import model, clean_json
from app.services.prompts import RUBRIC_PROMPT, ASSESSMENT_PROMPT
from app.services.file_engine import create_rubric_docx, create_assessment_docx
from app.models.evaluacion import RubricRequest, RubricResult, AssessmentRequest, AssessmentResult
import json

router = APIRouter()

@router.post("/generate-rubric", response_model=RubricResult)
async def gen_rubric(req: RubricRequest):
    prompt = RUBRIC_PROMPT.format(nivel=req.nivel, asignatura=req.asignatura, lista_oas=req.oaDescripcion, actividad=req.actividad)
    return json.loads(clean_json(model.generate_content(prompt).text))

@router.post("/generate-assessment", response_model=AssessmentResult)
async def gen_assess(req: AssessmentRequest):
    prompt = ASSESSMENT_PROMPT.format(nivel=req.grade, asignatura=req.subject, lista_oas=str(req.oaIds), tipo_instrumento=str(req.quantities))
    try:
        raw = json.loads(clean_json(model.generate_content(prompt).text))
        
        # --- CORRECCIÓN DE EMERGENCIA: APLANAR RESPUESTA ---
        # Si la IA devuelve 'sections', sacamos los items de adentro
        final_items = []
        if "sections" in raw:
            for sec in raw["sections"]:
                if "items" in sec: final_items.extend(sec["items"])
        elif "items" in raw:
            final_items = raw["items"]
            
        # Normalizar opciones (si vienen como objetos, pasarlos a string)
        for item in final_items:
            if "options" in item and isinstance(item["options"], list):
                if len(item["options"]) > 0 and isinstance(item["options"][0], dict):
                     item["options"] = [opt.get("text", "") for opt in item["options"]]

        return {"assessmentTitle": raw.get("assessmentTitle", "Prueba"), "description": str(raw.get("description", "")), "items": final_items}
    except Exception as e:
        print(f"Error IA Eval: {e}")
        raise HTTPException(500, "Error generando evaluación")

@router.post("/download-rubric-docx")
async def docx_rubric(data: dict):
    s = create_rubric_docx(data); return Response(content=s.read(), media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")

@router.post("/download-assessment-docx")
async def docx_assess(data: dict):
    s = create_assessment_docx(data); return Response(content=s.read(), media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")
