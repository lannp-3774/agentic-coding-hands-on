import { test, expect } from '@playwright/test';
import {
  deletePrelaunchRow,
  futureIso,
  restorePrelaunchSeed,
  setPrelaunchEndsAt,
} from './support/prelaunch-setting';

/**
 * FR-104, FR-105, BR-001, BR-002, DEC-001, DEC-002, US032, SC-003 — the site is
 * open when the moment is in the past, NULL, or the row is missing (fail open):
 * GET / is served as is (no redirect at all), and /countdown stays reachable by
 * URL (DEC-002): served with 200, and the page shows 00 00 00 without moving
 * the visitor to /.
 *
 * The "GET / is 200" cases also passed before the gate was wired, by design:
 * they guard against a gate that locks when it should not (BR-002). The row is
 * restored after each test.
 */
const OPEN_STATES: { name: string; arrange: () => Promise<void> }[] = [
  { name: 'past moment', arrange: () => setPrelaunchEndsAt(futureIso(-60 * 60 * 1000)) },
  { name: 'NULL moment', arrange: () => setPrelaunchEndsAt(null) },
  { name: 'missing row', arrange: deletePrelaunchRow },
];

test.describe('prelaunch-gate — open states', () => {
  test.afterEach(async () => {
    await restorePrelaunchSeed();
  });

  for (const state of OPEN_STATES) {
    test(`${state.name}: GET / is served (200, no redirect)`, async ({ request }) => {
      await state.arrange();

      const response = await request.get('/', { maxRedirects: 0 });

      expect(response.status()).toBe(200);
    });

    test(`${state.name}: GET /countdown is served (200, no redirect)`, async ({ request }) => {
      await state.arrange();

      const response = await request.get('/countdown', { maxRedirects: 0 });

      expect(response.status()).toBe(200);
    });
  }

  test('past moment: /countdown shows 00 00 00 and stays on /countdown', async ({ page }) => {
    await setPrelaunchEndsAt(futureIso(-60 * 60 * 1000));

    await page.goto('/countdown');
    // Hydrated tiles: the point where the client used to redirect to /.
    await expect(page.getByRole('group', { name: '00 MINUTES', exact: true })).toBeVisible();
    await page.waitForTimeout(1_000);

    await expect(page).toHaveURL('/countdown');
  });

  test('past moment: GET /awards-information is served (200, no redirect)', async ({
    request,
  }) => {
    await setPrelaunchEndsAt(futureIso(-60 * 60 * 1000));

    const response = await request.get('/awards-information', { maxRedirects: 0 });

    expect(response.status()).toBe(200);
  });
});
