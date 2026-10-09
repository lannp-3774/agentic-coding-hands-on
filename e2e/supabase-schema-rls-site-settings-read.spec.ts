import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ensureUser } from './support/supabase-session';
import { getServiceRoleClient } from './support/prelaunch-setting';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || '';

/**
 * FR-001, FR-002, SC-006 — site_settings holds exactly one row that anon and
 * authenticated clients can read (the proxy and /countdown read it with the
 * publishable key). The service_role read is the ground truth: each role must
 * see that same row, all three columns included. The row's value is not pinned
 * (seed = past moment locally, NULL on a fresh deploy) and is never written here.
 */
const ROW_COLUMNS = ['prelaunch_ends_at', 'singleton', 'updated_at'];

function publishableClient() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY required');
  }
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function readAllRows(client: SupabaseClient) {
  const { data, error, count } = await client
    .from('site_settings')
    .select('*', { count: 'exact' });
  expect(error).toBeNull();
  expect(count).toBe(1);
  return data;
}

test.describe('site_settings schema/RLS — read', () => {
  test('service_role reads the single row with every column', async () => {
    const rows = await readAllRows(getServiceRoleClient());

    expect(rows).toHaveLength(1);
    expect(Object.keys(rows![0]).sort()).toEqual(ROW_COLUMNS);
    expect(rows![0]).toHaveProperty('singleton', true);
  });

  test('anonymous client reads the same row as service_role', async () => {
    const truth = await readAllRows(getServiceRoleClient());

    const rows = await readAllRows(publishableClient());

    expect(rows).toEqual(truth);
  });

  test('authenticated client reads the same row as service_role', async () => {
    const email = `test-read-auth-${Date.now()}@example.com`;
    const password = 'password123';
    await ensureUser(email, password, 'user');
    const client = publishableClient();
    const { error: signInError } = await client.auth.signInWithPassword({ email, password });
    expect(signInError).toBeNull();
    const truth = await readAllRows(getServiceRoleClient());

    const rows = await readAllRows(client);

    expect(rows).toEqual(truth);
  });
});
