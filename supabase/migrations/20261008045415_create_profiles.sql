-- ROLLBACK STRATEGY
-- Supabase migrations are forward-only: never edit or delete this file once applied
-- anywhere. To undo it, add a NEW migration (forward-fix) containing the down SQL
-- below; prefer a corrective forward migration over a full drop when only part of the
-- change is wrong.
--
-- Down SQL (for a new migration, not run automatically), in dependency order:
--   drop trigger if exists on_auth_user_created on auth.users;
--   drop function if exists public.handle_new_user();
--   drop policy if exists profiles_select_own on public.profiles;
--   drop table if exists public.profiles;
--   -- WARNING: dropping profiles permanently loses every role assignment (admins
--   -- become plain users once the table is recreated). Export public.profiles first.
--
-- F003 Account menu & admin role: one profile row per auth user, holding the role.
-- Users can only read their own row; role changes go through service_role / operator SQL.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Per-user role (F003). Select-own for authenticated; writes only via service_role.';

alter table public.profiles enable row level security;

create policy profiles_select_own on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

-- Explicit privileges. Revoke first so the result does not depend on the project's
-- default ACLs. No insert/update/delete grant or policy for users: role is not user-writable.
revoke all on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;
grant select, insert, update, delete on table public.profiles to service_role;

-- Create the profile when an auth user is created. Kept trivial on purpose: an error here
-- would block every sign-up. Role always takes the column default, never user metadata.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger functions are never meant to be called through the Data API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- One-shot backfill for accounts created before this migration.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
