import { test, expect } from '@playwright/test';
import type { SupabaseClient } from '@supabase/supabase-js';
import { KUDOS_BY_N, SUNNERS, TEST_ACCOUNTS } from './support/kudos-board-seed';
import { anonClient, signedInClient } from './support/kudos-board-db';

/**
 * F006 SC-011 (write half) · FR-001, FR-002, FR-601, BR-001, F007 FR-604.
 * No client role may insert/update/delete any board table or write a counter column:
 * every attempt is refused with 42501 (privilege revoked), not silently ignored.
 */
const K = KUDOS_BY_N(60);
type Write = { table: string; insert: Record<string, unknown>; update: Record<string, unknown>; match: [string, string] };

const WRITES: Write[] = [
  { table: 'departments', insert: { code: 'ZZZ', name: 'ZZZ' }, update: { name: 'x' }, match: ['code', 'CEVC10'] },
  { table: 'hashtags', insert: { slug: 'zzz', label: 'ZZZ', sort_order: 99 }, update: { label: 'x' }, match: ['slug', 'teamwork'] },
  {
    table: 'sunners', insert: { full_name: 'Intruder', email: 'intruder@example.com' },
    update: { full_name: 'x' }, match: ['id', SUNNERS.CHUC.id],
  },
  {
    table: 'kudos', insert: { sender_id: SUNNERS.VIEWER.id, receiver_id: SUNNERS.CHUC.id, body: 'forged' },
    update: { body: 'x' }, match: ['id', K.id],
  },
  { table: 'kudos_hashtags', insert: { kudos_id: K.id, hashtag_slug: 'creative' }, update: { hashtag_slug: 'creative' }, match: ['kudos_id', K.id] },
  {
    table: 'kudos_images', insert: { kudos_id: K.id, sort_order: 1, image_path: '/sun-kudos/gallery/gallery-01.png' },
    update: { image_path: '/x.png' }, match: ['kudos_id', KUDOS_BY_N(54).id],
  },
];

const COUNTER_WRITES: { table: string; update: Record<string, number>; match: [string, string] }[] = [
  { table: 'kudos', update: { like_count: 999 }, match: ['id', K.id] },
  { table: 'sunners', update: { hearts_total: 999 }, match: ['id', SUNNERS.VIEWER.id] },
  { table: 'sunners', update: { kudos_received_count: 999 }, match: ['id', SUNNERS.VIEWER.id] },
];

async function expectAllWritesDenied(client: SupabaseClient, w: Write) {
  const inserted = await client.from(w.table).insert(w.insert);
  expect(inserted.error?.code, `${w.table} insert`).toBe('42501');
  const updated = await client.from(w.table).update(w.update).eq(...w.match);
  expect(updated.error?.code, `${w.table} update`).toBe('42501');
  const deleted = await client.from(w.table).delete().eq(...w.match);
  expect(deleted.error?.code, `${w.table} delete`).toBe('42501');
}

test.describe('@supabase kudos board schema and RLS — writes denied', () => {
  for (const w of WRITES) {
    test(`anon cannot insert/update/delete ${w.table}`, async () => {
      await expectAllWritesDenied(anonClient(), w);
    });

    test(`authenticated cannot insert/update/delete ${w.table}`, async () => {
      const { client } = await signedInClient(TEST_ACCOUNTS.VIEWER);
      await expectAllWritesDenied(client, w);
    });
  }

  test('authenticated cannot write like_count, hearts_total or kudos_received_count (FR-604)', async () => {
    const { client } = await signedInClient(TEST_ACCOUNTS.VIEWER);
    for (const c of COUNTER_WRITES) {
      const { error } = await client.from(c.table).update(c.update).eq(...c.match);
      expect(error?.code, `${c.table} ${Object.keys(c.update)[0]}`).toBe('42501');
    }
  });

  test('authenticated cannot read sunners.email / user_id', async () => {
    const { client } = await signedInClient(TEST_ACCOUNTS.VIEWER);
    for (const columns of ['id, email', 'id, user_id']) {
      const { error } = await client.from('sunners').select(columns);
      expect(error?.code, columns).toBe('42501');
    }
  });
});
