-- MIGRATION: Motor de Conducción Preventiva (V3)
-- Descripción: Tabla principal longitudinal dinámicamente conectada al currículum. 

-- 1. Eliminar rastro de la estructura anterior restrictiva si existe
DROP TABLE IF EXISTS public.motor_conduccion_preventiva CASCADE;
DROP TABLE IF EXISTS public.departamentos CASCADE;

-- 2. Tabla Principal: Motor de Conducción Preventiva (Versión Dinámica Curriculum)
CREATE TABLE public.motor_conduccion_preventiva (
    id SERIAL PRIMARY KEY,
    periodo_id VARCHAR(10) NOT NULL, -- Ej: '2026-S1'
    curso_id VARCHAR(20) NOT NULL,
    asignatura VARCHAR(255) NOT NULL, -- Conexión directa a curriculum_oas (Ej: 'Lenguaje y Comunicación', 'Filosofía')
    corte_temporal VARCHAR(50) DEFAULT 'General' NOT NULL,
    datos_academicos JSONB NOT NULL DEFAULT '{}'::jsonb,
    datos_convivencia JSONB NOT NULL DEFAULT '{}'::jsonb,
    configuracion_umbrales JSONB NOT NULL DEFAULT '{"asistencia_limite": 85, "peso_atrasos": 0.4}'::jsonb,
    contexto_coordinador TEXT,
    roadmap_sugerido JSONB,
    comentarios_aula JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_periodo_curso_asig_corte UNIQUE (periodo_id, curso_id, asignatura, corte_temporal)
);

-- 3. Índices Eficientes para Búsqueda
CREATE INDEX idx_mcp_periodo_asig ON public.motor_conduccion_preventiva (periodo_id, asignatura);
CREATE INDEX idx_mcp_curso ON public.motor_conduccion_preventiva (curso_id);
CREATE INDEX idx_mcp_corte_temporal ON public.motor_conduccion_preventiva (corte_temporal);

-- 4. Habilitar Seguridad (RLS)
ALTER TABLE public.motor_conduccion_preventiva ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Acceso
CREATE POLICY "Allow select for authenticated on motor" ON public.motor_conduccion_preventiva
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert for authenticated on motor" ON public.motor_conduccion_preventiva
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update for authenticated on motor" ON public.motor_conduccion_preventiva
    FOR UPDATE TO authenticated USING (true);
