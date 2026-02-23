# PLAN ESTRATÉGICO DE EVOLUCIÓN: PROFE IC (VERSION 4.0 - "LUXURY SUITE")

**Visión:** Consolidar Profe IC como un "Exoesqueleto Intelectual" de clase mundial. Arquitectura Cloud-Native (Cloud Run + Supabase), priorizando Soberanía de Datos, Colaboración y una Experiencia de Usuario (UX) de alto impacto visual.

## I. ARQUITECTURA "BIBLIOTECA VIVA" (Supabase Storage + RAG)
**Objetivo:** Permitir carga de contextos propios (libros, apuntes) con persistencia.
**Infraestructura:**
- **Supabase Storage:** Crear bucket privado `biblioteca_contexto`.
- **Backend (FastAPI):**
    - Endpoint `/upload` (streaming a Supabase).
    - Servicio `RAGService`: Ingesta de documentos PDF -> Extracción de texto -> Inyección en Prompt.
**Frontend:**
- Componente `UploadZone` con drag-and-drop en el generador.

## II. MARKETING & ONBOARDING (Landing Page High-End)
**Objetivo:** Una ventana de ventas y educación de alto impacto visual.
**Tecnología Visual:** Implementar `framer-motion` para animaciones y `lucide-react` para iconografía.
**Secciones Clave:**
1.  **Hero Cinematográfico:** Título animado, subtítulo persuasivo y call-to-action (Login) con fondo dinámico o video sutil.
2.  **Bento Grid de Módulos:** Tarjetas interactivas (hover effects) explicando:
    - "El Planificador Inteligente"
    - "El Evaluador Soberano (RAG)"
    - "El Asistente DUA"
3.  **Profe IC Academy:** Carrusel de videos tutoriales (Youtube Embeds) y casos de uso.
4.  **Social Proof:** Citas animadas de usuarios reales (ej: Jasnna, Octavio).

## III. MÓDULO DE INCLUSIÓN (DUA & PIE)
**Objetivo:** Adaptaciones curriculares personalizadas.
**Flujo:**
1.  Click en "Generar Adecuación DUA" sobre una planificación.
2.  **Input Contextual:** Modal para describir las barreras/necesidades del grupo (Input libre).
3.  **Output:** Estrategias diversificadas (Visual, Kinestésico, Auditivo) generadas por IA.

## IV. CICLO DE EVALUACIÓN "360"
**Objetivo:** Entregar la herramienta completa, no solo la prueba.
**Entregables:**
1.  **Prueba Alumno:** PDF/Word limpio.
2.  **Kit Docente:** PDF separado con Respuestas Correctas y Rúbricas de Desarrollo detalladas.

## V. MERCADO INTERNO (Comunidad)
**Objetivo:** Red social pedagógica privada.
**Lógica:**
- Feed "Sala de Profesores" con recursos marcados como `public`.
- Función "Clonar Recurso" (Forking) para editar sin alterar el original.