import { test, expect, type Page } from '@playwright/test';
import { GIFT_LIST } from './support/kudos-board-seed';
import {
  clearAllOpenedAt, createAuthUser, deleteAuthUser, deleteThrowawaySunners, findSunnersByUserId,
  restoreOpenedAt, signInBrowser, snapshotOpenedAt, throwawayEmail,
} from './support/kudos-board-db';

/**
 * F009 SC-003 (no Sunner -> "—", real zeros -> "0", FR-209) and SC-006 (no opened box ->
 * "Chưa có dữ liệu", FR-212). Serial project: creates throwaway users and nulls every
 * secret_boxes.opened_at; afterEach deletes the users and restores the snapshot.
 */
const PASSWORD = 'Sidebar123456!';
const LABELS = ['Số Kudos bạn nhận được:', 'Số Kudos bạn đã gửi:', 'Số tim bạn nhận được:',
  'Số Secret Box bạn đã mở:', 'Số Secret Box chưa mở:'];
const sidebar = (page: Page) => page.getByRole('complementary');
const statsPattern = (value: string) => new RegExp(LABELS.map((label) => `${label}\\s*${value}`).join('\\s*'));

const createdUsers: string[] = [];
let openedSnapshot: { id: string; opened_at: string | null }[] | null = null;

async function throwawaySignedIn(page: Page, tag: string) {
  const email = throwawayEmail(tag);
  const userId = await createAuthUser({ email, password: PASSWORD, confirmed: true });
  createdUsers.push(userId);
  await signInBrowser(page.context(), { email, password: PASSWORD });
  return userId;
}

test.describe('Sun* Kudos — sidebar edge states (serial)', () => {
  test.afterEach(async () => {
    for (const id of createdUsers.splice(0)) {
      try {
        await deleteThrowawaySunners(id);
      } finally {
        await deleteAuthUser(id); // always, even if the Sunner cleanup failed
      }
    }
    if (openedSnapshot) await restoreOpenedAt(openedSnapshot);
    openedSnapshot = null;
  });

  test('signed in without a Sunner row: five "—" and the button still shown (SC-003, FR-209)', async ({ page }) => {
    const userId = await throwawaySignedIn(page, 'nosunner');
    await deleteThrowawaySunners(userId);
    expect(await findSunnersByUserId(userId)).toEqual([]);

    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });

    await expect(sidebar(page)).toContainText(statsPattern('—'));
    await expect(sidebar(page).getByRole('button', { name: 'Mở Secret Box', exact: true })).toBeVisible();
  });

  test('signed in with a Sunner that has no data: five real "0" (SC-003, FR-209)', async ({ page }) => {
    const userId = await throwawaySignedIn(page, 'zeros');
    expect(await findSunnersByUserId(userId)).toHaveLength(1);

    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });

    await expect(sidebar(page)).toContainText(statsPattern('0'));
    await expect(sidebar(page).getByText('—', { exact: true })).toHaveCount(0);
  });

  test('no opened box: gift list title + "Chưa có dữ liệu", no rows (SC-006, FR-212)', async ({ page }) => {
    openedSnapshot = await snapshotOpenedAt();
    expect(openedSnapshot.filter((b) => b.opened_at !== null).length).toBeGreaterThanOrEqual(GIFT_LIST.length);
    await clearAllOpenedAt();

    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });

    await expect(sidebar(page).getByText('10 SUNNER NHẬN QUÀ MỚI NHẤT', { exact: true })).toBeVisible();
    await expect(sidebar(page).getByText('Chưa có dữ liệu', { exact: true })).toBeVisible();
    await expect(sidebar(page).getByRole('link').filter({ hasText: 'Nhận được 1' })).toHaveCount(0);
  });
});
