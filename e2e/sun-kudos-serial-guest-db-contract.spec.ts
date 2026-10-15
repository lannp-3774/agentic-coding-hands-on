import { test, expect } from '@playwright/test';
import { KUDOS_BY_N, TEST_ACCOUNTS } from './support/kudos-board-seed';
import { anonClient, deleteLikesBy, readLikeCount, signedInClient } from './support/kudos-board-db';
import { lockGateFor, redirectPath, restorePrelaunchSeed } from './support/prelaunch-setting';
import {
  createKudos, deleteKudos, expectCreateKudosRejected, kudosIdsCreatedSince, readKudosRow,
} from './support/write-kudos-db';
import {
  GUEST_SUNNER_NAME, anonymousSession, cookieHeader, deleteGuestsCreatedSince, setProfileRole, sunnersOfUser,
  windowStart, type AnonymousSession,
} from './support/guest-anonymous-db';

/**
 * @supabase guest-as-Anonymous DB contract (plan.md "Contracts", clarifications 2026-10-14), through
 * a REAL anonymous session (`signInAnonymously()` against local Supabase, Data API as that user):
 * the auth.users trigger creates a guest Sunner; create_kudos forces anonymous for guests and
 * refuses a guest recipient; hearts work; an anonymous user is never admin.
 * Serial project: one anonymous user per file (created lazily, asserted in each test). afterEach
 * deletes kudos and likes made meanwhile and re-opens the gate; afterAll deletes the anonymous
 * users created by this file with their guest Sunner.
 */
const ONE_HOUR_MS = 60 * 60 * 1000;
const K60 = KUDOS_BY_N(60);
let fileStartedAt = '';
let startedAt = '';
let cached: AnonymousSession | null = null;

/** The file's anonymous user and its guest Sunner id (sign-in asserted, not assumed). */
async function guest(): Promise<AnonymousSession & { sunnerId: string }> {
  if (!cached) {
    const session = await anonymousSession();
    expect(session.error, 'anonymous sign-in should succeed').toBeNull();
    expect(session.userId, 'the anonymous session has a user').toMatch(/^[0-9a-f-]{36}$/);
    cached = session;
  }
  const rows = await sunnersOfUser(cached.userId);
  expect(rows, 'a guest Sunner should exist for the anonymous user').toHaveLength(1);
  return { ...cached, sunnerId: rows[0].id };
}

test.describe('@supabase guest-as-Anonymous DB contract (serial)', () => {
  test.beforeAll(() => {
    fileStartedAt = windowStart();
  });

  test.beforeEach(() => {
    startedAt = windowStart();
  });

  test.afterEach(async () => {
    await deleteKudos(await kudosIdsCreatedSince(startedAt));
    if (cached) {
      await deleteLikesBy([cached.userId]);
      await setProfileRole(cached.userId, 'user');
    }
    await restorePrelaunchSeed();
  });

  test.afterAll(async () => {
    cached = null;
    await deleteGuestsCreatedSince(fileStartedAt);
  });

  test('anonymous sign-in creates a guest Sunner: is_guest, user_id = anon uid, "Ẩn danh", no email', async () => {
    const g = await guest();

    expect(await sunnersOfUser(g.userId)).toEqual([
      { id: g.sunnerId, full_name: GUEST_SUNNER_NAME, email: null, user_id: g.userId, is_guest: true },
    ]);
    const { data, error } = await g.client.rpc('get_my_sunner');
    expect(error).toBeNull();
    expect((data as { id: string }[]).map((r) => r.id), 'get_my_sunner works for a guest').toEqual([g.sunnerId]);
  });

  test('create_kudos from an anonymous session stores is_anonymous = true even when p_is_anonymous = false', async () => {
    const g = await guest();

    const { data: id, error } = await createKudos(g.client, { p_is_anonymous: false, p_anonymous_name: '' });

    expect(error, 'a guest can send a kudos').toBeNull();
    expect(await readKudosRow(id as string)).toMatchObject({
      sender_id: g.sunnerId, is_anonymous: true, anonymous_name: null, public_sender_id: null,
    });
    const sent = await g.client.rpc('get_my_sent_kudos_count');
    expect(sent.error).toBeNull();
    expect(sent.data, "the guest's own sent count").toBe(1);
  });

  test('a guest Sunner can never be a recipient: create_kudos → 22023 recipient', async () => {
    const g = await guest();
    const { client: sender } = await signedInClient(TEST_ACCOUNTS.SENDER);

    await expectCreateKudosRejected(sender, 'recipient', { p_receiver_id: g.sunnerId });
  });

  test('an anonymous session can like and unlike; like_count moves', async () => {
    const g = await guest();
    const base = await readLikeCount(K60.id);

    const liked = await g.client.from('kudos_likes').insert({ kudos_id: K60.id, user_id: g.userId });
    expect(liked.error, 'an anonymous session can like').toBeNull();
    expect(await readLikeCount(K60.id)).toBe(base + 1);

    const unliked = await g.client.from('kudos_likes').delete().eq('kudos_id', K60.id).eq('user_id', g.userId).select('kudos_id');
    expect(unliked.error, 'an anonymous session can unlike').toBeNull();
    expect(unliked.data).toHaveLength(1);
    expect(await readLikeCount(K60.id)).toBe(base);
  });

  test('kudos_sent_by_me answers only about the caller: own anonymous kudos yes, others no, anon denied', async () => {
    const g = await guest();
    const { data: ownId, error } = await createKudos(g.client);
    expect(error).toBeNull();
    const asked = [ownId as string, K60.id];

    const mine = await g.client.rpc('kudos_sent_by_me', { p_kudos_ids: asked });
    expect(mine.error).toBeNull();
    expect(mine.data, "the guest's own anonymous kudos only").toEqual([ownId]);

    const { client: other } = await signedInClient(TEST_ACCOUNTS.SENDER);
    const theirs = await other.rpc('kudos_sent_by_me', { p_kudos_ids: [ownId as string] });
    expect(theirs.error).toBeNull();
    expect(theirs.data, 'another account never learns who sent an anonymous kudos').toEqual([]);

    const anon = await anonClient().rpc('kudos_sent_by_me', { p_kudos_ids: asked });
    expect(anon.error?.code, 'not executable without a session').toBe('42501');
  });

  test('an anonymous user is never admin: even with profiles.role = admin the locked gate redirects', async ({ request }) => {
    const g = await guest();
    await setProfileRole(g.userId, 'admin'); // an operator mistake; the role must still not count
    await lockGateFor(ONE_HOUR_MS);

    const response = await request.get('/', { maxRedirects: 0, headers: cookieHeader(g.cookies()) });

    expect(response.status(), 'an anonymous session never passes the admin-only gate').toBe(307);
    expect(redirectPath(response)).toBe('/countdown');
  });
});
