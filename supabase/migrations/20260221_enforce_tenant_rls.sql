-- MIGRATION: Enforce tenant_id / school_id based Row Level Security
-- Addresses Phase 2 Hardening: Ensures isolation between schools.

-- 1. Helper function to get current user's school safely to avoid infinite recursion
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS UUID
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT school_id FROM profiles WHERE id = auth.uid();
$$;

-- 2. Secure Profiles Table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

CREATE POLICY "Users can view profiles in their own school or superadmin" ON public.profiles
  FOR SELECT USING (
    school_id = get_user_school_id() 
    OR id = auth.uid() 
    OR auth.jwt()->>'email' = 're.se.alvarez@gmail.com'
  );

-- 3. Secure Observation Cycles
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver ciclos" ON public.observation_cycles;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear/editar ciclos" ON public.observation_cycles;

CREATE POLICY "View observation_cycles by school"
  ON public.observation_cycles FOR SELECT TO authenticated
  USING (
    teacher_id IN (SELECT id FROM profiles WHERE school_id = get_user_school_id())
    OR auth.jwt()->>'email' = 're.se.alvarez@gmail.com'
  );

CREATE POLICY "Manage observation_cycles by school"
  ON public.observation_cycles FOR ALL TO authenticated
  USING (
    teacher_id IN (SELECT id FROM profiles WHERE school_id = get_user_school_id())
    OR auth.jwt()->>'email' = 're.se.alvarez@gmail.com'
  );

-- 4. Secure Observation Data
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver datos" ON public.observation_data;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear/editar datos" ON public.observation_data;

CREATE POLICY "View observation_data by school"
  ON public.observation_data FOR SELECT TO authenticated
  USING (
    cycle_id IN (
      SELECT id FROM observation_cycles 
      WHERE teacher_id IN (SELECT id FROM profiles WHERE school_id = get_user_school_id())
    )
    OR auth.jwt()->>'email' = 're.se.alvarez@gmail.com'
  );

CREATE POLICY "Manage observation_data by school"
  ON public.observation_data FOR ALL TO authenticated
  USING (
    cycle_id IN (
      SELECT id FROM observation_cycles 
      WHERE teacher_id IN (SELECT id FROM profiles WHERE school_id = get_user_school_id())
    )
    OR auth.jwt()->>'email' = 're.se.alvarez@gmail.com'
  );

-- 5. Secure Commitments (Trajectory)
DROP POLICY IF EXISTS "Authenticated users can read commitments" ON public.commitments;
DROP POLICY IF EXISTS "Authenticated users can insert commitments" ON public.commitments;
DROP POLICY IF EXISTS "Authenticated users can update commitments" ON public.commitments;

CREATE POLICY "View commitments by school"
  ON public.commitments FOR SELECT TO authenticated
  USING (
    teacher_id IN (SELECT id FROM profiles WHERE school_id = get_user_school_id())
    OR auth.jwt()->>'email' = 're.se.alvarez@gmail.com'
  );

CREATE POLICY "Manage commitments by school"
  ON public.commitments FOR ALL TO authenticated
  USING (
    teacher_id IN (SELECT id FROM profiles WHERE school_id = get_user_school_id())
    OR auth.jwt()->>'email' = 're.se.alvarez@gmail.com'
  );
