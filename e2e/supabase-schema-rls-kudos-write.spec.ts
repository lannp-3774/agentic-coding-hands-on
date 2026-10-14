import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import type { SupabaseClient } from '@supabase/supabase-js';
import { KUDOS_BY_N, SUNNERS, TEST_ACCOUNTS } from './support/kudos-board-seed';
import { anonClient, countRows, signedInClient } from './support/kudos-board-db';
import {
  createKudos, deleteKudos, expectCreateKudosRejected, imagePath, removeStorageObjects, uploadDrafts, validArgs,
  type CreateKudosArgs, type KudosField,
} from './support/write-kudos-db';

/**
 * Write-kudos DB contract (plan.md B1), rejection side only — nothing here may create a row,
 * so it runs in the parallel chromium project (no other spec there writes kudos).
 * create_kudos(...) is authenticated-only and refuses bad input with 22023 + the field key;
 * kudos.sender_id is never client-readable (column grants), and clients cannot write kudos.
 * sunners.hearts_total is not client-readable either (review C2): diffing it around a like of an
 * anonymous kudos would name the sender; the owner reads their own total via get_my_sunner().
 * Images (review C1/M2): each path must be /api/kudos/images/<uuid>.<ext> naming an object the
 * caller uploaded and no kudos uses yet. Drafts are real uploads (POST route), removed in afterAll.
 * The success path and "already attached" live in sun-kudos-serial-write-kudos-db.spec.ts.
 */
let sender: SupabaseClient;
let senderUid = '';
/** The viewer's own unattached upload: real, but not the sender's. */
let viewerDraft = '';
/** The sender's upload whose object was deleted afterwards: a path to nothing. */
let deletedDraft = '';
const REJECTIONS: { name: string; field: KudosField; over: () => Partial<CreateKudosArgs> }[] = [
  { name: 'self as recipient', field: 'recipient', over: () => ({ p_receiver_id: SUNNERS.SENDER.id }) },
  { name: 'unknown recipient', field: 'recipient', over: () => ({ p_receiver_id: '5c000000-0000-4000-8000-999999999999' }) },
  { name: 'blank Danh hiệu (trimmed)', field: 'title', over: () => ({ p_title: '   ' }) },
  { name: 'Danh hiệu of 51 chars', field: 'title', over: () => ({ p_title: 'a'.repeat(51) }) },
  { name: 'blank content (trimmed)', field: 'body', over: () => ({ p_body: ' \n ' }) },
  { name: 'content of 2001 chars', field: 'body', over: () => ({ p_body: 'a'.repeat(2001) }) },
  { name: 'no hashtag', field: 'hashtags', over: () => ({ p_hashtag_slugs: [] }) },
  {
    name: '6 hashtags', field: 'hashtags',
    over: () => ({ p_hashtag_slugs: ['dedicated', 'inspring', 'idol-gioi-tre', 'teamwork', 'creative', 'problem-solver'] }),
  },
  { name: 'hashtag not in the list', field: 'hashtags', over: () => ({ p_hashtag_slugs: ['no-such-tag'] }) },
  { name: '6 images', field: 'images', over: () => ({ p_image_paths: [1, 2, 3, 4, 5, 6].map((n) => imagePath(n)) }) },
  { name: "another user's uploaded image", field: 'images', over: () => ({ p_image_paths: [viewerDraft] }) },
  { name: 'an upload whose object was deleted', field: 'images', over: () => ({ p_image_paths: [deletedDraft] }) },
  { name: 'a path no upload ever had', field: 'images', over: () => ({ p_image_paths: [imagePath(1)] }) },
  {
    name: 'a path that names a user (/<uid>/<file>)', field: 'images',
    over: () => ({ p_image_paths: [`/api/kudos/images/${senderUid}/${randomUUID()}.jpg`] }),
  },
  { name: 'image that is not jpg/png', field: 'images', over: () => ({ p_image_paths: [imagePath(1, 'gif')] }) },
  { name: 'image outside /api/kudos/images', field: 'images', over: () => ({ p_image_paths: ['/sun-kudos/gallery/gallery-01.png'] }) },
  {
    name: 'anonymous name of 51 chars', field: 'anonymousName',
    over: () => ({ p_is_anonymous: true, p_anonymous_name: 'a'.repeat(51) }),
  },
];

