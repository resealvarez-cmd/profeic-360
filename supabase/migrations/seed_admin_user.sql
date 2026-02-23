-- Insert Super Admin into authorized_users
INSERT INTO public.authorized_users (email, full_name, role, status)
VALUES ('re.se.alvarez@gmail.com', 'René Álvarez', 'admin', 'active')
ON CONFLICT (email) DO UPDATE 
SET role = 'admin', 
    status = 'active',
    full_name = EXCLUDED.full_name;
