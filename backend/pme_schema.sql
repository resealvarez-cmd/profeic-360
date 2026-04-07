-- 1. Tabla para el "Paraguas" Estratégico (Acciones Oficiales)
CREATE TABLE IF NOT EXISTS public.pme_actions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    dimension text NOT NULL, -- Gestión Pedagógica, Liderazgo, Convivencia, Recursos
    title text NOT NULL,     -- El Objetivo extraído
    description text,        -- La Estrategia extraída
    academic_year integer DEFAULT extract(year from now()),
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now()
);

-- 2. Tabla para la Identidad e Información Financiera
CREATE TABLE IF NOT EXISTS public.pme_institutional_info (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    mission text,
    vision text,
    sellos jsonb DEFAULT '[]', -- Lista de sellos [sello1, sello2]
    budget_sep bigint DEFAULT 0,
    budget_pie bigint DEFAULT 0,
    budget_total bigint DEFAULT 0,
    academic_year integer DEFAULT extract(year from now()),
    updated_at timestamptz DEFAULT now()
);

-- 3. Vincular la tabla Operativa (Mejorando Juntos) con el Plan Oficial
-- Ejecutar esto solo si la columna no existe
ALTER TABLE public.strategic_goals ADD COLUMN IF NOT EXISTS pme_action_link uuid REFERENCES public.pme_actions(id);
