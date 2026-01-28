"""
Módulo de modelos Pydantic y plantillas de prompts para ProfeIC.
Define las estructuras de salida estructurada y los prompts del sistema.
"""

from pydantic import BaseModel, Field
from typing import List

# -- Pydantic Models para Salida Estructurada (Presentaciones) --

class SlideContent(BaseModel):
    """Estructura de contenido de una diapositiva de presentación."""
    slide_title: str = Field(description="Título claro y conciso de la diapositiva.")
    bullet_points: List[str] = Field(description="Lista de 3 a 5 puntos clave para la diapositiva.")
    speaker_notes: str = Field(description="Notas detalladas para el profesor (uso interno).")

class PresentationStructure(BaseModel):
    """Estructura completa de la presentación."""
    title: str = Field(description="Título general de la presentación.")
    slides: List[SlideContent] = Field(description="Lista de diapositivas que conforman la presentación.")

# -- Pydantic Models para Salida Estructurada (Rúbricas) --

class RubricRow(BaseModel):
    """Fila de una rúbrica de evaluación (criterio y descriptores)."""
    criteria: str = Field(description="El criterio pedagógico a evaluar (ej. Uso de vocabulario técnico).")
    insufficient: str = Field(description="Descripción del logro Insuficiente (Nivel 1).")
    sufficient: str = Field(description="Descripción del logro Suficiente (Nivel 2).")
    outstanding: str = Field(description="Descripción del logro Destacado (Nivel 3).")

class RubricObject(BaseModel):
    """Estructura completa de una rúbrica exportable a Excel."""
    title: str = Field(description="Título de la rúbrica.")
    learning_objective: str = Field(description="Objetivo de aprendizaje asociado.")
    rows: List[RubricRow] = Field(description="Lista de filas de criterios de evaluación.")

# -- Pydantic Models para Salida Estructurada (Evaluación Calibrada - NUEVO) --

class QuestionItem(BaseModel):
    """Estructura de una pregunta de evaluación escrita (test) con calibración de rigor."""
    question_text: str = Field(description="Enunciado de la pregunta, contextualizado por RAG.")
    bloom_level: str = Field(description="Nivel de Bloom revisada (ej. 'Applying', 'Analyzing').")
    dok_level: str = Field(description="Nivel de Webb (DOK 1, 2, 3, o 4).")
    options: List[str] = Field(description="Opciones de respuesta múltiple (4 o 5).")
    correct_answer: str = Field(description="Clave de respuesta (una de las opciones).")
    justification_for_calibration: str = Field(description="Explicación del LLM sobre la alineación de DOK/Bloom con el enunciado y el contexto curricular institucional.")

class AssessmentObject(BaseModel):
    """Estructura completa de una prueba de evaluación exportable."""
    title: str = Field(description="Título descriptivo de la prueba.")
    learning_objective: str = Field(description="Objetivo de Aprendizaje principal de la prueba.")
    questions: List[QuestionItem] = Field(description="Lista de objetos QuestionItem que conforman la prueba.")

# -- Plantillas de Prompt --

# -- Plantillas de Prompt --

SYSTEM_PROMPT = """Eres el asistente pedagógico inteligente 'ProfeIC'.

Tu misión es apoyar a docentes en Chile.

Instrucciones de Prioridad (CRÍTICO):

1. Prioridad Absoluta: Responde y diseña la pedagogía basándote primero en el contexto de la categoría 'institucional' (PEI, Marco Formativo, etc.) si se encuentra.

2. Prioridad Secundaria: Utiliza el currículum del Mineduc (categoría 'mineduc') para los OA, contenidos y el Marco para la Buena Enseñanza (MBE).

3. Tono: Formal, pedagógico, altamente inclusivo y que respeta el Marco para la Buena Enseñanza (MBE).

Responde SIEMPRE en español."""

PLAN_CLASE_PROMPT = """Contexto Curricular (Prioritario): {context}

Eres un experto en el Dominio A del MBE.

Genera un plan de clase de 90 minutos para {asignatura} / {nivel} sobre el objetivo: {objetivo}.

La estructura debe ser clara (Inicio, Desarrollo, Cierre) e incluir explícitamente **estrategias DUA** y **alineación con nuestro modelo de innovación** encontrado en el contexto institucional."""

