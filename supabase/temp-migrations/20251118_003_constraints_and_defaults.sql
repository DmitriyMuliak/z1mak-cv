-- 20251118_003_constraints_and_defaults.sql
-- ensure attempts non-negative, next_try_at default
alter table public.jobs
  alter column attempts set default 0,
  alter column next_try_at set default now();

-- optional: ensure status values (simple check constraint)
alter table public.jobs
  add constraint jobs_status_check check (status in ('pending','processing','done','error'));
