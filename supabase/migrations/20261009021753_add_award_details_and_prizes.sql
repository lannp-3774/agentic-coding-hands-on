-- ROLLBACK STRATEGY
-- Supabase migrations are forward-only: never edit or delete this file once applied
-- anywhere. To undo it, add a NEW migration (forward-fix) containing the down SQL
-- below; prefer a corrective forward migration over a full drop when only part of the
-- change is wrong.
--
-- Down SQL (for a new migration, not run automatically):
--   drop policy if exists award_prizes_select_public on public.award_prizes;
--   drop table if exists public.award_prizes;
--   alter table public.awards drop column if exists detail_description_vi;
--   alter table public.awards drop column if exists quantity;
--   alter table public.awards drop column if exists unit_vi;
--   alter table public.awards drop column if exists unit_en;
--   alter table public.awards drop column if exists nav_label;
--   -- Dropping these deletes all award detail and prize data; re-seed from
--   -- supabase/seeds/common/02-award-details.sql. Homepage columns are untouched.
--
-- F004 Awards Information (/awards-information): long award copy, quantity + unit and the
-- short left-nav label on public.awards, plus the prize tiers of each award in a new child
-- table (Signature 2025 - Creator has two tiers). Public read-only data.
-- Additive only: existing awards columns, policy and grants stay as they are; the homepage
-- selects explicit AWARD_COLUMNS, so it never sees the new columns. New columns are nullable
-- with no default: a row without details drops out of this page (DEC-001), the homepage is
-- unaffected. Rows are seeded locally from supabase/seeds/common/02-award-details.sql.

alter table public.awards
  add column detail_description_vi text,               -- VN only: EN mode shows VN body text (D012)
  add column quantity smallint check (quantity > 0),   -- number of awards, e.g. 10
  add column unit_vi text,                             -- e.g. Cá nhân / Tập thể
  add column unit_en text,                             -- e.g. Individual / Team
  add column nav_label text;                           -- short left-nav label, same in VN/EN (D011)

create table public.award_prizes (
  award_slug text not null
    references public.awards (slug) on delete cascade on update cascade,
  sort_order smallint not null,                        -- tier order within one award
  amount_vnd integer not null check (amount_vnd >= 0),
  note_vi text,                                        -- null = no note line under the amount (BR-006)
  note_en text,
  -- Leads with award_slug, so it also serves the foreign-key lookup: no extra index.
  primary key (award_slug, sort_order)
);

comment on table public.award_prizes is 'Prize tiers of each award for the Awards Information page (F004). Read-only for anon/authenticated.';

alter table public.award_prizes enable row level security;

create policy award_prizes_select_public on public.award_prizes
  for select to anon, authenticated
  using (true);

-- Explicit privileges. The CLI does not auto-grant Data API access on new tables, and
-- revoking first keeps the result independent of the project's default ACLs (older
-- projects grant ALL, incl. TRUNCATE which RLS does not cover).
revoke all on table public.award_prizes from public, anon, authenticated;
grant select on table public.award_prizes to anon, authenticated;
grant select, insert, update, delete on table public.award_prizes to service_role;
