-- ============================================================
-- Migration: RAG Multi-Tenant para Documentos Institucionales
-- Fecha: 2026-03-05
-- ============================================================
-- Añade school_id a documentos_institucionales para separar
-- los documentos (PEI, RICE, Reglamentos) por colegio.
-- Actualiza la función match_documents para filtrar por escuela.
-- ============================================================

-- 1. Agregar school_id a documentos_institucionales
ALTER TABLE public.documentos_institucionales
ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE;

-- Agregar índice para queries rápidas por colegio
CREATE INDEX IF NOT EXISTS idx_docs_inst_school_id 
ON public.documentos_institucionales(school_id);

-- 2. Agregar columna tipo_documento para la UI
ALTER TABLE public.documentos_institucionales
ADD COLUMN IF NOT EXISTS tipo_documento text DEFAULT 'general';
-- Valores sugeridos: 'pei', 'rice', 'reglamento_evaluacion', 'reglamento_convivencia', 'general'

COMMENT ON COLUMN public.documentos_institucionales.tipo_documento IS
'Tipo de documento institucional: pei, rice, reglamento_evaluacion, reglamento_convivencia, general';

COMMENT ON COLUMN public.documentos_institucionales.school_id IS
'Colegio al que pertenece este fragmento de documento. NULL = documentos globales/legacy.';

-- 3. Re-crear la función match_documents con filtro school_id opcional
-- IMPORTANTE: Esto REEMPLAZA la función existente.
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(768),
    match_threshold float,
    match_count int,
    filter_school_id uuid DEFAULT NULL
)
RETURNS TABLE (
    id bigint,
    content text,
    metadata jsonb,
    tipo_documento text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.content,
        d.metadata,
        d.tipo_documento,
        1 - (d.embedding <=> query_embedding) AS similarity
    FROM documentos_institucionales d
    WHERE
        1 - (d.embedding <=> query_embedding) > match_threshold
        AND (
            filter_school_id IS NULL               -- Sin filtro: busca todo (legacy)
            OR d.school_id = filter_school_id      -- Con filtro: solo ese colegio
            OR d.school_id IS NULL                 -- Documentos globales siempre visibles
        )
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 4. Marcar los documentos existentes como pertenecientes a Colegio Madre Paulina
-- (si ya existen documentos sin school_id, los asignamos al colegio histórico)
UPDATE public.documentos_institucionales
SET school_id = (
    SELECT id FROM public.schools WHERE name ILIKE '%Madre Paulina%' LIMIT 1
)
WHERE school_id IS NULL;
