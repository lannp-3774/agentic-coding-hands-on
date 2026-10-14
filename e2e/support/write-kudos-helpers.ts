/**
 * UI helpers for the "Viết Kudo" modal (MoMorph ihQ26W78P2). Every locator follows
 * plans/261013-1628-write-kudos-modal/selector-contract.md: roles, labels and placeholders
 * only, no test ids. Copy is Figma/clarifications verbatim (VN, the default locale).
 */
import path from 'node:path';
import { expect, type Locator, type Page } from '@playwright/test';

/** lib/i18n/sun-kudos-copy.ts → banner.sendPlaceholder (VN): the send bar's accessible name. */
export const SEND_BAR_NAME = 'Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?';
export const MODAL_TITLE = 'Gửi lời cám ơn và ghi nhận đến đồng đội';
export const BODY_PLACEHOLDER = 'Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!';
export const TITLE_PLACEHOLDER = 'Dành tặng một danh hiệu cho đồng đội';
export const ANONYMOUS_LABEL = 'Gửi lời cám ơn và ghi nhận ẩn danh';
export const REQUIRED_ERROR = 'Không được để trống';
/** lib/i18n/write-kudos-copy.ts → errors.tooLong (VN): each capped field quotes its own limit. */
export const tooLongError = (max: number) => `Tối đa ${max} ký tự`;
export const MAX_HASHTAGS_ERROR = 'Tối đa 5 hashtag';
export const DEFAULT_ANONYMOUS_ALIAS = 'Người gửi ẩn danh';

const FIXTURES = path.join(__dirname, '..', 'fixtures', 'write-kudos');
/** Real files (magic bytes checked server-side): 3 jpg + 2 png, plus non-image types. */
export const fixture = (name: string) => path.join(FIXTURES, name);
export const IMAGE_FIXTURES = ['test-image-1.jpg', 'test-image-2.png', 'test-image-3.jpg', 'test-image-4.png', 'test-image-5.jpg'].map(fixture);
export const NON_IMAGE_FIXTURES = ['dummy-document.pdf', 'dummy-video.mp4', 'dummy-document.txt'].map(fixture);
/** jpg/png must be ≤ 5 MB; 5 MiB + 1 KiB built at runtime from a real PNG (never committed). */
export const OVER_5_MB = 5 * 1024 * 1024 + 1024;

export const sendBar = (page: Page) => page.getByRole('button', { name: SEND_BAR_NAME, exact: true });
export const modal = (page: Page) => page.getByRole('dialog', { name: MODAL_TITLE });
export const recipientBox = (page: Page) => modal(page).getByRole('combobox', { name: /Người nhận/ });
export const titleBox = (page: Page) => modal(page).getByRole('textbox', { name: /Danh hiệu/ });
export const bodyBox = (page: Page) => modal(page).getByPlaceholder(BODY_PLACEHOLDER);
export const hashtagGroup = (page: Page) => modal(page).getByRole('group', { name: /Hashtag/ });
export const addHashtagButton = (page: Page) => hashtagGroup(page).getByRole('button', { name: /^\+?\s*Hashtag/ });
export const imageGroup = (page: Page) => modal(page).getByRole('group', { name: /Image/ });
export const addImageButton = (page: Page) => imageGroup(page).getByRole('button', { name: /^\+?\s*Image/ });
/** One remove button ("Xoá …"/"Xóa …") per chip or thumbnail inside a group. */
export const removeButtons = (group: Locator) => group.getByRole('button', { name: /^X(oá|óa)\b/ });
export const anonymousCheckbox = (page: Page) => modal(page).getByRole('checkbox', { name: ANONYMOUS_LABEL });
/** The optional alias field: its label or placeholder mentions "ẩn danh". */
export const anonymousNameBox = (page: Page) => modal(page).getByRole('textbox', { name: /ẩn danh/i });
export const submitButton = (page: Page) => modal(page).getByRole('button', { name: 'Gửi', exact: true });
export const cancelButton = (page: Page) => modal(page).getByRole('button', { name: 'Hủy', exact: true });
export const option = (page: Page, name: string | RegExp) => modal(page).getByRole('option', { name });

/** Go to /sun-kudos, click the send bar (A.1) and expect the modal (ID-0, ID-2). */
export async function openWriteKudosModal(page: Page) {
  await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
  await sendBar(page).click();
  await expect(modal(page), 'send bar opens the Viết Kudo dialog').toBeVisible();
}

/** Search the recipient by `query` and pick the suggestion named `name`. */
export async function pickRecipient(page: Page, query: string, name: string) {
  await recipientBox(page).fill(query);
  await option(page, new RegExp(name)).click();
}

/** Open the picker and choose each hashtag label from the existing list. */
export async function pickHashtags(page: Page, labels: string[]) {
  for (const label of labels) {
    await addHashtagButton(page).click();
    await option(page, new RegExp(`^#?${label}$`)).click();
  }
}

/** Attach files one by one through "+ Image" and the file chooser. */
export async function attachImages(page: Page, files: (string | { name: string; mimeType: string; buffer: Buffer })[]) {
  for (const file of files) {
    const chooser = page.waitForEvent('filechooser');
    await addImageButton(page).click();
    await (await chooser).setFiles(file);
  }
}

/** Fill every required field with valid Figma mock data (recipient, Danh hiệu, content, hashtags). */
export async function fillValidKudos(page: Page, opts: { title: string; body: string; hashtags: string[] }) {
  await pickRecipient(page, 'Quy', 'Nguyễn Văn Quy');
  await titleBox(page).fill(opts.title);
  await bodyBox(page).fill(opts.body);
  await pickHashtags(page, opts.hashtags);
}

/**
 * Length cap (1–N chars): either the field refuses input past `max`, or it shows an
 * error quoting that field's own `max` and keeps Gửi disabled. Both satisfy the rule;
 * anything else fails.
 */
export async function expectCappedOrRejected(page: Page, field: Locator, max: number) {
  await field.fill('a'.repeat(max + 1));
  await field.blur();
  const length = (await field.inputValue()).length;
  if (length <= max) {
    expect(length, 'input capped at the max length').toBe(max);
    return;
  }
  await expect(field).toHaveAttribute('aria-invalid', 'true');
  await expect(field).toHaveAccessibleDescription(new RegExp(tooLongError(max)));
  await expect(submitButton(page)).toBeDisabled();
}

/** Required-field error on a text control: red state (aria-invalid) + described message. */
export async function expectRequiredError(field: Locator) {
  await expect(field).toHaveAttribute('aria-invalid', 'true');
  await expect(field).toHaveAccessibleDescription(new RegExp(REQUIRED_ERROR));
}
