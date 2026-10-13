import { test, expect } from '@playwright/test';
import type { SupabaseClient } from '@supabase/supabase-js';
import { KUDOS_BY_N, SUNNERS, TEST_ACCOUNTS, kudosId } from './support/kudos-board-seed';
import {
  anonClient, deleteKudosRow, deleteLikesBy, deleteSpecialDay, insertKudosRow, readLikeCount,
  readSunnerCounters, setSpecialDay, signedInClient, todayInVietnam,
} from './support/kudos-board-db';

/**
 * F007 SC-001..SC-005, US005, US006 · BR-001..BR-006, FR-003, FR-405, FR-603, FR-604, ALG-001.
 * Serial project: likes move shared counters; afterEach deletes every like written here (the
 * AFTER DELETE trigger restores like_count / hearts_total), today's special day and the
 * throwaway kudos.
 */
const LIKED = KUDOS_BY_N(52); // XUAN -> HLINH, neither test account is sender or receiver
const OWN = KUDOS_BY_N(49); // sent by SENDER
const THROWAWAY_ID = kudosId(999);

let viewer: { client: SupabaseClient; userId: string };
let sender: { client: SupabaseClient; userId: string };

test.describe('@supabase kudos_likes invariants (serial)', () => {
  test.beforeAll(async () => {
    viewer = await signedInClient(TEST_ACCOUNTS.VIEWER);
    sender = await signedInClient(TEST_ACCOUNTS.SENDER);
  });

  test.afterEach(async () => {
    await deleteLikesBy([viewer.userId, sender.userId]);
    await deleteSpecialDay(todayInVietnam());
    await deleteKudosRow(THROWAWAY_ID);
  });

  test('the sender cannot like their own kudos: check_violation, counters unchanged (SC-001, BR-002)', async () => {
    const before = { likes: await readLikeCount(OWN.id), hearts: (await readSunnerCounters(SUNNERS.SENDER.id)).hearts };

    const { error } = await sender.client.from('kudos_likes').insert({ kudos_id: OWN.id, user_id: sender.userId });

    expect(error?.code).toBe('23514');
    expect(await readLikeCount(OWN.id)).toBe(before.likes);
    expect((await readSunnerCounters(SUNNERS.SENDER.id)).hearts).toBe(before.hearts);
  });

  test('a second like by the same user is a unique violation; like_count moves once (SC-002, BR-001)', async () => {
    const before = await readLikeCount(LIKED.id);
    const row = { kudos_id: LIKED.id, user_id: viewer.userId };

    expect((await viewer.client.from('kudos_likes').insert(row)).error).toBeNull();
    const second = await viewer.client.from('kudos_likes').insert(row);

    expect(second.error?.code).toBe('23505');
    expect(await readLikeCount(LIKED.id)).toBe(before + 1);
  });

  test('normal day: weight 1, sender +1 heart; unlike gives it back (SC-004, BR-003, BR-004)', async () => {
    await deleteSpecialDay(todayInVietnam());
    const before = { likes: await readLikeCount(LIKED.id), hearts: (await readSunnerCounters(SUNNERS.XUAN.id)).hearts };

    expect((await viewer.client.from('kudos_likes').insert({ kudos_id: LIKED.id, user_id: viewer.userId })).error).toBeNull();
    const own = await viewer.client.from('kudos_likes').select('kudos_id, weight').eq('kudos_id', LIKED.id);
    expect(own.error).toBeNull();
    expect(own.data).toEqual([{ kudos_id: LIKED.id, weight: 1 }]);
    expect(await readLikeCount(LIKED.id)).toBe(before.likes + 1);
    expect((await readSunnerCounters(SUNNERS.XUAN.id)).hearts).toBe(before.hearts + 1);

    expect((await viewer.client.from('kudos_likes').delete().eq('kudos_id', LIKED.id)).error).toBeNull();
    expect(await readLikeCount(LIKED.id)).toBe(before.likes);
    expect((await readSunnerCounters(SUNNERS.XUAN.id)).hearts).toBe(before.hearts);
  });

  test('special day: weight 2, sender +2; unlike after the day is removed still takes back 2 (SC-003, US006-1)', async () => {
    const before = { likes: await readLikeCount(LIKED.id), hearts: (await readSunnerCounters(SUNNERS.XUAN.id)).hearts };
    await setSpecialDay(todayInVietnam(), 2);

    expect((await viewer.client.from('kudos_likes').insert({ kudos_id: LIKED.id, user_id: viewer.userId })).error).toBeNull();
    const own = await viewer.client.from('kudos_likes').select('weight').eq('kudos_id', LIKED.id).single();
    expect(own.data?.weight).toBe(2);
    expect(await readLikeCount(LIKED.id)).toBe(before.likes + 1);
    expect((await readSunnerCounters(SUNNERS.XUAN.id)).hearts).toBe(before.hearts + 2);

    await deleteSpecialDay(todayInVietnam());
    expect((await viewer.client.from('kudos_likes').delete().eq('kudos_id', LIKED.id)).error).toBeNull();
    expect(await readLikeCount(LIKED.id)).toBe(before.likes);
    expect((await readSunnerCounters(SUNNERS.XUAN.id)).hearts).toBe(before.hearts);
  });

  test('deleting a kudos deducts the stored like weights from its sender (A5 cascade, A12)', async () => {
    const before = { hearts: (await readSunnerCounters(SUNNERS.HLINH.id)).hearts, received: (await readSunnerCounters(SUNNERS.QUY.id)).received };
    await insertKudosRow({ id: THROWAWAY_ID, sender_id: SUNNERS.HLINH.id, receiver_id: SUNNERS.QUY.id, body: 'throwaway' });
    await setSpecialDay(todayInVietnam(), 2);
    expect((await viewer.client.from('kudos_likes').insert({ kudos_id: THROWAWAY_ID, user_id: viewer.userId })).error).toBeNull();
    expect((await readSunnerCounters(SUNNERS.HLINH.id)).hearts).toBe(before.hearts + 2);

    await deleteKudosRow(THROWAWAY_ID);

    expect((await readSunnerCounters(SUNNERS.HLINH.id)).hearts).toBe(before.hearts);
    expect((await readSunnerCounters(SUNNERS.QUY.id)).received).toBe(before.received);
  });

  test('anon: cannot insert likes, select returns [] without error (SC-005, FR-603)', async () => {
    const anon = anonClient();

    const inserted = await anon.from('kudos_likes').insert({ kudos_id: LIKED.id, user_id: viewer.userId });
    expect(inserted.error?.code).toBe('42501');
    const read = await anon.from('kudos_likes').select('kudos_id, user_id');
    expect(read.error).toBeNull();
    expect(read.data).toEqual([]);
  });

  test('authenticated: own rows only, no weight, no other user_id, no update (SC-005, FR-604)', async () => {
    expect((await sender.client.from('kudos_likes').insert({ kudos_id: LIKED.id, user_id: sender.userId })).error).toBeNull();
    expect((await viewer.client.from('kudos_likes').insert({ kudos_id: LIKED.id, user_id: viewer.userId })).error).toBeNull();

    const mine = await viewer.client.from('kudos_likes').select('kudos_id, user_id');
    expect(mine.error).toBeNull();
    expect(mine.data).toEqual([{ kudos_id: LIKED.id, user_id: viewer.userId }]);
    const withWeight = await viewer.client.from('kudos_likes').insert({ kudos_id: KUDOS_BY_N(60).id, user_id: viewer.userId, weight: 2 });
    expect(withWeight.error?.code).toBe('42501');
    const forOther = await viewer.client.from('kudos_likes').insert({ kudos_id: KUDOS_BY_N(60).id, user_id: sender.userId });
    expect(forOther.error?.code).toBe('42501');
    const updated = await viewer.client.from('kudos_likes').update({ weight: 2 }).eq('kudos_id', LIKED.id);
    expect(updated.error?.code).toBe('42501');
  });

  test('anon and authenticated cannot write special_days (US006-2)', async () => {
    for (const client of [anonClient(), viewer.client]) {
      const { error } = await client.from('special_days').insert({ day: todayInVietnam(), weight: 2 });
      expect(error?.code).toBe('42501');
    }
  });
});
