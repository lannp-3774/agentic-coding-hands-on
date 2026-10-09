import { test, expect } from '@playwright/test';
import { APP_ORIGIN, armCountdownTarget, restorePrelaunchSeed } from './support/prelaunch-setting';

/**
 * FR-202 — the /countdown title follows the NEXT_LOCALE cookie, defaulting to
 * Vietnamese for no cookie or an unsupported value. The unit labels DAYS /
 * HOURS / MINUTES are English in both locales (the design shows them on the
 * Vietnamese screen too). The row is restored after each test.
 */
const VI_TITLE = 'Sự kiện sẽ bắt đầu sau';
const EN_TITLE = 'Event starts in';
const TWO_HOURS_THIRTY_MS = (2 * 60 + 30) * 60_000;

// cookie value (undefined = no cookie) -> expected title
const TITLES: [string | undefined, string][] = [
  [undefined, VI_TITLE],
  ['vi', VI_TITLE],
  ['en', EN_TITLE],
  ['ja', VI_TITLE], // unsupported locale falls back to the default
];

test.describe('prelaunch-gate — countdown language', () => {
  test.afterEach(async () => {
    await restorePrelaunchSeed();
  });

  for (const [locale, title] of TITLES) {
    test(`NEXT_LOCALE=${locale ?? '(none)'} shows "${title}" and the English unit labels`, async ({
      page,
      context,
      request,
    }) => {
      await armCountdownTarget(request, TWO_HOURS_THIRTY_MS);
      if (locale !== undefined) {
        await context.addCookies([{ name: 'NEXT_LOCALE', value: locale, url: APP_ORIGIN }]);
      }

      await page.goto('/countdown');

      await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
      await expect(page.getByRole('group', { name: '00 DAYS', exact: true })).toBeVisible();
      await expect(page.getByRole('group', { name: '02 HOURS', exact: true })).toBeVisible();
      await expect(page.getByRole('group', { name: '30 MINUTES', exact: true })).toBeVisible();
    });
  }
});
