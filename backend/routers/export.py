from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import nsdecls
from docx.oxml import parse_xml
import io
import os
import re
import json

router = APIRouter()

# ==========================================
# 1. MODELOS DE DATOS
# ==========================================

class ExportRequest(BaseModel):
    titulo: str
    descripcion: str
    nivel: str
    asignatura: str
    oa: str
    actividad: str
    puntaje_total: int
    tabla: List[Dict[str, Any]]

class PlanExportRequest(BaseModel):
    titulo_unidad: str
    estrategia: str
    nivel: str
    asignatura: str
    oas: List[str]
    clases: List[Dict[str, Any]]

class AssessmentItem(BaseModel):
    type: str
    dok_level: int
    points: int
    stem: str
    options: Optional[List[Dict[str, Any]]] = None
    correct_answer: Optional[bool] = None
    rubric_hint: Optional[str] = None

class AssessmentExportRequest(BaseModel):
    title: str
    description: str
    grade: str
    subject: str
    items: List[AssessmentItem]

class ElevatorExportRequest(BaseModel):
    grade: str
    subject: str
    activity: str
    dok_actual: str
    diagnostico: str
    escalera: List[Dict[str, Any]]
    propuestas: Dict[str, str]

class GenericExportRequest(BaseModel):
    titulo_unidad: str
    nivel: str
    asignatura: str
    contenido: Dict[str, Any]

# ==========================================
# 2. UTILIDADES DE DISEÑO
# ==========================================

def limpiar_latex_para_word(texto: str) -> str:
    if not texto: return ""
    texto = str(texto)
    texto = re.sub(r'\$\$(.*?)\$\$', r'\1', texto) 
    texto = texto.replace('\\', '') 
    return texto

def set_cell_background(cell, color_hex):
    shading_elm = parse_xml(r'<w:shd {} w:fill="{}"/>'.format(nsdecls('w'), color_hex))
    cell._tc.get_or_add_tcPr().append(shading_elm)

def style_header_cell(cell, text, bg_color="2B546E", text_color="FFFFFF"):
    cell.text = text
    set_cell_background(cell, bg_color)
    if cell.paragraphs[0].runs:
        run = cell.paragraphs[0].runs[0]
        run.font.bold = True
        try:
            run.font.color.rgb = RGBColor.from_string(text_color)
        except:
            pass
        run.font.size = Pt(10)
    cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

def add_header_logo(doc, asignatura, nivel, titulo_extra=""):
    table = doc.add_table(rows=1, cols=2)
    table.autofit = False
    table.columns[0].width = Inches(1.2)
    table.columns[1].width = Inches(5.3)
    
    cell_logo = table.cell(0, 0)
    p = cell_logo.paragraphs[0]
    run = p.add_run()
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    logo_path = os.path.join(base_dir, 'assets', 'logo.png')
    
    if os.path.exists(logo_path):
        try:
            run.add_picture(logo_path, width=Inches(1.0))
        except:
            run.add_text("ProfeIC")
    else:
        run.add_text("ProfeIC")

    cell_info = table.cell(0, 1)
    p_info = cell_info.paragraphs[0]
    p_info.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r1 = p_info.add_run("COLEGIO MADRE PAULINA\n")
    r1.bold = True; r1.font.size = Pt(12); r1.font.color.rgb = RGBColor(43, 84, 110)
    p_info.add_run(f"Asignatura: {asignatura} | Nivel: {nivel}\n").font.size = Pt(10)
    if titulo_extra:
        p_info.add_run(f"{titulo_extra}").italic = True

    doc.add_paragraph() 

# ==========================================
# 3. MOTORES DE RENDERIZADO (Lógica Visual)
# ==========================================

def renderizar_planificacion(doc, data):
    """Motor Visual para Planificaciones"""
    titulo = data.get('titulo_unidad_creativo') or data.get('titulo_unidad') or "Planificación"
    h = doc.add_heading(limpiar_latex_para_word(titulo), level=1)
    h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    est = data.get('estrategia_aprendizaje_sentencia') or data.get('estrategia')
    if est:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(f"Estrategia: {limpiar_latex_para_word(est)}")
        r.italic = True; r.font.color.rgb = RGBColor(43, 84, 110)

    # Clases
    clases = data.get('planificacion_clases') or data.get('clases') or []
    for clase in clases:
        doc.add_paragraph()
        # Header Clase
        t = doc.add_table(rows=1, cols=1); t.autofit = False; t.columns[0].width = Inches(6.5)
        c = t.cell(0,0); set_cell_background(c, "2B546E")
        p = c.paragraphs[0]; r = p.add_run(f"CLASE {clase.get('numero_clase','?')}"); r.bold=True; r.font.color.rgb=RGBColor(255,255,255); r.font.size=Pt(12)
        if clase.get('foco_pedagogico'): p.add_run(f" | Foco: {limpiar_latex_para_word(clase.get('foco_pedagogico'))}").font.color.rgb=RGBColor(255,255,255)
        
        # Momentos
        tm = doc.add_table(rows=2, cols=3); tm.style = 'Table Grid'
        style_header_cell(tm.cell(0,0), "INICIO", "F2AE60"); style_header_cell(tm.cell(0,1), "DESARROLLO", "F2AE60"); style_header_cell(tm.cell(0,2), "CIERRE", "F2AE60")
        cont = clase.get('contenido_editable', {})
        tm.cell(1,0).text = limpiar_latex_para_word(cont.get('inicio',''))
        tm.cell(1,1).text = limpiar_latex_para_word(cont.get('desarrollo',''))
        tm.cell(1,2).text = limpiar_latex_para_word(cont.get('cierre',''))

        # Recursos
        doc.add_paragraph()
        tr = doc.add_table(rows=1, cols=1); tr.style = 'Table Grid'
        tr.cell(0,0).text = f"Recursos: {limpiar_latex_para_word(clase.get('recurso_practica', ''))}\nTicket: {limpiar_latex_para_word(clase.get('ticket_salida', ''))}"

