-- 1. Crear la tabla de eventos institucionales
CREATE TABLE IF NOT EXISTS public.school_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT,
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.school_events ENABLE ROW LEVEL SECURITY;

-- 3. Política: Todos los usuarios autenticados pueden VER los eventos
CREATE POLICY "Permitir VER eventos a usuarios autenticados" 
ON public.school_events 
FOR SELECT 
TO authenticated 
USING (true);

-- 4. Política: Solo los Administradores, Directores o UTP pueden CREAR eventos
CREATE POLICY "Permitir CREAR eventos solo a directivos" 
ON public.school_events 
FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.authorized_users
        WHERE email = auth.email() AND role IN ('admin', 'director', 'utp')
    )
);

-- 5. Política: Solo los Administradores, Directores o UTP pueden EDITAR eventos
CREATE POLICY "Permitir EDITAR eventos solo a directivos" 
ON public.school_events 
FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.authorized_users
        WHERE email = auth.email() AND role IN ('admin', 'director', 'utp')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.authorized_users
        WHERE email = auth.email() AND role IN ('admin', 'director', 'utp')
    )
);

-- 6. Política: Solo los Administradores, Directores o UTP pueden ELIMINAR eventos
CREATE POLICY "Permitir ELIMINAR eventos solo a directivos" 
ON public.school_events 
FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.authorized_users
        WHERE email = auth.email() AND role IN ('admin', 'director', 'utp')
    )
);
