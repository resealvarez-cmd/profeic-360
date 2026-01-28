import { z } from "zod";

// 1. Validaciones del Formulario (Paso 1)
export const configSchema = z.object({
    nivel: z.string().min(1, "Selecciona un nivel"),
    asignatura: z.string().min(1, "Selecciona una asignatura"),
    oa: z.string().min(10, "El Objetivo de Aprendizaje debe ser descriptivo"),
    actitud: z.string().min(1, "Selecciona una actitud o valor del PEI"),
});

export type ConfigFormValues = z.infer<typeof configSchema>;

// 2. Definiciones de la Respuesta de la IA

export interface EstrategiaPropuesta {
    enfoque: string;
    metodologia_sugerida: string;
    habilidad_cognitiva: string;
    justificacion: string;
}

// Estos son los 7 pasos exactos
export type Etapa7Pasos =
    | "1. Expectación"
    | "2. Activación"
    | "3. Modelamiento"
    | "4. Práctica Guiada"
    | "5. Práctica Independiente"
    | "6. Retroalimentación"
    | "7. Cierre y Metacognición";

export interface PasoDidactico {
    etapa: Etapa7Pasos;
    descripcion: string;
    tiempo_sugerido: string;
    rol_docente: string;
    rol_estudiante: string;
}

export interface PlanificacionClase {
    numero_clase: number;
    objetivo_especifico: string;
    secuencia_7_pasos: PasoDidactico[];
    recursos: string[];
    evaluacion: string;
}