def renderizar_rubrica(doc, data):
    """Motor Visual para Rúbricas"""
    # Título y Descripción
    titulo = data.get('titulo') or "Rúbrica de Evaluación"
    h = doc.add_heading(limpiar_latex_para_word(titulo), level=1)
    h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    if data.get('descripcion'):
        p = doc.add_paragraph(limpiar_latex_para_word(data.get('descripcion')))
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.italic = True
    
    doc.add_paragraph()
    
    # Metadata (OA, Actividad)
    if data.get('oaDescripcion') or data.get('oa'):
        p = doc.add_paragraph()
        p.add_run("Objetivo de Aprendizaje: ").bold = True
        p.add_run(limpiar_latex_para_word(data.get('oaDescripcion') or data.get('oa')))
    
    if data.get('actividad'):
        p = doc.add_paragraph()
        p.add_run("Actividad / Producto: ").bold = True
        p.add_run(limpiar_latex_para_word(data.get('actividad')))
        
    doc.add_paragraph()

    # TABLA RÚBRICA
    tabla_datos = data.get('tabla', [])
    if tabla_datos:
        # Definir columnas: Criterio + 4 Niveles
        t = doc.add_table(rows=1, cols=5)
        t.style = 'Table Grid'
        t.autofit = False
        
        # Headers con Colores
        headers = ["Criterio & Peso", "Insuficiente", "Elemental", "Adecuado", "Destacado"]
        bg_colors = ["EFEFEF", "FEF2F2", "FEFCE8", "F0FDF4", "EFF6FF"] # Gris, Rojo, Amarillo, Verde, Azul
        text_colors = ["000000", "991B1B", "854D0E", "166534", "1E40AF"]

        for i, (text, bg) in enumerate(zip(headers, bg_colors)):
            style_header_cell(t.cell(0,i), text, bg, "000000" if i==0 else "333333")

        # Filas
        puntaje_total = data.get('puntaje_total', 60)
        
        for row in tabla_datos:
            new_row = t.add_row()
            
            # Criterio y Peso
            peso = row.get('porcentaje', 0)
            pts_max = (puntaje_total * peso) / 100
            criterio_text = f"{limpiar_latex_para_word(row.get('criterio',''))}\n\n({peso}%) - Máx {pts_max:.1f} pts"
            new_row.cells[0].text = criterio_text
            
            # Niveles
            niveles = row.get('niveles', {})
            # Mapeo seguro de claves (a veces vienen en mayusculas o minusculas)
            niveles_safe = {k.lower(): v for k, v in niveles.items()}
            
            keys = ["insuficiente", "elemental", "adecuado", "destacado"]
            factors = [0.25, 0.5, 0.75, 1.0]
            
            for i, key in enumerate(keys):
                desc = niveles_safe.get(key, "")
                pts = pts_max * factors[i]
                new_row.cells[i+1].text = f"{limpiar_latex_para_word(desc)}\n\n({pts:.1f} pts)"

def renderizar_evaluacion(doc, data):
    """Motor Visual para Pruebas"""
    titulo = data.get('title') or "Evaluación"
    h = doc.add_heading(limpiar_latex_para_word(titulo), level=1)
    h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    if data.get('description'):
        p = doc.add_paragraph(limpiar_latex_para_word(data.get('description')))
        p.italic = True
    
    doc.add_paragraph()
    
    # Datos alumno
    t = doc.add_table(rows=1, cols=2); t.style='Table Grid'
    t.cell(0,0).text = "Nombre: __________________________________"; t.cell(0,1).text = "Fecha: __________"
    doc.add_paragraph()

    items = data.get('items', [])
    for i, item in enumerate(items):
        p = doc.add_paragraph()
        run = p.add_run(f"{i+1}. {limpiar_latex_para_word(item.get('stem',''))}")
        run.bold = True
        p.add_run(f" ({item.get('points')} pts)")
        
        if item.get('type') == 'multiple_choice' and item.get('options'):
            for idx, opt in enumerate(item['options']):
                doc.add_paragraph(f"   {chr(97+idx)}) {limpiar_latex_para_word(opt.get('text',''))}")
        elif item.get('type') == 'true_false':
             doc.add_paragraph("   ___ V    ___ F")
        elif item.get('type') in ['short_answer', 'essay']:
             doc.add_paragraph("_" * 80)
             doc.add_paragraph("_" * 80)

