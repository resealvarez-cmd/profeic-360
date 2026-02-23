-- Create a table for authorized users (Pre-approved list)
CREATE TABLE IF NOT EXISTS public.authorized_users (
  email TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'director', 'utp', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public authorized_users are viewable by authenticated users." ON public.authorized_users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert/update authorized_users." ON public.authorized_users
  FOR ALL USING (
    auth.jwt() ->> 'email' = 're.se.alvarez@gmail.com' -- Hardcoded Super Admin for now
  );

-- Helper function to sync profile role on signup
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
BEGIN
  -- Check if email is in authorized_users
  SELECT role INTO user_role FROM public.authorized_users WHERE email = new.email;
  
  IF user_role IS NOT NULL THEN
    -- Update the user metadata with the role
    UPDATE auth.users SET raw_user_meta_data = 
      jsonb_set(raw_user_meta_data, '{role}', to_jsonb(user_role))
    WHERE id = new.id;
    
    -- Update status in authorized_users
    UPDATE public.authorized_users SET status = 'active' WHERE email = new.email;
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run on profile creation (or user signup)
-- Note: 'profiles' creation is triggered by auth.users insert. We might want to hook into that too.
-- Let's stick to simple table creation for now.
