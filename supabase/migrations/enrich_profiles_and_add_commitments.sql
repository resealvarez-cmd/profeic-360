-- MIGRATION: Enrich Profiles & Add Commitments (Master Prompt)

-- 1. Enrich Profiles Table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER;

-- 2. Create Commitments Table (Trajectory System)
CREATE TABLE IF NOT EXISTS public.commitments (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES public.observation_cycles(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'achieved', 'missed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT commitments_pkey PRIMARY KEY (id)
);

-- 3. Enable RLS for Commitments
ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Commitments
-- Authenticated users can read commitments (for trajectory view)
CREATE POLICY "Authenticated users can read commitments"
  ON public.commitments FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users (Coordinators/Directors) can insert commitments
CREATE POLICY "Authenticated users can insert commitments"
  ON public.commitments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update commitments
CREATE POLICY "Authenticated users can update commitments"
  ON public.commitments FOR UPDATE
  TO authenticated
  USING (true);
