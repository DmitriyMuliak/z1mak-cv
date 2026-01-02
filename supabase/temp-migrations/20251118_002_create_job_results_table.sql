-- 20251118_002_create_job_results_table.sql
create table if not exists public.job_results (
  id uuid primary key default gen_random_uuid(),
  job_id text not null references public.jobs(id) on delete cascade,
  result jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_job_results_job_id on public.job_results (job_id);
