-- Create a table to store AI-generated Executive Reports
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  type text not null check (type in ('executive', 'trajectory', 'flash')), -- Type of report
  content jsonb not null, -- The full JSON output from Gemini
  metrics jsonb, -- Quantitative data associated with the report (e.g. averages)
  author_id uuid references auth.users(id), -- Who generated it (usually Admin)
  target_id uuid references auth.users(id) -- Target user (for trajectory/flash) or null for global
);

-- Enable RLS
alter table public.reports enable row level security;

-- Policy: Admins/Directors/UTP can view all reports
create policy "Admins can view all reports"
  on public.reports for select
  using (
    exists (
      select 1 from public.authorized_users
      where email = auth.email()
      and role in ('admin', 'director', 'utp')
    )
  );

-- Policy: Teachers can view reports targeting them (e.g. Trajectory)
create policy "Teachers can view their own reports"
  on public.reports for select
  using (
    target_id = auth.uid()
  );

-- Policy: Admins can insert reports
create policy "Admins can insert reports"
  on public.reports for insert
  with check (
    exists (
      select 1 from public.authorized_users
      where email = auth.email()
      and role in ('admin', 'director', 'utp')
    )
  );
