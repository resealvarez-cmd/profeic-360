-- Backfill script para crear perfiles a usuarios antiguos que no tienen uno.

INSERT INTO public.profiles (id, full_name, avatar_url)
SELECT 
    au.id, 
    au.raw_user_meta_data->>'full_name', 
    au.raw_user_meta_data->>'avatar_url'
FROM auth.users au
LEFT JOIN public.profiles pp ON pp.id = au.id
WHERE pp.id IS NULL;