test.describe('@supabase write kudos — create_kudos rejections and sender privacy', () => {
  test.beforeAll(async () => {
    ({ client: sender, userId: senderUid } = await signedInClient(TEST_ACCOUNTS.SENDER));
    [viewerDraft] = await uploadDrafts(TEST_ACCOUNTS.VIEWER, ['test-image-3.jpg']);
    [deletedDraft] = await uploadDrafts(TEST_ACCOUNTS.SENDER, ['test-image-4.png']);
    await removeStorageObjects([deletedDraft]);
  });

  test.afterAll(async () => {
    await removeStorageObjects([viewerDraft, deletedDraft].filter(Boolean));
  });

  test('anon cannot execute create_kudos (42501)', async () => {
    const { data, error } = await anonClient().rpc('create_kudos', validArgs());
    if (typeof data === 'string') await deleteKudos([data]);

    expect(error?.code).toBe('42501');
    expect(data).toBeNull();
  });

  for (const r of REJECTIONS) {
    test(`create_kudos rejects ${r.name} with 22023 "${r.field}"`, async () => {
      await expectCreateKudosRejected(sender, r.field, r.over());
    });
  }

  test('a rejected call writes nothing: no kudos, hashtag or image rows (atomic)', async () => {
    const tables = ['kudos', 'kudos_hashtags', 'kudos_images'];
    const before = await Promise.all(tables.map(countRows));

    const { data, error } = await createKudos(sender, {
      p_hashtag_slugs: ['dedicated', 'no-such-tag'], p_image_paths: [imagePath(1), imagePath(2, 'png')],
    });
    if (typeof data === 'string') await deleteKudos([data]);

    expect(error?.code).toBe('22023');
    expect(await Promise.all(tables.map(countRows))).toEqual(before);
  });

  test('kudos.sender_id cannot be selected, filtered or reached via select=* (42501)', async () => {
    const anon = anonClient();
    const reads = [
      ['anon id,sender_id', anon.from('kudos').select('id, sender_id')],
      ['anon select=*', anon.from('kudos').select('*')],
      ['anon filter sender_id', anon.from('kudos').select('id').eq('sender_id', SUNNERS.SENDER.id)],
      ['authenticated sender_id', sender.from('kudos').select('sender_id').eq('id', KUDOS_BY_N(59).id)],
    ] as const;
    for (const [label, query] of reads) {
      const { data, error } = await query;
      expect(error?.code, label).toBe('42501');
      expect(data, label).toBeNull();
    }
  });

  test('sunners.hearts_total cannot be selected, embedded or filtered by anon or authenticated (review C2, 42501)', async () => {
    const anon = anonClient();
    const reads = [
      ['anon id,hearts_total', anon.from('sunners').select('id, hearts_total')],
      ['authenticated id,hearts_total', sender.from('sunners').select('id, hearts_total')],
      ['anon kudos→receiver embed', anon.from('kudos').select('id, receiver:sunners!receiver_id(id, hearts_total)')],
      ['authenticated kudos→sender embed', sender.from('kudos').select('id, sender:sunners!public_sender_id(id, hearts_total)')],
      ['anon filter hearts_total', anon.from('sunners').select('id').gt('hearts_total', 0)],
    ] as const;
    for (const [label, query] of reads) {
      const { data, error } = await query;
      expect(error?.code, label).toBe('42501');
      expect(data, label).toBeNull();
    }
  });

  test('authenticated cannot insert or update kudos directly, incl. is_anonymous/anonymous_name (42501)', async () => {
    const forged = await sender.from('kudos').insert({
      sender_id: SUNNERS.CHUC.id, receiver_id: SUNNERS.QUY.id, title: 'IDOL GIỚI TRẺ', body: 'forged',
      is_anonymous: true, anonymous_name: 'forged',
    });
    expect(forged.error?.code, 'insert').toBe('42501');

    const unmask = await sender.from('kudos').update({ is_anonymous: true, anonymous_name: 'x' }).eq('id', KUDOS_BY_N(59).id);
    expect(unmask.error?.code, 'update').toBe('42501');
  });
});
