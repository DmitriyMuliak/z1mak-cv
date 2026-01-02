-- 20251118_001_create_jobs_table.sql
create table if not exists public.jobs (
  id text primary key,
  status text not null default 'pending', -- pending | processing | done | error
  modes jsonb not null,
  cv_text text not null,
  vacancy_text text,
  added_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  error_message text,
  attempts int not null default 0,
  next_try_at timestamptz not null default now()
);

create index if not exists idx_jobs_status on public.jobs (status);
create index if not exists idx_jobs_added_at on public.jobs (added_at);
create index if not exists idx_jobs_next_try_at on public.jobs (next_try_at);
