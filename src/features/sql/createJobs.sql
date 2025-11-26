-- 1. Таблиця jobs (черга)
create table public.jobs (
  id text primary key,
  status text not null default 'pending', -- pending | processing | done | error
  modes jsonb not null, -- { evaluationMode, depth, domain, ... }
  cv_text text not null,
  vacancy_text text default null,
  added_at timestamptz default now(),
  started_at timestamptz default null,
  finished_at timestamptz default null,
  error_message text default null
);

create index on public.jobs (status);
create index on public.jobs ((modes->>'evaluationMode'));
create index on public.jobs (added_at);

-- 2. Таблиця job_results (зберігаємо результати)
create table public.job_results (
  id uuid primary key default gen_random_uuid(),
  job_id text references public.jobs(id) on delete cascade,
  result jsonb,
  created_at timestamptz default now()
);

create index on public.job_results (job_id);
