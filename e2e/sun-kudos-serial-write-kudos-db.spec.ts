import { readFileSync } from 'node:fs';
import { test, expect, request as playwrightRequest } from '@playwright/test';
import type { SupabaseClient } from '@supabase/supabase-js';
import { FIGMA_BODY, HASHTAGS, SUNNERS, TEST_ACCOUNTS } from './support/kudos-board-seed';
import { anonClient, readSunnerCounters, signedInClient } from './support/kudos-board-db';
import { APP_ORIGIN } from './support/prelaunch-setting';
import {
  IMAGES_BUCKET, createKudos, deleteKudos, expectCreateKudosRejected, imagePathPattern, kudosIdsCreatedSince,
  readKudosRow, removeStorageObjects, requestAs, storageKeyOf, storageObjectExists, uploadDrafts,
} from './support/write-kudos-db';
import { fixture } from './support/write-kudos-helpers';

/**
 * create_kudos success path (plan.md B1). Serial project: it inserts kudos, so afterEach deletes
 * every kudos created since the test started (the count trigger restores the receiver) and the
 * images the test uploaded. Contract: the caller's Sunner is the sender (never a parameter);
 * kudos, kudos_hashtags and kudos_images are written together; public_sender_id = sender, or
 * NULL when anonymous; anonymous_name is NULL unless anonymous; clients never see the sender of
 * an anonymous kudos. Images (review C1/M1/M2): stored as /api/kudos/images/<uuid>.<ext> with no
 * user id, public once attached, never attachable twice nor deletable by their owner.
 */
const PUBLIC_COLUMNS = 'id, public_sender_id, is_anonymous, anonymous_name, sender:sunners!public_sender_id(id, full_name)';
const IMAGE_FILES = ['test-image-1.jpg', 'test-image-2.png', 'test-image-3.jpg', 'test-image-4.png', 'test-image-5.jpg'];
let sender: SupabaseClient;
let viewer: SupabaseClient;
let senderUid = '';
let startedAt = '';
let uploaded: string[] = [];

/** Uploads `files` as the sender (POST /api/kudos/images); afterEach removes them. */
async function senderDrafts(files: string[]): Promise<string[]> {
  const paths = await uploadDrafts(TEST_ACCOUNTS.SENDER, files);
  uploaded.push(...paths);
  return paths;
}

function expectNoUserIdIn(paths: string[]) {
  for (const path of paths) {
    expect(path, 'stored image path names no user').toMatch(imagePathPattern());
    expect(path, 'stored image path names no user').not.toContain(senderUid);
  }
}

