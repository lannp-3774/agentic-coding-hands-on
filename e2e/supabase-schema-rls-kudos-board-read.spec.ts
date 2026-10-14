import { test, expect } from '@playwright/test';
import {
  DEPARTMENTS, HASHTAGS, KUDOS, KUDOS_BY_N, KUDOS_TOTAL, SUNNERS, TEST_ACCOUNTS, receivedCountOf,
} from './support/kudos-board-seed';
import { anonClient, signedInClient } from './support/kudos-board-db';

/**
 * F006 SC-011 (read half), F008 SC-011, get_my_sunner (F006 §4.2, F009 SC-008 part).
 * anon/authenticated read the six board tables with explicit columns; `sunners.email` and
 * `sunners.user_id` are not granted; get_my_sunner() is authenticated-only and returns the
 * caller's own row without email/user_id. Seed values come from the seed contract.
 */
// hearts_total is not granted (write-kudos review C2); the owner reads it through get_my_sunner().
const SUNNER_COLUMNS = 'id, full_name, department_code, avatar_url, kudos_received_count, created_at';
// Write-kudos contract: sender_id is no longer client-readable; public_sender_id exposes the sender (NULL if anonymous).
const KUDOS_COLUMNS = 'id, seq, public_sender_id, receiver_id, title, body, like_count, created_at';

test.describe('@supabase kudos board schema and RLS — reads', () => {
  test('anon reads departments and hashtags exactly as seeded', async () => {
    const client = anonClient();

    const departments = await client.from('departments').select('code, name').order('code');
    expect(departments.error).toBeNull();
    expect((departments.data ?? []).map((d) => d.code)).toEqual([...DEPARTMENTS]);

    const hashtags = await client.from('hashtags').select('slug, label, sort_order').order('sort_order');
    expect(hashtags.error).toBeNull();
    expect(hashtags.data).toEqual(HASHTAGS.map((h) => ({ slug: h.slug, label: h.label, sort_order: h.sortOrder })));
  });

  test('anon reads every kudos in seq order with seeded like_count (F008 SC-011)', async () => {
    const { data, error } = await anonClient().from('kudos').select(KUDOS_COLUMNS).order('seq');

    expect(error).toBeNull();
    const rows = data ?? [];
    expect(rows).toHaveLength(KUDOS_TOTAL);
    expect(rows.map((r) => r.id)).toEqual(KUDOS.map((r) => r.id));
    expect(rows.map((r) => r.like_count)).toEqual(KUDOS.map((r) => r.likeCount));
    expect(rows.map((r) => r.public_sender_id)).toEqual(KUDOS.map((r) => r.senderId)); // seed kudos are all named
    expect(rows[59].title).toBeNull();
    expect(rows[48].title).toBe(KUDOS_BY_N(49).title);
    const time = rows.find((r) => r.id === KUDOS_BY_N(55).id)!.created_at as string;
    expect(Date.parse(time)).toBe(Date.parse(KUDOS_BY_N(55).createdAt));
  });

  test('anon reads kudos_hashtags and kudos_images links', async () => {
    const client = anonClient();
    const tags = await client.from('kudos_hashtags').select('kudos_id, hashtag_slug');
    expect(tags.error).toBeNull();
    expect(tags.data).toHaveLength(KUDOS.reduce((sum, r) => sum + r.hashtags.length, 0));

    const rich = KUDOS_BY_N(54);
    const images = await client.from('kudos_images').select('kudos_id, sort_order, image_path').order('sort_order');
    expect(images.error).toBeNull();
    expect((images.data ?? []).filter((i) => i.kudos_id === rich.id).map((i) => i.image_path)).toEqual(rich.images);
  });

  test('anon reads sunners through granted columns; received counts match the seed (A12)', async () => {
    const { data, error } = await anonClient().from('sunners').select(SUNNER_COLUMNS);

    expect(error).toBeNull();
    const byId = new Map((data ?? []).map((s) => [s.id as string, s]));
    for (const s of Object.values(SUNNERS)) {
      expect(byId.get(s.id)?.full_name).toBe(s.name);
      expect(byId.get(s.id)?.kudos_received_count).toBe(receivedCountOf(s.id));
    }
    expect(byId.get(SUNNERS.CHUC.id)?.kudos_received_count).toBe(50);
  });

  test('anon cannot read sunners.email, sunners.user_id or select=* (42501)', async () => {
    const client = anonClient();
    for (const columns of ['id, email', 'id, user_id', '*']) {
      const { error } = await client.from('sunners').select(columns);
      expect(error?.code).toBe('42501');
    }
  });

  test('anon cannot call get_my_sunner()', async () => {
    const { error } = await anonClient().rpc('get_my_sunner');

    expect(error?.code).toBe('42501');
  });

  test('authenticated get_my_sunner() returns only the caller row, without email/user_id', async () => {
    const { client } = await signedInClient(TEST_ACCOUNTS.VIEWER);

    const { data, error } = await client.rpc('get_my_sunner');

    expect(error).toBeNull();
    const rows = (Array.isArray(data) ? data : [data]) as Record<string, unknown>[];
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(SUNNERS.VIEWER.id);
    expect(rows[0].full_name).toBe(SUNNERS.VIEWER.name);
    expect(Object.keys(rows[0])).not.toContain('email');
    expect(Object.keys(rows[0])).not.toContain('user_id');
  });
});
