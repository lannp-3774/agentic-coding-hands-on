import { test, expect, type Locator, type Page } from '@playwright/test';
import { KUDOS, SUNNERS } from './support/kudos-board-seed';

/**
 * F008 SC-005..SC-008, SC-010 (drag) · FR-204, FR-205, FR-403..FR-407, BR-006, BR-007,
 * ALG-002, ALG-003, SM-001, DEC-002. Matched nodes keep full opacity, others are dimmed;
 * errors show as role=alert inside the Spotlight region; Pan/Zoom is `<button aria-pressed>`;
 * one container holds every node and carries `transform: translate(x,y) scale(k)`.
 */
const spotlight = (page: Page) => page.getByRole('region', { name: 'SPOTLIGHT BOARD', exact: true });
const board = (page: Page) => spotlight(page).getByRole('group');
const node = (page: Page, name: string) => board(page).getByRole('link', { name, exact: true });
const searchBox = (page: Page) => spotlight(page).getByPlaceholder('Tìm kiếm', { exact: true });
const panZoom = (page: Page) => spotlight(page).getByRole('button', { name: 'Pan/Zoom', exact: true });
/** ALG-002 fold (NFD, drop marks, đ -> d, lower case), used to count the seed nodes a query must match. */
const fold = (v: string) => v.normalize('NFD').replace(/\p{M}/gu, '').replace(/[đĐ]/g, 'd').toLowerCase();
const nameOf = (id: string) => Object.values(SUNNERS).find((s) => s.id === id)!.name;
const NGUYEN_NODES = KUDOS.filter((r) => fold(nameOf(r.receiverId)).includes('nguyen')).length;

const opacityOf = (locator: Locator) => locator.evaluate((el) => Number(getComputedStyle(el).opacity));

/** {x, y, k} of the lowest common ancestor of all nodes (the pan/zoom container). */
async function boardTransform(page: Page) {
  return board(page).evaluate((group) => {
    const links = group.querySelectorAll('a');
    let container = links[0].parentElement!;
    while (!container.contains(links[links.length - 1])) container = container.parentElement!;
    const value = getComputedStyle(container).transform;
    const m = value === 'none' ? [1, 0, 0, 1, 0, 0] : value.slice(7, -1).split(',').map(Number);
    return { x: m[4], y: m[5], k: m[0] };
  });
}

async function openBoard(page: Page) {
  await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
  await expect(board(page).getByRole('link')).toHaveCount(KUDOS.length);
  await board(page).scrollIntoViewIfNeeded();
}

async function centreOf(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
}

test.describe('Sun* Kudos — Spotlight search', () => {
  test('match highlights, others dim; diacritic-free query matches; clearing restores (SC-005, SC-006)', async ({ page }) => {
    await openBoard(page);

    await searchBox(page).fill('nguyen');
    await searchBox(page).press('Enter');

    await expect.poll(() => opacityOf(node(page, SUNNERS.XUAN.name))).toBeLessThan(1);
    expect(await opacityOf(node(page, SUNNERS.CHUC.name).first())).toBe(1); // every Chức node shares one style
    await expect(spotlight(page).getByText(`${NGUYEN_NODES} kết quả`, { exact: true })).toBeAttached();

    await searchBox(page).fill('');
    await expect.poll(() => opacityOf(node(page, SUNNERS.XUAN.name))).toBe(1);
  });

  test('101 chars rejected, 100 accepted, empty search blocked with its own message (SC-005, BR-006)', async ({ page }) => {
    await openBoard(page);
    await searchBox(page).fill('Nguyễn');
    await searchBox(page).press('Enter');
    await expect.poll(() => opacityOf(node(page, SUNNERS.XUAN.name))).toBeLessThan(1);

    await searchBox(page).fill('a'.repeat(101));
    await expect(searchBox(page)).toHaveValue('a'.repeat(101));
    await searchBox(page).press('Enter');
    const tooLong = spotlight(page).getByRole('alert').filter({ hasNotText: 'Không tìm thấy' });
    await expect(tooLong).toBeVisible();
    const tooLongText = (await tooLong.innerText()).trim();
    expect(tooLongText.length).toBeGreaterThan(0);
    expect(await opacityOf(node(page, SUNNERS.XUAN.name))).toBeLessThan(1); // highlight unchanged

    await searchBox(page).fill('a'.repeat(100));
    await searchBox(page).press('Enter');
    await expect(spotlight(page).getByText(tooLongText, { exact: true })).toHaveCount(0);
    await expect(spotlight(page).getByText('Không tìm thấy', { exact: true })).toBeVisible();

    await searchBox(page).fill('');
    await spotlight(page).getByRole('button', { name: /tìm kiếm/i }).click();
    const required = spotlight(page).getByRole('alert').filter({ hasNotText: 'Không tìm thấy' });
    await expect(required).toBeVisible();
    expect((await required.innerText()).trim()).not.toBe(tooLongText);
    expect((await required.innerText()).trim().length).toBeGreaterThan(0);
  });

  test('no match: "Không tìm thấy" and every node stays normal (DEC-002, D006)', async ({ page }) => {
    await openBoard(page);

    await searchBox(page).fill('zzzz');
    await searchBox(page).press('Enter');

    await expect(spotlight(page).getByText('Không tìm thấy', { exact: true })).toBeVisible();
    expect(await opacityOf(node(page, SUNNERS.XUAN.name))).toBe(1);
  });
});

