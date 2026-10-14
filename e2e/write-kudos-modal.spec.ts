import { test, expect } from '@playwright/test';
import { FIGMA_BODY, TEST_ACCOUNTS } from './support/kudos-board-seed';
import { countRows, signInBrowser } from './support/kudos-board-db';
import {
  BODY_PLACEHOLDER, MODAL_TITLE, TITLE_PLACEHOLDER, anonymousCheckbox, anonymousNameBox,
  bodyBox, cancelButton, expectCappedOrRejected, expectRequiredError, fillValidKudos, hashtagGroup, imageGroup,
  modal, openWriteKudosModal, pickHashtags, pickRecipient, recipientBox, removeButtons, sendBar, submitButton,
  titleBox, REQUIRED_ERROR,
} from './support/write-kudos-helpers';

/**
 * Viết Kudo modal (MoMorph ihQ26W78P2) — access, layout, required fields, Gửi state, Hủy, anonymous.
 * Chromium project, no DB writes (Hủy must not save; the kudos count is stable in this project).
 * Clarifications: Gửi stays disabled until recipient + Danh hiệu + content + ≥1 hashtag are valid;
 * each required field shows "Không được để trống" once touched (blur).
 */
test.describe('Viết Kudo modal — form', () => {
  // ID-1 superseded (guests act as Anonymous, 2026-10-14): a guest's send bar opens the dialog
  // and creates an anonymous session, so that flow lives in sun-kudos-serial-guest-write-kudos.spec.ts.

  test.describe('signed in', () => {
    test.beforeEach(async ({ context }) => {
      await signInBrowser(context, TEST_ACCOUNTS.SENDER);
    });

    test('send bar opens the dialog: title, Figma field order, placeholders, anonymous off (ID-0, ID-2..6)', async ({ page }) => {
      await openWriteKudosModal(page);

      await expect(modal(page).getByRole('heading', { name: MODAL_TITLE })).toBeVisible();
      await expect(recipientBox(page)).toHaveAttribute('placeholder', 'Tìm kiếm');
      await expect(titleBox(page)).toHaveAttribute('placeholder', TITLE_PLACEHOLDER);
      await expect(bodyBox(page)).toHaveAttribute('placeholder', BODY_PLACEHOLDER);
      await expect(modal(page).getByText(/Bạn có thể .@ \+ tên. để nhắc tới đồng nghiệp khác/).first()).toBeVisible();
      await expect(modal(page).getByRole('link', { name: 'Tiêu chuẩn cộng đồng' })).toHaveAttribute('href', '/standards');
      await expect(anonymousCheckbox(page)).not.toBeChecked();

      const order = [recipientBox(page), titleBox(page), bodyBox(page), hashtagGroup(page), imageGroup(page),
        anonymousCheckbox(page), submitButton(page)];
      const tops: number[] = [];
      for (const control of order) tops.push((await control.boundingBox())!.y);
      expect(tops, 'Người nhận → Danh hiệu → content → Hashtag → Image → ẩn danh → footer').toEqual([...tops].sort((a, b) => a - b));
      expect(new Set(tops).size).toBe(tops.length);
    });

    test('Gửi is disabled on open; each required field shows "Không được để trống" after blur (ID-48, ID-56, ID-7, ID-11, ID-14)', async ({ page }) => {
      await openWriteKudosModal(page);
      await expect(submitButton(page)).toBeDisabled();

      for (const field of [recipientBox(page), titleBox(page), bodyBox(page)]) {
        await field.focus();
        await field.blur();
        await expectRequiredError(field);
      }
      await pickHashtags(page, ['Dedicated']);
      await removeButtons(hashtagGroup(page)).first().click();
      await expect(hashtagGroup(page).getByText(REQUIRED_ERROR)).toBeVisible();
      await expect(submitButton(page)).toBeDisabled();
    });

    test('Gửi enables only when recipient, Danh hiệu, content and a hashtag are all valid (ID-49, ID-15)', async ({ page }) => {
      await openWriteKudosModal(page);

      await pickRecipient(page, 'Quy', 'Nguyễn Văn Quy');
      await expect(submitButton(page)).toBeDisabled();
      await titleBox(page).fill('IDOL GIỚI TRẺ');
      await expect(submitButton(page)).toBeDisabled();
      await bodyBox(page).fill(FIGMA_BODY);
      await expect(submitButton(page)).toBeDisabled();
      await pickHashtags(page, ['Dedicated']);
      await expect(submitButton(page)).toBeEnabled();

      await titleBox(page).fill('   ');
      await titleBox(page).blur();
      await expect(submitButton(page), 'Danh hiệu is required after trim').toBeDisabled();
    });

    test('Danh hiệu is capped at 50 and content at 2000 characters', async ({ page }) => {
      await openWriteKudosModal(page);
      await fillValidKudos(page, { title: 'IDOL GIỚI TRẺ', body: FIGMA_BODY, hashtags: ['Dedicated'] });
      await expect(submitButton(page)).toBeEnabled();

      await expectCappedOrRejected(page, titleBox(page), 50);
      await titleBox(page).fill('a'.repeat(50));
      await expect(submitButton(page)).toBeEnabled();
      await expectCappedOrRejected(page, bodyBox(page), 2000);
    });

    test('Hủy closes the modal, saves nothing and the next open starts empty (ID-45)', async ({ page }) => {
      const before = await countRows('kudos');
      await openWriteKudosModal(page);
      await titleBox(page).fill('IDOL GIỚI TRẺ');
      await bodyBox(page).fill(FIGMA_BODY);

      await cancelButton(page).click();

      await expect(modal(page)).toHaveCount(0);
      expect(await countRows('kudos')).toBe(before);
      await sendBar(page).click();
      await expect(titleBox(page)).toHaveValue('');
      await expect(bodyBox(page)).toHaveValue('');
    });

    test('anonymous: checkbox toggles; optional name field only while checked, max 50 (ID-41..44)', async ({ page }) => {
      await openWriteKudosModal(page);
      await expect(anonymousNameBox(page)).toHaveCount(0);

      await anonymousCheckbox(page).click();
      await expect(anonymousCheckbox(page)).toBeChecked();
      await expect(anonymousNameBox(page)).toBeVisible();
      await expect(anonymousNameBox(page)).toHaveValue('');
      await expectCappedOrRejected(page, anonymousNameBox(page), 50);

      await anonymousCheckbox(page).click();
      await expect(anonymousCheckbox(page)).not.toBeChecked();
      await expect(anonymousNameBox(page)).toBeHidden();
    });
  });
});
