import { test, expect, type Page } from '@playwright/test';
import { KUDOS, KUDOS_BY_N, KUDOS_TOTAL, SUNNERS, TEST_ACCOUNTS, feedOrder } from './support/kudos-board-seed';
import { countRows, signInBrowser, useEnglish } from './support/kudos-board-db';

/**
 * F008 SC-001, SC-002, SC-004, SC-009, SC-010, SC-012 · BR-002..BR-005, BR-008, FR-409.
 * Spotlight contract (F008 A1/A6/A7): region "SPOTLIGHT BOARD"; label "{n} KUDOS"; the board is
 * the region's role=group; one <a> per kudos named by the receiver; one shared role=tooltip.
 */
const spotlight = (page: Page) => page.getByRole('region', { name: 'SPOTLIGHT BOARD', exact: true });
const board = (page: Page) => spotlight(page).getByRole('group');
const nodes = (page: Page) => board(page).getByRole('link');
const TICKER_SUFFIX = 'đã nhận được một Kudos mới';

test.describe('Sun* Kudos — Spotlight board', () => {
  test('title, real total and one node per kudos named by its receiver (SC-001, BR-002, BR-004)', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });

    await expect(spotlight(page).getByRole('heading', { name: 'SPOTLIGHT BOARD', exact: true })).toBeVisible();
    await expect(spotlight(page).getByText(`${KUDOS_TOTAL} KUDOS`, { exact: true })).toBeVisible();
    await expect(nodes(page)).toHaveCount(Math.min(KUDOS_TOTAL, 300));
    const chucNodes = KUDOS.filter((r) => r.receiverId === SUNNERS.CHUC.id).length;
    await expect(board(page).getByRole('link', { name: SUNNERS.CHUC.name, exact: true })).toHaveCount(chucNodes);
    await expect(board(page).getByRole('link', { name: SUNNERS.XUAN.name, exact: true })).toHaveCount(1);
    expect(await countRows('kudos')).toBe(KUDOS_TOTAL);
  });

  test('layout is deterministic: a node keeps its position across reloads (SC-002, ALG-001)', async ({ page }) => {
    const offsetOfXuan = async () => {
      await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
      const node = board(page).getByRole('link', { name: SUNNERS.XUAN.name, exact: true });
      await expect(node).toHaveCount(1);
      await node.scrollIntoViewIfNeeded();
      const [n, b] = [await node.boundingBox(), await board(page).boundingBox()];
      expect(n).not.toBeNull();
      expect(b).not.toBeNull();
      return { x: n!.x - b!.x, y: n!.y - b!.y };
    };

    const first = await offsetOfXuan();
    const second = await offsetOfXuan();

    expect(Math.abs(first.x - second.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(first.y - second.y)).toBeLessThanOrEqual(1);
  });

  test('ticker: 5 newest kudos, newest on top, `hh:mmAM/PM` + receiver + sentence (SC-004, US006)', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    const lines = spotlight(page).getByText(new RegExp(TICKER_SUFFIX));

    await expect(lines).toHaveCount(5);
    await expect(lines.nth(0)).toHaveText(new RegExp(`08:30PM\\s*${SUNNERS.CHUC.name}\\s*${TICKER_SUFFIX}`));
    const newestFive = feedOrder().slice(0, 5);
    const nameOf = (id: string) => Object.values(SUNNERS).find((s) => s.id === id)!.name;
    for (const [i, row] of newestFive.entries()) {
      await expect(lines.nth(i)).toContainText(nameOf(row.receiverId));
    }
    await expect(lines.nth(1)).toContainText('09:00AM');
  });

  test('hover shows one tooltip with receiver + `HH:mm - MM/DD/YYYY`, hidden on leave (SC-009, US002)', async ({ page, context }) => {
    await signInBrowser(context, TEST_ACCOUNTS.VIEWER);
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    const node = board(page).locator(`a[href="/sun-kudos/${KUDOS_BY_N(55).id}"]`);
    await expect(node).toHaveCount(1);
    await node.scrollIntoViewIfNeeded();

    await node.hover();
    const tooltip = page.getByRole('tooltip').filter({ hasText: SUNNERS.TRANG.name });
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText(SUNNERS.TRANG.name);
    await expect(tooltip).toContainText('10:00 - 10/30/2025');

    await page.mouse.move(0, 0);
    await expect(tooltip).toBeHidden();
  });

  test('signed-in: each node links to its own kudos detail (SC-010, BR-008)', async ({ page, context }) => {
    await signInBrowser(context, TEST_ACCOUNTS.VIEWER);
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    await expect(nodes(page)).toHaveCount(KUDOS_TOTAL);

    const hrefs = await nodes(page).evaluateAll((els) => els.map((el) => el.getAttribute('href')));

    expect(new Set(hrefs)).toEqual(new Set(KUDOS.map((r) => `/sun-kudos/${r.id}`)));
  });

  test('guest: every node links to /login and clicking lands there (SC-010, US003-1)', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    await expect(nodes(page)).toHaveCount(KUDOS_TOTAL);

    const hrefs = await nodes(page).evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    expect(new Set(hrefs)).toEqual(new Set(['/login']));

    await board(page).getByRole('link', { name: SUNNERS.XUAN.name, exact: true }).click();
    await expect(page).toHaveURL('http://localhost:3000/login');
  });

  test('EN translates labels and placeholder, receiver names stay as written (SC-012, FR-409)', async ({ page, context }) => {
    await useEnglish(context);
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });

    await expect(spotlight(page).getByText(`${KUDOS_TOTAL} KUDOS`, { exact: true })).toBeVisible();
    await expect(board(page).getByRole('link', { name: SUNNERS.XUAN.name, exact: true })).toHaveCount(1);
    await expect(spotlight(page).getByRole('textbox')).toBeVisible();
    await expect(spotlight(page).getByPlaceholder('Tìm kiếm', { exact: true })).toHaveCount(0);
    await expect(spotlight(page).getByText(TICKER_SUFFIX)).toHaveCount(0);
  });
});
