import { test, expect, type Page } from '@playwright/test';
import { KUDOS_BY_N, SUNNERS, TEST_ACCOUNTS } from './support/kudos-board-seed';
import { signInBrowser, useEnglish } from './support/kudos-board-db';

/**
 * F006 SC-001, SC-002, SC-014 · US001 — page shell of /sun-kudos.
 * Screen contract used across the sun-kudos specs: each block is a labelled region
 * (`<section aria-labelledby>` -> role=region named by its title heading), kudos cards
 * are `<article>`, the sidebar is the page's `<aside>` (role=complementary).
 */
const URL = 'http://localhost:3000/sun-kudos';
const SEND_PLACEHOLDER = 'Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?';
const BANNER_TITLE = 'Hệ thống ghi nhận và cảm ơn';
const region = (page: Page, name: string) => page.getByRole('region', { name, exact: true });
const newest = KUDOS_BY_N(60);

async function expectBoardBlocks(page: Page) {
  for (const title of ['HIGHLIGHT KUDOS', 'SPOTLIGHT BOARD', 'ALL KUDOS']) {
    const block = region(page, title);
    await expect(block).toBeVisible();
    await expect(block.getByText('Sun* Annual Awards 2025', { exact: true })).toBeVisible();
  }
  await expect(page.getByRole('complementary')).toBeVisible();
  await expect(page.getByText(BANNER_TITLE, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: SEND_PLACEHOLDER, exact: true })).toBeVisible();
  await expect(region(page, 'ALL KUDOS').getByRole('article').first()).toContainText(newest.timeLabel);
}

test.describe('Sun* Kudos — page shell', () => {
  test('guest gets 200 with every block, no redirect (SC-001, US001-1)', async ({ page }) => {
    const response = await page.goto('/sun-kudos', { waitUntil: 'networkidle' });

    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(URL);
    await expectBoardBlocks(page);
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });

  test('signed-in Sunner sees the same blocks and content (US001)', async ({ page, context }) => {
    await signInBrowser(context, TEST_ACCOUNTS.VIEWER);
    const response = await page.goto('/sun-kudos', { waitUntil: 'networkidle' });

    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(URL);
    await expectBoardBlocks(page);
  });

  test('"Sun* Kudos" is the only current link in header and footer (SC-001, BR-002)', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });

    for (const landmark of [page.getByRole('banner'), page.getByRole('contentinfo')]) {
      await expect(landmark.getByRole('link', { name: 'Sun* Kudos', exact: true })).toHaveAttribute('aria-current', 'page');
      await expect(landmark.getByRole('link', { name: 'About SAA 2025', exact: true })).not.toHaveAttribute('aria-current');
      await expect(landmark.getByRole('link', { name: 'Awards Information', exact: true })).not.toHaveAttribute('aria-current');
    }
  });

  test('header "Sun* Kudos" link on the homepage opens the board and becomes current (US001-2)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('banner').getByRole('link', { name: 'Sun* Kudos', exact: true }).click();

    await expect(page).toHaveURL(URL);
    await expect(page.getByRole('banner').getByRole('link', { name: 'Sun* Kudos', exact: true }))
      .toHaveAttribute('aria-current', 'page');
    await expect(region(page, 'ALL KUDOS')).toBeVisible();
  });

  test('A.1 send pill and "Tìm kiếm profile Sunner" pill are inert (SC-002, D013)', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    const send = page.getByRole('button', { name: SEND_PLACEHOLDER, exact: true });
    const searchProfile = page.getByRole('button', { name: 'Tìm kiếm profile Sunner', exact: true });
    await expect(send).toBeVisible();
    await expect(searchProfile).toBeVisible();

    await send.click();
    await searchProfile.click();

    await expect(page).toHaveURL(URL);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('at 375px the page is one column: sidebar under All Kudos, one carousel card (SC-002, D022)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    const cards = region(page, 'ALL KUDOS').getByRole('article');
    await expect(cards).toHaveCount(10);
    const slides = region(page, 'HIGHLIGHT KUDOS').locator('[aria-roledescription="slide"]');

    await expect(slides.nth(0)).toBeVisible();
    // index 1 is the adjacent card: shown faded on desktop, hidden below desktop width (D022)
    await expect(slides.nth(1)).toBeHidden();
    await expect(region(page, 'SPOTLIGHT BOARD')).toBeVisible();
    const lastCard = await cards.nth(9).boundingBox();
    const sidebar = await page.getByRole('complementary').boundingBox();
    expect(lastCard).not.toBeNull();
    expect(sidebar).not.toBeNull();
    expect(sidebar!.y).toBeGreaterThanOrEqual(lastCard!.y + lastCard!.height);
  });

  test('EN switches page labels but keeps kudos content as written (SC-014, BR-009)', async ({ page, context }) => {
    await useEnglish(context);
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    const firstCard = region(page, 'ALL KUDOS').getByRole('article').first();

    await expect(firstCard).toContainText(newest.timeLabel);
    await expect(firstCard).toContainText(SUNNERS.CHUC.name);
    await expect(firstCard).toContainText('Inspring');
    await expect(firstCard).toContainText(SUNNERS.CHUC.department);
    await expect(page.getByText(BANNER_TITLE, { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: SEND_PLACEHOLDER, exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Phòng ban', exact: true })).toHaveCount(0);
  });
});
