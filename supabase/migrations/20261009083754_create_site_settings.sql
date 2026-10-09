-- ROLLBACK STRATEGY
-- Supabase migrations are forward-only: never edit or delete this file once applied
-- anywhere. To undo it, add a NEW migration (forward-fix) containing the down SQL
-- below; prefer a corrective forward migration over a full drop when only part of the
-- change is wrong.
--
-- Down SQL (for a new migration, not run automatically):
--   drop policy if exists site_settings_select_public on public.site_settings;
--   drop table if exists public.site_settings;
--   -- Dropping site_settings turns the prelaunch gate OFF (the gate fails open when the
--   -- row cannot be read), so the whole site opens. Note the current prelaunch_ends_at
--   -- first if it has to be restored; locally re-seed from
--   -- supabase/seeds/common/03-site-settings.sql.
--
-- F005 Countdown Prelaunch: site-wide settings in one typed row. Today it holds only the
-- prelaunch moment that gates the whole site behind /countdown.
-- Public read for anon/authenticated (the proxy and the /countdown page read it with the
-- publishable key); writes only via service_role (operator SQL, Studio, E2E helper).
-- The migration inserts the single row with prelaunch_ends_at = NULL, so a deploy without
-- seeds ships with the gate OFF and operators only ever `update` one value.

create table public.site_settings (
  singleton boolean primary key default true
    check (singleton),                  -- only `true` is allowed, so at most one row exists
  prelaunch_ends_at timestamptz,        -- NULL = gate off; timestamptz rejects non-times (22007)
  updated_at timestamptz not null default now()
);

comment on table public.site_settings is 'Site-wide settings, single row (F005). Every column is publicly readable: never store sensitive settings here. Read for anon/authenticated; writes only via service_role. prelaunch_ends_at NULL = prelaunch gate off.';

alter table public.site_settings enable row level security;

create policy site_settings_select_public on public.site_settings
  for select to anon, authenticated
  using (true);

-- Explicit privileges. The CLI does not auto-grant Data API access on new tables (a
-- missing grant would make readers get 42501 and the gate silently fail open), and
-- revoking first keeps the result independent of the project's default ACLs (older
-- projects grant ALL, incl. TRUNCATE which RLS does not cover).
revoke all on table public.site_settings from public, anon, authenticated;
grant select on table public.site_settings to anon, authenticated;
grant select, insert, update, delete on table public.site_settings to service_role;

-- The only row. NULL keeps the site open until an operator sets a moment.
insert into public.site_settings (singleton, prelaunch_ends_at) values (true, null);
