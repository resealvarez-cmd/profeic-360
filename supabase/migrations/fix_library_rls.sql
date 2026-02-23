-- Enable RLS on library table
ALTER TABLE public.biblioteca_recursos ENABLE ROW LEVEL SECURITY;

-- 1. Permits exist for owners (CRUD)
DROP POLICY IF EXISTS "Users can manage own resources" ON public.biblioteca_recursos;
CREATE POLICY "Users can manage own resources"
ON public.biblioteca_recursos
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Permits exist for public reading (Backend & Community)
DROP POLICY IF EXISTS "Public resources are viewable by everyone" ON public.biblioteca_recursos;
CREATE POLICY "Public resources are viewable by everyone"
ON public.biblioteca_recursos
FOR SELECT
USING (is_public = true);

-- 3. If the backend needs to read everything (optional, if using Service Key it bypasses anyway)
-- But if using Anon key, it needs access. 
-- Since backend logic for 'feed' filters by is_public=True, the policy above covers it.

-- 4. Verify user_id type matches auth.uid (UUID)
-- If user_id is text/varchar in schema but auth.uid is uuid, usually works but good to know.
