-- ROLLBACK STRATEGY
-- Supabase migrations are forward-only: never edit or delete this file once applied
-- anywhere. To undo it, add a NEW migration (forward-fix) containing the down SQL
-- below; prefer a corrective forward migration over a full revert. Nothing depends on
-- this migration. Turn `[auth] enable_anonymous_sign_ins` off first (supabase/config.toml,
-- or the hosted dashboard) so no new guest signs in meanwhile.
--
-- Down SQL (for a new migration, not run automatically), in dependency order:
--   delete from public.sunners where is_guest;  -- their kudos cascade
--   delete from auth.users where is_anonymous;  -- their likes and profiles cascade
--   drop trigger if exists on_auth_user_created_guest_sunner on auth.users;
--   drop function if exists public.create_guest_sunner();
--   -- create_kudos: CREATE OR REPLACE it with the body of 20261014004500 (verbatim).
--   revoke select on table public.sunners from public, anon, authenticated;
--   grant select (id, full_name, department_code, avatar_url, kudos_received_count, created_at)
--     on table public.sunners to anon, authenticated;
--   alter table public.sunners drop column is_guest;
--   -- WARNING: the two deletes destroy every guest's activity (their kudos and hearts). Without
--   -- them, guest Sunners would become ordinary Sunners (searchable, valid recipients).
--
-- Guests act as Anonymous (plan 261014-1505-guest-anonymous-access, clarifications 2026-10-14):
-- a visitor without a login gets a Supabase anonymous session on their first action
-- (signInAnonymously(): an auth.users row with is_anonymous = true, JWT role authenticated)
-- and acts through a guest Sunner.
-- - sunners.is_guest marks it. Guests are never searchable (the app filters on is_guest, hence
--   the column grant) and never a kudos recipient (create_kudos refuses them).
-- - create_guest_sunner(): AFTER INSERT on auth.users for anonymous users only, creates the
--   guest Sunner 'Ẩn danh' (no email, no avatar). The confirmed-email link triggers never fire
--   for them (no email), and handle_new_user gives them a profiles row with role 'user'; the
--   app never treats an anonymous session as admin, whatever profiles.role says.
-- - create_kudos(): a guest's kudos is always anonymous (the alias stays optional). Every other
--   rule is exactly as in 20261014004500. CREATE OR REPLACE keeps its owner and grants.
-- - Hearts need no change: kudos_likes_before_insert only requires the liker's Sunner.

alter table public.sunners add column is_guest boolean not null default false;

comment on column public.sunners.is_guest is
  'Guest Sunner of an anonymous auth user (create_guest_sunner): never searchable, never a kudos recipient; its kudos are always anonymous.';

-- Revoking the table-level privilege also drops every column-level SELECT, so the grant below
-- is the complete column list clients may read: the 20261014004700 list plus is_guest
-- (hearts_total, email and user_id stay out).
revoke select on table public.sunners from public, anon, authenticated;
grant select (id, full_name, department_code, avatar_url, kudos_received_count, created_at, is_guest)
  on table public.sunners to anon, authenticated;

-- Creates the guest Sunner of a new anonymous auth user. Any error is downgraded to a warning
-- (as in link_or_create_sunner): an anonymous sign-in never fails here. A guest left without
-- a Sunner can still read the board; its writes are refused (P0002 / check_violation).
create function public.create_guest_sunner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.sunners (user_id, full_name, email, avatar_url, is_guest)
  values (new.id, 'Ẩn danh', null, null, true);
  return new;
exception when others then
  raise warning 'create_guest_sunner: anonymous account % left without a Sunner (% %)', new.id, sqlstate, sqlerrm;
  return new;
end;
$$;

-- Trigger functions are never meant to be called through the Data API.
revoke execute on function public.create_guest_sunner() from public, anon, authenticated;

-- Separate from on_auth_user_created (handle_new_user) and the link triggers; none depends on
-- another's order. GoTrue inserts an anonymous user with is_anonymous already true.
create trigger on_auth_user_created_guest_sunner
  after insert on auth.users
  for each row when (new.is_anonymous)
  execute function public.create_guest_sunner();

