-- Create a table for schools (Instituciones)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- Short name for URLs/filtering
    domain TEXT, -- Optional: to auto-map users by email domain
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add school_id to profiles to link users to schools
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='school_id') THEN
        ALTER TABLE public.profiles ADD COLUMN school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Policies for public.schools
CREATE POLICY "Schools are viewable by authenticated users" 
ON public.schools FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Only Super Admin can manage schools" 
ON public.schools FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'email' = 're.se.alvarez@gmail.com');

-- Seed a default school
INSERT INTO public.schools (name, slug) 
VALUES ('Colegio Madre Paulina', 'cmp')
ON CONFLICT (slug) DO NOTHING;

-- Backfill existing profiles with the default school
UPDATE public.profiles SET school_id = (SELECT id FROM public.schools WHERE slug = 'cmp')
WHERE school_id IS NULL;
