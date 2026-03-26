-- MIGRATION: Módulo de Monitoreo SIMCE
-- Descripción: Tablas para gestión de ensayos, preguntas y resultados de procesamiento OMR.

-- 1. Evaluaciones SIMCE
CREATE TABLE IF NOT EXISTS public.simce_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    level TEXT NOT NULL,
    learning_objectives JSONB NOT NULL DEFAULT '[]',
    pdf_url TEXT,
    omr_sheet_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Preguntas de la Evaluación (Metadata para corrección)
CREATE TABLE IF NOT EXISTS public.simce_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES public.simce_evaluations(id) ON DELETE CASCADE,
    question_number INT NOT NULL,
    correct_answer CHAR(1) NOT NULL, -- 'A', 'B', 'C', 'D', 'E'
    cognitive_domain TEXT CHECK (cognitive_domain IN ('Localizar', 'Relacionar', 'Reflexionar')),
    oa_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Resultados de Estudiantes (Post-procesamiento OMR)
CREATE TABLE IF NOT EXISTS public.simce_student_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL REFERENCES public.simce_evaluations(id) ON DELETE CASCADE,
    student_name TEXT, -- Extraído vía OCR o ingresado
    answers JSONB NOT NULL, -- { "1": "A", "2": "C" }
    score INT NOT NULL DEFAULT 0,
    total_questions INT NOT NULL,
    percentage FLOAT GENERATED ALWAYS AS (CASE WHEN total_questions > 0 THEN (score::FLOAT / total_questions) * 100 ELSE 0 END) STORED,
    performance_level TEXT CHECK (performance_level IN ('Adecuado', 'Elemental', 'Insuficiente')),
    scan_image_url TEXT,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}' -- Error margins, vision confidence, etc.
);

-- 4. RLS - Row Level Security (Siguiendo el patrón existente)
ALTER TABLE public.simce_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simce_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simce_student_results ENABLE ROW LEVEL SECURITY;

-- Políticas para simce_evaluations
CREATE POLICY "View simce_evaluations by school" ON public.simce_evaluations
    FOR SELECT TO authenticated USING (school_id = get_user_school_id());

CREATE POLICY "Manage simce_evaluations by school" ON public.simce_evaluations
    FOR ALL TO authenticated USING (school_id = get_user_school_id());

-- Políticas para simce_questions (heredan de evaluation)
CREATE POLICY "View simce_questions by school" ON public.simce_questions
    FOR SELECT TO authenticated USING (
        evaluation_id IN (SELECT id FROM public.simce_evaluations WHERE school_id = get_user_school_id())
    );

CREATE POLICY "Manage simce_questions by school" ON public.simce_questions
    FOR ALL TO authenticated USING (
        evaluation_id IN (SELECT id FROM public.simce_evaluations WHERE school_id = get_user_school_id())
    );

-- Políticas para simce_student_results
CREATE POLICY "View simce_student_results by school" ON public.simce_student_results
    FOR SELECT TO authenticated USING (
        evaluation_id IN (SELECT id FROM public.simce_evaluations WHERE school_id = get_user_school_id())
    );

CREATE POLICY "Manage simce_student_results by school" ON public.simce_student_results
    FOR ALL TO authenticated USING (
        evaluation_id IN (SELECT id FROM public.simce_evaluations WHERE school_id = get_user_school_id())
    );
