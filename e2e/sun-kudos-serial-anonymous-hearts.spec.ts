import { test, expect } from '@playwright/test';
import type { SupabaseClient } from '@supabase/supabase-js';
import { TEST_ACCOUNTS, vnTimeLabel } from './support/kudos-board-seed';
import { anonClient, deleteLikesBy, readLikeCount, signInBrowser, signedInClient } from './support/kudos-board-db';
import { createKudos, deleteKudos, kudosIdsCreatedSince, readKudosRow } from './support/write-kudos-db';

/**
 * Review round 2, C2 (clarifications 2026-10-14 "review round 2"): liking an ANONYMOUS kudos must
 * not reveal its sender. The sender still earns the hearts, but sunners.hearts_total is no longer
 * client-readable, so nobody can diff it around a like. The card's heart count (kudos.like_count)
 * stays public and still moves; the sender reads their own total through get_my_sunner().
 * Serial project: each test starts with a fresh anonymous kudos by SENDER (to QUY); afterEach
 * deletes VIEWER's likes (the trigger takes the hearts back) and that kudos.
 */
const GRANTED_SUNNER_COLUMNS = 'id, full_name, department_code, avatar_url, kudos_received_count, created_at';
const countText = (n: number) => new RegExp(`(^|\\D)${n}(\\D|$)`);

let viewer: { client: SupabaseClient; userId: string };
let sender: SupabaseClient;
let startedAt = '';
let kudosId = '';

/** What a client can read about every Sunner through the REST API, hearts_total included (rows or the refusal). */
async function observeSunners(client: SupabaseClient) {
  const granted = await client.from('sunners').select(GRANTED_SUNNER_COLUMNS).order('id');
  expect(granted.error).toBeNull();
  const hearts = await client.from('sunners').select('id, hearts_total').order('id');
  return { granted: granted.data, hearts: hearts.error ? `refused ${hearts.error.code}` : hearts.data };
}

/** The caller's own hearts_total, the sidebar's source (get_my_sunner, F009). */
async function ownHearts(client: SupabaseClient): Promise<number> {
  const { data, error } = await client.rpc('get_my_sunner');
  expect(error).toBeNull();
  return (data as { hearts_total: number }[])[0].hearts_total;
}

/** VIEWER likes the kudos through the client contract; returns the stored weight (1, or 2 on a special day). */
async function likeAsViewer(): Promise<number> {
  expect((await viewer.client.from('kudos_likes').insert({ kudos_id: kudosId, user_id: viewer.userId })).error).toBeNull();
  const own = await viewer.client.from('kudos_likes').select('weight').eq('kudos_id', kudosId).single();
  expect(own.error).toBeNull();
  return own.data!.weight as number;
}

test.describe('@supabase hearts on an anonymous kudos (serial)', () => {
  test.beforeAll(async () => {
    viewer = await signedInClient(TEST_ACCOUNTS.VIEWER);
    sender = (await signedInClient(TEST_ACCOUNTS.SENDER)).client;
  });

  test.beforeEach(async () => {
    startedAt = new Date(Date.now() - 1000).toISOString();
    const { data, error } = await createKudos(sender, { p_is_anonymous: true });
    expect(error).toBeNull();
    kudosId = data as string;
  });

  test.afterEach(async () => {
    await deleteLikesBy([viewer.userId]);
    await deleteKudos(await kudosIdsCreatedSince(startedAt));
  });

  test('a like reveals nothing: no Sunner read through the REST API changes, for the liker or anon (C2)', async () => {
    const observers = [viewer.client, anonClient()];
    const before = await Promise.all(observers.map(observeSunners));

    await likeAsViewer();

    expect(await readLikeCount(kudosId), 'the like itself landed').toBe(1);
    expect(await Promise.all(observers.map(observeSunners))).toEqual(before);
  });

  test("the sender still earns the hearts: get_my_sunner()'s hearts_total rises by the like weight", async () => {
    const before = await ownHearts(sender);

    const weight = await likeAsViewer();

    expect(await ownHearts(sender)).toBe(before + weight);
  });

  test("the anonymous card's heart count stays public and still increments", async ({ context, page }) => {
    await signInBrowser(context, TEST_ACCOUNTS.VIEWER);
    const createdAt = (await readKudosRow(kudosId)).created_at as string;
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    const heart = page.getByRole('region', { name: 'ALL KUDOS', exact: true }).getByRole('article')
      .filter({ hasText: vnTimeLabel(createdAt) }).locator('button[aria-pressed]');
    await expect(heart).toHaveText(countText(0));

    await heart.click();

    await expect(heart).toHaveAttribute('aria-pressed', 'true');
    await expect(heart).toHaveText(countText(1));
    await expect.poll(async () => {
      const { data, error } = await anonClient().from('kudos').select('like_count').eq('id', kudosId).single();
      return error ? `refused ${error.code}` : data.like_count;
    }, { message: 'anon reads the new like_count' }).toBe(1);
  });
});