test.describe('@supabase write kudos — create_kudos success (serial)', () => {
  test.beforeAll(async () => {
    ({ client: sender, userId: senderUid } = await signedInClient(TEST_ACCOUNTS.SENDER));
    ({ client: viewer } = await signedInClient(TEST_ACCOUNTS.VIEWER));
  });

  test.beforeEach(() => {
    startedAt = new Date(Date.now() - 1000).toISOString();
    uploaded = [];
  });

  test.afterEach(async () => {
    await deleteKudos(await kudosIdsCreatedSince(startedAt));
    await removeStorageObjects(uploaded);
  });

  test('named kudos: written atomically as the caller, sender public, receiver count +1', async () => {
    const receivedBefore = (await readSunnerCounters(SUNNERS.QUY.id)).received;
    const images = await senderDrafts(IMAGE_FILES.slice(0, 2));

    const { data: id, error } = await createKudos(sender, {
      p_hashtag_slugs: ['dedicated', 'inspring'], p_image_paths: images, p_anonymous_name: 'ignored', // test-only value
    });

    expect(error).toBeNull();
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(await readKudosRow(id as string)).toMatchObject({
      sender_id: SUNNERS.SENDER.id, receiver_id: SUNNERS.QUY.id, title: 'IDOL GIỚI TRẺ', body: FIGMA_BODY,
      is_anonymous: false, anonymous_name: null, public_sender_id: SUNNERS.SENDER.id,
      hashtags: ['dedicated', 'inspring'], images,
    });
    expectNoUserIdIn(images);
    expect((await readSunnerCounters(SUNNERS.QUY.id)).received).toBe(receivedBefore + 1);

    const { data, error: readError } = await anonClient().from('kudos').select(PUBLIC_COLUMNS).eq('id', id as string).single();
    expect(readError).toBeNull();
    expect(data).toMatchObject({ public_sender_id: SUNNERS.SENDER.id, sender: { id: SUNNERS.SENDER.id, full_name: SUNNERS.SENDER.name } });
  });

  test('anonymous kudos at the max lengths: sender kept internally, hidden from anon and users', async () => {
    const alias = 'a'.repeat(50); // test-only value (not in Figma): 50-char boundary
    const fiveTags = HASHTAGS.slice(0, 5).map((h) => h.slug);
    const fiveImages = await senderDrafts(IMAGE_FILES);

    const { data: id, error } = await createKudos(sender, {
      p_title: 'a'.repeat(50), p_body: 'a'.repeat(2000), p_hashtag_slugs: fiveTags, p_image_paths: fiveImages,
      p_is_anonymous: true, p_anonymous_name: alias,
    });

    expect(error).toBeNull();
    const row = await readKudosRow(id as string);
    expect(row).toMatchObject({ sender_id: SUNNERS.SENDER.id, is_anonymous: true, anonymous_name: alias, public_sender_id: null });
    expect(row.hashtags).toEqual([...fiveTags].sort());
    expect(row.images).toEqual(fiveImages);
    expectNoUserIdIn(row.images);
    for (const [label, client] of [['anon', anonClient()], ['authenticated', viewer]] as const) {
      const { data, error: readError } = await client.from('kudos').select(PUBLIC_COLUMNS).eq('id', id as string).single();
      expect(readError, label).toBeNull();
      expect(data, label).toMatchObject({ public_sender_id: null, is_anonymous: true, anonymous_name: alias, sender: null });
    }
  });

  test('an attached image is public: anon reads it from Storage and guests GET it', async () => {
    const [image] = await senderDrafts(IMAGE_FILES.slice(0, 1));
    const { error } = await createKudos(sender, { p_image_paths: [image] });
    expect(error).toBeNull();

    const bytes = readFileSync(fixture(IMAGE_FILES[0]));
    const { data } = await anonClient().storage.from(IMAGES_BUCKET).download(storageKeyOf(image));
    expect(data ? Buffer.from(await data.arrayBuffer()) : null, 'anon Storage read').toEqual(bytes);
    const guest = await playwrightRequest.newContext({ baseURL: APP_ORIGIN });
    try {
      const served = await guest.get(image);
      expect(served.status()).toBe(200);
      expect(served.headers()['content-type']).toMatch(/^image\/jpeg/);
      expect(served.headers()['cache-control']).toMatch(/max-age=[1-9]\d{3,}/);
      expect(await served.body()).toEqual(bytes);
    } finally {
      await guest.dispose();
    }
  });

  test('an image already attached to a kudos cannot be attached to another one', async () => {
    const [image] = await senderDrafts(IMAGE_FILES.slice(0, 1));
    const { error } = await createKudos(sender, { p_image_paths: [image] });
    expect(error).toBeNull();

    await expectCreateKudosRejected(sender, 'images', { p_image_paths: [image] });
  });

  test('the owner cannot delete an attached image (Storage or DELETE route) but can delete a draft', async () => {
    const [attached, draft] = await senderDrafts(IMAGE_FILES.slice(0, 2));
    const { error } = await createKudos(sender, { p_image_paths: [attached] });
    expect(error).toBeNull();

    const viaStorage = await sender.storage.from(IMAGES_BUCKET).remove([storageKeyOf(attached)]);
    expect(viaStorage.data ?? [], 'Storage delete of an attached image').toHaveLength(0);
    const owner = await requestAs(TEST_ACCOUNTS.SENDER);
    try {
      expect((await owner.delete(attached)).status(), 'DELETE of an attached image').toBe(404);
    } finally {
      await owner.dispose();
    }
    expect(await storageObjectExists(attached), 'attached image kept').toBe(true);

    const removed = await sender.storage.from(IMAGES_BUCKET).remove([storageKeyOf(draft)]);
    expect(removed.data ?? [], 'own draft deleted').toHaveLength(1);
    expect(await storageObjectExists(draft)).toBe(false);
  });
});
