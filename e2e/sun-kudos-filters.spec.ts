import { test, expect, type Page } from '@playwright/test';
import { DEPARTMENTS, HASHTAGS, feedOrder, highlightOrder } from './support/kudos-board-seed';

/**
 * F006 SC-006, SC-007 (option lists, select, "Tất cả") · FR-301..FR-303, BR-006, DEC-005.
 * Filter contract (F006 A7/A8): two buttons aria-haspopup="listbox" in the Highlight header,
 * Hashtag first then Phòng ban (Figma B.1.1, B.1.2); open list role=listbox with
 * role=option items, "Tất cả" first; the active button shows the selected value.
 */
const highlight = (page: Page) => page.getByRole('region', { name: 'HIGHLIGHT KUDOS', exact: true });
const feed = (page: Page) => page.getByRole('region', { name: 'ALL KUDOS', exact: true });
const filterButtons = (page: Page) => highlight(page).locator('button[aria-haspopup="listbox"]');
const slides = (page: Page) => highlight(page).locator('[aria-roledescription="slide"]');
const EMPTY = 'Hiện tại chưa có Kudos nào.';

async function expectQuery(page: Page, expected: Record<string, string>) {
  await expect(page).toHaveURL((url) =>
    url.pathname === '/sun-kudos' &&
    [...url.searchParams.keys()].length === Object.keys(expected).length &&
    Object.entries(expected).every(([key, value]) => url.searchParams.get(key) === value));
}

async function openList(page: Page, index: 0 | 1) {
  await expect(filterButtons(page)).toHaveCount(2);
  await filterButtons(page).nth(index).click();
  await expect(filterButtons(page).nth(index)).toHaveAttribute('aria-expanded', 'true');
  return page.getByRole('listbox');
}

test.describe('Sun* Kudos — Hashtag and Phòng ban filters', () => {
  test('lists exactly "Tất cả" + seeded hashtags / departments; one list open at a time (SC-007, FR-301)', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    await expect(filterButtons(page)).toHaveCount(2);
    await expect(filterButtons(page).nth(0)).toHaveText('Hashtag');
    await expect(filterButtons(page).nth(1)).toHaveText('Phòng ban');

    const hashtagList = await openList(page, 0);
    await expect(hashtagList.getByRole('option')).toHaveText(['Tất cả', ...HASHTAGS.map((h) => h.label)]);

    const departmentList = await openList(page, 1);
    await expect(page.getByRole('listbox')).toHaveCount(1);
    await expect(departmentList.getByRole('option')).toHaveText(['Tất cả', ...DEPARTMENTS]);

    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(filterButtons(page).nth(1)).toHaveAttribute('aria-expanded', 'false');
  });

  test('choosing a hashtag sets ?hashtag, resets the carousel to 1/n and narrows both blocks (SC-006, SC-007, DEC-005)', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    await expect(highlight(page).getByText('1/5', { exact: true })).toBeVisible();
    await highlight(page).getByRole('button', { name: /sau/i }).click();
    await expect(highlight(page).getByText('2/5', { exact: true })).toBeVisible();

    const list = await openList(page, 0);
    await list.getByRole('option', { name: 'Dedicated', exact: true }).click();

    await expectQuery(page, { hashtag: 'dedicated' });
    await expect(filterButtons(page).nth(0)).toContainText('Dedicated');
    await expect(highlight(page).getByText('1/5', { exact: true })).toBeVisible();
    const top = highlightOrder({ hashtag: 'dedicated' });
    await expect(slides(page)).toHaveCount(top.length);
    await expect(slides(page).nth(0)).toContainText(top[0].timeLabel);
    const rows = feedOrder({ hashtag: 'dedicated' });
    await expect(feed(page).getByRole('article')).toHaveCount(10);
    await expect(feed(page).getByRole('article').first()).toContainText(rows[0].timeLabel);
    await expect(feed(page).getByText(feedOrder()[0].timeLabel)).toHaveCount(0);
  });

  test('choosing a department filters by the RECEIVER department (SC-007, BR-006)', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });

    const list = await openList(page, 1);
    await list.getByRole('option', { name: 'CEVC10', exact: true }).click();

    await expectQuery(page, { department: 'CEVC10' });
    await expect(filterButtons(page).nth(1)).toContainText('CEVC10');
    const rows = feedOrder({ department: 'CEVC10' });
    await expect(feed(page).getByRole('article')).toHaveCount(rows.length);
    for (const [i, row] of rows.entries()) {
      await expect(feed(page).getByRole('article').nth(i)).toContainText(row.timeLabel);
    }
  });

  test('"Tất cả" removes only that key and keeps the other filter (SC-007, DEC-005)', async ({ page }) => {
    await page.goto('/sun-kudos?hashtag=problem-solver&department=CEVC10', { waitUntil: 'networkidle' });
    await expect(highlight(page).getByText('1/2', { exact: true })).toBeVisible();

    const list = await openList(page, 0);
    await list.getByRole('option', { name: 'Tất cả', exact: true }).click();

    await expectQuery(page, { department: 'CEVC10' });
    await expect(filterButtons(page).nth(0)).toHaveText('Hashtag');
    await expect(highlight(page).getByText('1/5', { exact: true })).toBeVisible();
    await expect(feed(page).getByRole('article')).toHaveCount(feedOrder({ department: 'CEVC10' }).length);
  });

  test('a filter with no match shows the empty message in Highlight AND All Kudos (SC-006, DEC-001, DEC-003)', async ({ page }) => {
    expect(feedOrder({ hashtag: 'idol-gioi-tre', department: 'CEVC10' })).toHaveLength(0);

    await page.goto('/sun-kudos?hashtag=idol-gioi-tre&department=CEVC10', { waitUntil: 'networkidle' });

    await expect(highlight(page).getByText(EMPTY, { exact: true })).toBeVisible();
    await expect(feed(page).getByText(EMPTY, { exact: true })).toBeVisible();
    await expect(slides(page)).toHaveCount(0);
    await expect(feed(page).getByRole('article')).toHaveCount(0);
  });
});
