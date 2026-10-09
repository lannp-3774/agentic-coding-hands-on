import { createClient } from '@supabase/supabase-js';
import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';

/** Must equal the baseURL in playwright.config.ts. */
export const APP_ORIGIN = 'http://localhost:3000';

/** Must equal the literal in supabase/seeds/common/03-site-settings.sql (past = gate open). */
export const SEED_PAST_ISO = '2026-01-01T00:00:00+07:00';

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Service_role Supabase client (admin, bypasses RLS) for arranging and reading
 * site_settings in tests.
 */
export function getServiceRoleClient() {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY required for getServiceRoleClient()');
  }

  return createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Set site_settings.prelaunch_ends_at to an ISO timestamp (or NULL to disable the gate).
 * Upserts, so it also recreates a deleted row; every write asserts error is null.
 */
export async function setPrelaunchEndsAt(isoTimestamp: string | null) {
  const { error } = await getServiceRoleClient()
    .from('site_settings')
    .upsert({ singleton: true, prelaunch_ends_at: isoTimestamp });
  expect(error).toBeNull();
}

/** Delete the site_settings row (the "missing setting" state). */
export async function deletePrelaunchRow() {
  const { error } = await getServiceRoleClient().from('site_settings').delete().eq('singleton', true);
  expect(error).toBeNull();
}

/** Restore the seeded past value (gate open). Call from afterEach so a failed test cannot leave the site locked. */
export async function restorePrelaunchSeed() {
  await setPrelaunchEndsAt(SEED_PAST_ISO);
}

/** ISO 8601 timestamp `msFromNow` ahead of this machine's clock (the server shares it). */
export function futureIso(msFromNow: number): string {
  return new Date(Date.now() + msFromNow).toISOString();
}

/** Lock the site until `msFromNow` from now. */
export async function lockGateFor(msFromNow: number) {
  await setPrelaunchEndsAt(futureIso(msFromNow));
}

/**
 * Lock the site until `msFromNow` from now, but only after one throwaway
 * GET /countdown, so the dev server's first-hit compile of that route cannot
 * eat the short countdown a test is about to watch. Returns the target in epoch ms.
 */
export async function armCountdownTarget(request: APIRequestContext, msFromNow: number) {
  await lockGateFor(ONE_HOUR_MS);
  await request.get('/countdown', { maxRedirects: 0 });
  const targetMs = Date.now() + msFromNow;
  await setPrelaunchEndsAt(new Date(targetMs).toISOString());
  return targetMs;
}

/**
 * Path + query of a redirect response's Location (it may be absolute or relative).
 * Asserts the redirect stays on the app origin; returning the query too makes a
 * leaked `?next=` visible to the caller's toBe('/countdown') (BR-004).
 */
export function redirectPath(response: APIResponse): string {
  const location = response.headers()['location'];
  if (location === undefined) {
    throw new Error(`${response.url()} answered ${response.status()} without a Location header`);
  }
  const target = new URL(location, APP_ORIGIN);
  expect(target.origin).toBe(APP_ORIGIN);
  return target.pathname + target.search;
}
