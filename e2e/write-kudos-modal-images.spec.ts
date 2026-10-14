import { readFileSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';
import { TEST_ACCOUNTS } from './support/kudos-board-seed';
import { signInBrowser, signedInClient } from './support/kudos-board-db';
import { imagePathPattern, jsonOrNull, removeStorageObjects, storageObjectExists } from './support/write-kudos-db';
import {
  IMAGE_FIXTURES, NON_IMAGE_FIXTURES, OVER_5_MB, addImageButton, attachImages, cancelButton, fixture, imageGroup,
  modal, openWriteKudosModal, removeButtons,
} from './support/write-kudos-helpers';

/**
 * Viết Kudo — image attachments (F). Chromium project: no kudos rows, but each accepted file
 * is uploaded (POST /api/kudos/images → kudos/<uuid>.<ext>, no user id); afterEach removes
 * exactly the objects this test uploaded. Clarifications: jpg/png only, ≤ 5 MB each, 0–5 images,
 * "+ Image" hidden at 5 and shown again after a removal. Review round 1: a removed thumbnail
 * or a closed modal deletes its unsent uploads (best effort, so polled).
 */
let senderUid = '';
let uploaded: string[] = [];
let uploadStatuses: number[] = [];

function recordUploads(page: Page) {
  page.on('response', async (res) => {
    if (res.request().method() !== 'POST' || !res.url().endsWith('/api/kudos/images')) return;
    uploadStatuses.push(res.status());
    const body = await jsonOrNull(res);
    if (typeof body?.path === 'string') uploaded.push(body.path);
  });
}
const thumbnails = (page: Page) => removeButtons(imageGroup(page));

test.describe('Viết Kudo modal — images', () => {
  test.beforeAll(async () => {
    senderUid = (await signedInClient(TEST_ACCOUNTS.SENDER)).userId;
  });

  test.beforeEach(async ({ context, page }) => {
    uploaded = [];
    uploadStatuses = [];
    recordUploads(page);
    await signInBrowser(context, TEST_ACCOUNTS.SENDER);
    await openWriteKudosModal(page);
  });

  test.afterEach(async () => {
    await removeStorageObjects(uploaded);
  });

  test('jpg and png upload with no user id in the path and show thumbnails; "+ Image" stays (ID-18, ID-21, ID-22, ID-37)', async ({ page }) => {
    await attachImages(page, [fixture('test-image-1.jpg'), fixture('test-image-2.png')]);

    await expect(thumbnails(page)).toHaveCount(2);
    await expect(imageGroup(page).locator('img')).toHaveCount(2);
    await expect(addImageButton(page)).toBeVisible();
    await expect.poll(() => uploaded.length).toBe(2);
    for (const path of uploaded) expect(path, 'no user id in the image path').not.toContain(senderUid);
    expect(uploaded[0]).toMatch(imagePathPattern('jpg'));
    expect(uploaded[1]).toMatch(imagePathPattern('png'));
  });

  test('removing a thumbnail deletes its upload; Hủy deletes the uploads not sent', async ({ page }) => {
    await attachImages(page, [fixture('test-image-1.jpg'), fixture('test-image-2.png')]);
    await expect(thumbnails(page)).toHaveCount(2);
    await expect.poll(() => uploaded.length).toBe(2);
    await expect.poll(() => storageObjectExists(uploaded[1]), 'both stored').toBe(true);

    await thumbnails(page).first().click();
    await expect(thumbnails(page)).toHaveCount(1);
    await expect.poll(() => storageObjectExists(uploaded[0]), 'removed thumbnail: upload deleted').toBe(false);
    expect(await storageObjectExists(uploaded[1]), 'kept thumbnail: upload kept').toBe(true);

    await cancelButton(page).click();
    await expect(modal(page)).toHaveCount(0);
    await expect.poll(() => storageObjectExists(uploaded[1]), 'Hủy: unsent upload deleted').toBe(false);
  });

  test('5 images hide "+ Image"; removing one shows it again (ID-19, ID-20, ID-38, ID-39, ID-40, ID-54)', async ({ page }) => {
    await attachImages(page, IMAGE_FIXTURES.slice(0, 4));
    await expect(thumbnails(page)).toHaveCount(4);
    await expect(addImageButton(page)).toBeVisible();

    await attachImages(page, IMAGE_FIXTURES.slice(4));

    await expect(thumbnails(page)).toHaveCount(5);
    await expect(addImageButton(page)).toHaveCount(0);
    // Uploads run one at a time (they keep the picked order), so 5 of them can take
    // longer than the default 10 s on a busy host: allow the whole chain (debugger 2026-10-14).
    await expect.poll(() => uploaded.length, { message: 'all 5 stored', timeout: 30_000 }).toBe(5);
    await thumbnails(page).nth(1).click();
    await expect(thumbnails(page)).toHaveCount(4);
    await expect(addImageButton(page)).toBeVisible();
  });

  test('pdf, mp4 and txt are refused with an invalid-format error and no thumbnail (ID-23, ID-24, ID-55)', async ({ page }) => {
    for (const file of NON_IMAGE_FIXTURES) {
      await attachImages(page, [file]);

      await expect(imageGroup(page).getByRole('alert'), file).toBeVisible();
      await expect(thumbnails(page), file).toHaveCount(0);
    }
    expect(uploaded, 'nothing stored').toEqual([]);
    expect(uploadStatuses.filter((s) => s === 200)).toEqual([]);
  });

  test('a png over 5 MB is refused with an error and no thumbnail', async ({ page }) => {
    const png = readFileSync(fixture('test-image-2.png'));
    const big = Buffer.concat([png, Buffer.alloc(OVER_5_MB - png.length)]);

    await attachImages(page, [{ name: 'over-5-mb.png', mimeType: 'image/png', buffer: big }]);

    await expect(imageGroup(page).getByRole('alert')).toBeVisible();
    await expect(thumbnails(page)).toHaveCount(0);
    expect(uploaded, 'nothing stored').toEqual([]);
  });
});
