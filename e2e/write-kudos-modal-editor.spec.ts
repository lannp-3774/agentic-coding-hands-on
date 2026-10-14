import { test, expect, type Page } from '@playwright/test';
import { SUNNERS, TEST_ACCOUNTS } from './support/kudos-board-seed';
import { signInBrowser } from './support/kudos-board-db';
import { bodyBox, modal, openWriteKudosModal, option } from './support/write-kudos-helpers';

/**
 * Viết Kudo — content editor (C toolbar, D textarea). Chromium project, no writes.
 * Clarifications: a plain textarea; each toolbar button wraps the selection in Markdown
 * (**bold**, _italic_, ~~strike~~, `1. ` list, [text](url), `> ` quote); the link URL comes
 * from window.prompt (selector contract). "@" + name suggests Sunners; the pick is plain text.
 * Test data is MoMorph test-case data (ID-27..33).
 */
const TOOL = {
  bold: /Bold|Đậm/i, italic: /Italic|Nghiêng/i, strike: /Strike|Gạch ngang/i,
  list: /List|Danh sách/i, link: /Link|Liên kết/i, quote: /Quote|Trích dẫn/i,
};
const tool = (page: Page, name: RegExp) => modal(page).getByRole('button', { name });

async function formatAll(page: Page, text: string, name: RegExp) {
  await bodyBox(page).fill(text);
  await bodyBox(page).selectText();
  await tool(page, name).click();
}

test.describe('Viết Kudo modal — content editor', () => {
  test.beforeEach(async ({ context, page }) => {
    await signInBrowser(context, TEST_ACCOUNTS.SENDER);
    await openWriteKudosModal(page);
  });

  test('B, I, S and quote wrap the selection in Markdown markers (ID-27, ID-28, ID-29, ID-32)', async ({ page }) => {
    await formatAll(page, 'Cảm ơn bạn', TOOL.bold);
    await expect(bodyBox(page)).toHaveValue('**Cảm ơn bạn**');

    await formatAll(page, 'Cảm ơn bạn', TOOL.italic);
    await expect(bodyBox(page)).toHaveValue('_Cảm ơn bạn_');

    await formatAll(page, 'Cảm ơn bạn', TOOL.strike);
    await expect(bodyBox(page)).toHaveValue('~~Cảm ơn bạn~~');

    await formatAll(page, 'Đây là quote', TOOL.quote);
    await expect(bodyBox(page)).toHaveValue('> Đây là quote');
  });

  test('numbered list prefixes each selected line (ID-30)', async ({ page }) => {
    await formatAll(page, 'Điểm 1\nĐiểm 2', TOOL.list);

    await expect(bodyBox(page)).toHaveValue(/^1\. Điểm 1\n\d+\. Điểm 2$/);
  });

  test('link asks for the URL and inserts [text](url) (ID-31)', async ({ page }) => {
    page.once('dialog', (dialog) => dialog.accept('https://example.com'));

    await formatAll(page, 'Cảm ơn bạn', TOOL.link);

    await expect(bodyBox(page)).toHaveValue('[Cảm ơn bạn](https://example.com)');
  });

  test('"@" + name suggests Sunners and the pick is inserted as text (ID-12, ID-13, ID-33)', async ({ page }) => {
    await bodyBox(page).fill('Cảm ơn @Nguy');

    await expect(option(page, new RegExp(SUNNERS.QUY.name))).toBeVisible();
    await option(page, new RegExp(SUNNERS.QUY.name)).click();

    await expect(bodyBox(page)).toHaveValue(new RegExp(`^Cảm ơn @${SUNNERS.QUY.name}\\s?$`));
  });
});
