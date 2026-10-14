/**
 * Guest-as-Anonymous helpers (plans/261014-1505-guest-anonymous-access, plan.md "Contracts").
 * A guest acts through a real Supabase anonymous session: `signInAnonymously()` with its cookies
 * kept in a jar, like the app's SSR client. service_role is used ONLY to read internal state
 * (is_guest, user_id, profiles.role) and to clean up. Cleanup deletes every anonymous auth user
 * created since a test began, with its likes and guest Sunner (whose kudos cascade). Serial only.
 */
import { expect } from '@playwright/test';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { APP_ORIGIN, getServiceRoleClient } from './prelaunch-setting';
import { deleteAuthUser, deleteLikesBy, deleteThrowawaySunners } from './kudos-board-db';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || '';
const PAGE_SIZE = 1000;

/** full_name of every guest Sunner (plan.md DB contract). */
export const GUEST_SUNNER_NAME = 'Ẩn danh';

type Cookie = { name: string; value: string; url: string };

export type AnonymousSession = {
  /** Data API client acting as the anonymous user (role `authenticated`, claim is_anonymous). */
  client: SupabaseClient;
  userId: string;
  /** `null` when the sign-in worked; otherwise the auth error, for the caller's assertion. */
  error: string | null;
  /** The session's Supabase SSR cookies, for a browser context or a request header. */
  cookies: () => Cookie[];
};

/** Signs in anonymously the way the app's server client does. Never throws: the caller asserts `error`. */
export async function anonymousSession(): Promise<AnonymousSession> {
  const jar = new Map<string, string>();
  const client = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (cs) => cs.forEach(({ name, value }) => (value ? jar.set(name, value) : jar.delete(name))),
    },
  });
  const { data, error } = await client.auth.signInAnonymously();
  return {
    client,
    userId: data.user?.id ?? '',
    error: error ? `${error.code ?? error.status}: ${error.message}` : null,
    cookies: () => [...jar].map(([name, value]) => ({ name, value, url: APP_ORIGIN })),
  };
}

/** `Cookie` request header carrying a session's cookies. */
export const cookieHeader = (cookies: { name: string; value: string }[]) =>
  ({ Cookie: cookies.map((c) => `${c.name}=${c.value}`).join('; ') });

/** ISO start of a test window, with slack for the clock of the Supabase containers. */
export const windowStart = () => new Date(Date.now() - 2000).toISOString();

/** Ids of the anonymous auth users created at or after `sinceIso` (Admin API, every page). */
export async function anonymousUserIdsSince(sinceIso: string): Promise<string[]> {
  const admin = getServiceRoleClient();
  const since = Date.parse(sinceIso);
  const ids: string[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PAGE_SIZE });
    expect(error).toBeNull();
    const users = data.users ?? [];
    ids.push(...users.filter((u) => u.is_anonymous === true && Date.parse(u.created_at) >= since).map((u) => u.id));
    if (users.length < PAGE_SIZE) return ids;
  }
}

/** The one anonymous user the guest's first action created (lazily, server-side). */
export async function onlyAnonymousUserSince(sinceIso: string): Promise<string> {
  const ids = await anonymousUserIdsSince(sinceIso);
  expect(ids, 'exactly one anonymous session was created for the guest').toHaveLength(1);
  return ids[0];
}

/** Removes every anonymous user created since `sinceIso`: likes, guest Sunner (kudos cascade), auth user. */
export async function deleteGuestsCreatedSince(sinceIso: string) {
  for (const id of await anonymousUserIdsSince(sinceIso)) {
    try {
      await deleteLikesBy([id]);
      await deleteThrowawaySunners(id);
    } finally {
      await deleteAuthUser(id); // always, even if the Sunner cleanup failed
    }
  }
}

export type SunnerInternals = { id: string; full_name: string; email: string | null; user_id: string | null; is_guest: boolean };
const INTERNAL_COLUMNS = 'id, full_name, email, user_id, is_guest';

/** Sunner rows linked to auth user `userId`, internal columns included (service_role read). */
export async function sunnersOfUser(userId: string): Promise<SunnerInternals[]> {
  const { data, error } = await getServiceRoleClient().from('sunners').select(INTERNAL_COLUMNS).eq('user_id', userId);
  expect(error).toBeNull();
  return (data ?? []) as SunnerInternals[];
}

/** One Sunner row by id, internal columns included (service_role read). */
export async function readSunnerInternals(id: string): Promise<SunnerInternals> {
  const { data, error } = await getServiceRoleClient().from('sunners').select(INTERNAL_COLUMNS).eq('id', id).single();
  expect(error).toBeNull();
  return data as SunnerInternals;
}

/** Likes stored for (`userId`, `kudosId`) (service_role read). */
export async function countLikesOf(userId: string, kudosId: string): Promise<number> {
  const { count, error } = await getServiceRoleClient().from('kudos_likes')
    .select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('kudos_id', kudosId);
  expect(error).toBeNull();
  return count ?? -1;
}

/** profiles.role write (service_role), e.g. to simulate an operator granting admin by mistake. */
export async function setProfileRole(userId: string, role: 'user' | 'admin') {
  const { error } = await getServiceRoleClient().from('profiles').update({ role }).eq('id', userId);
  expect(error).toBeNull();
}
