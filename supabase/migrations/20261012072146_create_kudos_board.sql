-- ROLLBACK STRATEGY
-- Supabase migrations are forward-only: never edit or delete this file once applied
-- anywhere. To undo it, add a NEW migration (forward-fix) containing the down SQL
-- below; prefer a corrective forward migration over a full drop when only part of the
-- change is wrong. Roll back create_secret_boxes and create_kudos_likes first (they
-- depend on get_my_sunner, kudos and sunners).
--
-- Down SQL (for a new migration, not run automatically), in dependency order:
--   drop trigger if exists on_auth_user_confirmed_link_sunner on auth.users;
--   drop trigger if exists on_auth_user_created_link_sunner on auth.users;
--   drop trigger if exists kudos_sync_received_count on public.kudos;
--   drop function if exists public.link_or_create_sunner();
--   drop function if exists public.link_or_create_sunner_for_user(uuid, text, jsonb);
--   drop function if exists public.sync_kudos_received_count();
--   drop function if exists public.get_my_sunner();
--   drop table if exists public.kudos_images;
--   drop table if exists public.kudos_hashtags;
--   drop table if exists public.hashtags;
--   drop table if exists public.kudos;
--   drop table if exists public.sunners;
--   drop table if exists public.departments;
--   -- WARNING: dropping these deletes every kudos and every Sunner<->account link. Export
--   -- public.sunners (user_id) and public.kudos first; locally re-seed from
--   -- supabase/seeds/common/04-kudos-board.sql. handle_new_user / profiles are untouched.
--
-- F006 Kudos Board Browse: departments, Sunners, kudos (+ hashtags, images) for /sun-kudos.
-- Board data is public read-only (anon, authenticated); writes only via service_role (seed,
-- operator SQL). sunners.email and sunners.user_id are never granted to clients: the viewer's
-- own row comes from get_my_sunner(). Both heart counters (kudos.like_count,
-- sunners.hearts_total) are created here; F007 adds the triggers that maintain them.
-- Local rows: supabase/seeds/common/04-kudos-board.sql (Figma frame MaZUn5xHXZ).

