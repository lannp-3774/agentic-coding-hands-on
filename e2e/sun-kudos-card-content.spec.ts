import { test, expect, type Page } from '@playwright/test';
import { HASHTAGS, KUDOS_BY_N, RICH_BODY, SUNNERS } from './support/kudos-board-seed';

/**
 * F006 SC-008 · FR-207, FR-211..FR-214, BR-003, BR-007, BR-008.
 * Card: sender + receiver blocks (name, department, stars, hero label), time
 * `HH:mm - MM/DD/YYYY` in Asia/Ho_Chi_Minh, title tag, body clamped 3 (Highlight) / 5
 * (All Kudos) lines, ≤5 hashtags, ≤5 square images (All Kudos only, open in a new tab).
 */
const highlight = (page: Page) => page.getByRole('region', { name: 'HIGHLIGHT KUDOS', exact: true });
const feed = (page: Page) => page.getByRole('region', { name: 'ALL KUDOS', exact: true });
const feedCard = (page: Page, n: number) =>
  feed(page).getByRole('article').filter({ hasText: KUDOS_BY_N(n).timeLabel });
const STAR_TOOLTIP_3 =
  'Sunner đã nhận được 50 Kudos và trở thành hình mẫu của sự công nhận, sẻ chia và lan tỏa tinh thần Sun*.';
const GALLERY_FIRST_FIVE = [1, 2, 3, 4, 5].map((n) => `/sun-kudos/gallery/gallery-0${n}.png`);

test.describe('Sun* Kudos — card content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
  });

  test('sender and receiver blocks show name + department, time in VN time (SC-008, BR-008)', async ({ page }) => {
    const card = feedCard(page, 55);

    await expect(card.getByText(SUNNERS.VIEWER.name, { exact: true })).toBeVisible();
    await expect(card.getByText(SUNNERS.VIEWER.department, { exact: true })).toBeVisible();
    await expect(card.getByText(SUNNERS.TRANG.name, { exact: true })).toBeVisible();
    await expect(card.getByText(SUNNERS.TRANG.department, { exact: true })).toBeVisible();
    await expect(card.getByText('10:00 - 10/30/2025', { exact: true })).toBeVisible();
    await expect(highlight(page).locator('[aria-roledescription="slide"]').nth(0))
      .toContainText('09:00 - 10/25/2025');
  });

  test('hero tier: 50 received = Legend Hero with the 3-star tooltip, 0-9 = New Hero (SC-008, BR-003)', async ({ page }) => {
    const card = feedCard(page, 60);

    await expect(card.getByText('Legend Hero', { exact: true })).toHaveCount(1);
    await expect(card.getByText('New Hero', { exact: true })).toHaveCount(1);
    await expect(card.getByText(STAR_TOOLTIP_3, { exact: true })).toBeAttached();
  });

  test('All Kudos body clamps at 5 lines, Highlight body at 3 lines (SC-008, BR-007)', async ({ page }) => {
    const firstLine = RICH_BODY.split('\n')[0];
    await expect(feedCard(page, 54).getByText(firstLine)).toHaveCSS('-webkit-line-clamp', '5');

    const slideBody = highlight(page).locator('[aria-roledescription="slide"]').nth(0)
      .getByText(KUDOS_BY_N(49).body);
    await expect(slideBody).toHaveCSS('-webkit-line-clamp', '3');
  });

  test('a kudos with 7 hashtags shows the first 5 by sort order (SC-008, BR-007)', async ({ page }) => {
    const chips = feedCard(page, 54).locator('a[href*="hashtag="]');

    await expect(chips).toHaveCount(5);
    const expected = HASHTAGS.slice(0, 5).map((h) => h.slug);
    const hrefs = await chips.evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''));
    expect(hrefs.map((href) => new URL(href, 'http://localhost:3000').searchParams.get('hashtag'))).toEqual(expected);
  });

  test('a kudos with 6 images shows 5 links to the originals, opening in a new tab (SC-008, D017)', async ({ page, context }) => {
    const card = feedCard(page, 54);
    const images = card.locator('a[target="_blank"]').filter({ has: page.locator('img') });

    await expect(images).toHaveCount(5);
    const hrefs = await images.evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    expect(hrefs).toEqual(GALLERY_FIRST_FIVE);
    await expect(images.first()).toHaveAttribute('rel', /noopener/);

    const [tab] = await Promise.all([context.waitForEvent('page'), images.first().click()]);
    await tab.waitForLoadState();
    expect(tab.url()).toBe(`http://localhost:3000${GALLERY_FIRST_FIVE[0]}`);
    await tab.close();
  });

  test('Highlight cards carry no attached images (SC-008, BR-007)', async ({ page }) => {
    const slides = highlight(page).locator('[aria-roledescription="slide"]');
    await expect(slides).toHaveCount(5);

    await expect(highlight(page).locator('img[src*="gallery"], a[href*="/sun-kudos/gallery/"]')).toHaveCount(0);
  });
});
