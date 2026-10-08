-- ROLLBACK STRATEGY
-- Supabase migrations are forward-only: never edit or delete this file once applied
-- anywhere. To undo it, add a NEW migration (forward-fix) containing the down SQL
-- below; prefer a corrective forward migration over a full drop when only part of the
-- change is wrong.
--
-- Down SQL (for a new migration, not run automatically):
--   drop policy if exists awards_select_public on public.awards;
--   drop table if exists public.awards;
--   -- Dropping awards deletes all award rows; re-seed from supabase/seeds/common/01-awards.sql.
--
-- F002 Homepage SAA: award categories shown on the homepage grid.
-- Public read-only data. Rows are seeded locally from supabase/seeds/common/01-awards.sql.

create table public.awards (
  slug text primary key,                -- also the anchor of /awards-information#<slug>
  title_vi text not null,
  title_en text not null,
  description_vi text not null,         -- VN only: EN mode shows VN body text
  image_path text not null,             -- path under /public, e.g. /home/awards/<slug>.png
  sort_order smallint not null          -- not unique: reordering via upsert must not collide
);

comment on table public.awards is 'Award categories for the SAA homepage (F002). Read-only for anon/authenticated.';

alter table public.awards enable row level security;

create policy awards_select_public on public.awards
  for select to anon, authenticated
  using (true);

-- Explicit privileges. Revoke first so the result does not depend on the project's
-- default ACLs (older projects grant ALL, incl. TRUNCATE which RLS does not cover).
revoke all on table public.awards from public, anon, authenticated;
grant select on table public.awards to anon, authenticated;
grant select, insert, update, delete on table public.awards to service_role;
