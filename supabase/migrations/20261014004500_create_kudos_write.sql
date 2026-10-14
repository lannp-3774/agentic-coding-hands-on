-- ROLLBACK STRATEGY
-- Supabase migrations are forward-only: never edit or delete this file once applied
-- anywhere. To undo it, add a NEW migration (forward-fix) containing the down SQL
-- below; prefer a corrective forward migration over a full revert. Roll back
-- 20261014004600_create_kudos_images_storage first (its policies read kudos_images).
--
-- Down SQL (for a new migration, not run automatically), in dependency order:
--   drop index if exists public.kudos_images_uploaded_path_key;
--   drop function if exists public.get_my_sent_kudos_count();
--   drop function if exists public.create_kudos(uuid, text, text, text[], text[], boolean, text);
--   revoke select on table public.kudos from anon, authenticated;
--   grant select on table public.kudos to anon, authenticated;
--   drop index if exists public.kudos_public_sender_id_idx;
--   alter table public.kudos drop column public_sender_id, drop column anonymous_name,
--     drop column is_anonymous;
--   -- WARNING: the down SQL makes every anonymous kudos show its real sender again
--   -- (sender_id becomes client-readable): delete or export anonymous kudos first.
--
-- F010 Kudos Write ("Viết Kudo" modal, plan 261013-1628-write-kudos-modal):
-- - Anonymous kudos: is_anonymous + optional alias. sender_id stays the real sender for the
--   heart triggers and the caller's own counts, but is no longer client-readable (column
--   grants). Clients read the sender through public_sender_id: a stored generated copy of
--   sender_id that is NULL for anonymous kudos, with its own FK so PostgREST can embed
--   `sender:sunners!public_sender_id(...)`.
-- - create_kudos(): the only client write path. SECURITY DEFINER, the caller's Sunner is the
--   sender (never a parameter), every rule re-checked here, all rows inserted atomically.
--   Bad input -> SQLSTATE 22023 with message '<WriteKudosField>: <WriteKudosErrorCode>';
--   a caller without a Sunner -> SQLSTATE P0002 (no_data_found), message 'sender: noSunner'.
-- - Images: kudos_images.image_path = /api/kudos/images/<uuid>.<jpg|png>, the app route of
--   Storage object kudos/<uuid>.<ext> (bucket `images`, 20261014004600). The path never
--   names the uploader (anonymous kudos stay unlinkable); ownership is the object's owner_id.
-- - get_my_sent_kudos_count(): replaces the client `sender_id` filter of the F009 sidebar.

alter table public.kudos
  add column is_anonymous boolean not null default false,
  add column anonymous_name text,
  add column public_sender_id uuid
    generated always as (case when is_anonymous then null else sender_id end) stored
    references public.sunners (id) on delete cascade,
  -- The alias exists only on anonymous kudos; NULL means "show the default alias".
  add constraint kudos_anonymous_name_check check (anonymous_name is null
    or (is_anonymous and btrim(anonymous_name) <> '' and char_length(anonymous_name) <= 50));

-- FK column (cascade deletes from sunners); the embed itself joins on sunners' PK.
create index kudos_public_sender_id_idx on public.kudos (public_sender_id);

-- An uploaded image belongs to one kudos at most (seed gallery paths may repeat). Also the
-- index behind the "is this object attached?" lookups of create_kudos and the Storage policies.
create unique index kudos_images_uploaded_path_key on public.kudos_images (image_path)
  where image_path like '/api/kudos/images/%';

comment on column public.kudos.sender_id is
  'Real sender, anonymous kudos included. NOT client-readable (column grants): read public_sender_id.';
comment on column public.kudos.is_anonymous is 'F010: the card hides the sender (public_sender_id is NULL).';
comment on column public.kudos.anonymous_name is 'F010: optional alias of an anonymous kudos (<= 50 chars); NULL = default copy.';
comment on column public.kudos.public_sender_id is
  'F010: sender_id, or NULL when is_anonymous. The only client path to the sender (embed sunners!public_sender_id).';

-- Column grants replace the table-level select: sender_id is left out, so selecting,
-- filtering or embedding through it (or select=*) is refused with 42501. Still no client
-- insert/update/delete on kudos: create_kudos is the only write path.
revoke select on table public.kudos from anon, authenticated;
grant select (id, seq, receiver_id, title, body, like_count, created_at,
  is_anonymous, anonymous_name, public_sender_id) on table public.kudos to anon, authenticated;

-- F010 A1: creates one kudos as the caller's Sunner. Every rule is checked before any write,
-- and the three inserts share the function's transaction, so a failure writes nothing.
-- Errors: 22023 (invalid_parameter_value) '<field>: <code>', the codes of WriteKudosErrorCode.
create function public.create_kudos(
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
  v_title text := regexp_replace(coalesce(p_title, ''), c_trim, '', 'g');
  v_body text := regexp_replace(coalesce(p_body, ''), c_trim, '', 'g');
  v_anonymous boolean := coalesce(p_is_anonymous, false);
  v_alias text;
  v_slugs text[];
  v_paths text[] := coalesce(p_image_paths, '{}'::text[]);
  v_path text;
  v_id uuid;
begin
  select s.id into v_sender from public.sunners s where v_uid is not null and s.user_id = v_uid;
  if v_sender is null then
    raise exception 'sender: noSunner' using errcode = 'P0002',
      hint = 'The signed-in account is not linked to a Sunner.';
  end if;

  if p_receiver_id is null or not exists (select 1 from public.sunners s where s.id = p_receiver_id) then
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

-- The caller's own sent kudos, anonymous ones included (F009 A1 "sent"). 0 without a Sunner.
create function public.get_my_sent_kudos_count()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer
  from public.kudos k
  join public.sunners s on s.id = k.sender_id
  where s.user_id = (select auth.uid());
$$;

revoke execute on function public.create_kudos(uuid, text, text, text[], text[], boolean, text),
  public.get_my_sent_kudos_count() from public, anon, authenticated;
grant execute on function public.create_kudos(uuid, text, text, text[], text[], boolean, text),
  public.get_my_sent_kudos_count() to authenticated;
