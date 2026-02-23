-- Add enrichment columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER;

-- Optional: Add comments
COMMENT ON COLUMN public.profiles.age IS 'Edad del docente';
COMMENT ON COLUMN public.profiles.department IS 'Departamento o Asignatura principal';
COMMENT ON COLUMN public.profiles.years_experience IS 'Años de experiencia docente';
