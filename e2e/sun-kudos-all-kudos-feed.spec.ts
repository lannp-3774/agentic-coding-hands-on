import { test, expect, type Page } from '@playwright/test';
import { KUDOS_PAGE_SIZE, KUDOS_TOTAL, feedOrder } from './support/kudos-board-seed';

/**
 * F006 SC-005 · FR-209, FR-210, FR-215, BR-005, DEC-003, DEC-004, US003.
 * All Kudos: newest seq first, PAGE_SIZE 10, sentinel-driven load of GET /api/kudos,
 * no duplicate ids, silent stop at the end, "Không tải thêm được Kudos." + "Thử lại" on error.
 */
const feed = (page: Page) => page.getByRole('region', { name: 'ALL KUDOS', exact: true });
const cards = (page: Page) => feed(page).getByRole('article');
const ORDER = feedOrder();
const LOAD_MORE_ERROR = 'Không tải thêm được Kudos.';

/** Scroll the last loaded card into view so the sentinel below it intersects. */
async function scrollToListEnd(page: Page) {
  await cards(page).last().scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 600);
}

async function expectCardsInOrder(page: Page, upTo: number) {
  await expect(cards(page)).toHaveCount(upTo);
  for (const i of [0, KUDOS_PAGE_SIZE - 1, upTo - 1]) {
    await expect(cards(page).nth(i)).toContainText(ORDER[i].timeLabel);
  }
}

test.describe('Sun* Kudos — All Kudos feed', () => {
  test('first page: 10 cards, newest seq first (SC-005, BR-005)', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });

    await expect(feed(page).getByRole('heading', { name: 'ALL KUDOS', exact: true })).toBeVisible();
    await expectCardsInOrder(page, KUDOS_PAGE_SIZE);
  });

  test('scrolling to the sentinel appends exactly the next 10 older cards (SC-005, US003-1)', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    await expect(cards(page)).toHaveCount(KUDOS_PAGE_SIZE);
    const nextPage = page.waitForResponse((r) => r.url().includes('/api/kudos') && r.request().method() === 'GET');

    await scrollToListEnd(page);

    const response = await nextPage;
    expect(response.status()).toBe(200);
    expect(new URL(response.url()).searchParams.get('cursor')).toMatch(/^[1-9][0-9]*$/);
    await expectCardsInOrder(page, 2 * KUDOS_PAGE_SIZE);
    for (const row of ORDER.slice(0, 2 * KUDOS_PAGE_SIZE)) {
      await expect(cards(page).filter({ hasText: row.timeLabel })).toHaveCount(1);
    }
  });

  test('stops silently after the last page, no duplicates and no extra request (SC-005, DEC-004)', async ({ page }) => {
    const apiCalls: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('/api/kudos')) apiCalls.push(r.url());
    });
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    await expect(cards(page)).toHaveCount(KUDOS_PAGE_SIZE);

    const pages = Math.ceil(KUDOS_TOTAL / KUDOS_PAGE_SIZE);
    for (let loaded = 2; loaded <= pages; loaded++) {
      await scrollToListEnd(page);
      await expect(cards(page)).toHaveCount(Math.min(loaded * KUDOS_PAGE_SIZE, KUDOS_TOTAL));
    }
    await scrollToListEnd(page);
    await page.waitForLoadState('networkidle');

    await expectCardsInOrder(page, KUDOS_TOTAL);
    expect(apiCalls).toHaveLength(pages - 1);
    await expect(feed(page).getByText(LOAD_MORE_ERROR, { exact: true })).toHaveCount(0);
  });

  test('load-more failure keeps loaded cards and offers "Thử lại" that recovers (SC-005, US003-2)', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    await expect(cards(page)).toHaveCount(KUDOS_PAGE_SIZE);
    await page.route('**/api/kudos**', (route) => route.fulfill({ status: 500, body: '{"error":"boom"}' }));

    await scrollToListEnd(page);

    await expect(feed(page).getByText(LOAD_MORE_ERROR, { exact: true })).toBeVisible();
    const retry = feed(page).getByRole('button', { name: 'Thử lại', exact: true });
    await expect(retry).toBeVisible();
    await expect(cards(page)).toHaveCount(KUDOS_PAGE_SIZE);
    await expect(cards(page).first()).toContainText(ORDER[0].timeLabel);

    await page.unroute('**/api/kudos**');
    await retry.click();

    await expectCardsInOrder(page, 2 * KUDOS_PAGE_SIZE);
    await expect(feed(page).getByText(LOAD_MORE_ERROR, { exact: true })).toHaveCount(0);
  });
});
