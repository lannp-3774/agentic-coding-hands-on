-- F007 Kudos Hearts: special days whose likes give the kudos sender 2 hearts instead of 1
-- (local seed, runs on `supabase db reset` after 04-kudos-board.sql). Figma frame MaZUn5xHXZ has
-- no special-day content, so both rows are test-only values (not in Figma), taken from the E2E
-- seed contract e2e/support/kudos-board-seed.ts (SPECIAL_DAYS). Dates are in 2025 on purpose:
-- "today" is never special unless a serial spec adds (and then removes) today's row.
-- Idempotent: upsert by day.
insert into public.special_days (day, weight) values
  ('2025-11-20', 2),
  ('2025-12-25', 2)
on conflict (day) do update set weight = excluded.weight;
