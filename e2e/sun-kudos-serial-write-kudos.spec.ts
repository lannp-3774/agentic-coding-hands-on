import { test, expect, type Page } from '@playwright/test';
import { FIGMA_BODY, SUNNERS, TEST_ACCOUNTS, vnTimeLabel } from './support/kudos-board-seed';
import { signInBrowser, signedInClient } from './support/kudos-board-db';
import {
  createKudos, deleteKudos, imagePathPattern, kudosIdsCreatedSince, readKudosRow, removeKudosImagesStoredSince,
} from './support/write-kudos-db';
import {
  DEFAULT_ANONYMOUS_ALIAS, anonymousCheckbox, anonymousNameBox, attachImages, cancelButton, fillValidKudos, fixture,
  imageGroup, modal, openWriteKudosModal, removeButtons, submitButton, titleBox,
} from './support/write-kudos-helpers';

/**
 * Viết Kudo end to end (ID-46, ID-47 + clarifications). Serial project: each test writes a kudos;
 * afterEach deletes every kudos created since the test began and every image stored since then.
 * After Gửi: the modal closes, a success toast shows and the new kudos is first in All Kudos
 * without a reload. Anonymous cards show the alias (default "Người gửi ẩn danh"), no sender
 * name, avatar or profile link. Card bodies render the Markdown subset; raw HTML stays text.
 */
const firstFeedCard = (page: Page) =>
  page.getByRole('region', { name: 'ALL KUDOS', exact: true }).getByRole('article').first();
const toast = (page: Page) => page.getByRole('status').filter({ hasText: /\S/ });
const VALID = { title: 'IDOL GIỚI TRẺ', body: FIGMA_BODY, hashtags: ['Dedicated', 'Inspring'] };
let senderUid = '';
let startedAt = '';

/** The only kudos this test created (internal state, service_role read). */
async function createdRow() {
  const ids = await kudosIdsCreatedSince(startedAt);
  expect(ids, 'exactly one kudos created').toHaveLength(1);
  return readKudosRow(ids[0]);
}

async function submitAndExpectSuccess(page: Page) {
  await expect(submitButton(page)).toBeEnabled();
  await submitButton(page).click();
  await expect(modal(page)).toHaveCount(0);
  await expect(toast(page).first()).toBeVisible();
}

async function expectAnonymousCard(page: Page, alias: string) {
  const row = await createdRow();
  expect(row).toMatchObject({ sender_id: SUNNERS.SENDER.id, is_anonymous: true, public_sender_id: null });
  const card = firstFeedCard(page);
  await expect(card).toContainText(vnTimeLabel(row.created_at as string));
  await expect(card.getByText(alias, { exact: true })).toBeVisible();
  await expect(card).not.toContainText(SUNNERS.SENDER.name);
  await expect(card.locator(`a[href="/profiles/${SUNNERS.SENDER.id}"]`)).toHaveCount(0);
  await expect(card.getByRole('link', { name: SUNNERS.SENDER.name })).toHaveCount(0);
}

