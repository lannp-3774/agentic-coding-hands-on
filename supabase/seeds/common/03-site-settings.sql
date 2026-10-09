-- F005 Countdown Prelaunch: local prelaunch moment (local seed, runs on `supabase db reset`).
-- A fixed moment in the PAST, so the local site is open after every reset. Gate E2E specs
-- set a future value themselves and restore this one; the literal must stay equal to
-- SEED_PAST_ISO in e2e/support/prelaunch-setting.ts. To see the lock locally, set a future
-- value on this row in Supabase Studio. Hosted environments have no seed: the migration's
-- NULL row (gate off) applies there.
insert into public.site_settings (singleton, prelaunch_ends_at) values
  (true, '2026-01-01T00:00:00+07:00')
on conflict (singleton) do update set
  prelaunch_ends_at = excluded.prelaunch_ends_at,
  updated_at = now();
