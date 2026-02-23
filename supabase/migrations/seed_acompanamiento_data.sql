-- SEED DATA: Acompañamiento 360 (Simulation)

-- 1. Ensure we have some teachers (Profiles)
-- NOTE: Uses existing IDs from auth.users if available, or creates placeholders.
-- Ideally, run this after 'seed_users.sql' or ensure 'profiles' has data.

DO $$
DECLARE
    teacher1_id UUID;
    teacher2_id UUID;
    teacher3_id UUID;
    observer_id UUID; -- Admin
BEGIN
    -- Try to get existing profiles, or fallback to inserting dummies if testing locally with no auth
    SELECT id INTO observer_id FROM profiles WHERE full_name LIKE '%Rene%' LIMIT 1;
    IF observer_id IS NULL THEN
        -- Fallback: Use the first admin or created user
        SELECT id INTO observer_id FROM profiles LIMIT 1;
    END IF;

    -- Get 3 random teachers to assign cycles to
    SELECT id INTO teacher1_id FROM profiles WHERE id != observer_id ORDER BY random() LIMIT 1;
    SELECT id INTO teacher2_id FROM profiles WHERE id != observer_id AND id != teacher1_id ORDER BY random() LIMIT 1;
    SELECT id INTO teacher3_id FROM profiles WHERE id != observer_id AND id != teacher1_id AND id != teacher2_id ORDER BY random() LIMIT 1;

    -- Loop to create random cycles
    -- 1. Completed Cycles (Past)
    INSERT INTO public.observation_cycles (teacher_id, observer_id, status, created_at, updated_at)
    VALUES 
        (teacher1_id, observer_id, 'completed', now() - interval '5 days', now() - interval '5 days'),
        (teacher2_id, observer_id, 'completed', now() - interval '10 days', now() - interval '10 days'),
        (teacher3_id, observer_id, 'completed', now() - interval '2 days', now() - interval '2 days'),
        (teacher1_id, observer_id, 'completed', now() - interval '20 days', now() - interval '20 days');

    -- 2. In Progress / Planned (Active)
    INSERT INTO public.observation_cycles (teacher_id, observer_id, status, created_at, updated_at)
    VALUES 
        (teacher1_id, observer_id, 'in_progress', now() - interval '2 hours', now() - interval '1 hour'),
        (teacher2_id, observer_id, 'planned', now() + interval '1 days', now()),
        (teacher3_id, observer_id, 'planned', now() + interval '3 days', now());

    -- 3. Commitments (Trajectory)
    -- Insert commitments for the completed cycles
    INSERT INTO public.commitments (cycle_id, teacher_id, description, status, created_at)
    SELECT id, teacher_id, 'Mejorar el cierre de la clase usando Ticket de Salida.', 'achieved', created_at
    FROM public.observation_cycles 
    WHERE status = 'completed' AND teacher_id = teacher1_id LIMIT 1;

    INSERT INTO public.commitments (cycle_id, teacher_id, description, status, created_at)
    SELECT id, teacher_id, 'Implementar rutinas de normalización al inicio.', 'pending', created_at
    FROM public.observation_cycles 
    WHERE status = 'completed' AND teacher_id = teacher2_id LIMIT 1;

END $$;