test.describe('Sun* Kudos — Spotlight Pan/Zoom', () => {
  test('off by default: wheel scrolls the page and leaves the board alone (SC-007, BR-007)', async ({ page }) => {
    await openBoard(page);
    await expect(panZoom(page)).toHaveAttribute('aria-pressed', 'false');
    const before = await boardTransform(page);
    const scrollBefore = await page.evaluate(() => window.scrollY);

    const c = await centreOf(board(page));
    await page.mouse.move(c.x, c.y);
    await page.mouse.wheel(0, 400);

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollBefore);
    expect(await boardTransform(page)).toEqual(before);
  });

  test('on: drag pans, wheel zooms clamped to [0.5, 4]; off again freezes the board (SC-007, ALG-003)', async ({ page }) => {
    await openBoard(page);
    await panZoom(page).click();
    await expect(panZoom(page)).toHaveAttribute('aria-pressed', 'true');
    const start = await boardTransform(page);
    let c = await centreOf(board(page));

    await page.mouse.move(c.x, c.y);
    await page.mouse.down();
    await page.mouse.move(c.x + 100, c.y, { steps: 10 });
    await page.mouse.up();
    await expect.poll(async () => (await boardTransform(page)).x - start.x).toBeGreaterThan(50);

    c = await centreOf(board(page));
    await page.mouse.move(c.x, c.y);
    for (let i = 0; i < 30; i++) await page.mouse.wheel(0, -500);
    await expect.poll(async () => (await boardTransform(page)).k).toBeCloseTo(4, 2);
    for (let i = 0; i < 40; i++) await page.mouse.wheel(0, 500);
    await expect.poll(async () => (await boardTransform(page)).k).toBeCloseTo(0.5, 2);

    await panZoom(page).click();
    await expect(panZoom(page)).toHaveAttribute('aria-pressed', 'false');
    const frozen = await boardTransform(page);
    c = await centreOf(board(page));
    await page.mouse.move(c.x, c.y);
    await page.mouse.wheel(0, -500);
    expect(await boardTransform(page)).toEqual(frozen);
  });

  test('keyboard: nodes reachable by focus and kept in view; arrows and +/- move the board (SC-008, FR-407)', async ({ page }) => {
    await openBoard(page);
    const target = node(page, SUNNERS.XUAN.name);

    await target.focus();
    await expect(target).toBeFocused();
    await expect(target).toBeInViewport();

    await panZoom(page).click();
    await target.focus();
    const before = await boardTransform(page);
    await page.keyboard.press('+');
    await expect.poll(async () => (await boardTransform(page)).k).toBeGreaterThan(before.k);
    const zoomed = await boardTransform(page);
    await page.keyboard.press('ArrowRight');
    await expect.poll(async () => (await boardTransform(page)).x).not.toBe(zoomed.x);
  });

  test('dragging from a node and releasing on it does not navigate (SC-010)', async ({ page }) => {
    await openBoard(page);
    await panZoom(page).click();
    const c = await centreOf(node(page, SUNNERS.XUAN.name));

    await page.mouse.move(c.x, c.y);
    await page.mouse.down();
    await page.mouse.move(c.x + 60, c.y + 20, { steps: 8 });
    await page.mouse.move(c.x, c.y, { steps: 8 });
    await page.mouse.up();

    await expect(page).toHaveURL('http://localhost:3000/sun-kudos');
  });
});
