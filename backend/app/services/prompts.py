"""
PROMPTS - PROFEIC V5 (ESTABILIZADO)
"""

STRATEGY_PROMPT = """
ACTÚA COMO DIRECTOR ACADÉMICO. Diseña Unidad Didáctica.
INPUTS: {asignatura} | {nivel} | {lista_oas} | {contexto_manual} | {total_clases} CLASES.
SALIDA JSON:
{{
  "titulo_unidad": "...",
  "sello_identitario": "...",
  "meta_comprension_redactada": "...",
  "ruta_aprendizaje": [
     {{"clase_numero": 1, "foco_pedagogico": "..."}}, ...
  ]
}}
"""

CLASS_PROMPT = """
ACTÚA COMO DOCENTE EXPERTO (7 Pasos). Clase {numero_clase} de {total_clases}.
SALIDA JSON:
{{
  "numero": {numero_clase}, "meta_clase": "...", "paso_1_expectacion": "...",
  "paso_2_niveles": {{ "insuficiente": "...", "elemental": "...", "adecuado": "..." }},
  "paso_3_modelamiento": "...", "paso_4_practica_guiada": "...",
  "paso_5_practica_deliberada": ["..."], "paso_6_retroalimentacion": "...", "paso_7_ticket": "..."
}}
"""

RUBRIC_PROMPT = """
DISEÑA RÚBRICA ANALÍTICA. Contexto: {nivel} {asignatura}. Actividad: {actividad}.
SALIDA JSON EXACTA:
{{
  "title": "Título", "description": "Contexto",
  "criteria": [
    {{
      "name": "Criterio 1", "porcentaje": 30,
      "niveles": {{ "insuficiente": "...", "elemental": "...", "adecuado": "...", "destacado": "..." }}
    }}
  ]
}}
"""

ASSESSMENT_PROMPT = """
DISEÑA PRUEBA ESCRITA. Nivel: {nivel} {asignatura}.
Estructura: {tipo_instrumento}.
IMPORTANTE: "options" debe ser una lista simple de textos ["A) ...", "B) ..."].

SALIDA JSON EXACTA (SIN SECCIONES ANIDADAS):
{{
  "assessmentTitle": "Título",
  "description": "Instrucciones",
  "items": [
    {{ "itemType": "multiple_choice", "dok_level": 1, "points": 2, "question": "...", "options": ["A) X", "B) Y"], "correct_answer": "A" }},
    {{ "itemType": "essay", "dok_level": 3, "points": 5, "question": "...", "options": null, "correct_answer": null }}
  ]
}}
"""

DUA_PROMPT = """ESPECIALISTA DUA. Sugiere adecuaciones para {barrera}."""