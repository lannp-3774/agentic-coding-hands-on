/**
 * DB + Storage helpers for the write-kudos contract (plan.md "Contracts", B1/B2).
 * Clients act through the contract (create_kudos RPC, the app's image routes, Storage with
 * their own session); the service_role client is used ONLY to read internal state
 * (sender_id, object existence) and to clean up.
 */
import { readFileSync } from 'node:fs';
import { expect, request as playwrightRequest, type APIRequestContext, type APIResponse } from '@playwright/test';
import type { SupabaseClient } from '@supabase/supabase-js';
import { APP_ORIGIN, getServiceRoleClient } from './prelaunch-setting';
import { FIGMA_BODY, SUNNERS } from './kudos-board-seed';
import { ensureUser, sessionCookies } from './supabase-session';
import { fixture } from './write-kudos-helpers';

export const IMAGES_BUCKET = 'images';
/** WriteKudosField keys (lib/kudos/write-kudos-types.ts): the 22023 message names the field. */
export type KudosField = 'recipient' | 'title' | 'body' | 'hashtags' | 'images' | 'anonymousName';

export type CreateKudosArgs = {
  p_receiver_id: string; p_title: string; p_body: string; p_hashtag_slugs: string[];
  p_image_paths: string[]; p_is_anonymous: boolean; p_anonymous_name: string;
};

type Account = { email: string; password: string };

/** Valid call with Figma mock data (QUY receiver, "IDOL GIỚI TRẺ" title, Figma body, #Dedicated). */
export const validArgs = (over: Partial<CreateKudosArgs> = {}): CreateKudosArgs => ({
  p_receiver_id: SUNNERS.QUY.id, p_title: 'IDOL GIỚI TRẺ', p_body: FIGMA_BODY, p_hashtag_slugs: ['dedicated'],
  p_image_paths: [], p_is_anonymous: false, p_anonymous_name: '', ...over,
});

/**
 * `/api/kudos/images/<uuid>.<ext>`: the only image path shape create_kudos accepts. It names no
 * user (review C1: an anonymous kudos must not link to its sender). No object exists behind it.
 */
export const imagePath = (n: number, ext = 'jpg') =>
  `/api/kudos/images/00000000-0000-4000-8000-${String(n).padStart(12, '0')}.${ext}`;
export const imagePathPattern = (ext = '(jpg|png)') => new RegExp(`^/api/kudos/images/[0-9a-f-]{36}\\.${ext}$`);
/** API path → Storage object key (`kudos/<file>`). */
export const storageKeyOf = (apiPath: string) => apiPath.replace(/^\/api\/kudos\/images\//, 'kudos/');

/** API client of the app signed in as `account` (its Supabase SSR session cookies). */
export async function requestAs(account: Account): Promise<APIRequestContext> {
  await ensureUser(account.email, account.password, 'user');
  const cookies = await sessionCookies(account.email, account.password, APP_ORIGIN);
  const cookie = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
  return playwrightRequest.newContext({ baseURL: APP_ORIGIN, extraHTTPHeaders: { cookie } });
}

/** Uploads fixtures through POST /api/kudos/images as `account`: the drafts' image paths, in order. */
export async function uploadDrafts(account: Account, files: string[]): Promise<string[]> {
  const api = await requestAs(account);
  try {
    const paths: string[] = [];
    for (const name of files) {
      const mimeType = name.endsWith('.png') ? 'image/png' : 'image/jpeg';
      const res = await api.post('/api/kudos/images', { multipart: { file: { name, mimeType, buffer: readFileSync(fixture(name)) } } });
      const body = await jsonOrNull(res);
      expect(res.status(), `upload ${name}`).toBe(200);
      expect(typeof body?.path, `upload ${name}`).toBe('string');
      paths.push(body!.path as string);
    }
    return paths;
  } finally {
    await api.dispose();
  }
}

export async function createKudos(client: SupabaseClient, over: Partial<CreateKudosArgs> = {}) {
  return client.rpc('create_kudos', validArgs(over));
}

/** Rejected call: 22023 naming `field`, no id. A row created by a broken contract is deleted first. */
export async function expectCreateKudosRejected(client: SupabaseClient, field: KudosField, over: Partial<CreateKudosArgs>) {
  const { data, error } = await createKudos(client, over);
  if (typeof data === 'string') await deleteKudos([data]);
  expect(error?.code, `create_kudos rejects ${field}`).toBe('22023');
  expect(error?.message, 'message key names the field').toContain(field);
  expect(data).toBeNull();
}

export async function deleteKudos(ids: string[]) {
  if (ids.length === 0) return;
  const { error } = await getServiceRoleClient().from('kudos').delete().in('id', ids);
  expect(error).toBeNull();
}

/** Ids of kudos created after `sinceIso` (seed rows are all in 2025). */
export async function kudosIdsCreatedSince(sinceIso: string): Promise<string[]> {
  const { data, error } = await getServiceRoleClient().from('kudos').select('id').gte('created_at', sinceIso);
  expect(error).toBeNull();
  return (data ?? []).map((r) => r.id as string);
}

/** Internal state, read with service_role: the stored kudos row plus its links. */
export async function readKudosRow(id: string): Promise<Record<string, unknown> & { hashtags: string[]; images: string[] }> {
  const sr = getServiceRoleClient();
  const row = await sr.from('kudos')
    .select('sender_id, receiver_id, title, body, is_anonymous, anonymous_name, public_sender_id, created_at')
    .eq('id', id).single();
  expect(row.error).toBeNull();
  const tags = await sr.from('kudos_hashtags').select('hashtag_slug').eq('kudos_id', id);
  expect(tags.error).toBeNull();
  const images = await sr.from('kudos_images').select('image_path, sort_order').eq('kudos_id', id).order('sort_order');
  expect(images.error).toBeNull();
  return {
    ...(row.data as Record<string, unknown>),
    hashtags: (tags.data ?? []).map((t) => t.hashtag_slug as string).sort(),
    images: (images.data ?? []).map((i) => i.image_path as string),
  };
}

/** Whether the Storage object of an API path or key exists (service_role read). */
export async function storageObjectExists(pathOrKey: string): Promise<boolean> {
  const key = pathOrKey.startsWith('/api/') ? storageKeyOf(pathOrKey) : pathOrKey;
  const { data } = await getServiceRoleClient().storage.from(IMAGES_BUCKET).download(key);
  return data !== null;
}

/** Remove Storage objects by API path or key; missing objects are not an error. */
export async function removeStorageObjects(paths: string[]) {
  if (paths.length === 0) return;
  const keys = paths.map((p) => (p.startsWith('/api/') ? storageKeyOf(p) : p));
  const { error } = await getServiceRoleClient().storage.from(IMAGES_BUCKET).remove(keys);
  expect(error).toBeNull();
}

/** Remove every kudos image stored since `sinceIso` (serial specs only: nothing else uploads meanwhile). */
export async function removeKudosImagesStoredSince(sinceIso: string) {
  const { data, error } = await getServiceRoleClient().storage.from(IMAGES_BUCKET)
    .list('kudos', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });
  if (error) return; // bucket or folder missing: nothing to clean
  const since = Date.parse(sinceIso);
  const recent = (data ?? []).filter((o) => o.id && o.created_at && Date.parse(o.created_at) >= since);
  await removeStorageObjects(recent.map((o) => `kudos/${o.name}`));
}

/** JSON body or null (a 404 HTML page parses to null instead of throwing). */
export async function jsonOrNull(res: Pick<APIResponse, 'json'>): Promise<Record<string, unknown> | null> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}
