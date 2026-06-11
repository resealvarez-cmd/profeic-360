-- MIGRATION: Mejoras de Estructura, Rendimiento y Seguridad - Motor Conducción Preventiva
-- Fecha: 2026-06-01

-- 1. Crear la Tabla Relacional Secundaria para Comentarios de Aula
CREATE TABLE IF NOT EXISTS public.comentarios_aula (
    id SERIAL PRIMARY KEY,
    motor_id INT NOT NULL REFERENCES public.motor_conduccion_preventiva(id) ON DELETE CASCADE,
    comentario_original TEXT NOT NULL,
    nudo_didactico TEXT NOT NULL,
    accion_sugerida TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexar la clave foránea para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_comentarios_motor_id ON public.comentarios_aula(motor_id);

-- 2. Migración de Datos y Limpieza
DO $$
BEGIN
    -- Si la columna comentarios_aula existe en la tabla principal, migramos sus datos a la nueva tabla relacional
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'motor_conduccion_preventiva' AND column_name = 'comentarios_aula'
    ) THEN
        INSERT INTO public.comentarios_aula (motor_id, comentario_original, nudo_didactico, accion_sugerida, created_at)
        SELECT 
            m.id, 
            COALESCE(c->>'comentario_original', ''), 
            COALESCE(c->>'nudo_didactico', ''), 
            COALESCE(c->>'accion_sugerida', ''), 
            COALESCE((c->>'timestamp')::timestamptz, m.created_at)
        FROM 
            public.motor_conduccion_preventiva m,
            jsonb_array_elements(m.comentarios_aula) AS c
        WHERE jsonb_typeof(m.comentarios_aula) = 'array'
        ON CONFLICT DO NOTHING;
        
        -- Eliminar la columna de la tabla principal para evitar duplicidades
        ALTER TABLE public.motor_conduccion_preventiva DROP COLUMN comentarios_aula;
    END IF;
END $$;

-- 3. Añadir Check Constraint para Formato del periodo_id
ALTER TABLE public.motor_conduccion_preventiva 
DROP CONSTRAINT IF EXISTS check_periodo_formato;

ALTER TABLE public.motor_conduccion_preventiva
ADD CONSTRAINT check_periodo_formato 
CHECK (periodo_id ~ '^[0-9]{4}-S[1-2]$');

-- 4. Añadir Índices GIN en campos JSONB para mayor rendimiento
CREATE INDEX IF NOT EXISTS idx_mcp_datos_academicos_gin 
ON public.motor_conduccion_preventiva USING GIN (datos_academicos);

CREATE INDEX IF NOT EXISTS idx_mcp_datos_convivencia_gin 
ON public.motor_conduccion_preventiva USING GIN (datos_convivencia);

-- 5. Robustecimiento de Row Level Security (RLS) en motor_conduccion_preventiva
-- Eliminar políticas previas genéricas
DROP POLICY IF EXISTS "Allow insert for authenticated on motor" ON public.motor_conduccion_preventiva;
DROP POLICY IF EXISTS "Allow update for authenticated on motor" ON public.motor_conduccion_preventiva;

-- Nueva política de inserción estricta por Rol Directivo/Coordinador
CREATE POLICY "Allow insert for coordinators and directores" 
ON public.motor_conduccion_preventiva
FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.authorized_users
        WHERE email = auth.email() AND role IN ('admin', 'director', 'utp', 'coordinador')
    )
);

-- Nueva política de actualización estricta por Rol Directivo/Coordinador
CREATE POLICY "Allow update for coordinators and directores" 
ON public.motor_conduccion_preventiva
FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.authorized_users
        WHERE email = auth.email() AND role IN ('admin', 'director', 'utp', 'coordinador')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.authorized_users
        WHERE email = auth.email() AND role IN ('admin', 'director', 'utp', 'coordinador')
    )
);

-- 6. Habilitar y Configurar Row Level Security (RLS) en la tabla comentarios_aula
ALTER TABLE public.comentarios_aula ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for authenticated on comentarios_aula" ON public.comentarios_aula;
CREATE POLICY "Allow select for authenticated on comentarios_aula"
ON public.comentarios_aula
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow insert for authenticated on comentarios_aula" ON public.comentarios_aula;
CREATE POLICY "Allow insert for authenticated on comentarios_aula"
ON public.comentarios_aula
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow manage for coordinators and directores on comentarios_aula" ON public.comentarios_aula;
CREATE POLICY "Allow manage for coordinators and directores on comentarios_aula"
ON public.comentarios_aula
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.authorized_users
        WHERE email = auth.email() AND role IN ('admin', 'director', 'utp', 'coordinador')
    )
);
