-- FIX RLS POLICY
-- The previous policy tried to select from auth.users which is restricted.
-- We must use auth.jwt() ->> 'email' for a reliable check.

DROP POLICY IF EXISTS "Admins can insert/update/delete authorized_users." ON public.authorized_users;
DROP POLICY IF EXISTS "Admins can insert/update authorized_users." ON public.authorized_users;
DROP POLICY IF EXISTS "Public authorized_users are viewable by authenticated users." ON public.authorized_users;

-- 1. VIEW POLICY: Authenticated users can SEE the list (needed for 'Mis Docentes' and Admin)
CREATE POLICY "Authenticated users can view authorized_users." ON public.authorized_users
  FOR SELECT TO authenticated USING (true);

-- 2. ADMIN POLICY: Only Super Admin can INSERT/UPDATE/DELETE
CREATE POLICY "Super Admin can manage authorized_users." ON public.authorized_users
  FOR ALL TO authenticated USING (
    auth.jwt() ->> 'email' = 're.se.alvarez@gmail.com'
  );
