import { test, expect, type Page } from '@playwright/test';
import { KUDOS_BY_N, feedOrder, highlightOrder } from './support/kudos-board-seed';

/**
 * F006 SC-007 (chips, title tag, URL values) · FR-304, FR-305, BR-006, DEC-005, D014, US004.
 * Hashtag chips and a matching title tag are links that set ?hashtag and keep ?department.
 */
const highlight = (page: Page) => page.getByRole('region', { name: 'HIGHLIGHT KUDOS', exact: true });
const feed = (page: Page) => page.getByRole('region', { name: 'ALL KUDOS', exact: true });
const feedCard = (page: Page, n: number) =>
  feed(page).getByRole('article').filter({ hasText: KUDOS_BY_N(n).timeLabel });
const slides = (page: Page) => highlight(page).locator('[aria-roledescription="slide"]');
const EMPTY = 'Hiện tại chưa có Kudos nào.';

async function expectQuery(page: Page, expected: Record<string, string>) {
  await expect(page).toHaveURL((url) =>
    url.pathname === '/sun-kudos' &&
    [...url.searchParams.keys()].length === Object.keys(expected).length &&
    Object.entries(expected).every(([key, value]) => url.searchParams.get(key) === value));
}

test.describe('Sun* Kudos — hashtag chips, title tag and URL filter values', () => {
  test('clicking a hashtag chip sets ?hashtag and keeps ?department (US004-1, DEC-005)', async ({ page }) => {
    await page.goto('/sun-kudos?department=CEVC10', { waitUntil: 'networkidle' });

    const chip = feedCard(page, 56).getByRole('link', { name: 'Problem Solver' });
    await expect(chip).toBeVisible();
    await chip.click();

    await expectQuery(page, { department: 'CEVC10', hashtag: 'problem-solver' });
    const rows = feedOrder({ department: 'CEVC10', hashtag: 'problem-solver' });
    await expect(feed(page).getByRole('article')).toHaveCount(rows.length);
    await expect(highlight(page).getByText(`1/${rows.length}`, { exact: true })).toBeVisible();
    await expect(slides(page).nth(0)).toContainText(highlightOrder({ department: 'CEVC10', hashtag: 'problem-solver' })[0].timeLabel);
  });

  test('a matching title tag is a link that sets the hashtag filter (SC-007, D014)', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    const titled = KUDOS_BY_N(49);
    await expect(slides(page).nth(0)).toContainText(titled.timeLabel);

    await slides(page).nth(0).getByRole('link', { name: 'IDOL GIỚI TRẺ' }).click();

    await expectQuery(page, { hashtag: 'idol-gioi-tre' });
    const rows = feedOrder({ hashtag: 'idol-gioi-tre' });
    await expect(feed(page).getByRole('article')).toHaveCount(rows.length);
    await expect(feed(page).getByRole('article').first()).toContainText(rows[0].timeLabel);
  });

  test('a title with no matching hashtag is plain, non-focusable text (SC-007, DEC-005)', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    const card = feedCard(page, 54);

    await expect(card.getByText('NGƯỜI TRUYỀN LỬA', { exact: true })).toBeVisible();
    await expect(card.getByRole('link', { name: 'NGƯỜI TRUYỀN LỬA' })).toHaveCount(0);
  });

  test('a malformed ?hashtag is ignored: page renders unfiltered (SC-007, US004-2)', async ({ page }) => {
    await page.goto('/sun-kudos?hashtag=Bad%20Value!', { waitUntil: 'networkidle' });

    await expect(highlight(page).getByText('1/5', { exact: true })).toBeVisible();
    await expect(slides(page).nth(0)).toContainText(highlightOrder()[0].timeLabel);
    await expect(feed(page).getByRole('article')).toHaveCount(10);
    await expect(feed(page).getByRole('article').first()).toContainText(feedOrder()[0].timeLabel);
  });

  test('a well-formed but unknown ?hashtag gives the empty message in both blocks (SC-007, BR-006)', async ({ page }) => {
    await page.goto('/sun-kudos?hashtag=khong-ton-tai', { waitUntil: 'networkidle' });

    await expect(highlight(page).getByText(EMPTY, { exact: true })).toBeVisible();
    await expect(feed(page).getByText(EMPTY, { exact: true })).toBeVisible();
  });
});
