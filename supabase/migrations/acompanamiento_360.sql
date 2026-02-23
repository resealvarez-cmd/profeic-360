-- MIGRATION: Acompañamiento 360
-- Tables for Observation Cycles and Data

-- 1. Tabla de Ciclos de Observación
create table public.observation_cycles (
  id uuid not null default gen_random_uuid (),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  observer_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'planned'::text check (status in ('planned', 'in_progress', 'completed')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  
  constraint observation_cycles_pkey primary key (id)
);

-- 2. Tabla de Datos del Ciclo (Stages)
create table public.observation_data (
  id uuid not null default gen_random_uuid (),
  cycle_id uuid not null references public.observation_cycles (id) on delete cascade,
  stage text not null check (stage in ('pre', 'execution', 'reflection')),
  content jsonb not null default '{}'::jsonb, -- Almacena inputs, checkboxes, URLs de fotos, etc.
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  
  constraint observation_data_pkey primary key (id),
  constraint observation_data_cycle_stage_unique unique (cycle_id, stage) -- Solo un registro por etapa por ciclo
);

-- 3. Habilitar RLS
alter table public.observation_cycles enable row level security;
alter table public.observation_data enable row level security;

-- 4. Políticas de Seguridad (Simples por ahora: Authenticated users can read/write)
-- En producción, esto debería restringirse a Admin/Observer o al Teacher propio.

create policy "Usuarios autenticados pueden ver ciclos"
  on public.observation_cycles for select
  to authenticated
  using (true);

create policy "Usuarios autenticados pueden crear/editar ciclos"
  on public.observation_cycles for all
  to authenticated
  using (true);

create policy "Usuarios autenticados pueden ver datos"
  on public.observation_data for select
  to authenticated
  using (true);

create policy "Usuarios autenticados pueden crear/editar datos"
  on public.observation_data for all
  to authenticated
  using (true);

-- 5. Trigger para updated_at (Opcional pero recomendado)
-- (Asumiendo que existe una función moddatetime, si no, crearla o omitir)
