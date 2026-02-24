-- Update the check constraint for subscription_plan to allow 'basic' (and 'individual' if ever used for schools, though we use individual on profiles)
ALTER TABLE public.schools DROP CONSTRAINT IF EXISTS schools_subscription_plan_check;
ALTER TABLE public.schools ADD CONSTRAINT schools_subscription_plan_check CHECK (subscription_plan IN ('trial', 'basic', 'pro', 'enterprise'));

-- Add individual plan status directly to profiles (for the $12k plan where teachers have no school, or they belong to a basic school but paid for pro, though we'll stick to simple logic: boolean flag)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='individual_plan_active') THEN
        ALTER TABLE public.profiles ADD COLUMN individual_plan_active BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create Demo School
INSERT INTO public.schools (id, name, slug, subscription_plan, max_users, status)
VALUES (
    'd1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a', -- fixed so it is consistent
    'Colegio Valórico San Juan de la Innovación (Demo)',
    'demo-school',
    'pro', -- Has everything for the demo
    50,
    'active'
) ON CONFLICT (slug) DO UPDATE 
SET name = 'Colegio Valórico San Juan de la Innovación (Demo)', subscription_plan = 'pro', status = 'active';

-- Optional: Create some fake profiles for the demo school so sales demos look populated
-- Ensure we can insert basic profiles without full auth users just for listing purposes if needed, 
-- but better to let the user create auth users if they want to log in as them.
