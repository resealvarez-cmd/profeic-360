-- Create school_events table
CREATE TABLE IF NOT EXISTS public.school_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.school_events ENABLE ROW LEVEL SECURITY;

-- Allow SELECT for all authenticated users
CREATE POLICY "Allow SELECT for authenticated users on school_events"
    ON public.school_events FOR SELECT
    TO authenticated
    USING (true);

-- Allow INSERT for admins
CREATE POLICY "Allow INSERT for admins on school_events"
    ON public.school_events FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.authorized_users
            WHERE email = auth.email() AND role IN ('admin', 'director', 'utp')
        )
    );

-- Allow UPDATE for admins
CREATE POLICY "Allow UPDATE for admins on school_events"
    ON public.school_events FOR UPDATE
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

-- Allow DELETE for admins
CREATE POLICY "Allow DELETE for admins on school_events"
    ON public.school_events FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.authorized_users
            WHERE email = auth.email() AND role IN ('admin', 'director', 'utp')
        )
    );
