-- Add SaaS management columns to public.schools

DO $$ 
BEGIN 
    -- Add status column (active, suspended, past_due)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='status') THEN
        ALTER TABLE public.schools ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'past_due'));
    END IF;

    -- Add subscription_plan column (trial, pro, enterprise)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='subscription_plan') THEN
        ALTER TABLE public.schools ADD COLUMN subscription_plan TEXT DEFAULT 'trial' CHECK (subscription_plan IN ('trial', 'pro', 'enterprise'));
    END IF;

    -- Add max_users column (integer limit of teachers allowed)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='max_users') THEN
        ALTER TABLE public.schools ADD COLUMN max_users INTEGER DEFAULT 10;
    END IF;
END $$;

-- Update the default school ('cmp') to be an enterprise customer with more users
UPDATE public.schools 
SET subscription_plan = 'enterprise', 
    max_users = 100 
WHERE slug = 'cmp';