# ==========================================
# 4. ENDPOINTS
# ==========================================

@router.post("/export/planificacion-docx")
async def export_planificacion_docx(req: PlanExportRequest):
    try:
        doc = Document()
        add_header_logo(doc, req.asignatura, req.nivel, "Planificación")
        renderizar_planificacion(doc, req.dict())
        file_stream = io.BytesIO(); doc.save(file_stream); file_stream.seek(0)
        return StreamingResponse(file_stream, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={"Content-Disposition": "attachment; filename=planificacion.docx"})
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.post("/export/rubrica-docx")
async def export_rubric_docx(req: ExportRequest):
    try:
        doc = Document()
        add_header_logo(doc, req.asignatura, req.nivel, "Rúbrica de Evaluación")
        renderizar_rubrica(doc, req.dict())
        file_stream = io.BytesIO(); doc.save(file_stream); file_stream.seek(0)
        return StreamingResponse(file_stream, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={"Content-Disposition": "attachment; filename=rubrica.docx"})
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.post("/export/evaluacion-docx")
async def export_assessment_docx(req: AssessmentExportRequest):
    try:
        doc = Document()
        add_header_logo(doc, req.subject, req.grade, "Evaluación")
        renderizar_evaluacion(doc, req.dict())
        file_stream = io.BytesIO(); doc.save(file_stream); file_stream.seek(0)
        return StreamingResponse(file_stream, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={"Content-Disposition": "attachment; filename=evaluacion.docx"})
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.post("/export/elevador-docx")
async def export_elevator_docx(req: ElevatorExportRequest):
    try:
        doc = Document()
        add_header_logo(doc, req.subject, req.grade, "Elevador Cognitivo")
        doc.add_heading("Elevador Cognitivo", 1)
        doc.add_paragraph(f"Actividad Base: {req.activity}")
        doc.add_heading(f"Diagnóstico: {req.dok_actual}", 2)
        doc.add_paragraph(req.diagnostico)
        # (Se puede expandir la lógica visual aquí si es necesario)
        file_stream = io.BytesIO(); doc.save(file_stream); file_stream.seek(0)
        return StreamingResponse(file_stream, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={"Content-Disposition": "attachment; filename=elevador.docx"})
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

# --- GENÉRICO (BIBLIOTECA) ---
@router.post("/export/generic-docx")
async def export_generic_docx(req: GenericExportRequest):
    try:
        doc = Document()
        add_header_logo(doc, req.asignatura, req.nivel, "Documento Exportado")
        content = req.contenido

        # 1. PLANIFICACIÓN
        if "planificacion_clases" in content or ("clases" in content and isinstance(content['clases'], list)):
            print("Detectado: Planificación")
            # Normalización
            if "titulo_unidad_creativo" in content: content["titulo_unidad"] = content["titulo_unidad_creativo"]
            if "estrategia_aprendizaje_sentencia" in content: content["estrategia"] = content["estrategia_aprendizaje_sentencia"]
            renderizar_planificacion(doc, content)

        # 2. RÚBRICA (¡AQUÍ ESTÁ LA MAGIA QUE FALTABA!)
        elif "tabla" in content and isinstance(content['tabla'], list) and "criterio" in content['tabla'][0]:
            print("Detectado: Rúbrica")
            renderizar_rubrica(doc, content)

        # 3. EVALUACIÓN (PRUEBA)
        elif "items" in content and isinstance(content['items'], list):
            print("Detectado: Evaluación")
            renderizar_evaluacion(doc, content)

        # 4. AUDITORÍA
        elif "diagnostico_global" in content:
            doc.add_heading("Reporte de Auditoría", 1)
            doc.add_paragraph(f"Diagnóstico: {content.get('diagnostico_global')}")
            p = doc.add_paragraph(f"Score: {content.get('score_coherencia')}%")
            if content.get('score_coherencia', 0) < 60: p.runs[0].font.color.rgb = RGBColor(255, 0, 0)

        # 5. NEE / OTROS
        elif "estrategias" in content:
            doc.add_heading(f"Adecuación: {content.get('diagnosis')}", 1)
            doc.add_paragraph(f"Barrera: {content.get('barrier')}")
            est = content.get('estrategias', {})
            doc.add_heading("Acceso", 2); doc.add_paragraph(est.get('acceso', ''))
            doc.add_heading("Actividad", 2); doc.add_paragraph(est.get('actividad', ''))
            doc.add_heading("Evaluación", 2); doc.add_paragraph(est.get('evaluacion', ''))

        # 6. DEFAULT
        else:
             doc.add_paragraph(json.dumps(content, indent=4, ensure_ascii=False))

        file_stream = io.BytesIO(); doc.save(file_stream); file_stream.seek(0)
        filename = f"{req.titulo_unidad}.docx".replace(" ", "_")
        return StreamingResponse(file_stream, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={"Content-Disposition": f"attachment; filename={filename}"})
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))