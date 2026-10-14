import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test, expect, request as playwrightRequest, type APIRequestContext } from '@playwright/test';
import type { SupabaseClient } from '@supabase/supabase-js';
import { TEST_ACCOUNTS } from './support/kudos-board-seed';
import { anonClient, signInBrowser, signedInClient } from './support/kudos-board-db';
import { APP_ORIGIN } from './support/prelaunch-setting';
import {
  IMAGES_BUCKET, imagePathPattern, jsonOrNull, removeStorageObjects, requestAs, storageKeyOf, storageObjectExists,
  uploadDrafts,
} from './support/write-kudos-db';
import { OVER_5_MB, fixture } from './support/write-kudos-helpers';

/**
 * Kudos images (plan.md B1 Storage, B2 routes; review round 1 C1/M1/M2). Chromium project: no
 * kudos rows, so every object here is an unattached draft; each test removes what it stored.
 * Storage bucket `images` (private, jpg/png, 5 MiB): objects are kudos/<uuid>.<ext>, owned
 * (owner_id) by the uploader, never under a user folder. A draft is readable and deletable by
 * its owner only; anon reads only attached images (sun-kudos-serial-write-kudos-db covers those).
 * POST /api/kudos/images: one multipart field `file`, signed-in, jpg/png ≤ 5 MB by magic bytes →
 * {path} | {error}. /api/kudos/images/<uuid>.<ext>: GET serves attached images (404 otherwise),
 * DELETE lets the owner drop a draft.
 */
const PNG = readFileSync(fixture('test-image-2.png'));
const filePart = (name: string, mimeType: string, buffer: Buffer) => ({ multipart: { file: { name, mimeType, buffer } } });
const bytesOf = async (blob: Blob | null) => (blob ? Buffer.from(await blob.arrayBuffer()) : null);
const fileOf = (path: string) => path.slice(path.lastIndexOf('/') + 1);

let sender: SupabaseClient;
let senderUid = '';
let viewer: SupabaseClient;

async function guestRequest(): Promise<APIRequestContext> {
  return playwrightRequest.newContext({ baseURL: APP_ORIGIN });
}

