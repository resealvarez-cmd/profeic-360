-- Migration: Contexto Institucional per-colegio y per-profesor
-- Fecha: 2026-03-05
-- Propósito: Agregar columnas necesarias para la feature de contexto institucional dinámico

-- ───────────────────────────────────────────────────────────
-- 1. PROFILES: preferencia de contexto geográfico del profesor
-- ───────────────────────────────────────────────────────────
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS usar_contexto_geografico boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.profiles.usar_contexto_geografico IS 
'Si es true, la IA usará referencias geográficas locales (ciudad, región) en los recursos generados. 
El sello y valores del colegio siempre se aplican independiente de este toggle.';

-- ───────────────────────────────────────────────────────────
-- 2. SCHOOLS: campos de contexto institucional
--    (solo agrega si no existen — safe para colegios ya creados)
-- ───────────────────────────────────────────────────────────
ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS sello_institucional text,
ADD COLUMN IF NOT EXISTS valores text,
ADD COLUMN IF NOT EXISTS proyecto_educativo text;

COMMENT ON COLUMN public.schools.city IS 
'Ciudad donde está ubicado el colegio. Se usa para contextualizar ejemplos pedagógicos.';
COMMENT ON COLUMN public.schools.region IS 
'Región de Chile donde está el colegio (ej: Región del Biobío).';
COMMENT ON COLUMN public.schools.sello_institucional IS 
'Sello formativo o identidad del colegio (ej: Humanista-Cristiano, Científico-Tecnológico).';
COMMENT ON COLUMN public.schools.valores IS 
'Valores institucionales separados por coma (ej: Respeto, Fe, Servicio, Excelencia).';
COMMENT ON COLUMN public.schools.proyecto_educativo IS 
'Descripción breve del proyecto educativo institucional para contextualizar la IA.';

-- ───────────────────────────────────────────────────────────
-- 3. Pre-llenar datos del Colegio Madre Paulina (si existe)
-- ───────────────────────────────────────────────────────────
UPDATE public.schools
SET 
    city = COALESCE(city, 'Chiguayante'),
    region = COALESCE(region, 'Región del Biobío'),
    sello_institucional = COALESCE(sello_institucional, 'Humanista-Cristiano con Excelencia Académica'),
    valores = COALESCE(valores, 'Caridad, Fe, Verdad, Alegría, Servicio, Libertad, Humildad, Responsabilidad, Respeto')
WHERE name ILIKE '%Madre Paulina%';
