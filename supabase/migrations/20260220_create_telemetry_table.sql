-- Create a table for product telemetry and analytics
CREATE TABLE IF NOT EXISTS public.telemetry_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT, -- Capturing email for easier filtering in Early Stage
    event_name TEXT NOT NULL, -- e.g. 'regenerate_question', 'login_success'
    module TEXT, -- e.g. 'lectura_inteligente', 'dashboard'
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- dynamic data (e.g. error messages, counts)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can INSERT their OWN events (silent tracking)
CREATE POLICY "Users can insert their own telemetry" 
ON public.telemetry_events FOR INSERT 
TO authenticated 
WITH CHECK (true); -- We allow all authenticated users to report events

-- Policy: ONLY re.se.alvarez@gmail.com can SELECT (view) telemetry data
CREATE POLICY "Only re.se.alvarez@gmail.com can view telemetry" 
ON public.telemetry_events FOR SELECT 
TO authenticated 
USING (auth.jwt() ->> 'email' = 're.se.alvarez@gmail.com');

-- Add index for performance in future analysis
CREATE INDEX IF NOT EXISTS idx_telemetry_event_name ON public.telemetry_events(event_name);
CREATE INDEX IF NOT EXISTS idx_telemetry_school_id ON public.telemetry_events(school_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON public.telemetry_events(created_at);
