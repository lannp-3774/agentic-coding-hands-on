-- ROLLBACK STRATEGY
-- Supabase migrations are forward-only: never edit or delete this file once applied
-- anywhere. To undo it, add a NEW migration (forward-fix) containing the down SQL
-- below; prefer a corrective forward migration over a full drop when only part of the
-- change is wrong. Roll back create_secret_boxes first only if it is also being undone;
-- it does not depend on this migration.
--
-- Down SQL (for a new migration, not run automatically), in dependency order:
--   drop trigger if exists kudos_before_delete_release_like_hearts on public.kudos;
--   drop trigger if exists kudos_likes_after_change on public.kudos_likes;
--   drop trigger if exists kudos_likes_before_insert on public.kudos_likes;
--   drop function if exists public.release_kudos_like_hearts();
--   drop function if exists public.kudos_likes_after_change();
--   drop function if exists public.kudos_likes_before_insert();
--   drop table if exists public.kudos_likes;
--   drop table if exists public.special_days;
--   -- WARNING: dropping kudos_likes deletes every like; kudos.like_count and
--   -- sunners.hearts_total (F006 columns) keep their last values and stop changing.
--   -- Locally re-seed special days from supabase/seeds/common/05-special-days.sql.
--
-- F007 Kudos Hearts: one like per account per kudos, weighted 1 (or the special_days weight,
-- 2 by default) on the Asia/Ho_Chi_Minh day of the like. Triggers keep kudos.like_count and
-- the SENDER's sunners.hearts_total in the same transaction; unlike (or deleting the kudos)
-- takes back exactly the stored weight. Clients write only their own like rows (no weight,
-- no update); likes are readable only by their owner. special_days: public read,
-- service_role writes. Local rows: supabase/seeds/common/05-special-days.sql.

create table public.special_days (
  day date primary key,
  weight smallint not null default 2 check (weight in (1, 2))
);

create table public.kudos_likes (
  kudos_id uuid not null references public.kudos (id) on delete cascade on update cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  weight smallint not null default 1 check (weight in (1, 2)),  -- set by kudos_likes_before_insert only
  created_at timestamptz not null default now(),
  primary key (kudos_id, user_id)  -- BR-001: one like per account per kudos
);

create index kudos_likes_user_id_idx on public.kudos_likes (user_id);  -- RLS policy column

comment on table public.special_days is 'Days whose likes weigh more (F007). Public read; writes only via service_role (no admin UI).';
comment on table public.kudos_likes is 'One like per account per kudos (F007). Owner-only read/insert/delete; weight decided by trigger; counters kept by triggers.';
comment on column public.kudos_likes.weight is 'Hearts this like gave the kudos sender (1, or special_days.weight); taken back on unlike.';

alter table public.special_days enable row level security;
alter table public.kudos_likes enable row level security;

create policy special_days_select_public on public.special_days
  for select to anon, authenticated using (true);

-- anon is included so guests embedding their own likes get [] instead of 42501.
create policy kudos_likes_select_own on public.kudos_likes
  for select to anon, authenticated using (user_id = (select auth.uid()));
create policy kudos_likes_insert_own on public.kudos_likes
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy kudos_likes_delete_own on public.kudos_likes
  for delete to authenticated using (user_id = (select auth.uid()));

-- Explicit privileges, revoke first (see create_kudos_board). Insert is a column grant so a
-- client can never choose weight or created_at; there is no update grant at all.
revoke all on table public.special_days, public.kudos_likes from public, anon, authenticated;
grant select on table public.special_days, public.kudos_likes to anon, authenticated;
grant insert (kudos_id, user_id) on table public.kudos_likes to authenticated;
grant delete on table public.kudos_likes to authenticated;
grant select, insert, update, delete on table public.special_days, public.kudos_likes to service_role;

-- A4: refuse likes from an account without a Sunner or from the kudos sender (check_violation,
-- BR-002), then set the weight (ALG-001). A missing kudos is left to the foreign key (23503).
create function public.kudos_likes_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_liker uuid;
begin
  select s.id into v_liker from public.sunners s where s.user_id = new.user_id;
  if v_liker is null then
    raise exception 'kudos_likes: the liking account has no Sunner profile' using errcode = 'check_violation';
  end if;
  if exists (select 1 from public.kudos k where k.id = new.kudos_id and k.sender_id = v_liker) then
    raise exception 'kudos_likes: a sender cannot like their own kudos' using errcode = 'check_violation';
  end if;
  new.weight := coalesce((select d.weight from public.special_days d
    where d.day = (now() at time zone 'Asia/Ho_Chi_Minh')::date), 1);
  return new;
end;
$$;

-- A5: like_count +/- 1 and the sender's hearts_total +/- the stored weight (floor 0).
-- When the kudos itself is being deleted its row is already gone while the cascaded likes
-- are removed, so nothing is updated here: release_kudos_like_hearts charged the sender back.
create function public.kudos_likes_after_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sender uuid;
begin
  if tg_op = 'INSERT' then
    update public.kudos set like_count = like_count + 1 where id = new.kudos_id
    returning sender_id into v_sender;
    update public.sunners set hearts_total = hearts_total + new.weight where id = v_sender;
  else
    update public.kudos set like_count = greatest(like_count - 1, 0) where id = old.kudos_id
    returning sender_id into v_sender;
    update public.sunners set hearts_total = greatest(hearts_total - old.weight, 0) where id = v_sender;
  end if;
  return null;
end;
$$;

-- Deleting a kudos (service_role SQL only) takes back the stored weight of every like on it
-- from its sender. Runs BEFORE the delete because the cascade removes the likes only after the
-- kudos row is gone, when kudos_likes_after_change can no longer find the sender.
create function public.release_kudos_like_hearts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.sunners s
     set hearts_total = greatest(s.hearts_total - l.total, 0)
    from (select sum(kl.weight)::integer as total from public.kudos_likes kl where kl.kudos_id = old.id) l
   where s.id = old.sender_id and l.total > 0;
  return old;
end;
$$;

revoke execute on function public.kudos_likes_before_insert(), public.kudos_likes_after_change(),
  public.release_kudos_like_hearts() from public, anon, authenticated;

create trigger kudos_likes_before_insert
  before insert on public.kudos_likes
  for each row execute function public.kudos_likes_before_insert();

create trigger kudos_likes_after_change
  after insert or delete on public.kudos_likes
  for each row execute function public.kudos_likes_after_change();

create trigger kudos_before_delete_release_like_hearts
  before delete on public.kudos
  for each row execute function public.release_kudos_like_hearts();
