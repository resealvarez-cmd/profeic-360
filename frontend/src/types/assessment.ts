export type DoKLevel = 1 | 2 | 3 | 4;

export type ItemType =
    | 'multiple_choice'
    | 'true_false'
    | 'matching'
    | 'ordering'
    | 'short_answer'
    | 'essay';

// Configuración inicial que elige el docente
export interface AssessmentConfig {
    grade: string;
    subject: string;
    oaIds: string[]; // IDs de los OAs seleccionados
    totalQuestions: number;
    dokDistribution: {
        dok1: number; // Porcentaje
        dok2: number;
        dok3: number;
    };
}

// Estructura de una pregunta generada
export interface AssessmentItem {
    id: string;
    oa_reference: string;
    type: ItemType;
    dok_level: DoKLevel;
    stem: string; // El enunciado

    // Opciones (para selección múltiple)
    options?: {
        id: string;
        text: string;
        isCorrect: boolean;
        feedback?: string
    }[];

    // Para Verdadero/Falso
    isTrue?: boolean;

    // Rúbrica simplificada (para preguntas de desarrollo)
    rubric?: {
        criteria: string;
        max_score: number;
    }[];
}

// La prueba completa
export interface AssessmentResult {
    title: string;
    description: string;
    items: AssessmentItem[];
}   