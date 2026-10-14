import { test, expect, type Page } from '@playwright/test';
import { KUDOS_BY_N, TEST_ACCOUNTS } from './support/kudos-board-seed';
import { signInBrowser } from './support/kudos-board-db';

/**
 * F007 SC-006, SC-007 · FR-201, FR-203, FR-601, DEC-002. No writes: safe in parallel.
 * Heart contract (phase 03 KudosHeartView): the only `button[aria-pressed]` in a card,
 * showing the heart count; `disabled` for the kudos sender.
 */

/** Heart count as a whole number inside the button text (not a digit of another number). */
const countText = (n: number) => new RegExp(`(^|\\D)${n}(\\D|$)`);
const feed = (page: Page) => page.getByRole('region', { name: 'ALL KUDOS', exact: true });
const feedHeart = (page: Page, n: number) =>
  feed(page).getByRole('article').filter({ hasText: KUDOS_BY_N(n).timeLabel }).locator('button[aria-pressed]');
const slideHeart = (page: Page, index: number) =>
  page.getByRole('region', { name: 'HIGHLIGHT KUDOS', exact: true })
    .locator('[aria-roledescription="slide"]').nth(index).locator('button[aria-pressed]');

test.describe('Sun* Kudos — hearts for guests and senders', () => {
  // Guests act as Anonymous (2026-10-14): a guest's click now likes instead of going to /login.
  // It writes rows, so it lives in sun-kudos-serial-guest-hearts-and-header.spec.ts.
  test('guest sees an enabled gray heart with the count (SC-006)', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    const heart = feedHeart(page, 60);

    await expect(heart).toBeEnabled();
    await expect(heart).toHaveAttribute('aria-pressed', 'false');
    await expect(heart).toHaveText(countText(KUDOS_BY_N(60).likeCount));
  });

  test("sender's own kudos: heart disabled, count shown, click changes nothing (SC-007, FR-203)", async ({ page, context }) => {
    await signInBrowser(context, TEST_ACCOUNTS.SENDER);
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    const own = slideHeart(page, 0); // K49, sent by SENDER, Highlight slide 1
    const ownInFeed = feedHeart(page, 59); // K59, sent by SENDER

    await expect(own).toBeDisabled();
    await expect(own).toHaveAttribute('aria-pressed', 'false');
    await expect(own).toHaveText(countText(KUDOS_BY_N(49).likeCount));
    await expect(ownInFeed).toBeDisabled();
    await expect(feedHeart(page, 60)).toBeEnabled(); // someone else's kudos

    await own.click({ force: true });

    await expect(page).toHaveURL('http://localhost:3000/sun-kudos');
    await expect(own).toHaveAttribute('aria-pressed', 'false');
    await expect(own).toHaveText(countText(KUDOS_BY_N(49).likeCount));
  });
});
