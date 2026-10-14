import { test, expect } from '@playwright/test';
import { TEST_ACCOUNTS } from './support/kudos-board-seed';
import { signInBrowser } from './support/kudos-board-db';
import {
  REQUIRED_ERROR, cancelButton, modal, openWriteKudosModal, recipientBox, sendBar, titleBox,
} from './support/write-kudos-helpers';

/**
 * Visual review M1: a required field shows "Không được để trống" only after the user touched it.
 * The dialog's own focus handling (focus the first field on open, give focus back on close) must
 * never count as a touch, also under React StrictMode's double effects in dev (where it showed).
 * Chromium project, no DB writes.
 */
test.describe('Viết Kudo modal — no error before a touch', () => {
  test.beforeEach(async ({ context }) => {
    await signInBrowser(context, TEST_ACCOUNTS.SENDER);
  });

  test('on open the recipient is focused, not invalid, and no required error shows; Hủy gives focus back', async ({ page }) => {
    await openWriteKudosModal(page);

    await expect(recipientBox(page), 'the dialog focuses the first field').toBeFocused();
    await expect(recipientBox(page)).not.toHaveAttribute('aria-invalid', 'true');
    await expect(modal(page).getByText(REQUIRED_ERROR)).toHaveCount(0);

    await titleBox(page).focus();
    await expect(recipientBox(page), 'a real blur still counts as a touch').toHaveAttribute('aria-invalid', 'true');

    await cancelButton(page).click();
    await expect(modal(page)).toHaveCount(0);
    await expect(sendBar(page), 'focus returns to the send bar').toBeFocused();
  });
});
