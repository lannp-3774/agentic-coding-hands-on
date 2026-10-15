import { test, expect, type Page } from '@playwright/test';
import { SUNNERS, vnTimeLabel } from './support/kudos-board-seed';
import { deleteKudos, kudosIdsCreatedSince } from './support/write-kudos-db';
import {
  DEFAULT_ANONYMOUS_ALIAS, anonymousCheckbox, anonymousNameBox, fillValidKudos,
} from './support/write-kudos-helpers';
import {
  GUEST_SUNNER_NAME, deleteGuestsCreatedSince, onlyAnonymousUserSince, readSunnerInternals, windowStart,
} from './support/guest-anonymous-db';
import {
  VALID_KUDOS, firstFeedCard, onlyKudosCreatedSince, openModalAsGuest, sidebar, submitAndExpectSuccess,
} from './support/guest-anonymous-ui';

/**
 * Guests act as Anonymous (clarifications 2026-10-14; supersedes F010 "guest send bar → /login").
 * A guest's send bar opens Viết Kudo in place; the anonymous checkbox is forced on and disabled;
 * the kudos is stored as the guest Sunner (is_guest), always anonymous, and shows first in All
 * Kudos with the alias (default "Người gửi ẩn danh"), never a profile link. The sidebar then
 * shows the guest's own stats. Serial project: afterEach deletes the kudos created during the
 * test and every anonymous user created meanwhile, with its guest Sunner.
 */
let startedAt = '';

/** The stored kudos: anonymous, sent by the guest Sunner of the only new anonymous user. */
async function expectGuestKudosRow(alias: string | null) {
  const row = await onlyKudosCreatedSince(startedAt);
  expect(row, 'a guest kudos is always anonymous').toMatchObject({
    receiver_id: SUNNERS.QUY.id, is_anonymous: true, anonymous_name: alias, public_sender_id: null,
  });
  const guestUid = await onlyAnonymousUserSince(startedAt);
  expect(await readSunnerInternals(row.sender_id as string), 'sender is the guest Sunner').toMatchObject({
    is_guest: true, user_id: guestUid, full_name: GUEST_SUNNER_NAME,
  });
  return row;
}

/** First card in All Kudos: the new kudos, alias shown, no sender name or profile link. */
async function expectAnonymousFirstCard(page: Page, row: Record<string, unknown>, alias: string) {
  const card = firstFeedCard(page);
  await expect(card).toContainText(vnTimeLabel(row.created_at as string));
  await expect(card.getByText(alias, { exact: true })).toBeVisible();
  await expect(card.getByText(SUNNERS.QUY.name, { exact: true })).toBeVisible();
  await expect(card.getByText(GUEST_SUNNER_NAME, { exact: true })).toHaveCount(0);
  await expect(card.locator(`a[href="/profiles/${row.sender_id as string}"]`)).toHaveCount(0);
}

test.describe('Sun* Kudos — a guest writes a kudos (serial)', () => {
  test.beforeEach(() => {
    startedAt = windowStart();
  });

  test.afterEach(async () => {
    await deleteKudos(await kudosIdsCreatedSince(startedAt));
    await deleteGuestsCreatedSince(startedAt);
  });

  test('guest: send bar opens Viết Kudo, anonymous forced on; the kudos shows first as "Người gửi ẩn danh"', async ({ page }) => {
    await openModalAsGuest(page);
    await expect(anonymousCheckbox(page), 'anonymous is forced on for a guest').toBeChecked();
    await expect(anonymousCheckbox(page), 'and cannot be turned off').toBeDisabled();

    await fillValidKudos(page, VALID_KUDOS);
    await submitAndExpectSuccess(page);

    const row = await expectGuestKudosRow(null);
    await expectAnonymousFirstCard(page, row, DEFAULT_ANONYMOUS_ALIAS);
  });

  test('guest with an alias: the card shows the alias, the row stores it', async ({ page }) => {
    const alias = 'Bạn Tốt'; // test-only value (not in Figma)
    await openModalAsGuest(page);
    await expect(anonymousCheckbox(page), 'anonymous is forced on for a guest').toBeChecked();
    await expect(anonymousNameBox(page)).toBeVisible();
    await anonymousNameBox(page).fill(alias);

    await fillValidKudos(page, VALID_KUDOS);
    await submitAndExpectSuccess(page);

    const row = await expectGuestKudosRow(alias);
    await expectAnonymousFirstCard(page, row, alias);
  });

  // F007 FR-203 / BR-002: the DB refuses a self-like, so the guest's own (always anonymous) kudos
  // must not offer a heart — before the fix it stayed enabled and every click failed with a toast.
  test("guest: the heart on the guest's own anonymous kudos is disabled, also after a reload", async ({ page }) => {
    await openModalAsGuest(page);
    await fillValidKudos(page, VALID_KUDOS);
    await submitAndExpectSuccess(page);
    const row = await expectGuestKudosRow(null);

    const ownHeart = () => firstFeedCard(page).locator('button[aria-pressed]');
    await expect(firstFeedCard(page)).toContainText(vnTimeLabel(row.created_at as string));
    await expect(ownHeart(), 'own kudos: heart disabled right after sending').toBeDisabled();

    await page.reload({ waitUntil: 'networkidle' });
    await expect(firstFeedCard(page)).toContainText(vnTimeLabel(row.created_at as string));
    await expect(ownHeart(), 'own kudos: heart disabled after a reload').toBeDisabled();
    const otherHeart = page.getByRole('region', { name: 'ALL KUDOS', exact: true }).getByRole('article').nth(1).locator('button[aria-pressed]');
    await expect(otherHeart, "someone else's kudos: the guest's heart stays enabled").toBeEnabled();
  });

  test("guest sidebar: after one kudos the guest sees their own stats, sent = 1", async ({ page }) => {
    await openModalAsGuest(page);
    await fillValidKudos(page, VALID_KUDOS);
    await submitAndExpectSuccess(page);
    await expectGuestKudosRow(null);

    await page.reload({ waitUntil: 'networkidle' });

    await expect(sidebar(page), "the guest's own sent count").toContainText(/Số Kudos bạn đã gửi:\s*1(?!\d)/);
    await expect(sidebar(page)).toContainText(/Số Kudos bạn nhận được:\s*0(?!\d)/);
  });
});
