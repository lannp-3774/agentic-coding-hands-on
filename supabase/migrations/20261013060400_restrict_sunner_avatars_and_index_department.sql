-- ROLLBACK STRATEGY
-- Supabase migrations are forward-only: never edit or delete this file once applied
-- anywhere. To undo it, add a NEW migration (forward-fix) containing the down SQL
-- below; prefer a corrective forward migration over a full revert when only part of the
-- change is wrong. No other migration depends on this one.
--
-- Down SQL (for a new migration, not run automatically):
--   drop index if exists public.sunners_department_code_idx;
--   comment on column public.sunners.avatar_url is null;
--   alter table public.sunners drop constraint sunners_avatar_url_check,
--     add constraint sunners_avatar_url_check check (char_length(avatar_url) <= 2048
--       and avatar_url ~ '^(https://[^[:space:]]+|/[^/\\[:space:]][^\\[:space:]]*)$');
--   create or replace function public.link_or_create_sunner_for_user(p_user_id uuid, p_email text, p_meta jsonb)
--   returns void
--   language plpgsql
--   security definer
--   set search_path = ''
--   as $$
--   declare
--     v_email text := nullif(lower(btrim(p_email)), '');
--     v_avatar text := nullif(btrim(coalesce(p_meta ->> 'avatar_url', p_meta ->> 'picture')), '');
--     v_name text;
--   begin
--     if exists (select 1 from public.sunners s where s.user_id = p_user_id) then
--       return;
--     end if;
--     if v_avatar !~ '^https://[^[:space:]]+$' or char_length(v_avatar) > 2048 then
--       v_avatar := null;
--     end if;
--     update public.sunners s
--        set user_id = p_user_id, avatar_url = coalesce(s.avatar_url, v_avatar)
--      where v_email is not null and s.user_id is null and lower(s.email) = v_email;
--     if found then
--       return;
--     end if;
--     v_name := left(coalesce(nullif(btrim(p_meta ->> 'full_name'), ''), nullif(btrim(p_meta ->> 'name'), ''),
--       nullif(split_part(v_email, '@', 1), ''), 'Sunner'), 200);
--     insert into public.sunners (user_id, full_name, email, avatar_url)
--     values (p_user_id, v_name,
--       case when not exists (select 1 from public.sunners s where lower(s.email) = v_email) then v_email end,
--       v_avatar);
--   end;
--   $$;
--   revoke execute on function public.link_or_create_sunner_for_user(uuid, text, jsonb)
--     from public, anon, authenticated;
--   -- WARNING: the non-local avatar_url values nulled below are NOT restored by the down SQL
--   -- (one-way data change). Before applying on a hosted project, export them if they matter:
--   --   select id, avatar_url from public.sunners
--   --   where avatar_url !~ '^/[^/\\[:space:]][^\\[:space:]]*$';
--
-- Stage 5 review fixes for F006/F009 (plan 261012-0856-sun-kudos-live-board):
-- - M1 (clarifications 2026-10-13: avatars LOCAL ONLY): sunners.avatar_url may only hold a
--   path under /public, so no viewer's browser is ever pointed at a remote host. Existing
--   remote values are cleared (the UI shows the initial), the CHECK drops its https branch,
--   and link_or_create_sunner_for_user no longer copies any avatar from user_metadata
--   (user-writable). Everything else in that function is unchanged.
-- - M3: index for the All Kudos department filter (receiver!inner embed on department_code).

-- Clear first: the stricter CHECK below validates every existing row.
update public.sunners
   set avatar_url = null
 where avatar_url is not null
   and avatar_url !~ '^/[^/\\[:space:]][^\\[:space:]]*$';

-- Local path under /public only: one leading "/", no "//", no backslash, no whitespace.
alter table public.sunners drop constraint sunners_avatar_url_check,
  add constraint sunners_avatar_url_check check (char_length(avatar_url) <= 2048
    and avatar_url ~ '^/[^/\\[:space:]][^\\[:space:]]*$');

comment on column public.sunners.avatar_url is
  'Local path under /public only (no //, no backslash, no whitespace); NULL shows the initial. Never copied from user metadata.';

create index sunners_department_code_idx on public.sunners (department_code);

-- A11 / BR-011: link the account to the unlinked Sunner with the same email, else create a
-- new Sunner. Never overwrites a linked Sunner. Only the name is taken from user metadata;
-- the avatar is never copied (it stays as seeded, or NULL). Callers must only pass
-- confirmed accounts.
create or replace function public.link_or_create_sunner_for_user(p_user_id uuid, p_email text, p_meta jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := nullif(lower(btrim(p_email)), '');
  v_name text;
begin
  if exists (select 1 from public.sunners s where s.user_id = p_user_id) then
    return;
  end if;

  update public.sunners s
     set user_id = p_user_id
   where v_email is not null and s.user_id is null and lower(s.email) = v_email;
  if found then
    return;
  end if;

  v_name := left(coalesce(nullif(btrim(p_meta ->> 'full_name'), ''), nullif(btrim(p_meta ->> 'name'), ''),
    nullif(split_part(v_email, '@', 1), ''), 'Sunner'), 200);
  -- The email stays unique: if another (linked) Sunner already holds it, the new one gets none.
  insert into public.sunners (user_id, full_name, email)
  values (p_user_id, v_name,
    case when not exists (select 1 from public.sunners s where lower(s.email) = v_email) then v_email end);
end;
$$;

-- `create or replace` keeps the ACL; re-asserted so this file stands on its own.
revoke execute on function public.link_or_create_sunner_for_user(uuid, text, jsonb)
  from public, anon, authenticated;
