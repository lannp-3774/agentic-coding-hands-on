import { test, expect } from '@playwright/test';
import type { SupabaseClient } from '@supabase/supabase-js';
import { OPENED_BOXES, SECRET_BOXES, SUNNERS, TEST_ACCOUNTS, boxId } from './support/kudos-board-seed';
import { anonClient, signedInClient } from './support/kudos-board-db';

/**
 * F009 SC-008 · FR-602, BR-001, BR-004 (get_my_sunner checks live in the kudos-board read spec).
 * Opened boxes are public-read; unopened boxes are readable only by their owner; no client writes.
 */
const COLUMNS = 'id, owner_id, gift_name, opened_at';
const sortedIds = (rows: { id: string }[]) => rows.map((r) => r.id).sort();

async function expectWritesDenied(client: SupabaseClient) {
  const inserted = await client.from('secret_boxes')
    .insert({ owner_id: SUNNERS.VIEWER.id, gift_name: 'forged', opened_at: null });
  expect(inserted.error?.code, 'insert').toBe('42501');
  const opened = await client.from('secret_boxes')
    .update({ opened_at: new Date().toISOString() }).eq('id', boxId(13));
  expect(opened.error?.code, 'update').toBe('42501');
  const deleted = await client.from('secret_boxes').delete().eq('id', boxId(1));
  expect(deleted.error?.code, 'delete').toBe('42501');
}

test.describe('@supabase secret_boxes schema and RLS', () => {
  test('anon reads every opened box and no unopened box', async () => {
    const { data, error } = await anonClient().from('secret_boxes').select(COLUMNS);

    expect(error).toBeNull();
    const rows = (data ?? []) as { id: string; opened_at: string | null }[];
    expect(sortedIds(rows)).toEqual(sortedIds(OPENED_BOXES));
    expect(rows.every((r) => r.opened_at !== null)).toBe(true);
  });

  test("owner reads opened boxes plus only their own unopened boxes", async () => {
    const { client } = await signedInClient(TEST_ACCOUNTS.VIEWER);

    const { data, error } = await client.from('secret_boxes').select(COLUMNS);

    expect(error).toBeNull();
    const visible = SECRET_BOXES.filter((b) => b.openedAt !== null || b.ownerId === SUNNERS.VIEWER.id);
    expect(sortedIds((data ?? []) as { id: string }[])).toEqual(sortedIds(visible));
    const unopened = ((data ?? []) as { owner_id: string; opened_at: string | null }[]).filter((r) => r.opened_at === null);
    expect(unopened).toHaveLength(3);
    expect(unopened.every((r) => r.owner_id === SUNNERS.VIEWER.id)).toBe(true);
  });

  test('another user cannot read the owner unopened boxes', async () => {
    const { client } = await signedInClient(TEST_ACCOUNTS.SENDER);

    const { data, error } = await client.from('secret_boxes').select(COLUMNS).is('opened_at', null);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  test('anon cannot insert, open (update) or delete boxes', async () => {
    await expectWritesDenied(anonClient());
  });

  test('authenticated owner cannot insert, open (update) or delete boxes', async () => {
    const { client } = await signedInClient(TEST_ACCOUNTS.VIEWER);
    await expectWritesDenied(client);
  });
});
