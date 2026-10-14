/**
 * UI helpers for the guest-as-Anonymous specs (plans/261014-1505-guest-anonymous-access).
 * Same selector contract as the board and Viết Kudo specs: roles, labels and visible copy only.
 * A guest is a browser context with no cookies; its first action (heart, send bar) creates the
 * anonymous session server-side, and the cookies keep it from then on.
 */
import { expect, type Page } from '@playwright/test';
import { FIGMA_BODY, KUDOS_BY_N } from './kudos-board-seed';
import { kudosIdsCreatedSince, readKudosRow } from './write-kudos-db';
import { modal, sendBar, submitButton } from './write-kudos-helpers';

export const BOARD_URL = 'http://localhost:3000/sun-kudos';
/** Figma mock data, as in sun-kudos-serial-write-kudos.spec.ts. */
export const VALID_KUDOS = { title: 'IDOL GIỚI TRẺ', body: FIGMA_BODY, hashtags: ['Dedicated', 'Inspring'] };
/** lib/i18n/write-kudos-copy.ts → recipient.noResults (VN). */
export const RECIPIENT_NO_RESULTS = 'Không tìm thấy Sunner phù hợp';

/** Heart count as a whole number inside the button text (not a digit of another number). */
export const countText = (n: number) => new RegExp(`(^|\\D)${n}(\\D|$)`);
export const feedHeart = (page: Page, n: number) =>
  page.getByRole('region', { name: 'ALL KUDOS', exact: true }).getByRole('article')
    .filter({ hasText: KUDOS_BY_N(n).timeLabel }).locator('button[aria-pressed]');
export const firstFeedCard = (page: Page) =>
  page.getByRole('region', { name: 'ALL KUDOS', exact: true }).getByRole('article').first();
export const toast = (page: Page) => page.getByRole('status').filter({ hasText: /\S/ });
export const sidebar = (page: Page) => page.getByRole('complementary');

/** A guest (no cookies) clicks the send bar: the dialog opens in place, never /login. */
export async function openModalAsGuest(page: Page) {
  await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
  await sendBar(page).click();
  await expect(modal(page), 'a guest opens the Viết Kudo dialog (no /login)').toBeVisible();
  await expect(page).toHaveURL(BOARD_URL);
}

export async function submitAndExpectSuccess(page: Page) {
  await expect(submitButton(page)).toBeEnabled();
  await submitButton(page).click();
  await expect(modal(page)).toHaveCount(0);
  await expect(toast(page).first()).toBeVisible();
}

/** The only kudos created since `sinceIso` (internal state, service_role read). */
export async function onlyKudosCreatedSince(sinceIso: string) {
  const ids = await kudosIdsCreatedSince(sinceIso);
  expect(ids, 'exactly one kudos created').toHaveLength(1);
  return readKudosRow(ids[0]);
}