RUBRIC_TABLE_PROMPT = """Contexto Curricular: {context}

Genera una rúbrica analítica para evaluar: {actividad_a_evaluar} en {nivel}.

FORMATO DE SALIDA OBLIGATORIO:
Debes generar EXCLUSIVAMENTE una Tabla Markdown con las siguientes columnas:
| Criterio de Evaluación | Insuficiente (1 pt) | Elemental (2 pts) | Adecuado (3 pts) | Destacado (4 pts) |

Los criterios deben ser observables y usar lenguaje amigable para el docente."""

# Alias para compatibilidad
RUBRIC_GENERATION_PROMPT = RUBRIC_TABLE_PROMPT

COGNITIVE_ELEVATOR_PROMPT = """Contexto Curricular: {context}

Eres un experto en Taxonomía de Bloom y DOK de Webb.

Analiza el siguiente reactivo (pregunta/actividad): "{reactivo}"

Tu tarea es:
1. Identificar el nivel cognitivo actual.
2. Reescribir el reactivo para elevarlo a un nivel superior (DOK 3 o 4).

FORMATO DE SALIDA OBLIGATORIO:
Presenta el resultado en dos partes:

**1. Justificación Teórica:**
(Breve explicación del análisis)

**2. Tabla Comparativa:**
| Reactivo Original (Nivel Detectado) | Reactivo Mejorado (Nivel DOK 3/4) | Habilidad Cognitiva Activada |
|---|---|---|
| ... | ... | ... |
"""

CALIBRATOR_PROMPT = """Contexto Curricular: {context}

Analiza la coherencia y rigor del siguiente instrumento de evaluación:
"{instrumento}"

Tu tarea es calibrar el instrumento según el currículum nacional y los estándares institucionales.

FORMATO DE SALIDA OBLIGATORIO:

**1. Análisis de Coherencia:**
(Texto breve sobre alineación con OA)

**2. Tabla de Estadísticas de Rigor:**
| Nivel DOK | Cantidad de Preguntas | Porcentaje del Instrumento | Sugerencia de Ajuste |
|---|---|---|---|
| DOK 1 (Memorizar) | ... | ... | ... |
| DOK 2 (Procesar) | ... | ... | ... |
| DOK 3 (Estratégico) | ... | ... | ... |
| DOK 4 (Extendido) | ... | ... | ... |
"""

NEE_ASSISTANT_PROMPT = """Contexto Normativo: {context}

Eres un especialista PIE.

Analiza la siguiente actividad: {actividad_base}.

El estudiante tiene un diagnóstico de {diagnostico_nee}.

Genera sugerencias concretas de adecuaciones curriculares que se alineen con el Decreto 83/2015, categorizadas en: A) Adaptaciones de Acceso (ej. recursos) y B) Adaptaciones a los Objetivos (si son necesarias)."""

PPT_GENERATION_PROMPT = """Contexto Temático: {context}

Genera una estructura de presentación de {num_slides} diapositivas sobre el tema: {tema_ppt} para {nivel}.

La salida debe ser EXCLUSIVAMENTE un JSON válido que se ajuste estrictamente al esquema Pydantic 'PresentationStructure'.
Asegúrate de escapar las comillas dobles dentro del contenido JSON.

La estructura debe ser pedagógicamente sólida (ej. Introducción, Desarrollo de Contenido, Cierre)."""

TEST_GENERATION_PROMPT = """Contexto Curricular (Prioritario): {context}

Eres un experto en evaluación educativa (DOK de Webb y Taxonomía de Bloom Revisada).

Genera una evaluación escrita (tipo prueba de selección múltiple), en formato JSON que se ajuste estrictamente al esquema Pydantic 'AssessmentObject', sobre el objetivo: {objetivo_de_aprendizaje}.

Instrucciones Críticas de Calibración:

1. El número total de preguntas es: {num_questions}.

2. La distribución de rigor debe ser: {rigor_distribution} (ej. '70% DOK 2 o superior' o '50% Remembering/DOK 1').

3. Cada pregunta debe tener 4 o 5 opciones de respuesta.

4. Completa rigurosamente el campo 'justification_for_calibration' explicando por qué la pregunta cumple con el nivel DOK/Bloom asignado, basándote en el Contexto Curricular.

5. Prioriza el enfoque formativo de nuestra institución."""

