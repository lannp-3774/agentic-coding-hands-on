import { test, expect, type Page } from '@playwright/test';
import { armCountdownTarget, restorePrelaunchSeed } from './support/prelaunch-setting';

/**
 * FR-201, FR-203..206, BR-005, DEC-003, US028, SC-004 — the /countdown screen
 * while locked: days / hours / minutes tiles computed from server time (whole
 * minutes, rounded up, two digits minimum, real number above 99 days), one h1,
 * no header, footer or buttons, white text, `--` in the server HTML, and a tile
 * ticking down when a minute passes.
 *
 * Every target is a whole number of minutes from "now": the page shows
 * ceil(remaining) so the tiles stay stable for the 60 s it takes to load the
 * page, whatever the machine speed. The route is warmed first (see
 * armCountdownTarget). page.clock is used only by the tick-down test, which
 * neither gates nor redirects. The row is restored after each test.
 */
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const tile = (page: Page, name: string) => page.getByRole('group', { name, exact: true });

async function expectTiles(page: Page, days: string, hours: string, minutes: string) {
  await expect(tile(page, `${days} DAYS`)).toBeVisible();
  await expect(tile(page, `${hours} HOURS`)).toBeVisible();
  await expect(tile(page, `${minutes} MINUTES`)).toBeVisible();
}

test.describe('prelaunch-gate — countdown screen', () => {
  test.afterEach(async () => {
    await restorePrelaunchSeed();
  });

  // Values from the screen's test cases: days 0/9/10/31, hours 0/9/10/23, minutes 9/10/59.
  const CASES: [number, number, number][] = [
    [31, 23, 59],
    [10, 10, 10],
    [9, 9, 9],
    [0, 0, 9],
  ];
  for (const [d, h, m] of CASES) {
    const pad = (n: number) => String(n).padStart(2, '0');
    test(`${d}d ${h}h ${m}m left shows ${pad(d)} / ${pad(h)} / ${pad(m)}`, async ({
      page,
      request,
    }) => {
      await armCountdownTarget(request, d * DAY + h * HOUR + m * MINUTE);

      await page.goto('/countdown');

      await expectTiles(page, pad(d), pad(h), pad(m));
    });
  }

  test('a partial minute is rounded up (5 min 50 s left shows 06 MINUTES)', async ({
    page,
    request,
  }) => {
    await armCountdownTarget(request, 5 * MINUTE + 50_000);

    await page.goto('/countdown');

    await expectTiles(page, '00', '00', '06');
  });

  test('more than 99 days shows the full number (120 DAYS)', async ({ page, request }) => {
    await armCountdownTarget(request, 120 * DAY);

    await page.goto('/countdown');

    await expectTiles(page, '120', '00', '00');
  });

  test('has exactly one h1, the localized title', async ({ page, request }) => {
    await armCountdownTarget(request, HOUR);

    await page.goto('/countdown');

    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText('Sự kiện sẽ bắt đầu sau');
  });

  test('shows only the title and tiles: no header, footer or buttons', async ({
    page,
    request,
  }) => {
    await armCountdownTarget(request, HOUR);

    await page.goto('/countdown');

    // Positive anchor first: a 404 page has no banner either.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('banner')).toHaveCount(0);
    await expect(page.getByRole('contentinfo')).toHaveCount(0);
    // Scoped to <main>: the Next.js dev tools overlay renders its own buttons.
    await expect(page.locator('main').getByRole('button')).toHaveCount(0);
  });

  test('labels and tiles are white (computed color)', async ({ page, request }) => {
    await armCountdownTarget(request, HOUR);

    await page.goto('/countdown');

    for (const label of ['DAYS', 'HOURS', 'MINUTES']) {
      const group = page.getByRole('group', { name: new RegExp(`^\\d+ ${label}$`) });
      await expect(group).toHaveCSS('color', 'rgb(255, 255, 255)');
      await expect(group.getByText(label, { exact: true })).toHaveCSS('color', 'rgb(255, 255, 255)');
    }
  });

  test('a tile ticks down by one minute when a minute passes', async ({ page, request }) => {
    await armCountdownTarget(request, 2 * MINUTE);
    await page.clock.install();

    await page.goto('/countdown');
    await expect(tile(page, '02 MINUTES')).toBeVisible();
    await page.clock.runFor(MINUTE);

    await expect(tile(page, '01 MINUTES')).toBeVisible();
    await expect(tile(page, '02 MINUTES')).toHaveCount(0);
  });

  test('the server-rendered HTML shows -- tiles, never a clock reading (BR-005, DEC-003)', async ({
    request,
  }) => {
    await armCountdownTarget(request, HOUR);

    // The raw response is what the browser holds before hydration. (The content
    // streams inside <Suspense>, so a JavaScript-disabled browser would not
    // display it; the HTML itself is what BR-005 is about.)
    const html = await (await request.get('/countdown', { maxRedirects: 0 })).text();

    for (const label of ['DAYS', 'HOURS', 'MINUTES']) {
      expect(html).toContain(`aria-label="-- ${label}"`);
      expect(html).not.toMatch(new RegExp(`aria-label="\\d+ ${label}"`));
    }
  });
});