create table public.departments (
  code text primary key check (code ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$'), -- same rule as the URL filter
  name text not null check (btrim(name) <> '')
);

create table public.sunners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,  -- linked account, never client-readable
  full_name text not null check (char_length(btrim(full_name)) between 1 and 200),
  email text check (btrim(email) <> ''),                       -- link key only, never client-readable
  department_code text references public.departments (code) on delete set null on update cascade,
  -- Local path under /public (no //, no backslash) or an https:// URL; anything else is rejected.
  avatar_url text check (char_length(avatar_url) <= 2048
    and avatar_url ~ '^(https://[^[:space:]]+|/[^/\\[:space:]][^\\[:space:]]*)$'),
  kudos_received_count integer not null default 0 check (kudos_received_count >= 0),
  hearts_total integer not null default 0 check (hearts_total >= 0),
  created_at timestamptz not null default now()
);

-- BR-011: one account maps to at most one Sunner; also the lookup index for get_my_sunner().
create unique index sunners_user_id_key on public.sunners (user_id) where user_id is not null;
create unique index sunners_email_lower_key on public.sunners (lower(email)) where email is not null;

create table public.kudos (
  id uuid primary key default gen_random_uuid(),
  seq bigint generated always as identity unique,  -- insert order = page cursor (BR-005); its unique index also serves ORDER BY seq DESC
  sender_id uuid not null references public.sunners (id) on delete cascade on update cascade,
  receiver_id uuid not null references public.sunners (id) on delete cascade on update cascade,
  title text check (btrim(title) <> ''),           -- free-text title tag (D.4); NULL = none
  body text not null check (btrim(body) <> ''),
  like_count integer not null default 0 check (like_count >= 0),
  created_at timestamptz not null default now()
);

create index kudos_highlight_idx on public.kudos (like_count desc, seq desc);
create index kudos_receiver_seq_idx on public.kudos (receiver_id, seq desc);
create index kudos_sender_id_idx on public.kudos (sender_id);

create table public.hashtags (
  slug text primary key check (slug ~ '^[a-z0-9][a-z0-9-]{0,63}$'),
  label text not null check (btrim(label) <> ''),
  sort_order smallint not null
);

create table public.kudos_hashtags (
  kudos_id uuid not null references public.kudos (id) on delete cascade on update cascade,
  hashtag_slug text not null references public.hashtags (slug) on delete cascade on update cascade,
  primary key (kudos_id, hashtag_slug)
);

create index kudos_hashtags_slug_kudos_idx on public.kudos_hashtags (hashtag_slug, kudos_id);

create table public.kudos_images (
  kudos_id uuid not null references public.kudos (id) on delete cascade on update cascade,
  sort_order smallint not null check (sort_order >= 1),
  image_path text not null check (image_path ~ '^/[^/\\[:space:]][^\\[:space:]]*$'), -- path under /public
  primary key (kudos_id, sort_order)
);

comment on table public.departments is 'Departments for Sun* Kudos (F006). Public read; writes only via service_role.';
comment on table public.sunners is 'Kudos people (F006). Public read by column grant WITHOUT email/user_id; own row via get_my_sunner(); counters only change through triggers; writes only via service_role.';
comment on column public.sunners.user_id is 'auth.users link set by link_or_create_sunner (confirmed email match). Not granted to clients.';
comment on column public.sunners.email is 'Link key for link_or_create_sunner (unique by lower(email)). Not granted to clients.';
comment on column public.sunners.kudos_received_count is 'Maintained by sync_kudos_received_count (BR-012); drives the Hero tier.';
comment on column public.sunners.hearts_total is 'Hearts earned as a kudos sender; maintained by the F007 kudos_likes triggers.';
comment on table public.kudos is 'Kudos (F006). Public read; writes only via service_role. seq is the All Kudos cursor.';
comment on column public.kudos.like_count is 'Number of likes; maintained by the F007 kudos_likes triggers.';
comment on table public.hashtags is 'Fixed hashtag list of the Hashtag filter (F006). Public read.';
comment on table public.kudos_hashtags is 'Kudos <-> hashtag links (F006). Public read.';
comment on table public.kudos_images is 'Kudos gallery images, root paths under /public (F006). Public read.';

alter table public.departments enable row level security;
alter table public.sunners enable row level security;
alter table public.kudos enable row level security;
alter table public.hashtags enable row level security;
alter table public.kudos_hashtags enable row level security;
alter table public.kudos_images enable row level security;

create policy departments_select_public on public.departments for select to anon, authenticated using (true);
create policy sunners_select_public on public.sunners for select to anon, authenticated using (true);
create policy kudos_select_public on public.kudos for select to anon, authenticated using (true);
create policy hashtags_select_public on public.hashtags for select to anon, authenticated using (true);
create policy kudos_hashtags_select_public on public.kudos_hashtags for select to anon, authenticated using (true);
create policy kudos_images_select_public on public.kudos_images for select to anon, authenticated using (true);

-- Explicit privileges. Revoke first so the result does not depend on the project's default
-- ACLs (older projects grant ALL, incl. TRUNCATE which RLS does not cover). No client role
-- gets insert/update/delete on any board table, counters included.
revoke all on table public.departments, public.sunners, public.kudos, public.hashtags,
  public.kudos_hashtags, public.kudos_images from public, anon, authenticated;
revoke all on sequence public.kudos_seq_seq from public, anon, authenticated;
grant select on table public.departments, public.kudos, public.hashtags,
  public.kudos_hashtags, public.kudos_images to anon, authenticated;
-- Column grant: email and user_id are left out, so `select=*` on sunners is refused (42501).
grant select (id, full_name, department_code, avatar_url, kudos_received_count, hearts_total, created_at)
  on table public.sunners to anon, authenticated;
grant select, insert, update, delete on table public.departments, public.sunners, public.kudos,
  public.hashtags, public.kudos_hashtags, public.kudos_images to service_role;

-- A11 / BR-011: link the account to the unlinked Sunner with the same email, else create a
-- new Sunner. Never overwrites a linked Sunner. Name/avatar are copied once from user metadata
-- (avatar only when https://). Callers must only pass confirmed accounts.
create function public.link_or_create_sunner_for_user(p_user_id uuid, p_email text, p_meta jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := nullif(lower(btrim(p_email)), '');
  v_avatar text := nullif(btrim(coalesce(p_meta ->> 'avatar_url', p_meta ->> 'picture')), '');
  v_name text;
begin
  if exists (select 1 from public.sunners s where s.user_id = p_user_id) then
    return;
  end if;
  if v_avatar !~ '^https://[^[:space:]]+$' or char_length(v_avatar) > 2048 then
    v_avatar := null;
  end if;

  update public.sunners s
     set user_id = p_user_id, avatar_url = coalesce(s.avatar_url, v_avatar)
   where v_email is not null and s.user_id is null and lower(s.email) = v_email;
  if found then
    return;
  end if;

  v_name := left(coalesce(nullif(btrim(p_meta ->> 'full_name'), ''), nullif(btrim(p_meta ->> 'name'), ''),
    nullif(split_part(v_email, '@', 1), ''), 'Sunner'), 200);
  -- The email stays unique: if another (linked) Sunner already holds it, the new one gets none.
  insert into public.sunners (user_id, full_name, email, avatar_url)
  values (p_user_id, v_name,
    case when not exists (select 1 from public.sunners s where lower(s.email) = v_email) then v_email end,
    v_avatar);
end;
$$;

-- Trigger wrapper on auth.users. Any error is downgraded to a warning: sign-up never fails here.
create function public.link_or_create_sunner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is not null then
    perform public.link_or_create_sunner_for_user(new.id, new.email, new.raw_user_meta_data);
  end if;
  return new;
exception when others then
  raise warning 'link_or_create_sunner: account % left without a Sunner (% %)', new.id, sqlstate, sqlerrm;
  return new;
end;
$$;

-- A12 / BR-012: kudos received count follows kudos inserts and deletes (never below 0).
create function public.sync_kudos_received_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.sunners set kudos_received_count = kudos_received_count + 1 where id = new.receiver_id;
  else
    update public.sunners set kudos_received_count = greatest(kudos_received_count - 1, 0) where id = old.receiver_id;
  end if;
  return null;
end;
$$;

-- The viewer's own Sunner row (at most one), without email/user_id. The only client path to it.
create function public.get_my_sunner()
returns table (id uuid, full_name text, department_code text, avatar_url text,
  kudos_received_count integer, hearts_total integer)
language sql
stable
security definer
set search_path = ''
as $$
  select s.id, s.full_name, s.department_code, s.avatar_url, s.kudos_received_count, s.hearts_total
  from public.sunners s
  where s.user_id = (select auth.uid())
  limit 1;
$$;

-- Trigger/helper functions are never callable through the Data API; get_my_sunner is
-- deliberately executable by authenticated only.
revoke execute on function public.link_or_create_sunner_for_user(uuid, text, jsonb),
  public.link_or_create_sunner(), public.sync_kudos_received_count(), public.get_my_sunner()
  from public, anon, authenticated;
grant execute on function public.get_my_sunner() to authenticated;

create trigger kudos_sync_received_count
  after insert or delete on public.kudos
  for each row execute function public.sync_kudos_received_count();

-- Separate from on_auth_user_created (handle_new_user); neither depends on the other's order.
-- GoTrue usually inserts the user first and sets email_confirmed_at in a later UPDATE
-- (admin create, auto-confirm, OAuth), so both moments are covered; unconfirmed = no Sunner.
create trigger on_auth_user_created_link_sunner
  after insert on auth.users
  for each row when (new.email_confirmed_at is not null)
  execute function public.link_or_create_sunner();

create trigger on_auth_user_confirmed_link_sunner
  after update of email_confirmed_at on auth.users
  for each row when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.link_or_create_sunner();

-- One-shot backfill for confirmed accounts created before this migration.
select public.link_or_create_sunner_for_user(u.id, u.email, u.raw_user_meta_data)
from auth.users u
where u.email_confirmed_at is not null
order by u.created_at;
