import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ensureUser } from './support/supabase-session';
import { getServiceRoleClient } from './support/prelaunch-setting';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || '';

/**
 * A moment in the past that nothing else uses: if a write is wrongly allowed
 * it cannot lock the site (past = open), and the service_role read-back can
 * tell it apart from the seed, so the assertion never depends on the row's
 * current value. These specs never write through service_role, so they are
 * safe to run beside other suites.
 */
const PROBE_PAST_ISO = '2000-01-01T00:00:00.000Z';
const PERMISSION_DENIED = '42501';

/**
 * FR-001 — site_settings grants anon and authenticated SELECT only. Every
 * write is refused with 42501 (privilege revoked), AND the row is verifiably
 * untouched afterwards (a write that "succeeds" with 0 rows would also fail
 * the error assertion, so a silent RLS filter cannot pass as a denial).
 */
function publishableClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY required');
  }
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function expectRowUntouched() {
  const { data, error } = await getServiceRoleClient().from('site_settings').select('*');
  expect(error).toBeNull();
  expect(data).toHaveLength(1);
  expect(data![0].singleton).toBe(true);
  // Postgres returns its own timestamp format, so compare instants, not strings.
  const stored: string | null = data![0].prelaunch_ends_at;
  expect(stored === null ? null : new Date(stored).getTime()).not.toBe(Date.parse(PROBE_PAST_ISO));
}

const WRITES: { name: string; run: (client: SupabaseClient) => PromiseLike<{ error: { code?: string } | null }> }[] = [
  {
    name: 'update',
    run: (c) => c.from('site_settings').update({ prelaunch_ends_at: PROBE_PAST_ISO }).eq('singleton', true),
  },
  {
    name: 'insert',
    run: (c) => c.from('site_settings').insert({ singleton: true, prelaunch_ends_at: PROBE_PAST_ISO }),
  },
  {
    name: 'upsert',
    run: (c) => c.from('site_settings').upsert({ singleton: true, prelaunch_ends_at: PROBE_PAST_ISO }),
  },
  { name: 'delete', run: (c) => c.from('site_settings').delete().eq('singleton', true) },
];

test.describe('site_settings schema/RLS — write denied', () => {
  for (const write of WRITES) {
    test(`anonymous client cannot ${write.name} site_settings`, async () => {
      const { error } = await write.run(publishableClient());

      expect(error?.code).toBe(PERMISSION_DENIED);
      await expectRowUntouched();
    });

    test(`authenticated user cannot ${write.name} site_settings`, async () => {
      const email = `test-write-denied-${write.name}-${Date.now()}@example.com`;
      const password = 'password123';
      await ensureUser(email, password, 'user');
      const client = publishableClient();
      const { error: signInError } = await client.auth.signInWithPassword({ email, password });
      expect(signInError).toBeNull();

      const { error } = await write.run(client);

      expect(error?.code).toBe(PERMISSION_DENIED);
      await expectRowUntouched();
    });
  }
});
