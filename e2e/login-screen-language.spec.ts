import { test, expect } from '@playwright/test';

test.describe('Login Screen — Language Selector', () => {
  test('language selector shows VN flag and chevron by default', async ({
    page,
  }) => {
    await page.goto('/login');

    const langSelector = page.getByRole('button', { name: /VN|Tiếng Việt/i });
    await expect(langSelector).toBeVisible();

    // Should contain both flag and code
    const text = await langSelector.textContent();
    expect(text).toContain('VN');
  });

  test('language selector opens dropdown on click', async ({ page }) => {
    await page.goto('/login');

    const langSelector = page.getByRole('button', { name: /VN|Tiếng Việt/i });
    await langSelector.click();

    // Dropdown should appear with VN and EN options
    const vn = page.getByRole('menuitem', { name: /VN|Việt/ });
    const en = page.getByRole('menuitem', { name: /EN|English/ });

    await expect(vn).toBeVisible();
    await expect(en).toBeVisible();
  });

  test('language selector shows pointer cursor on hover', async ({ page }) => {
    await page.goto('/login');

    const langSelector = page.getByRole('button', { name: /VN|Tiếng Việt/i });
    await langSelector.hover();

    const cursor = await langSelector.evaluate((el) =>
      window.getComputedStyle(el).cursor
    );
    expect(cursor).toBe('pointer');
  });

  test('switching language to EN changes texts and sets NEXT_LOCALE cookie', async ({
    page,
    context,
  }) => {
    await page.goto('/login');

    // Open language dropdown
    const langSelector = page.getByRole('button', { name: /VN|Tiếng Việt/i });
    await langSelector.click();

    // Select EN
    const enOption = page.getByRole('menuitem', { name: /EN|English/ });
    await enOption.click();

    // Wait for texts to change to English
    await expect(
      page.locator('text=Start your journey with SAA 2025')
    ).toBeVisible();
    await expect(page.locator('text=Log in to explore!')).toBeVisible();
    await expect(
      page.getByText('Copyright © 2025 Sun*', { exact: true })
    ).toBeVisible();

    // Verify NEXT_LOCALE cookie is set
    const cookies = await context.cookies();
    const localeCookie = cookies.find((c) => c.name === 'NEXT_LOCALE');
    expect(localeCookie?.value).toBe('en');
  });

  test('language choice persists on reload', async ({ page }) => {
    await page.goto('/login');

    // Switch to EN
    const langSelector = page.getByRole('button', { name: /VN|Tiếng Việt/i });
    await langSelector.click();
    const enOption = page.getByRole('menuitem', { name: /EN|English/ });
    await enOption.click();

    // Wait for EN texts
    await expect(
      page.locator('text=Start your journey with SAA 2025')
    ).toBeVisible();

    // Reload
    await page.reload();

    // Should still show English
    await expect(
      page.locator('text=Start your journey with SAA 2025')
    ).toBeVisible();
  });
});
