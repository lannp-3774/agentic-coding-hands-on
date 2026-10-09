import { test, expect } from '@playwright/test';
import {
  futureIso,
  getServiceRoleClient,
  restorePrelaunchSeed,
  setPrelaunchEndsAt,
} from './support/prelaunch-setting';

/**
 * FR-001, US033 — service_role is the only writer of site_settings: valid
 * values round-trip (future / past / NULL) and invalid ones are rejected by the
 * database (22007 not a timestamp, 23514 singleton must be true) without
 * touching the stored value.
 *
 * These pass without the proxy gate: they pin the DB contract the gate reads.
 * They sit in the prelaunch-gate project only because they write the shared
 * row, which that project runs serially. The row is restored after each test.
 */
async function readStoredMs(): Promise<number | null> {
  const { data, error } = await getServiceRoleClient()
    .from('site_settings')
    .select('prelaunch_ends_at')
    .eq('singleton', true)
    .single();
  expect(error).toBeNull();
  return data!.prelaunch_ends_at === null ? null : new Date(data!.prelaunch_ends_at).getTime();
}

test.describe('prelaunch-gate — site_settings service_role', () => {
  test.afterEach(async () => {
    await restorePrelaunchSeed();
  });

  for (const [label, offsetMs] of [
    ['future', 3_600_000],
    ['past', -3_600_000],
  ] as const) {
    test(`service_role can write a ${label} timestamp`, async () => {
      const iso = futureIso(offsetMs);

      await setPrelaunchEndsAt(iso);

      expect(await readStoredMs()).toBe(new Date(iso).getTime());
    });
  }

  test('service_role can write NULL (gate off)', async () => {
    await setPrelaunchEndsAt(futureIso(3_600_000));

    await setPrelaunchEndsAt(null);

    expect(await readStoredMs()).toBeNull();
  });

  test('a non-timestamp value is rejected with 22007 and the stored value is unchanged', async () => {
    const iso = futureIso(3_600_000);
    await setPrelaunchEndsAt(iso);

    const { error } = await getServiceRoleClient()
      .from('site_settings')
      .upsert({ singleton: true, prelaunch_ends_at: 'not-a-date' });

    expect(error?.code).toBe('22007');
    expect(await readStoredMs()).toBe(new Date(iso).getTime());
  });

  test('a second row (singleton=false) is rejected with 23514', async () => {
    const { error } = await getServiceRoleClient()
      .from('site_settings')
      .insert({ singleton: false, prelaunch_ends_at: null });

    expect(error?.code).toBe('23514');
    const { count } = await getServiceRoleClient()
      .from('site_settings')
      .select('*', { count: 'exact', head: true });
    expect(count).toBe(1);
  });
});
