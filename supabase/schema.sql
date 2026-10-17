-- =====================================================================
-- EdiSubmit database schema  (Supabase PostgreSQL)
-- FOR A NEW PROJECT: paste this whole file into Supabase -> SQL Editor -> New query -> Run.
-- Safe to run more than once (uses IF NOT EXISTS / CREATE OR REPLACE / DROP ... IF EXISTS).
-- It never drops a table or deletes rows.
-- =====================================================================

-- ---------- TASKS ----------
create table if not exists public.tasks (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title             text not null,
  description       text,
  subject           text not null,
  task_type         text not null default 'Assignment',
  priority          text not null default 'medium',
  status            text not null default 'todo',
  due_date          date not null,
  planned_date      date,
  estimated_minutes integer,
  completed_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- EXISTING DATABASE REPAIR: if "tasks" already existed with fewer columns, these add what is missing
-- without touching your data. (Fixes: "Could not find the 'task_type' column of 'tasks' in the schema cache")
alter table public.tasks add column if not exists description       text;
alter table public.tasks add column if not exists task_type         text not null default 'Assignment';
alter table public.tasks add column if not exists priority          text not null default 'medium';
alter table public.tasks add column if not exists status            text not null default 'todo';
alter table public.tasks add column if not exists planned_date      date;
alter table public.tasks add column if not exists estimated_minutes integer;
alter table public.tasks add column if not exists completed_at      timestamptz;
alter table public.tasks add column if not exists created_at        timestamptz not null default now();
alter table public.tasks add column if not exists updated_at        timestamptz not null default now();

-- Value and length constraints (re-created so re-running always ends in the same state).
alter table public.tasks drop constraint if exists tasks_title_len;
alter table public.tasks drop constraint if exists tasks_subject_len;
alter table public.tasks drop constraint if exists tasks_description_len;
alter table public.tasks drop constraint if exists tasks_type_check;
alter table public.tasks drop constraint if exists tasks_priority_check;
alter table public.tasks drop constraint if exists tasks_status_check;
alter table public.tasks drop constraint if exists tasks_minutes_check;

alter table public.tasks add constraint tasks_title_len       check (char_length(btrim(title)) between 1 and 120);
alter table public.tasks add constraint tasks_subject_len     check (char_length(btrim(subject)) between 1 and 80);
alter table public.tasks add constraint tasks_description_len check (description is null or char_length(description) <= 2000);
alter table public.tasks add constraint tasks_type_check      check (task_type in ('Assignment','Project','Quiz','Examination','Research','Presentation','Other'));
alter table public.tasks add constraint tasks_priority_check  check (priority in ('low','medium','high'));
alter table public.tasks add constraint tasks_status_check    check (status in ('todo','in_progress','completed'));
alter table public.tasks add constraint tasks_minutes_check   check (estimated_minutes is null or estimated_minutes between 5 and 1440);

create index if not exists tasks_user_due_idx    on public.tasks (user_id, due_date);
create index if not exists tasks_user_status_idx on public.tasks (user_id, status);

-- Trigger: keeps updated_at fresh, protects the owner and created_at, maintains completed_at.
create or replace function public.tasks_before_write()
returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' then
    if new.user_id is distinct from old.user_id then
      raise exception 'user_id cannot be changed';
    end if;
    new.created_at := old.created_at;      -- silently keep the original creation time
  end if;

  new.updated_at := now();

  if new.status = 'completed' then
    -- keep the first completion time; set it when a task becomes completed
    new.completed_at := coalesce(case when tg_op = 'UPDATE' then old.completed_at end, now());
  else
    new.completed_at := null;              -- re-opened tasks lose their completion time
  end if;
  return new;
end $$;

drop trigger if exists tasks_before_write_trg on public.tasks;
create trigger tasks_before_write_trg
  before insert or update on public.tasks
  for each row execute function public.tasks_before_write();

-- ---------- CONSENTS (privacy policy acknowledgements) ----------
-- One row per user per policy version. No passwords or secrets here, ever.
create table if not exists public.consents (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  policy_version text not null check (char_length(policy_version) between 1 and 40),
  agreed_at      timestamptz not null default now(),
  unique (user_id, policy_version)
);

-- The server decides the timestamp; a client cannot back-date or forge it.
create or replace function public.consents_set_time()
returns trigger language plpgsql as $$
begin
  new.agreed_at := now();
  return new;
end $$;

drop trigger if exists consents_set_time_trg on public.consents;
create trigger consents_set_time_trg
  before insert on public.consents
  for each row execute function public.consents_set_time();

-- Registration flow: the register form attaches the accepted policy version to the sign-up request
-- (stored with the new auth user). This trigger copies it into "consents" the moment the account row
-- is created - even when email confirmation means the user is not signed in yet. No public endpoint,
-- no secrets. If the metadata is missing, no row is written and the app asks the user after login.
create or replace function public.handle_new_user_consent()
returns trigger language plpgsql security definer set search_path = public as $$
declare v text;
begin
  v := new.raw_user_meta_data ->> 'accepted_policy_version';
  if v is not null and char_length(v) between 1 and 40 then
    insert into public.consents (user_id, policy_version) values (new.id, v)
    on conflict (user_id, policy_version) do nothing;
  end if;
  return new;
end $$;

revoke all on function public.handle_new_user_consent() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_consent on auth.users;
create trigger on_auth_user_created_consent
  after insert on auth.users
  for each row execute function public.handle_new_user_consent();

-- ---------- ROW LEVEL SECURITY ----------
alter table public.tasks    enable row level security;
alter table public.consents enable row level security;

-- Drop old policies first so re-running is safe.
drop policy if exists "tasks_select_own"    on public.tasks;
drop policy if exists "tasks_insert_own"    on public.tasks;
drop policy if exists "tasks_update_own"    on public.tasks;
drop policy if exists "tasks_delete_own"    on public.tasks;
drop policy if exists "consents_select_own" on public.consents;
drop policy if exists "consents_insert_own" on public.consents;

create policy "tasks_select_own" on public.tasks for select to authenticated
  using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks for insert to authenticated
  with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks for delete to authenticated
  using (auth.uid() = user_id);

-- Consents: read and add your own only. No UPDATE/DELETE policy = nobody can edit or erase them from the app.
create policy "consents_select_own" on public.consents for select to authenticated
  using (auth.uid() = user_id);
create policy "consents_insert_own" on public.consents for insert to authenticated
  with check (auth.uid() = user_id);

-- Table privileges (RLS still decides which rows). Anonymous visitors get nothing.
revoke all on public.tasks, public.consents from anon;
grant select, insert, update, delete on public.tasks    to authenticated;
grant select, insert                 on public.consents to authenticated;

-- Make the API notice new columns immediately.
notify pgrst, 'reload schema';

-- =====================================================================
-- VERIFY (run these separately after the script succeeds)
-- =====================================================================
-- select table_name from information_schema.tables where table_schema='public' and table_name in ('tasks','consents');
-- select tablename, rowsecurity from pg_tables where schemaname='public' and tablename in ('tasks','consents');   -- rowsecurity = true
-- select tablename, policyname, cmd from pg_policies where schemaname='public' order by tablename, cmd;           -- 4 for tasks, 2 for consents
-- select tgname from pg_trigger where tgname in ('tasks_before_write_trg','consents_set_time_trg','on_auth_user_created_consent');
