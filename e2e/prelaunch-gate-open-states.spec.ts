import { test, expect } from '@playwright/test';
import {
  deletePrelaunchRow,
  futureIso,
  redirectPath,
  restorePrelaunchSeed,
  setPrelaunchEndsAt,
} from './support/prelaunch-setting';

/**
 * FR-104, FR-105, BR-001, BR-002, DEC-001, DEC-002, US032, SC-003 — the site is
 * open when the moment is in the past, NULL, or the row is missing (fail open):
 * GET / is served as is (no redirect at all), and /countdown has nothing left
 * to show so it sends the visitor to / with a 307.
 *
 * The "GET / is 200" cases also passed before the gate was wired, by design:
 * they guard against a gate that locks when it should not (BR-002). The
 * /countdown cases fail until the gate and the page exist. The row is
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

    test(`${state.name}: GET /countdown redirects to / (307)`, async ({ request }) => {
      await state.arrange();

      const response = await request.get('/countdown', { maxRedirects: 0 });

      expect(response.status()).toBe(307);
      expect(redirectPath(response)).toBe('/');
    });
  }

  test('past moment: GET /awards-information is served (200, no redirect)', async ({
    request,
  }) => {
    await setPrelaunchEndsAt(futureIso(-60 * 60 * 1000));

    const response = await request.get('/awards-information', { maxRedirects: 0 });

    expect(response.status()).toBe(200);
  });
});
