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

PME_IMPORT_PROMPT = """
ACTÚA COMO CONSULTOR ESTRATÉGICO EDUCACIONAL. Analiza el siguiente texto de un Plan de Mejoramiento Educativo (PME).
TEXTO: {texto_documento}

Extrae y organiza la información en el siguiente formato JSON EXACTO:
{{
  "title": "Título del Objetivo Estratégico",
  "description": "Breve descripción general de la meta",
  "phases": [
    {{
      "title": "Nombre de la Fase (Ej: Diagnóstico, Implementación, Evaluación)",
      "indicators": [
        {{ "description": "Descripción del indicador de éxito", "target_value": 100, "metric_type": "percentage" }}
      ]
    }}
  ]
}}
"""

MOTOR_PREVENTIVO_ROADMAP_PROMPT = """
ACTÚA COMO INGENIERO DE LIDERAZGO INSTRUCCIONAL PREVENTIVO Y ASESOR PEDAGÓGICO SENIOR.
Tu misión es diseñar un Roadmap didáctico estratégico y un plan de reenseñanza flexible y dinámico para combatir el Camuflaje Cognitivo y mitigar el Doble Riesgo.

=== DATOS CONSOLIDADOS DEL CURSO ===
Curso: {curso_id}
Período: {periodo_id}
Datos Académicos (Internos vs Externos DIA/SIMCE): {datos_academicos}
Datos de Convivencia e IDPS (RICE, anotaciones por gravedad, atrasos): {datos_convivencia}
Notas y Contexto del Coordinador (HITL): {contexto_coordinador}
Comentarios Conversacionales de Docentes (Bloqueadores en el aula): {comentarios_aula}
Pautas del Perfilador Docente (Paso 1 y Paso 3 - Clima e Inclusión): {pautas_perfilador}

=== REGLAS CRÍTICAS DE ANÁLISIS ===
1. DETECTAR CAMUFLAJE COGNITIVO: Compara la brecha del DIA/SIMCE (% de logro adecuado) contra las notas y aprobación interna. Si las notas son altas pero el SIMCE es bajo, señala la "Ilusión de Competencia" e identifica el camuflaje.
2. CONVIVENCIA VS PERFILADOR: Cruza los quiebres de convivencia escolar (atrasos, anotaciones graves/gravísimas según RICE) con las pautas de Clima e Inclusión del profesor (Paso 1 - Expectación/Clima y Paso 3 - Modelamiento) para entender bloqueadores.
3. ROADMAP Y SECUENCIA DIDÁCTICA DE 7 PASOS: Genera una propuesta de Hoja de Ruta didáctica flexible organizada en base a la Secuencia Didáctica de 7 Pasos:
   - Paso 1: Expectación
   - Paso 2: Niveles de desempeño
   - Paso 3: Modelamiento
   - Paso 4: Práctica guiada
   - Paso 5: Práctica deliberada
   - Paso 6: Retroalimentación
   - Paso 7: Ticket de salida

RETORNA ESTRICTAMENTE UN JSON CON LA SIGUIENTE ESTRUCTURA EXACTA (SIN TEXTO EXTRA, SIN FORMATO MARKDOWN EXTRA, SOLO EL JSON DE RESPUESTA):
{{
  "titulo_roadmap": "Nombre formal de la estrategia de conducción",
  "diagnostico_camuflaje": {{
    "deteccion_brecha": "Análisis descriptivo de brecha SIMCE/DIA vs Notas",
    "nivel_alerta": "Bajo" | "Medio" | "Crítico",
    "explicacion": "Explicación detallada de la ilusión de competencia observada"
  }},
  "analisis_convivencia_aula": {{
    "nudos_criticos": "Cruces clave entre anotaciones RICE/atrasos y pautas docentes de clima/inclusión",
    "bloqueadores_identificados": ["Bloqueador 1", "Bloqueador 2"]
  }},
  "roadmap_secuencia_didactica": {{
    "estrategia_reenseñanza_general": "Líneas maestras no rígidas para el departamento",
    "pasos": {{
      "paso_1_expectacion": "Foco y adecuación recomendada para enganchar al curso considerando quiebres",
      "paso_2_niveles_desempeno": "Definición flexible de niveles de logro",
      "paso_3_modelamiento": "Acción del docente para derribar camuflajes cognitivos",
      "paso_4_practica_guiada": "Andamiajes y apoyo docente focalizado en Doble Riesgo",
      "paso_5_practica_deliberada": "Actividades dinámicas adaptadas por nivel",
      "paso_6_retroalimentacion": "Estrategias de feedback oportuno en aula",
      "paso_7_ticket_salida": "Instrumento rápido para sincerar el aprendizaje al cierre de clase"
    }}
  }},
  "desafios_directivos_sugeridos": [
    {{"tarea": "Acción estratégica para el equipo UTP/Director", "prioridad": "Alta" | "Media"}}
  ]
}}
"""