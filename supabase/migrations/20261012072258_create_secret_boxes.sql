-- ROLLBACK STRATEGY
-- Supabase migrations are forward-only: never edit or delete this file once applied
-- anywhere. To undo it, add a NEW migration (forward-fix) containing the down SQL
-- below; prefer a corrective forward migration over a full drop when only part of the
-- change is wrong. Undo this before create_kudos_board (its policy calls get_my_sunner).
--
-- Down SQL (for a new migration, not run automatically), in dependency order:
--   drop policy if exists secret_boxes_select_own on public.secret_boxes;
--   drop policy if exists secret_boxes_select_opened_public on public.secret_boxes;
--   drop table if exists public.secret_boxes;
--   -- WARNING: dropping secret_boxes deletes every box and its opened_at; export it first.
--   -- Locally re-seed from supabase/seeds/common/06-secret-boxes.sql.
--
-- F009 Kudos Personal Sidebar: Secret Boxes (one owner Sunner, one gift, opened_at NULL =
-- unopened). Opened boxes are public read (the "10 SUNNER NHẬN QUÀ MỚI NHẤT" gift list);
-- unopened boxes are readable only by their owner, resolved through get_my_sunner() because
-- sunners.user_id is not granted to clients. No client writes (opening a box is out of scope).
-- Local rows: supabase/seeds/common/06-secret-boxes.sql.

create table public.secret_boxes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.sunners (id) on delete cascade,
  gift_name text not null check (btrim(gift_name) <> ''),
  opened_at timestamptz,  -- NULL = unopened
  created_at timestamptz not null default now()
);

create index secret_boxes_owner_id_idx on public.secret_boxes (owner_id);
-- Gift list: newest opened first, id as tie-breaker (BR-003).
create index secret_boxes_opened_recent_idx on public.secret_boxes (opened_at desc, id desc)
  where opened_at is not null;

comment on table public.secret_boxes is 'Secret Boxes (F009). Opened boxes public read; unopened boxes owner-only (via get_my_sunner); writes only via service_role.';
comment on column public.secret_boxes.opened_at is 'When the box was opened; NULL = unopened (owner-only read).';

alter table public.secret_boxes enable row level security;

create policy secret_boxes_select_opened_public on public.secret_boxes
  for select to anon, authenticated
  using (opened_at is not null);

create policy secret_boxes_select_own on public.secret_boxes
  for select to authenticated
  using (owner_id = (select me.id from public.get_my_sunner() as me));

-- Explicit privileges, revoke first (see create_kudos_board). No client write grant.
revoke all on table public.secret_boxes from public, anon, authenticated;
grant select on table public.secret_boxes to anon, authenticated;
grant select, insert, update, delete on table public.secret_boxes to service_role;
