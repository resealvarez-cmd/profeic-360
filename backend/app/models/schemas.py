from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# --- ENTRADAS DE API (INPUT SCHEMAS) ---

class HITLValidarRequest(BaseModel):
    periodo_id: str = Field(..., description="ID del período escolar, ej. '2026-S1'")
    curso_id: str = Field(..., description="ID o nombre del curso, ej. '1 Medio A'")
    configuracion_umbrales: Dict[str, Any] = Field(
        default={"asistencia_limite": 85.0, "peso_atrasos": 0.4},
        description="Ponderaciones y límites editados por el coordinador mediante HITL"
    )
    contexto_coordinador: str = Field(..., description="Anotaciones cualitativas obligatorias del coordinador (licencias, crisis, etc.)")

class RoadmapGenerarRequest(BaseModel):
    periodo_id: str = Field(..., description="ID del período escolar")
    curso_id: str = Field(..., description="ID o nombre del curso")

class ClassroomCommentRequest(BaseModel):
    curso_id: str = Field(..., description="ID o nombre del curso")
    asignatura_id: str = Field(..., description="Nombre o identificador de la asignatura (será normalizado)")
    comentario: str = Field(..., description="Texto libre o transcripción de audio proveniente del Pop-up Conversacional del profesor")


# --- SALIDAS DE API & RESPUESTAS (OUTPUT SCHEMAS) ---

class IngestaResponse(BaseModel):
    status: str = "success"
    message: str
    periodo_id: str
    curso_id: str
    datos_academicos: Dict[str, Any]
    datos_convivencia: Dict[str, Any]

class HITLPreviewResponse(BaseModel):
    periodo_id: str
    curso_id: str
    datos_academicos: Dict[str, Any]
    datos_convivencia: Dict[str, Any]
    configuracion_umbrales: Dict[str, Any]
    contexto_coordinador: Optional[str] = None
    alumnos_doble_riesgo: List[Dict[str, Any]]


# --- CONTRATOS DE SEGURIDAD POR ROL (RBAC RESPONSES) ---

# 1. ROL DIRECTOR: Acceso al Dashboard Maestro con analítica longitudinal y DOK.
class DirectorDashboardResponse(BaseModel):
    role: str = "director"
    periodo_id: str
    curso_id: str
    datos_academicos_longitudinal: Dict[str, Any] = Field(
        ...,
        description="Métricas de impacto longitudinal comparativas entre periodos (ej. 2026-S1 vs 2026-S2)"
    )
    graficos_conversion_dok: Dict[str, Any] = Field(
        ...,
        description="Gráficos dinámicos de distribución de niveles de profundidad de conocimiento (DOK)"
    )
    desafios_directivos_inversos: List[Dict[str, Any]] = Field(
        ...,
        description="Tareas estratégicas e inversas para el Director basadas en los cuellos de botella detectados"
    )
    alumnos_doble_riesgo_resumen: Dict[str, Any] = Field(
        ...,
        description="Resumen agregado de alertas de Doble Riesgo sin detallar nóminas confidenciales si no es necesario, o estadísticas macro"
    )

# 2. ROL COORDINADOR: Acceso al Panel de Control de Ciclo con calibración de umbrales y nómina de Doble Riesgo.
class CoordinadorDashboardResponse(BaseModel):
    role: str = "coordinador"
    periodo_id: str
    curso_id: str
    consola_umbrales: Dict[str, Any] = Field(
        ...,
        description="Sliders y calibraciones dinámicas de asistencia y pesos de atrasos"
    )
    heatmap_departamentos: Dict[str, Any] = Field(
        ...,
        description="Visualización en cuadrícula de alertas de rendimiento, asistencia y anotaciones por departamento"
    )
    generador_pautas_reunion: Dict[str, Any] = Field(
        ...,
        description="Briefing automatizado de puntos ciegos y brecha de sinceramiento para reuniones de ciclo"
    )
    alumnos_doble_riesgo_detalle: List[Dict[str, Any]] = Field(
        ...,
        description="Nómina atómica y detallada de alumnos en Doble Riesgo (RUT, promedio, asistencia, alertas)"
    )

# 3. ROL JEFE DE DEPARTAMENTO: Acceso al Kanban Instruccional de su asignatura.
class JefeDepartamentoDashboardResponse(BaseModel):
    role: str = "jefe_departamento"
    periodo_id: str
    curso_id: str
    departamento: str = Field(..., description="Asignatura/Departamento asignado")
    kanban_instruccional: List[Dict[str, Any]] = Field(
        ...,
        description="Tablero Kanban de hitos didácticos vinculados obligatoriamente a evidencias del aula"
    )
    alertas_academicas_depto: List[Dict[str, Any]] = Field(
        ...,
        description="Alumnos en rezago o con asignaturas insuficientes dentro de su área"
    )

# 4. ROL PROFESOR DE ASIGNATURA: Timeline semestral y retroalimentación didáctica.
# RESTRICCIÓN DE SEGURIDAD ABSOLUTA: Oculta por completo los gráficos y datos macro de "Doble Riesgo" de los alumnos.
class ProfesorDashboardResponse(BaseModel):
    role: str = "profesor"
    periodo_id: str
    curso_id: str
    timeline_semestral: List[Dict[str, Any]] = Field(
        ...,
        description="Timeline semestral de metas pedagógicas y fases metodológicas"
    )
    metas_pedagogicas: List[str] = Field(
        ...,
        description="Metas específicas de aprendizaje y cobertura de su área"
    )
    feed_retroalimentacion: List[str] = Field(
        ...,
        description="Sugerencias de liderazgo preventivo y feed de retroalimentación metodológica basado en la IA"
    )
    popup_conversacional_activo: bool = Field(
        True,
        description="Estado habilitado para registrar inputs por audio/texto de bloqueadores en el aula"
    )


# --- DETALLE DE DRILL-DOWN CLÍNICO ---

class DetailDrillDownResponse(BaseModel):
    periodo_id: str
    curso_id: str
    departamento_id: Optional[int] = None
    atrasos_netos: List[Dict[str, Any]] = Field(..., description="Atrasos acumulados y netos por RUT")
    anotaciones_rice: List[Dict[str, Any]] = Field(..., description="Mapeo detallado de anotaciones clasificadas RICE (Leve, Grave, Gravísima)")
    reactivos_pruebas: List[Dict[str, Any]] = Field(..., description="Estadísticas de reactivos específicos de pruebas y DOK")