-- F010 create_kudos (20261014004500), with two guest rules: the caller's guest Sunner always
-- sends anonymously, and a guest Sunner is never a valid recipient ('recipient: required').
create or replace function public.create_kudos(
  p_receiver_id uuid,
  p_title text,
  p_body text,
  p_hashtag_slugs text[],
  p_image_paths text[],
  p_is_anonymous boolean,
  p_anonymous_name text
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  -- Leading/trailing whitespace exactly as JS String.prototype.trim() (the client validator):
  -- ASCII whitespace, NBSP, U+1680, U+2000-U+200A, U+2028/9, U+202F, U+205F, U+3000, BOM.
  c_trim constant text := '^[\t\n\v\f\r    -     　﻿]+'
    || '|[\t\n\v\f\r    -     　﻿]+$';
  v_sender uuid;
  v_sender_is_guest boolean;
  v_title text := regexp_replace(coalesce(p_title, ''), c_trim, '', 'g');
  v_body text := regexp_replace(coalesce(p_body, ''), c_trim, '', 'g');
  v_anonymous boolean := coalesce(p_is_anonymous, false);
  v_alias text;
  v_slugs text[];
  v_paths text[] := coalesce(p_image_paths, '{}'::text[]);
  v_path text;
  v_id uuid;
begin
  select s.id, s.is_guest into v_sender, v_sender_is_guest
  from public.sunners s where v_uid is not null and s.user_id = v_uid;
  if v_sender is null then
    raise exception 'sender: noSunner' using errcode = 'P0002',
      hint = 'The signed-in account is not linked to a Sunner.';
  end if;
  -- Guests act as Anonymous: a guest Sunner always sends anonymously (the alias stays optional).
  if v_sender_is_guest then
    v_anonymous := true;
  end if;

  -- A guest Sunner is never a recipient: refused as if it did not exist.
  if p_receiver_id is null
     or not exists (select 1 from public.sunners s where s.id = p_receiver_id and not s.is_guest) then
    raise exception 'recipient: required' using errcode = '22023';
  end if;
  if p_receiver_id = v_sender then
    raise exception 'recipient: selfRecipient' using errcode = '22023';
  end if;

  if v_title = '' then
    raise exception 'title: required' using errcode = '22023';
  end if;
  if char_length(v_title) > 50 then
    raise exception 'title: tooLong' using errcode = '22023';
  end if;

  if v_body = '' then
    raise exception 'body: required' using errcode = '22023';
  end if;
  if char_length(v_body) > 2000 then
    raise exception 'body: tooLong' using errcode = '22023';
  end if;

  -- Hashtags: duplicates are dropped silently; 1-5 distinct slugs, all from public.hashtags.
  select coalesce(array_agg(distinct t.slug), '{}'::text[]) into v_slugs
  from unnest(coalesce(p_hashtag_slugs, '{}'::text[])) as t (slug);
  if cardinality(v_slugs) = 0 then
    raise exception 'hashtags: required' using errcode = '22023';
  end if;
  if cardinality(v_slugs) > 5 then
    raise exception 'hashtags: maxHashtags' using errcode = '22023';
  end if;
  if (select count(*) from public.hashtags h where h.slug = any (v_slugs)) <> cardinality(v_slugs) then
    raise exception 'hashtags: required' using errcode = '22023';
  end if;

  -- Images: 0-5 distinct paths /api/kudos/images/<uuid>.<jpg|png>, each naming an object kudos/<uuid>.<ext>
  -- the caller uploaded (owner_id) that no kudos uses yet: index point lookups per path, never a scan
  -- (storage.objects indexes name COLLATE "C", so the comparison must use that collation).
  if cardinality(v_paths) > 5 then
    raise exception 'images: maxImages' using errcode = '22023';
  end if;
  foreach v_path in array v_paths loop
    if v_path is null or cardinality(array_positions(v_paths, v_path)) > 1
       or v_path !~ '^/api/kudos/images/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png)$'
       or not exists (select 1 from storage.objects o
         where o.bucket_id = 'images' and o.name collate "C" = 'kudos/' || substr(v_path, 19) and o.owner_id = v_uid::text)
       or exists (select 1 from public.kudos_images i
         where i.image_path like '/api/kudos/images/%' and i.image_path = v_path) then
      raise exception 'images: uploadFailed' using errcode = '22023';
    end if;
  end loop;

  -- The alias only counts for anonymous kudos; blank means "default alias" (NULL).
  if v_anonymous then
    v_alias := nullif(regexp_replace(coalesce(p_anonymous_name, ''), c_trim, '', 'g'), '');
    if char_length(v_alias) > 50 then
      raise exception 'anonymousName: tooLong' using errcode = '22023';
    end if;
  end if;

  insert into public.kudos (sender_id, receiver_id, title, body, is_anonymous, anonymous_name)
  values (v_sender, p_receiver_id, v_title, v_body, v_anonymous, v_alias)
  returning id into v_id;

  insert into public.kudos_hashtags (kudos_id, hashtag_slug)
  select v_id, s.slug from unnest(v_slugs) as s (slug);

  begin
    insert into public.kudos_images (kudos_id, sort_order, image_path)
    select v_id, p.ord::smallint, p.path from unnest(v_paths) with ordinality as p (path, ord);
  exception when unique_violation then
    -- A concurrent create_kudos attached the same upload first: this whole call fails.
    raise exception 'images: uploadFailed' using errcode = '22023';
  end;

  return v_id;
end;
$$;
