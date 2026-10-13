import { test, expect, type Page } from '@playwright/test';
import { KUDOS_BY_N, LINK_TEST_EMAILS, SUNNERS, kudosId, receivedCountOf } from './support/kudos-board-seed';
import {
  createAuthUser, deleteAuthUser, deleteKudosRow, deleteThrowawaySunners, findSunnersByUserId,
  insertKudosRow, readSunnerCounters, readSunnerUserId, setReceivedCount, throwawayEmail,
} from './support/kudos-board-db';

/**
 * F006 SC-012 (A11 link_or_create_sunner), SC-013 (A12 received count), US007 (hero tiers).
 * Serial project: creates auth users / kudos and edits QUY's counter; afterEach removes them
 * (deleting the auth user sets sunners.user_id back to NULL) and restores the seed count.
 */
const PASSWORD = 'LinkTest123456!';
const THROWAWAY_ID = kudosId(998);
const QUY_SEED_COUNT = receivedCountOf(SUNNERS.QUY.id);
const TOOLTIPS = [
  'Sunner đã nhận được 10 Kudos và bắt đầu lan tỏa năng lượng ấm áp đến mọi người xung quanh.',
  'Sunner đã nhận được 20 Kudos và chứng minh sức ảnh hưởng của mình qua những hành động lan tỏa tích cực mỗi ngày.',
  'Sunner đã nhận được 50 Kudos và trở thành hình mẫu của sự công nhận, sẻ chia và lan tỏa tinh thần Sun*.',
];
const TIERS: { count: number; label: string; stars: 0 | 1 | 2 | 3 }[] = [
  { count: 9, label: 'New Hero', stars: 0 }, { count: 10, label: 'Rising Hero', stars: 1 },
  { count: 19, label: 'Rising Hero', stars: 1 }, { count: 20, label: 'Super Hero', stars: 2 },
  { count: 49, label: 'Super Hero', stars: 2 }, { count: 50, label: 'Legend Hero', stars: 3 },
];
/** Auth users to delete; `ownSunner` = the trigger created a throwaway Sunner row for it. */
const createdUsers: { id: string; ownSunner: boolean }[] = [];

const firstSlide = (page: Page) =>
  page.getByRole('region', { name: 'HIGHLIGHT KUDOS', exact: true }).locator('[aria-roledescription="slide"]').nth(0);

test.describe('@supabase sunner link + received-count triggers (serial)', () => {
  test.afterEach(async () => {
    for (const user of createdUsers.splice(0)) {
      try {
        if (user.ownSunner) await deleteThrowawaySunners(user.id);
      } finally {
        await deleteAuthUser(user.id); // a linked seed Sunner gets user_id = NULL back
      }
    }
    await deleteKudosRow(THROWAWAY_ID);
    await setReceivedCount(SUNNERS.QUY.id, QUY_SEED_COUNT);
  });

  test('confirmed email matching an unlinked Sunner links it, no second Sunner (SC-012, US008-1)', async () => {
    const userId = await createAuthUser({ email: LINK_TEST_EMAILS.confirmed, password: PASSWORD, confirmed: true });
    createdUsers.push({ id: userId, ownSunner: false });

    expect(await readSunnerUserId(SUNNERS.LINK_1.id)).toBe(userId);
    expect((await findSunnersByUserId(userId)).map((s) => s.id)).toEqual([SUNNERS.LINK_1.id]);
  });

  test('unconfirmed email does not link the seed Sunner and sign-up still succeeds (SC-012, US008-2)', async () => {
    const userId = await createAuthUser({ email: LINK_TEST_EMAILS.unconfirmed, password: PASSWORD, confirmed: false });
    createdUsers.push({ id: userId, ownSunner: true });

    expect(await readSunnerUserId(SUNNERS.LINK_2.id)).toBeNull();
    expect((await findSunnersByUserId(userId)).map((s) => s.id)).not.toContain(SUNNERS.LINK_2.id);
  });

  test('an email matching no Sunner creates a new Sunner from user metadata (SC-012, BR-011)', async () => {
    const userId = await createAuthUser({
      email: throwawayEmail('newsunner'), password: PASSWORD, confirmed: true, fullName: 'Throwaway Kudos Tester',
    });
    createdUsers.push({ id: userId, ownSunner: true });

    const rows = await findSunnersByUserId(userId);
    expect(rows).toHaveLength(1);
    expect(rows[0].full_name).toBe('Throwaway Kudos Tester');
  });

  test('inserting a kudos adds 1 to the receiver, deleting removes 1, never below 0 (SC-013, BR-012)', async () => {
    const before = (await readSunnerCounters(SUNNERS.QUY.id)).received;
    expect(before).toBe(QUY_SEED_COUNT);

    await insertKudosRow({ id: THROWAWAY_ID, sender_id: SUNNERS.HLINH.id, receiver_id: SUNNERS.QUY.id, body: 'throwaway' });
    expect((await readSunnerCounters(SUNNERS.QUY.id)).received).toBe(before + 1);
    await deleteKudosRow(THROWAWAY_ID);
    expect((await readSunnerCounters(SUNNERS.QUY.id)).received).toBe(before);

    await insertKudosRow({ id: THROWAWAY_ID, sender_id: SUNNERS.HLINH.id, receiver_id: SUNNERS.QUY.id, body: 'throwaway' });
    await setReceivedCount(SUNNERS.QUY.id, 0);
    await deleteKudosRow(THROWAWAY_ID);
    expect((await readSunnerCounters(SUNNERS.QUY.id)).received).toBe(0);
  });

  test('hero tier on the card follows kudos received at 9/10/19/20/49/50 (US007, BR-003)', async ({ page }) => {
    for (const tier of TIERS) {
      await setReceivedCount(SUNNERS.QUY.id, tier.count);
      await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
      const card = firstSlide(page); // K49: SENDER (New Hero) -> QUY
      await expect(card, `count ${tier.count}`).toContainText(KUDOS_BY_N(49).timeLabel);

      const expectedNew = tier.label === 'New Hero' ? 2 : 1;
      await expect(card.getByText('New Hero', { exact: true }), `count ${tier.count}`).toHaveCount(expectedNew);
      if (tier.label !== 'New Hero') {
        await expect(card.getByText(tier.label, { exact: true }), `count ${tier.count}`).toHaveCount(1);
      }
      for (const [i, text] of TOOLTIPS.entries()) {
        await expect(card.getByText(text, { exact: true }), `count ${tier.count} tooltip ${i + 1}`)
          .toHaveCount(tier.stars === i + 1 ? 1 : 0);
      }
    }
  });
});
