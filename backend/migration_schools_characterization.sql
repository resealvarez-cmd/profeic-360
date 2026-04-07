-- SQL Migration: Add school characterization fields
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS attendance_avg numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS enrollment_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS priority_pct numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS priority_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS preferred_pct numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS preferred_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pie_neet_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pie_neep_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS socioeconomic_level text;

-- Optional: Comment on columns for clarity
COMMENT ON COLUMN public.schools.attendance_avg IS 'Average attendance percentage (0-100)';
COMMENT ON COLUMN public.schools.enrollment_count IS 'Total number of enrolled students';
COMMENT ON COLUMN public.schools.priority_pct IS 'Percentage of priority students (0-100)';
COMMENT ON COLUMN public.schools.preferred_pct IS 'Percentage of preferred students (0-100)';
COMMENT ON COLUMN public.schools.pie_neet_count IS 'Count of PIE NEET students (Transient Special Educational Needs)';
COMMENT ON COLUMN public.schools.pie_neep_count IS 'Count of PIE NEEP students (Permanent Special Educational Needs)';
COMMENT ON COLUMN public.schools.socioeconomic_level IS 'School socioeconomic classification (e.g., Alto, Medio-Alto, etc.)';