test.describe('Sun* Kudos — send a kudos (serial)', () => {
  test.beforeAll(async () => {
    senderUid = (await signedInClient(TEST_ACCOUNTS.SENDER)).userId;
  });

  test.beforeEach(async ({ context }) => {
    startedAt = new Date(Date.now() - 1000).toISOString();
    await signInBrowser(context, TEST_ACCOUNTS.SENDER);
  });

  test.afterEach(async () => {
    await deleteKudos(await kudosIdsCreatedSince(startedAt));
    await removeKudosImagesStoredSince(startedAt);
  });

  test('Gửi with 2 images: modal closes, toast, new kudos first in All Kudos with its images (ID-46)', async ({ page }) => {
    await openWriteKudosModal(page);
    await fillValidKudos(page, VALID);
    await attachImages(page, [fixture('test-image-1.jpg'), fixture('test-image-2.png')]);
    await expect(removeButtons(imageGroup(page))).toHaveCount(2);

    await submitAndExpectSuccess(page);

    const row = await createdRow();
    expect(row).toMatchObject({
      sender_id: SUNNERS.SENDER.id, receiver_id: SUNNERS.QUY.id, title: VALID.title, body: FIGMA_BODY,
      is_anonymous: false, public_sender_id: SUNNERS.SENDER.id, hashtags: ['dedicated', 'inspring'],
    });
    expect(row.images).toHaveLength(2);
    for (const path of row.images) {
      expect(path, 'stored image path names no user').not.toContain(senderUid);
      expect(path).toMatch(imagePathPattern());
    }

    const card = firstFeedCard(page);
    await expect(card).toContainText(vnTimeLabel(row.created_at as string));
    await expect(card).toContainText(VALID.title);
    await expect(card.getByText(SUNNERS.SENDER.name, { exact: true })).toBeVisible();
    await expect(card.getByText(SUNNERS.QUY.name, { exact: true })).toBeVisible();
    const links = card.locator('a[target="_blank"]').filter({ has: page.locator('img') });
    expect(await links.evaluateAll((els) => els.map((el) => el.getAttribute('href')))).toEqual(row.images);
    for (const path of row.images) {
      const res = await page.request.get(path);
      expect(res.status(), path).toBe(200);
    }
  });

  test('while Gửi is in flight, Hủy is disabled and Escape does not close the dialog (review L1)', async ({ page }) => {
    await openWriteKudosModal(page);
    await fillValidKudos(page, VALID);
    // Hold the sendKudos server action (the page's next-action POST) until the checks are done.
    let release = () => {};
    const held = new Promise<void>((resolve) => { release = resolve; });
    await page.route('**/sun-kudos**', async (route) => {
      if (route.request().method() !== 'POST' || !route.request().headers()['next-action']) return route.fallback();
      await held;
      await route.continue();
    });

    try {
      await submitButton(page).click();
      await expect(submitButton(page)).toHaveAttribute('aria-busy', 'true');
      await expect(cancelButton(page)).toBeDisabled();
      await titleBox(page).focus();
      await page.keyboard.press('Escape');
      await expect(submitButton(page), 'still sending after Escape').toHaveAttribute('aria-busy', 'true');
      await expect(modal(page)).toBeVisible();
    } finally {
      release();
    }

    await expect(modal(page)).toHaveCount(0);
    await expect(toast(page).first()).toBeVisible();
    await createdRow();
  });

  test('anonymous with a name: the card shows the alias, never the sender (ID-41, ID-43, ID-47)', async ({ page }) => {
    const alias = 'Bạn Tốt'; // test-only value (not in Figma)
    await openWriteKudosModal(page);
    await fillValidKudos(page, VALID);
    await anonymousCheckbox(page).click();
    await anonymousNameBox(page).fill(alias);

    await submitAndExpectSuccess(page);

    expect((await createdRow()).anonymous_name).toBe(alias);
    await expectAnonymousCard(page, alias);
  });

  test('anonymous without a name shows "Người gửi ẩn danh"', async ({ page }) => {
    await openWriteKudosModal(page);
    await fillValidKudos(page, VALID);
    await anonymousCheckbox(page).click();

    await submitAndExpectSuccess(page);

    await expectAnonymousCard(page, DEFAULT_ANONYMOUS_ALIAS);
  });

  test('card renders the Markdown subset; raw HTML and javascript: links stay text', async ({ page }) => {
    // test-only values (not in Figma): one sample per Markdown construct from the clarifications.
    const body = '**Cảm ơn** _bạn_ ~~cũ~~\n\n> trích dẫn\n\n1. một\n2. hai\n\n[Sun*](https://sun-asterisk.vn) [x](javascript:alert(1)) <b>raw</b>';
    const { client } = await signedInClient(TEST_ACCOUNTS.SENDER);
    const { error } = await createKudos(client, { p_body: body });
    expect(error).toBeNull();

    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });

    const card = firstFeedCard(page);
    await expect(card).toContainText(vnTimeLabel((await createdRow()).created_at as string));
    await expect(card.locator('strong, b').filter({ hasText: /^Cảm ơn$/ })).toHaveCount(1);
    await expect(card.locator('em, i').filter({ hasText: /^bạn$/ })).toHaveCount(1);
    await expect(card.locator('s, del').filter({ hasText: /^cũ$/ })).toHaveCount(1);
    await expect(card.locator('blockquote').filter({ hasText: 'trích dẫn' })).toHaveCount(1);
    await expect(card.locator('ol > li')).toHaveCount(2);
    await expect(card.locator('a[href="https://sun-asterisk.vn"]')).toHaveText('Sun*');
    await expect(card.locator('a[href^="javascript"]')).toHaveCount(0);
    await expect(card.getByText('<b>raw</b>')).toHaveCount(1);
    await expect(card.locator('strong, b').filter({ hasText: /^raw$/ })).toHaveCount(0);
  });
});
