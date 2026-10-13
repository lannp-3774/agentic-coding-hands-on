import { test, expect, type Page } from '@playwright/test';
import { GIFT_LIST, TEST_ACCOUNTS, VIEWER_STATS } from './support/kudos-board-seed';
import { signInBrowser, useEnglish } from './support/kudos-board-db';

/**
 * F009 SC-001, SC-002, SC-004, SC-005, SC-007, SC-009 · FR-102, FR-201..FR-215, BR-001..BR-003.
 * Sidebar = the page <aside>: D.1 personal stats (or guest login prompt), then D.3 gift list.
 */
const sidebar = (page: Page) => page.getByRole('complementary');
const LOGIN_PROMPT = 'Đăng nhập để xem thống kê Kudos của bạn';
const GIFT_TITLE = '10 SUNNER NHẬN QUÀ MỚI NHẤT';
const LABELS = ['Số Kudos bạn nhận được:', 'Số Kudos bạn đã gửi:', 'Số tim bạn nhận được:',
  'Số Secret Box bạn đã mở:', 'Số Secret Box chưa mở:'];
const giftRows = (page: Page) => sidebar(page).getByRole('link').filter({ hasText: 'Nhận được 1' });

/** "label value label value ..." in FR-201 order. */
const statsPattern = (values: (number | string)[]) =>
  new RegExp(LABELS.map((label, i) => `${label}\\s*${values[i]}`).join('\\s*'));

test.describe('Sun* Kudos — personal sidebar', () => {
  test('guest: login prompt with "Đăng nhập" -> /login instead of stats and "Mở Secret Box" (SC-001)', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });

    await expect(sidebar(page).getByText(LOGIN_PROMPT, { exact: true })).toBeVisible();
    const login = sidebar(page).getByRole('link', { name: 'Đăng nhập', exact: true });
    await expect(login).toHaveAttribute('href', '/login');
    await expect(sidebar(page).getByText(LABELS[0])).toHaveCount(0);
    await expect(sidebar(page).getByRole('button', { name: 'Mở Secret Box' })).toHaveCount(0);

    await login.click();
    await expect(page).toHaveURL('http://localhost:3000/login');
  });

  test('signed-in: five values match the seed, "Mở Secret Box" does nothing (SC-002, US001)', async ({ page, context }) => {
    await signInBrowser(context, TEST_ACCOUNTS.VIEWER);
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    const s = VIEWER_STATS;
    const expected = statsPattern([s.received, s.sent, s.hearts, s.boxesOpened, s.boxesUnopened]);

    await expect(sidebar(page)).toContainText(expected);
    await sidebar(page).getByRole('button', { name: 'Mở Secret Box', exact: true }).click();

    await expect(page).toHaveURL('http://localhost:3000/sun-kudos');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(sidebar(page)).toContainText(expected);
  });

  test('signed-in: the guest login prompt never appears while the session loads (SC-004, FR-208)', async ({ page, context }) => {
    await signInBrowser(context, TEST_ACCOUNTS.VIEWER);
    await page.addInitScript((prompt) => {
      const w = window as unknown as { __promptSeen: boolean };
      w.__promptSeen = false;
      new MutationObserver(() => {
        if (document.body?.innerText.includes(prompt)) w.__promptSeen = true;
      }).observe(document, { childList: true, subtree: true, characterData: true });
    }, LOGIN_PROMPT);

    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });

    await expect(sidebar(page).getByText(LABELS[0])).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __promptSeen: boolean }).__promptSeen)).toBe(false);
  });

  test('gift list: 10 latest opened boxes, newest first, one row per box (SC-005, BR-003)', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });

    await expect(sidebar(page).getByText(GIFT_TITLE, { exact: true })).toBeVisible();
    await expect(giftRows(page)).toHaveCount(10);
    for (const [i, box] of GIFT_LIST.entries()) {
      await expect(giftRows(page).nth(i)).toContainText(box.ownerName);
      await expect(giftRows(page).nth(i)).toContainText(`Nhận được 1 ${box.gift}`);
    }
  });

  test('gift rows: signed-in -> /profiles/<id>, guest -> /login (SC-007, FR-102)', async ({ browser }) => {
    const member = await browser.newContext();
    await signInBrowser(member, TEST_ACCOUNTS.VIEWER);
    const memberPage = await member.newPage();
    await memberPage.goto('http://localhost:3000/sun-kudos', { waitUntil: 'networkidle' });
    await expect(giftRows(memberPage)).toHaveCount(10);
    const memberHrefs = await giftRows(memberPage).evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    expect(memberHrefs).toEqual(GIFT_LIST.map((b) => `/profiles/${b.ownerId}`));
    await giftRows(memberPage).nth(0).click();
    await expect(memberPage).toHaveURL(`http://localhost:3000/profiles/${GIFT_LIST[0].ownerId}`);
    await member.close();

    const guest = await browser.newContext();
    const guestPage = await guest.newPage();
    await guestPage.goto('http://localhost:3000/sun-kudos', { waitUntil: 'networkidle' });
    await expect(giftRows(guestPage)).toHaveCount(10);
    const guestHrefs = await giftRows(guestPage).evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    expect(new Set(guestHrefs)).toEqual(new Set(['/login']));
    await giftRows(guestPage).nth(0).click();
    await expect(guestPage).toHaveURL('http://localhost:3000/login');
    await guest.close();
  });

  test('EN translates the labels; Sunner and gift names stay as stored (SC-009, FR-214, FR-215)', async ({ page, context }) => {
    await signInBrowser(context, TEST_ACCOUNTS.VIEWER);
    await useEnglish(context);
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });

    const firstRow = sidebar(page).getByRole('link').filter({ hasText: GIFT_LIST[0].ownerName }).first();
    await expect(firstRow).toContainText(GIFT_LIST[0].gift);
    for (const label of LABELS) await expect(sidebar(page).getByText(label)).toHaveCount(0);
    await expect(sidebar(page).getByText(GIFT_TITLE, { exact: true })).toHaveCount(0);
  });
});
