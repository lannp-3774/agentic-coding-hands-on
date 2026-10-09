import { test, expect, type Page } from '@playwright/test';
import { armCountdownTarget, restorePrelaunchSeed } from './support/prelaunch-setting';

/**
 * FR-207, BR-007, BR-008, ALG-003, SC-008 — the countdown runs on SERVER time,
 * so a viewer whose clock is 3 hours ahead or behind sees the same tiles and
 * reaches / exactly when the gate opens, without bouncing back to /countdown.
 *
 * The skew is applied by overriding Date.now in the page (addInitScript), not
 * with page.clock: timers keep running in real time, so the only thing that
 * can make these pass is the client measuring its offset from the server's
 * time. (Fake timers + runFor would jump the client past a target the server
 * has not reached and turn this into a different test.) The row is restored
 * after each test.
 */
const HOUR = 60 * 60 * 1000;
const TARGET_IN_MS = 15_000;

async function skewClientClock(page: Page, offsetMs: number) {
  await page.addInitScript((offset) => {
    const realNow = Date.now.bind(Date);
    Date.now = () => realNow() + offset;
  }, offsetMs);
}

test.describe('prelaunch-gate — countdown clock skew', () => {
  test.afterEach(async () => {
    await restorePrelaunchSeed();
  });

  for (const [label, skewMs] of [
    ['+3h (client ahead)', 3 * HOUR],
    ['-3h (client behind)', -3 * HOUR],
  ] as const) {
    test(`client clock ${label}: tiles follow server time and / is reached once, on time`, async ({
      page,
      request,
    }) => {
      const targetMs = await armCountdownTarget(request, TARGET_IN_MS);
      await skewClientClock(page, skewMs);
      const visited: string[] = [];
      page.on('framenavigated', (frame) => {
        if (frame === page.mainFrame()) visited.push(new URL(frame.url()).pathname);
      });

      await page.goto('/countdown');
      // Server-time reading: 15 s left = 1 minute. A client trusting its own
      // clock would show 3 hours (behind) or jump straight to / (ahead).
      await expect(page.getByRole('group', { name: '00 DAYS', exact: true })).toBeVisible();
      await expect(page.getByRole('group', { name: '00 HOURS', exact: true })).toBeVisible();
      await expect(page.getByRole('group', { name: '01 MINUTES', exact: true })).toBeVisible();
      await expect(page).toHaveURL('/', { timeout: 30_000 });

      expect(Date.now()).toBeGreaterThanOrEqual(targetMs);
      await expect(page.getByRole('banner')).toBeVisible();
      // Same-URL entries (history.replaceState on hydration) collapse; a bounce would add /countdown again.
      const path = visited.filter((p, i) => i === 0 || p !== visited[i - 1]);
      expect(path).toEqual(['/countdown', '/']);
    });
  }
});
