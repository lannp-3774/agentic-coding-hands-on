import { test, expect, type Page } from '@playwright/test';
import { SUNNERS, TEST_ACCOUNTS } from './support/kudos-board-seed';
import { signInBrowser } from './support/kudos-board-db';
import { modal, openWriteKudosModal, option, recipientBox } from './support/write-kudos-helpers';
import {
  GUEST_SUNNER_NAME, anonymousSession, anonymousUserIdsSince, deleteGuestsCreatedSince, sunnersOfUser, windowStart,
  type AnonymousSession,
} from './support/guest-anonymous-db';
import { RECIPIENT_NO_RESULTS, openModalAsGuest } from './support/guest-anonymous-ui';

/**
 * Guest Sunners (full_name "Ẩn danh", is_guest) never appear in recipient search
 * (clarifications 2026-10-14; plan.md `searchSunners` excludes is_guest), whoever searches.
 * Another guest is created through a real anonymous session (REST) once per file, so the
 * searching guest cannot pass only because the modal hides the viewer's own Sunner.
 * Serial project: afterAll deletes every anonymous user created by this file, with its Sunner.
 */
let fileStartedAt = '';
let otherGuest: AnonymousSession | null = null;

/** A guest Sunner that exists before anyone searches (created lazily, kept for the file). */
async function existingGuestSunner() {
  if (!otherGuest) {
    const session = await anonymousSession();
    expect(session.error, 'anonymous sign-in should succeed').toBeNull();
    otherGuest = session;
  }
  const rows = await sunnersOfUser(otherGuest.userId);
  expect(rows, 'the anonymous user has a guest Sunner "Ẩn danh"').toEqual([
    expect.objectContaining({ full_name: GUEST_SUNNER_NAME, is_guest: true }),
  ]);
  return rows[0];
}

/** Search works (a seed Sunner is found), yet "Ẩn danh" finds nobody. */
async function expectGuestsNotSearchable(page: Page) {
  await recipientBox(page).fill('Quy');
  await expect(option(page, new RegExp(SUNNERS.QUY.name)), 'recipient search answers').toBeVisible();

  await recipientBox(page).fill(GUEST_SUNNER_NAME);

  await expect(modal(page).getByText(RECIPIENT_NO_RESULTS), 'no Sunner matches "Ẩn danh"').toBeVisible();
  await expect(modal(page).getByRole('option')).toHaveCount(0);
}

test.describe('Sun* Kudos — guest Sunners are not searchable (serial)', () => {
  test.beforeAll(() => {
    fileStartedAt = windowStart();
  });

  test.afterAll(async () => {
    otherGuest = null;
    await deleteGuestsCreatedSince(fileStartedAt);
  });

  test('signed-in Sunner: recipient search never lists a guest Sunner', async ({ page, context }) => {
    await existingGuestSunner();
    await signInBrowser(context, TEST_ACCOUNTS.SENDER);
    await openWriteKudosModal(page);

    await expectGuestsNotSearchable(page);
  });

  test('guest: recipient search never lists a guest Sunner', async ({ page }) => {
    const testStartedAt = windowStart();
    await openModalAsGuest(page);
    const ownIds = (await anonymousUserIdsSince(testStartedAt)).filter((id) => id !== otherGuest?.userId);
    expect(ownIds, 'opening the dialog created one anonymous session').toHaveLength(1);
    expect(await sunnersOfUser(ownIds[0]), "the searching guest's own guest Sunner").toHaveLength(1);
    await existingGuestSunner();

    await expectGuestsNotSearchable(page);
  });
});