test.describe('write kudos — image storage and routes', () => {
  test.beforeAll(async () => {
    ({ client: sender, userId: senderUid } = await signedInClient(TEST_ACCOUNTS.SENDER));
    ({ client: viewer } = await signedInClient(TEST_ACCOUNTS.VIEWER));
  });

  test('Storage: users upload only kudos/<uuid>.<ext> (no user folder), own their drafts, 5 MiB cap', async () => {
    const key = `kudos/${randomUUID()}.png`;
    const strays = [`kudos/${senderUid}/${randomUUID()}.png`, 'kudos/photo.png', `kudos/${randomUUID()}.png`];
    try {
      const ownUpload = await sender.storage.from(IMAGES_BUCKET).upload(key, PNG, { contentType: 'image/png' });
      expect(ownUpload.error, 'own draft insert').toBeNull();
      expect(await bytesOf((await sender.storage.from(IMAGES_BUCKET).download(key)).data), 'owner reads own draft').toEqual(PNG);
      expect((await viewer.storage.from(IMAGES_BUCKET).download(key)).data, 'another user reads a draft').toBeNull();

      const intoUserFolder = await sender.storage.from(IMAGES_BUCKET).upload(strays[0], PNG, { contentType: 'image/png' });
      expect(intoUserFolder.error, 'a user-id folder').not.toBeNull();
      const oddName = await sender.storage.from(IMAGES_BUCKET).upload(strays[1], PNG, { contentType: 'image/png' });
      expect(oddName.error, 'a name that is not <uuid>.<ext>').not.toBeNull();
      const asAnon = await anonClient().storage.from(IMAGES_BUCKET).upload(strays[2], PNG, { contentType: 'image/png' });
      expect(asAnon.error, 'anon insert').not.toBeNull();
      const big = Buffer.concat([PNG, Buffer.alloc(OVER_5_MB - PNG.length)]);
      const tooBig = await sender.storage.from(IMAGES_BUCKET).upload(`kudos/${randomUUID()}.png`, big, { contentType: 'image/png' });
      expect(tooBig.error?.message, 'bucket limit 5 MiB').toMatch(/maximum allowed size|too large|exceed/i);

      const byOther = await viewer.storage.from(IMAGES_BUCKET).remove([key]);
      expect(byOther.data ?? [], "another user's delete").toHaveLength(0);
      expect(await storageObjectExists(key), 'draft kept').toBe(true);
      const removed = await sender.storage.from(IMAGES_BUCKET).remove([key]);
      expect(removed.error, 'own delete').toBeNull();
      expect(removed.data ?? [], 'own delete').toHaveLength(1);
    } finally {
      await removeStorageObjects([key, ...strays]);
    }
  });

  test('POST stores the draft as /api/kudos/images/<uuid>.<ext>: no user id in the path or the Storage key', async () => {
    const [path] = await uploadDrafts(TEST_ACCOUNTS.SENDER, ['test-image-1.jpg']);
    try {
      expect(path, 'no user id in the public path').not.toContain(senderUid);
      expect(path).toMatch(imagePathPattern('jpg'));
      expect(await storageObjectExists(`kudos/${fileOf(path)}`), 'stored as kudos/<file>').toBe(true);
    } finally {
      await removeStorageObjects([path]);
    }
  });

  test('a draft is private: anon cannot read or list it, and GET answers 404 until a kudos uses it', async () => {
    const [path] = await uploadDrafts(TEST_ACCOUNTS.SENDER, ['test-image-1.jpg']);
    const key = storageKeyOf(path);
    const folder = key.slice(0, key.lastIndexOf('/'));
    const guest = await guestRequest();
    try {
      const anon = anonClient().storage.from(IMAGES_BUCKET);
      expect((await anon.download(key)).data, 'anon download of a draft').toBeNull();
      const names = [...((await anon.list('kudos', { limit: 1000 })).data ?? []), ...((await anon.list(folder, { limit: 1000 })).data ?? [])]
        .map((o) => o.name);
      expect(names, 'anon listing shows no draft').not.toContain(fileOf(path));
      expect(names, 'anon listing shows no user folder').not.toContain(senderUid);
      expect((await guest.get(path)).status(), 'GET of a draft').toBe(404);
    } finally {
      await guest.dispose();
      await removeStorageObjects([path]);
    }
  });

  test('GET answers 404 for unknown, malformed and user-folder paths', async () => {
    const [path] = await uploadDrafts(TEST_ACCOUNTS.SENDER, ['test-image-1.jpg']);
    const guest = await guestRequest();
    try {
      const missing = [
        `/api/kudos/images/${randomUUID()}.jpg`,
        '/api/kudos/images/not-a-uuid.jpg',
        `/api/kudos/images/${fileOf(path).replace(/\.jpg$/, '.gif')}`,
        '/api/kudos/images/photo.jpg',
        `/api/kudos/images/${senderUid}/${fileOf(path)}`,
      ];
      for (const url of missing) expect((await guest.get(url)).status(), url).toBe(404);
    } finally {
      await guest.dispose();
      await removeStorageObjects([path]);
    }
  });

  test('DELETE: the owner removes an unattached draft; guests get 401, other users 404 and it stays', async () => {
    const [path] = await uploadDrafts(TEST_ACCOUNTS.SENDER, ['test-image-1.jpg']);
    const guest = await guestRequest();
    const owner = await requestAs(TEST_ACCOUNTS.SENDER);
    const other = await requestAs(TEST_ACCOUNTS.VIEWER);
    try {
      expect((await guest.delete(path)).status(), 'guest').toBe(401);
      expect((await other.delete(path)).status(), 'another user').toBe(404);
      expect(await storageObjectExists(path), 'draft kept').toBe(true);

      expect((await owner.delete(path)).status(), 'owner').toBe(204);
      expect(await storageObjectExists(path), 'draft deleted').toBe(false);
      expect((await owner.delete(path)).status(), 'already gone').toBe(404);
    } finally {
      await Promise.all([guest.dispose(), owner.dispose(), other.dispose()]);
      await removeStorageObjects([path]);
    }
  });

  test('POST refuses a text file named .png, a pdf and a png over 5 MB with the error code', async ({ context }) => {
    await signInBrowser(context, TEST_ACCOUNTS.SENDER);
    const cases = [
      { label: 'disguised text', part: filePart('fake.png', 'image/png', readFileSync(fixture('dummy-document.txt'))), error: 'invalidFileType' },
      { label: 'pdf', part: filePart('dummy-document.pdf', 'application/pdf', readFileSync(fixture('dummy-document.pdf'))), error: 'invalidFileType' },
      { label: 'over 5 MB', part: filePart('big.png', 'image/png', Buffer.concat([PNG, Buffer.alloc(OVER_5_MB - PNG.length)])), error: 'fileTooLarge' },
    ];
    for (const c of cases) {
      const res = await context.request.post('/api/kudos/images', c.part);
      const body = await jsonOrNull(res);
      if (typeof body?.path === 'string') await removeStorageObjects([body.path]);

      expect(body, c.label).toEqual({ error: c.error });
      expect(res.ok(), c.label).toBe(false);
    }
  });

  test('POST refuses guests (401/403) and stores nothing', async () => {
    const guest = await guestRequest();
    const res = await guest.post('/api/kudos/images', filePart('test-image-2.png', 'image/png', PNG));
    const body = await jsonOrNull(res);
    if (typeof body?.path === 'string') await removeStorageObjects([body.path]);
    await guest.dispose();

    expect([401, 403]).toContain(res.status());
    expect(body?.path).toBeUndefined();
  });
});
