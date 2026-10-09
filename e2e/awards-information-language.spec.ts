import { test, expect, type Page } from '@playwright/test';

const VN_TITLE = 'Hệ thống giải thưởng SAA 2025';
const EN_TITLE = 'SAA 2025 Awards System';
// Seed: 6 award blocks, 7 prize rows (Signature 2025 Creator has two tiers).
const AWARD_BLOCKS = 6;
const PRIZE_ROWS = 7;

/**
 * Switches to EN through the LanguageSelector (setLocale server action).
 * Resolves only once the EN title has rendered, i.e. after the action response
 * (which carries the Set-Cookie) has returned: no fixed sleeps, no optional clicks.
 */
async function switchToEnglish(page: Page) {
  await page.getByRole('button', { name: /VN/i }).click();
  await page.getByRole('menuitem', { name: 'EN', exact: true }).click();
  await expect(page.getByRole('heading', { name: EN_TITLE })).toBeVisible();
}

test.describe('Awards Information language', () => {
  test('page displays Vietnamese text by default', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: VN_TITLE })).toBeVisible();
    await expect(page.getByText('Số lượng giải thưởng:', { exact: true })).toHaveCount(AWARD_BLOCKS);
    await expect(page.getByText('Giá trị giải thưởng:', { exact: true })).toHaveCount(PRIZE_ROWS);

    // "Hoặc" separator exists only between the two Signature prize tiers.
    const separator = page.locator('section[id="signature-2025-creator"] span:has(+ hr)');
    await expect(separator).toHaveText('Hoặc');

    await expect(
      page.locator('section[id="top-talent"]').getByText('Cá nhân', { exact: true })
    ).toBeVisible();
  });

  test('language selector defaults to VN', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });

    const langButton = page.getByRole('button', { name: /VN/i });
    await expect(langButton).toBeVisible();
  });

  test('switching to English translates interface labels', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    await switchToEnglish(page);

    // Labels are translated in every block (per D012 clarifications)
    await expect(page.getByText('Number of awards:', { exact: true })).toHaveCount(AWARD_BLOCKS);
    await expect(page.getByText('Prize value:', { exact: true })).toHaveCount(PRIZE_ROWS);

    // "Hoặc" becomes "Or": the separator inside the Signature block
    const signature = page.locator('section[id="signature-2025-creator"]');
    await expect(signature.locator('span:has(+ hr)')).toHaveText('Or');

    // Units are translated per block: "Individual", "Team", "Individual or team"
    await expect(
      page.locator('section[id="top-talent"]').getByText('Individual', { exact: true })
    ).toBeVisible();
    await expect(
      page.locator('section[id="top-project"]').getByText('Team', { exact: true })
    ).toBeVisible();
    await expect(signature.getByText('Individual or team', { exact: true })).toBeVisible();

    // Note lines are translated: "per award", "for the individual award", "for the team award"
    await expect(
      page.locator('section[id="top-talent"]').getByText('per award', { exact: true })
    ).toBeVisible();
    await expect(signature.getByText('for the individual award', { exact: true })).toBeVisible();
    await expect(signature.getByText('for the team award', { exact: true })).toBeVisible();
  });

  test('Vietnamese descriptions remain in Vietnamese under EN language mode', async ({
    page,
  }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    await switchToEnglish(page);

    // Long descriptions stay Vietnamese (seed: detail_description_vi)
    await expect(
      page
        .locator('section[id="top-talent"]')
        .getByText(/^Giải thưởng Top Talent vinh danh những cá nhân xuất sắc/)
    ).toBeVisible();
  });

  test('Kudos section description remains in Vietnamese under EN mode', async ({
    page,
  }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    await switchToEnglish(page);

    // Kudos description should still start with "ĐIỂM MỚI CỦA SAA 2025"
    await expect(page.getByText('ĐIỂM MỚI CỦA SAA 2025')).toBeVisible();
  });

  test('language preference is saved in NEXT_LOCALE cookie', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });

    // Starts without a locale cookie: the assertion below can only pass if setLocale ran
    expect((await page.context().cookies()).find((c) => c.name === 'NEXT_LOCALE')).toBeUndefined();

    await switchToEnglish(page);

    // The EN title rendered => the setLocale action response (Set-Cookie) has returned
    const cookies = await page.context().cookies();
    const localeCookie = cookies.find((c) => c.name === 'NEXT_LOCALE');
    expect(localeCookie?.value).toBe('en');
  });

  test('invalid language cookie defaults to Vietnamese', async ({ page }) => {
    // Set an invalid locale cookie
    await page.context().addCookies([
      {
        name: 'NEXT_LOCALE',
        value: 'invalid-locale',
        url: 'http://localhost:3000',
      },
    ]);

    await page.goto('/awards-information', { waitUntil: 'networkidle' });

    // Should default to Vietnamese
    await expect(page.getByRole('heading', { name: VN_TITLE })).toBeVisible();
    await expect(page.getByText('Số lượng giải thưởng:', { exact: true })).toHaveCount(AWARD_BLOCKS);
  });

  test('language preference persists across page reload', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    await switchToEnglish(page);

    // Reload page
    await page.reload({ waitUntil: 'networkidle' });

    // EN should still be displayed
    await expect(page.getByRole('heading', { name: EN_TITLE })).toBeVisible();
    await expect(page.getByText('Number of awards:', { exact: true })).toHaveCount(AWARD_BLOCKS);
  });
});
