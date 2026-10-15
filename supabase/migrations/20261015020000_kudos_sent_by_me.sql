-- ROLLBACK STRATEGY
-- Supabase migrations are forward-only: never edit or delete this file once applied
-- anywhere. To undo it, add a NEW migration (forward-fix) containing the down SQL
-- below. Nothing in the database depends on it; the app treats a failed call as
-- "sent nothing" (the heart stays enabled and the DB still refuses self-likes).
--
-- Down SQL (for a new migration, not run automatically):
--   drop function if exists public.kudos_sent_by_me(uuid[]);
--
-- F007 FR-203 / BR-002 for anonymous kudos (F010 deferred follow-up "enabled heart on your own
-- anonymous kudos"; every guest kudos is anonymous, so a guest always hit it). The card cannot
-- tell its own sender that a kudos is theirs: sender_id is not client-readable and
-- public_sender_id is NULL when is_anonymous. A computed column is not possible either (a
-- whole-row argument needs SELECT on every kudos column, sender_id included).
--
-- kudos_sent_by_me(): of the given kudos ids, the ones the CALLER sent (auth.uid(), never a
-- parameter). It only tells a user about their own kudos, which they already know, so it opens
-- no path to another sender. Executable by authenticated only (accounts and anonymous guests);
-- input capped at 100 ids (a board page asks for at most 21), primary-key lookups only.

create function public.kudos_sent_by_me(p_kudos_ids uuid[])
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select k.id
  from public.kudos k
  join public.sunners s on s.id = k.sender_id
  where k.id = any ((coalesce(p_kudos_ids, '{}'::uuid[]))[1:100])
    and s.user_id = (select auth.uid());
$$;

comment on function public.kudos_sent_by_me(uuid[]) is
  'F007 FR-203: of the given kudos ids (max 100), those the caller sent, anonymous kudos included. Reveals only the caller''s own kudos.';

revoke execute on function public.kudos_sent_by_me(uuid[]) from public, anon;
grant execute on function public.kudos_sent_by_me(uuid[]) to authenticated;
