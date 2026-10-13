/**
 * DB + session helpers for the Sun* Kudos E2E suite (F006-F009).
 * service_role writes stay in the test process (never the browser); every write
 * asserts `error` is null so a broken arrange step fails loudly. Mutating helpers
 * are only called from the `sun-kudos-serial` project, which restores in afterEach.
 */
import { expect, type BrowserContext } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { APP_ORIGIN, getServiceRoleClient } from './prelaunch-setting';
import { SUNNERS } from './kudos-board-seed';
import { ensureUser, sessionCookies } from './supabase-session';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || '';

type Account = { email: string; password: string };

/** Client with the anon role (publishable key, no session). */
export function anonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Client with the `authenticated` role for `account` (account is created first if missing). */
export async function signedInClient(account: Account): Promise<{ client: SupabaseClient; userId: string }> {
  await ensureUser(account.email, account.password, 'user');
  const client = anonClient();
  const { data, error } = await client.auth.signInWithPassword(account);
  expect(error).toBeNull();
  expect(data.user?.id).toBeTruthy();
  return { client, userId: data.user!.id };
}

/** Sign the browser context in as `account` (Supabase SSR cookies). */
export async function signInBrowser(context: BrowserContext, account: Account) {
  await ensureUser(account.email, account.password, 'user');
  await context.addCookies(await sessionCookies(account.email, account.password, APP_ORIGIN));
}

/** Browser context in EN (F002 NEXT_LOCALE cookie). */
export async function useEnglish(context: BrowserContext) {
  await context.addCookies([{ name: 'NEXT_LOCALE', value: 'en', url: APP_ORIGIN }]);
}

export async function countRows(table: string): Promise<number> {
  const { count, error } = await getServiceRoleClient().from(table).select('*', { count: 'exact', head: true });
  expect(error).toBeNull();
  return count ?? -1;
}

export async function readSunnerCounters(id: string) {
  const { data, error } = await getServiceRoleClient()
    .from('sunners').select('kudos_received_count, hearts_total').eq('id', id).single();
  expect(error).toBeNull();
  return { received: data!.kudos_received_count as number, hearts: data!.hearts_total as number };
}

export async function readLikeCount(kudosId: string): Promise<number> {
  const { data, error } = await getServiceRoleClient().from('kudos').select('like_count').eq('id', kudosId).single();
  expect(error).toBeNull();
  return data!.like_count as number;
}

export async function setReceivedCount(id: string, count: number) {
  const { error } = await getServiceRoleClient().from('sunners').update({ kudos_received_count: count }).eq('id', id);
  expect(error).toBeNull();
}

export async function insertKudosRow(row: { id: string; sender_id: string; receiver_id: string; body: string }) {
  const { error } = await getServiceRoleClient().from('kudos').insert(row);
  expect(error).toBeNull();
}

/** Delete a kudos if it exists (cleanup-safe: deleting nothing is not an error). */
export async function deleteKudosRow(id: string) {
  const { error } = await getServiceRoleClient().from('kudos').delete().eq('id', id);
  expect(error).toBeNull();
}

/** Remove every like written by these auth users; the AFTER DELETE trigger restores the counters. */
export async function deleteLikesBy(userIds: string[]) {
  const { error } = await getServiceRoleClient().from('kudos_likes').delete().in('user_id', userIds);
  expect(error).toBeNull();
}

/** Today's date in Asia/Ho_Chi_Minh (fixed +07:00, no DST), `YYYY-MM-DD` — what ALG-001 compares against. */
export function todayInVietnam(): string {
  return new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10);
}

export async function setSpecialDay(day: string, weight: 1 | 2 = 2) {
  const { error } = await getServiceRoleClient().from('special_days').upsert({ day, weight });
  expect(error).toBeNull();
}

export async function deleteSpecialDay(day: string) {
  const { error } = await getServiceRoleClient().from('special_days').delete().eq('day', day);
  expect(error).toBeNull();
}

/** Snapshot of secret_boxes.opened_at, restored with restoreOpenedAt(). */
export async function snapshotOpenedAt(): Promise<{ id: string; opened_at: string | null }[]> {
  const { data, error } = await getServiceRoleClient().from('secret_boxes').select('id, opened_at');
  expect(error).toBeNull();
  return (data ?? []) as { id: string; opened_at: string | null }[];
}

export async function clearAllOpenedAt() {
  const { error } = await getServiceRoleClient().from('secret_boxes').update({ opened_at: null }).not('id', 'is', null);
  expect(error).toBeNull();
}

export async function restoreOpenedAt(snapshot: { id: string; opened_at: string | null }[]) {
  for (const row of snapshot) {
    const { error } = await getServiceRoleClient().from('secret_boxes').update({ opened_at: row.opened_at }).eq('id', row.id);
    expect(error).toBeNull();
  }
}

/** Create an auth user through the Admin API (fires the auth.users triggers). */
export async function createAuthUser(opts: { email: string; password: string; confirmed: boolean; fullName?: string }) {
  const { data, error } = await getServiceRoleClient().auth.admin.createUser({
    email: opts.email,
    password: opts.password,
    email_confirm: opts.confirmed,
    user_metadata: opts.fullName ? { full_name: opts.fullName } : undefined,
  });
  expect(error).toBeNull();
  return data.user!.id;
}

/** Delete an auth user by id (sunners.user_id is `on delete set null`). Missing user is not an error. */
export async function deleteAuthUser(userId: string) {
  const { error } = await getServiceRoleClient().auth.admin.deleteUser(userId);
  if (error && error.status !== 404) throw new Error(`deleteUser ${userId}: ${error.message}`);
}

export async function findSunnersByUserId(userId: string) {
  const { data, error } = await getServiceRoleClient().from('sunners').select('id, full_name, user_id').eq('user_id', userId);
  expect(error).toBeNull();
  return (data ?? []) as { id: string; full_name: string; user_id: string }[];
}

export async function readSunnerUserId(id: string): Promise<string | null> {
  const { data, error } = await getServiceRoleClient().from('sunners').select('user_id').eq('id', id).single();
  expect(error).toBeNull();
  return data!.user_id as string | null;
}

/** Delete Sunner rows the trigger created for `userId`; seed Sunners are never deleted. */
export async function deleteThrowawaySunners(userId: string) {
  const seedIds = Object.values(SUNNERS).map((s) => s.id);
  const { error } = await getServiceRoleClient().from('sunners').delete()
    .eq('user_id', userId).not('id', 'in', `(${seedIds.join(',')})`);
  expect(error).toBeNull();
}

/** Unique throwaway email so serial specs never collide with seed or other users. */
export const throwawayEmail = (tag: string) =>
  `kudos-${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
