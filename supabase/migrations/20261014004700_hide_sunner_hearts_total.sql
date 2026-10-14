-- ROLLBACK STRATEGY
-- Supabase migrations are forward-only: never edit or delete this file once applied
-- anywhere. To undo it, add a NEW migration (forward-fix) containing the down SQL
-- below; prefer a corrective forward migration over a full revert. Nothing depends on
-- this migration.
--
-- Down SQL (for a new migration, not run automatically):
--   grant select (hearts_total) on table public.sunners to anon, authenticated;
--   comment on table public.sunners is 'Kudos people (F006). Public read by column grant WITHOUT email/user_id; own row via get_my_sunner(); counters only change through triggers; writes only via service_role.';
--   comment on column public.sunners.hearts_total is 'Hearts earned as a kudos sender; maintained by the F007 kudos_likes triggers.';
--   -- WARNING: the down SQL re-opens review finding C2: anyone who diffs hearts_total around
--   -- a like of an anonymous kudos learns its sender.
--
-- F010 review round 2, C2 (plan 261013-1628-write-kudos-modal, clarifications 2026-10-14
-- "review round 2"): the F007 triggers credit the like weight to the SENDER's hearts_total,
-- anonymous kudos included. While hearts_total was client-readable, reading every Sunner's
-- total, liking an anonymous kudos and reading again named its sender. Decision: hearts stay
-- credited exactly as before (kudos.like_count stays public and keeps moving), but
-- hearts_total is no longer readable by anon/authenticated. The owner still gets their own
-- total from get_my_sunner() (SECURITY DEFINER, own row only) for the F009 sidebar.

-- Revoking the table-level privilege also drops every column-level SELECT, so the grant below
-- is the complete column list clients may read (not select=*, filter, order or embed beyond it).
revoke select on table public.sunners from public, anon, authenticated;
grant select (id, full_name, department_code, avatar_url, kudos_received_count, created_at)
  on table public.sunners to anon, authenticated;

comment on table public.sunners is
  'Kudos people (F006). Public read by column grant WITHOUT email/user_id/hearts_total; own row via get_my_sunner(); counters only change through triggers; writes only via service_role.';
comment on column public.sunners.hearts_total is
  'Hearts earned as a kudos sender (anonymous kudos included); maintained by the F007 kudos_likes triggers. NOT client-readable (it would unmask anonymous senders): the owner reads it via get_my_sunner().';
