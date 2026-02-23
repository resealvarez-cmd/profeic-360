-- Update RLS Policy to be more robust
DROP POLICY IF EXISTS "Admins can insert/update authorized_users." ON public.authorized_users;

CREATE POLICY "Admins can insert/update/delete authorized_users." ON public.authorized_users
  FOR ALL USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 're.se.alvarez@gmail.com'
  );
