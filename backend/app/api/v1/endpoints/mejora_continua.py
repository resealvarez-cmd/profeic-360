from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ai_core import model, clean_json
from app.services.prompts import PME_IMPORT_PROMPT
import json
import io
import pypdf
import docx

router = APIRouter()

@router.post("/importar-documento")
async def importar_pme(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text = ""
        
        if file.filename.lower().endswith(".pdf"):
            pdf = pypdf.PdfReader(io.BytesIO(content))
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        elif file.filename.lower().endswith(".docx"):
            doc = docx.Document(io.BytesIO(content))
            for para in doc.paragraphs:
                text += para.text + "\n"
        else:
            # Fallback simple para texto plano o CSV
            text = content.decode("utf-8", errors="ignore")

        if not text.strip():
            raise HTTPException(status_code=400, detail="No se pudo extraer texto del documento.")

        # Limitar texto para evitar exceder tokens (aproximadamente 3000 palabras)
        text_limited = " ".join(text.split()[:3000])
        
        prompt = PME_IMPORT_PROMPT.format(texto_documento=text_limited)
        raw_response = model.generate_content(prompt).text
        json_data = json.loads(clean_json(raw_response))
        
        return json_data
    except Exception as e:
        print(f"Error en importación PME: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error procesando documento: {str(e)}")
