export interface AlumnoDobleRiesgo {
    rut: string;
    nombre: string;
    asistencia: number;
    promedio: number;
    atraso_minutos: number;
    anotaciones_negativas: number;
    anotaciones_graves: number;
    alerta_doble_riesgo: boolean;
    indice_camuflaje: number;
}

export interface AtrasoNeto {
    rut: string;
    minutos_netos: number;
}

export interface AnotacionRICE {
    rut: string;
    tipo: string;
    motivo: string;
    gravedad: "Leve" | "Grave" | "Gravísima";
}

export interface ReactivoPrueba {
    item: string;
    oa: string;
    dok_level: number;
    porcentaje_logro: number;
    alerta_rezago: boolean;
}

export interface KanbanItem {
    id: string;
    titulo: string;
    status: "Logrado" | "En proceso" | "Por hacer";
    evidencia: string;
}

export interface ComentarioAula {
    comentario_original: string;
    nudo_didactico: string;
    accion_sugerida: string;
    timestamp: string;
}

// --- RESPUESTAS DE DASHBOARD POR ROL ---

export interface DirectorDashboard {
    role: "director";
    periodo_id: string;
    curso_id: string;
    datos_academicos_longitudinal: {
        [periodo: string]: {
            promedio: number;
            aprobacion: number;
            atrasos: number;
        };
    };
    graficos_conversion_dok: {
        // BUG FIX: el backend corregido retorna number, pero el mock/cache puede retornar string con "%"
        // Se acepta ambos para retrocompatibilidad
        [label: string]: string | number;
    };
    desafios_directivos_inversos: Array<{
        tarea: string;
        urgencia: string;
    }>;
    alumnos_doble_riesgo_resumen: {
        total_alumnos: number;
        en_riesgo_critico: number;
        variacion_mensual: string;
    };
}

export interface CoordinadorDashboard {
    role: "coordinador";
    periodo_id: string;
    curso_id: string;
    consola_umbrales: {
        asistencia_limite: number;
        peso_atrasos: number;
    };
    heatmap_departamentos: {
        [materia: string]: {
            promedio: number;
            atrasos_mins: number;
            anotaciones: number;
        };
    };
    generador_pautas_reunion: {
        titulo: string;
        puntos_ciegos: string[];
    };
    alumnos_doble_riesgo_detalle: AlumnoDobleRiesgo[];
}

export interface JefeDepartamentoDashboard {
    role: "jefe_departamento";
    periodo_id: string;
    curso_id: string;
    departamento: string;
    kanban_instruccional: KanbanItem[];
    alertas_academicas_depto: Array<{
        rut: string;
        nombre: string;
        promedio_area: number;
        evidencia_bloqueo: string;
    }>;
}

export interface ProfesorDashboard {
    role: "profesor";
    periodo_id: string;
    curso_id: string;
    timeline_semestral: Array<{
        fecha: string;
        hito: string;
        metodo_sugerido: string;
    }>;
    metas_pedagogicas: string[];
    feed_retroalimentacion: string[];
    popup_conversacional_activo: boolean;
}
