import { test, expect, type Page } from '@playwright/test';
import { KUDOS_BY_N, TEST_ACCOUNTS } from './support/kudos-board-seed';
import { deleteLikesBy, readLikeCount, signInBrowser, signedInClient } from './support/kudos-board-db';

/**
 * F007 SC-008, SC-009, SC-010 · FR-201, FR-202, FR-401..FR-404, SM-001, DEC-002, D003.
 * Serial project: likes move shared counters; afterEach deletes VIEWER's likes (trigger restores).
 * Heart = the card's only `button[aria-pressed]`, text shows the count.
 */
const HEART_ERROR = 'Không cập nhật được tim. Vui lòng thử lại.';
const countText = (n: number) => new RegExp(`(^|\\D)${n}(\\D|$)`);
const feedHeart = (page: Page, n: number) =>
  page.getByRole('region', { name: 'ALL KUDOS', exact: true }).getByRole('article')
    .filter({ hasText: KUDOS_BY_N(n).timeLabel }).locator('button[aria-pressed]');
const slideHeart = (page: Page, index: number) =>
  page.getByRole('region', { name: 'HIGHLIGHT KUDOS', exact: true })
    .locator('[aria-roledescription="slide"]').nth(index).locator('button[aria-pressed]');

let viewerUserId = '';

test.describe('Sun* Kudos — like / unlike (serial)', () => {
  test.beforeAll(async () => {
    viewerUserId = (await signedInClient(TEST_ACCOUNTS.VIEWER)).userId;
  });

  test.beforeEach(async ({ context }) => {
    await signInBrowser(context, TEST_ACCOUNTS.VIEWER);
  });

  test.afterEach(async () => {
    await deleteLikesBy([viewerUserId]);
  });

  test('gray -> red +1, persists on reload, red -> gray -1 (SC-008, US001-1, US002-1)', async ({ page }) => {
    const base = KUDOS_BY_N(60).likeCount;
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    const heart = feedHeart(page, 60);
    await expect(heart).toHaveAttribute('aria-pressed', 'false');
    await expect(heart).toHaveText(countText(base));

    await heart.click();
    await expect(heart).toHaveAttribute('aria-pressed', 'true');
    await expect(heart).toHaveText(countText(base + 1));
    await expect.poll(() => readLikeCount(KUDOS_BY_N(60).id)).toBe(base + 1);

    await page.reload({ waitUntil: 'networkidle' });
    await expect(feedHeart(page, 60)).toHaveAttribute('aria-pressed', 'true');
    await expect(feedHeart(page, 60)).toHaveText(countText(base + 1));

    await feedHeart(page, 60).click();
    await expect(feedHeart(page, 60)).toHaveAttribute('aria-pressed', 'false');
    await expect(feedHeart(page, 60)).toHaveText(countText(base));
    await page.reload({ waitUntil: 'networkidle' });
    await expect(feedHeart(page, 60)).toHaveAttribute('aria-pressed', 'false');
    await expect(feedHeart(page, 60)).toHaveText(countText(base));
  });

  test('a failed like reverts the heart and count and shows the error toast (SC-009, FR-403)', async ({ page }) => {
    const base = KUDOS_BY_N(60).likeCount;
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    await expect(feedHeart(page, 60)).toHaveText(countText(base));
    await page.route('**/sun-kudos**', (route) =>
      route.request().method() === 'POST' && route.request().headers()['next-action'] ? route.abort() : route.fallback());

    await feedHeart(page, 60).click();

    await expect(page.getByRole('status').filter({ hasText: HEART_ERROR })).toBeVisible();
    await expect(feedHeart(page, 60)).toHaveAttribute('aria-pressed', 'false');
    await expect(feedHeart(page, 60)).toHaveText(countText(base));
    expect(await readLikeCount(KUDOS_BY_N(60).id)).toBe(base);
  });

  test('the same kudos in Highlight and All Kudos stays in sync (SC-010, FR-404)', async ({ page }) => {
    const shared = KUDOS_BY_N(52); // Highlight slide 4 and All Kudos page 1
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    await expect(page.getByRole('region', { name: 'HIGHLIGHT KUDOS', exact: true })
      .locator('[aria-roledescription="slide"]').nth(3)).toContainText(shared.timeLabel);
    await expect(slideHeart(page, 3)).toHaveAttribute('aria-pressed', 'false');

    await feedHeart(page, 52).click();

    await expect(feedHeart(page, 52)).toHaveAttribute('aria-pressed', 'true');
    await expect(slideHeart(page, 3)).toHaveAttribute('aria-pressed', 'true');
    await expect(slideHeart(page, 3)).toHaveText(countText(shared.likeCount + 1));
  });
});
