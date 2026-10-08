import { test, expect } from '@playwright/test';

test.describe('Homepage Language Selection', () => {
  test('homepage displays VN by default', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const langButton = page.getByRole('button', { name: /VN/i });
    await expect(langButton).toBeVisible();

    // Check for Vietnamese text
    await expect(page.locator('text=/Đăng nhập/i')).toBeVisible();
  });

  test('clicking language button opens dropdown', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const langButton = page.getByRole('button', { name: /VN/i });
    await langButton.click();

    // Dropdown should show VN and EN menuitem options
    const vnOption = page.getByRole('menuitem', { name: /VN|Việt/i });
    const enOption = page.getByRole('menuitem', { name: /EN|English/i });

    await expect(vnOption).toBeVisible({ timeout: 2000 });
    await expect(enOption).toBeVisible({ timeout: 2000 });
  });

  test('clicking EN switches UI to English', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const langButton = page.getByRole('button', { name: /VN/i });
    await langButton.click();

    // Select EN menuitem option
    const enOption = page.getByRole('menuitem', { name: /EN|English/i });
    await enOption.click();

    // Wait for language to change
    await page.waitForTimeout(200);

    // Check that UI chrome is now in English (e.g., countdown units)
    // DAYS/HOURS/MINUTES should remain same, but we verify locale via nav text
    const standards = page.getByText(/General Standards/i);
    await expect(standards).toBeVisible({ timeout: 3000 });
  });

  test('EN mode translates UI labels but keeps long content in VN', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Switch to EN
    const langButton = page.getByRole('button', { name: /VN/i });
    await langButton.click();
    const enOption = page.getByRole('menuitem', { name: /EN|English/i });
    await enOption.click();

    await page.waitForTimeout(200);

    // UI chrome should be in English
    const loginBtn = page.getByRole('link', { name: /Login/i }).first();
    await expect(loginBtn).toBeVisible({ timeout: 3000 });

    // Verify English UI chrome is shown (not Vietnamese equivalents)
    await expect(page.getByRole('heading', { name: /Awards System/i })).toBeVisible({
      timeout: 3000,
    });
    // Check for "Details" links (EN) instead of "Chi tiết" (VN)
    const detailsLinks = page.getByRole('link', { name: /Details/i });
    await expect(detailsLinks.first()).toBeVisible({ timeout: 1000 });
    // Time and Venue labels should be in English
    await expect(page.getByText(/^Time:$/)).toBeVisible({ timeout: 1000 });
    await expect(page.getByText(/^Venue:$/)).toBeVisible({ timeout: 1000 });

    // Long body content should still be in Vietnamese (not translated)
    // The specific opening paragraph of the ROOT FURTHER section
    await expect(
      page.getByText(/Đứng trước bối cảnh thay đổi như vũ bão/)
    ).toBeVisible({ timeout: 2000 });
  });

  test('language selection persists with NEXT_LOCALE cookie on reload', async ({
    page,
    context,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Switch to EN
    const langButton = page.getByRole('button', { name: /VN/i });
    await langButton.click();
    const enOption = page.getByRole('menuitem', { name: /EN|English/i });
    await enOption.click();

    await page.waitForTimeout(200);

    // Verify EN is active (check for English-specific text)
    await expect(page.getByText(/General Standards/i)).toBeVisible({
      timeout: 3000,
    });

    // Reload page
    await page.reload();

    // Should still be in EN
    await expect(page.getByText(/General Standards/i)).toBeVisible({
      timeout: 3000,
    });

    // Verify NEXT_LOCALE cookie exists
    const cookies = await context.cookies();
    const localeCookie = cookies.find((c) => c.name === 'NEXT_LOCALE');
    expect(localeCookie?.value).toBe('en');
  });

  test('closing language dropdown with Esc returns focus to button', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const langButton = page.getByRole('button', { name: /VN/i });
    await langButton.focus();
    await langButton.click();

    // Dropdown should be open
    await page.waitForTimeout(100);

    // Press Esc to close
    await page.keyboard.press('Escape');

    // Wait for dropdown to close
    await page.waitForTimeout(100);

    // Verify the language menu is closed (no menuitem visible)
    const enOption = page.getByRole('menuitem', { name: /EN|English/i });
    await expect(enOption).not.toBeVisible({ timeout: 1000 });

    // Focus should return to the button
    const focused = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      return el?.getAttribute('aria-haspopup');
    });
    expect(focused).toBe('menu'); // button with aria-haspopup="menu"
  });

  test('clicking outside dropdown closes it', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const langButton = page.getByRole('button', { name: /VN/i });
    await langButton.click();

    // Dropdown should be open
    await page.waitForTimeout(100);

    // Click outside (e.g., on main content)
    const main = page.getByRole('main');
    await main.click();

    // Dropdown should be closed
    const enOption = page.getByRole('menuitem', { name: /EN|English/i });
    await expect(enOption).not.toBeVisible({ timeout: 1000 });
  });
});
