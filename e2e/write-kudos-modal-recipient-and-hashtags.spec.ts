import { test, expect, type Page } from '@playwright/test';
import { HASHTAGS, SUNNERS, TEST_ACCOUNTS } from './support/kudos-board-seed';
import { signInBrowser } from './support/kudos-board-db';
import {
  MAX_HASHTAGS_ERROR, addHashtagButton, hashtagGroup, modal, openWriteKudosModal, option, pickHashtags,
  recipientBox, removeButtons,
} from './support/write-kudos-helpers';

/**
 * Viết Kudo — recipient search (B) and hashtag picker (E). Chromium project, no writes.
 * Clarifications: search matches full_name case-insensitively after trim (ilike, escaped, ≤10,
 * min 1 char); "@ # $" gives no results. Hashtags come only from the existing list, 1–5 distinct.
 */
const NGUYEN = [SUNNERS.CHUC.name, SUNNERS.QUY.name, SUNNERS.HLINH.name];
const optionNames = (page: Page) => modal(page).getByRole('option').allInnerTexts();
const chip = (page: Page, label: string) =>
  hashtagGroup(page).getByRole('button', { name: new RegExp(`^X(oá|óa) #?${label}$`) });

test.describe('Viết Kudo modal — recipient and hashtags', () => {
  test.beforeEach(async ({ context, page }) => {
    await signInBrowser(context, TEST_ACCOUNTS.SENDER);
    await openWriteKudosModal(page);
  });

  test('"Nguyễn" suggests only Sunners whose name contains it (ID-8)', async ({ page }) => {
    await recipientBox(page).fill('Nguyễn');

    for (const name of NGUYEN) await expect(option(page, new RegExp(name))).toBeVisible();
    for (const text of await optionNames(page)) expect(text).toContain('Nguyễn');
  });

  test('"an" matches case-insensitively, "  Nguyễn  " is trimmed (ID-25, ID-10)', async ({ page }) => {
    await recipientBox(page).fill('an');
    await expect(option(page, new RegExp(SUNNERS.VIEWER.name))).toBeVisible(); // "Dương thúy An"
    await expect(option(page, new RegExp(SUNNERS.TRANG.name))).toBeVisible(); // "Lê Kiều Trang"
    for (const text of await optionNames(page)) expect(text.toLowerCase()).toContain('an');

    await recipientBox(page).fill('  Nguyễn  ');
    for (const name of NGUYEN) await expect(option(page, new RegExp(name))).toBeVisible();
  });

  test('"@ # $" clears the suggestions to no results (ID-9)', async ({ page }) => {
    await recipientBox(page).fill('Nguyễn');
    await expect(option(page, new RegExp(SUNNERS.QUY.name))).toBeVisible();

    await recipientBox(page).fill('@ # $');

    await expect(modal(page).getByRole('option')).toHaveCount(0);
  });

  test('picking a suggestion fills the field and closes the list (ID-26)', async ({ page }) => {
    await recipientBox(page).fill('Quy');
    await option(page, new RegExp(SUNNERS.QUY.name)).click();

    await expect(recipientBox(page)).toHaveValue(new RegExp(SUNNERS.QUY.name));
    await expect(modal(page).getByRole('listbox')).toHaveCount(0);
  });

  test('"+ Hashtag" lists exactly the existing hashtags; a pick becomes a chip (ID-34, ID-35)', async ({ page }) => {
    await addHashtagButton(page).click();
    await expect(modal(page).getByRole('option')).toHaveCount(HASHTAGS.length);

    const labels = (await optionNames(page)).map((t) => t.trim().replace(/^#/, ''));
    expect(labels).toEqual(HASHTAGS.map((h) => h.label));
    await option(page, /^#?Dedicated$/).click();
    await pickHashtags(page, ['Inspring']);

    await expect(chip(page, 'Dedicated')).toBeVisible();
    await expect(chip(page, 'Inspring')).toBeVisible();
    await expect(removeButtons(hashtagGroup(page))).toHaveCount(2);
  });

  test('"x" on a chip removes only that hashtag (ID-36)', async ({ page }) => {
    await pickHashtags(page, ['Dedicated', 'Inspring']);

    await chip(page, 'Dedicated').click();

    await expect(chip(page, 'Dedicated')).toHaveCount(0);
    await expect(chip(page, 'Inspring')).toBeVisible();
    await expect(removeButtons(hashtagGroup(page))).toHaveCount(1);
  });

  test('5 hashtags is the max: "Tối đa 5 hashtag" and no 6th chip (ID-16, ID-17, ID-53)', async ({ page }) => {
    const five = HASHTAGS.slice(0, 5).map((h) => h.label);
    await pickHashtags(page, five);
    await expect(removeButtons(hashtagGroup(page))).toHaveCount(5);

    const add = addHashtagButton(page);
    if ((await add.isVisible()) && (await add.isEnabled())) {
      await add.click();
      const sixth = option(page, new RegExp(`^#?${HASHTAGS[5].label}$`));
      if ((await sixth.isVisible()) && (await sixth.isEnabled())) await sixth.click();
    }

    await expect(hashtagGroup(page).getByText(MAX_HASHTAGS_ERROR)).toBeVisible();
    await expect(removeButtons(hashtagGroup(page))).toHaveCount(5);
    await expect(chip(page, HASHTAGS[5].label)).toHaveCount(0);
  });
});
