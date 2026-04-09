from fastapi import APIRouter, HTTPException, Response
from app.db.supabase import supabase
from app.services.ai_core import model, clean_json
from app.services.prompts import STRATEGY_PROMPT, CLASS_PROMPT
from app.services.file_engine import create_plan_docx
from app.models.planificacion import UnitRequest, EstrategiaUnidad, ClassGenerationRequest, DetalleClase
from app.models.common import CurriculumRequest
import json

router = APIRouter()

@router.post("/curriculum/options")
async def get_options(req: CurriculumRequest):
    try:
        if supabase:
            if not req.nivel:
                d = supabase.table('curriculum').select('nivel').execute()
                if d.data: return {"type": "niveles", "data": sorted(list(set([x['nivel'] for x in d.data])))}
            if not req.asignatura:
                d = supabase.table('curriculum').select('asignatura').eq('nivel', req.nivel).execute()
                if d.data: return {"type": "asignaturas", "data": sorted(list(set([x['asignatura'] for x in d.data])))}
            d = supabase.table('curriculum').select('*').eq('nivel', req.nivel).eq('asignatura', req.asignatura).execute()
            if d.data: return {"type": "oas", "data": d.data}
    except: pass
    # FALLBACK MANUAL (EMERGENCIA)
    return {"type": "niveles", "data": ["1° Básico", "2° Básico", "3° Básico", "4° Básico", "1° Medio", "2° Medio", "3° Medio", "4° Medio"]}

@router.post("/generate-strategy", response_model=EstrategiaUnidad)
async def gen_strat(req: UnitRequest):
    # Contexto Colegio
    contexto_colegio = ""
    if req.school_id:
        try:
            school_resp = supabase.table("schools").select("*").eq("id", req.school_id).maybe_single().execute()
            if school_resp.data:
                s = school_resp.data
                contexto_colegio = f"CONTEXTO COLEGIO: Vulnerabilidad {s.get('priority_pct')}% SEP, {s.get('pie_neet_count', 0) + s.get('pie_neep_count', 0)} alumnos PIE, Nivel {s.get('socioeconomic_level')}."
        except: pass

    ctx_full = f"{contexto_colegio} {req.contexto_manual}" if contexto_colegio else req.contexto_manual
    
    prompt = STRATEGY_PROMPT.format(asignatura=req.asignatura, nivel=req.nivel, lista_oas=str(req.oas), contexto_manual=ctx_full, total_clases=max(1, req.horas // 2))
    return json.loads(clean_json(model.generate_content(prompt).text))

@router.post("/generate-class", response_model=DetalleClase)
async def gen_class(req: ClassGenerationRequest):
    prompt = CLASS_PROMPT.format(numero_clase=req.numero_clase, total_clases=req.total_clases, titulo_unidad=req.estrategia_unidad.titulo_unidad, meta_unidad=req.estrategia_unidad.meta_comprension_redactada, sello=req.estrategia_unidad.sello_identitario, foco_clase="General")
    return json.loads(clean_json(model.generate_content(prompt).text))

@router.post("/generate-docx-plan")
async def docx_plan(data: dict):
    s = create_plan_docx(data); return Response(content=s.read(), media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")
