import { test, expect } from '@playwright/test';
import { armCountdownTarget, restorePrelaunchSeed } from './support/prelaunch-setting';

/**
 * FR-204, FR-205, FR-401, BR-007, DEC-003, US031, SC-005 — a viewer on
 * /countdown is moved to / by the page itself when the (server-time)
 * countdown reaches 0, with router.replace so Back does not return to it.
 * Real time, no page.clock: the server enforces the gate, so the redirect can
 * only stick if it fires at or after the target. The row is restored after
 * each test.
 *
 * Dropped from the earlier draft: "from /login ... navigates to /" (/login has
 * no countdown, so no correct implementation can pass it; FR-401 / A5 only
 * concern /countdown, which the first test below covers) and "groups render
 * with accessible names" (duplicate of the screen spec, and used page.clock
 * on a redirecting page).
 */
const TARGET_IN_MS = 12_000;

test.describe('prelaunch-gate — countdown auto-redirect', () => {
  test.afterEach(async () => {
    await restorePrelaunchSeed();
  });

  test('moves from /countdown to / once the target is reached, not before', async ({
    page,
    request,
  }) => {
    const targetMs = await armCountdownTarget(request, TARGET_IN_MS);

    await page.goto('/countdown');
    // Still counting: proves the page was shown and did not redirect on load.
    await expect(page.getByRole('group', { name: '01 MINUTES', exact: true })).toBeVisible();
    await expect(page).toHaveURL('/countdown');
    await expect(page).toHaveURL('/', { timeout: 30_000 });

    expect(Date.now()).toBeGreaterThanOrEqual(targetMs);
    // The open homepage, not a bounce back or an error page: it has a header, /countdown has none.
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('replaces the history entry instead of pushing one (BR-007)', async ({ page, request }) => {
    await armCountdownTarget(request, TARGET_IN_MS);

    await page.goto('/countdown');
    await expect(page.getByRole('group', { name: '01 MINUTES', exact: true })).toBeVisible();
    const entriesBefore = await page.evaluate(() => history.length);
    await expect(page).toHaveURL('/', { timeout: 30_000 });

    const entriesAfter = await page.evaluate(() => history.length);
    expect(entriesAfter).toBe(entriesBefore);
  });
});
