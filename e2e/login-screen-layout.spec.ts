import { test, expect } from '@playwright/test';

test.describe('Login Screen — Layout & Structure', () => {
  test('renders header with logo and language selector', async ({ page }) => {
    await page.goto('/login');

    // Logo visible and not a link (static image)
    const logo = page.locator('img[alt*="Sun"]');
    await expect(logo).toBeVisible();
    const logoParent = logo.locator('..');
    await expect(logoParent).not.toHaveRole('link');

    // Language selector at top-right with VN flag + text + chevron
    const langSelector = page.getByRole('button', { name: /VN|Tiếng Việt/i });
    await expect(langSelector).toBeVisible();
  });

  test('renders header with fixed position', async ({ page }) => {
    await page.goto('/login');

    const header = page.locator('header');
    await expect(header).toBeVisible();

    const position = await header.evaluate((el) =>
      window.getComputedStyle(el).position
    );
    expect(position).toBe('fixed');
  });

  test('renders hero section with title and descriptions', async ({ page }) => {
    await page.goto('/login');

    // Title "ROOT FURTHER" in Vietnamese view
    await expect(page.locator('text=ROOT FURTHER')).toBeVisible();

    // Description texts in Vietnamese
    await expect(
      page.locator('text=Bắt đầu hành trình của bạn cùng SAA 2025')
    ).toBeVisible();
    await expect(
      page.locator('text=Đăng nhập để khám phá!')
    ).toBeVisible();
  });

  test('renders login button with Google icon', async ({ page }) => {
    await page.goto('/login');

    const loginBtn = page.getByRole('button', {
      name: /login with google/i,
    });
    await expect(loginBtn).toBeVisible();
    await expect(loginBtn).toBeEnabled();

    // Button should have a Google icon
    const icon = loginBtn.locator('svg, img[alt*="Google"]');
    await expect(icon).toBeVisible();
  });

  test('renders footer with copyright and fixed position', async ({ page }) => {
    await page.goto('/login');

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Copyright text in Vietnamese
    await expect(
      page.locator('text=Bản quyền thuộc về Sun* © 2025')
    ).toBeVisible();

    const position = await footer.evaluate((el) =>
      window.getComputedStyle(el).position
    );
    expect(position).toBe('fixed');
  });

  test('unauthenticated /todo redirects to /login', async ({ page }) => {
    // Navigate to /todo without session
    await page.goto('/todo', { waitUntil: 'networkidle' });

    // Should redirect to /login
    expect(page.url()).toContain('/login');
  });

  test('descriptions have user-select: none', async ({ page }) => {
    await page.goto('/login');

    const intro1 = page.locator('text=Bắt đầu hành trình của bạn cùng SAA 2025');
    const intro2 = page.locator('text=Đăng nhập để khám phá!');

    // Text should be visible
    await expect(intro1).toBeVisible();
    await expect(intro2).toBeVisible();

    // Should not be selectable (user-select: none)
    const userSelect1 = await intro1.evaluate((el) =>
      window.getComputedStyle(el).userSelect
    );
    expect(userSelect1).toBe('none');

    const userSelect2 = await intro2.evaluate((el) =>
      window.getComputedStyle(el).userSelect
    );
    expect(userSelect2).toBe('none');
  });

  test('logo is not interactive', async ({ page }) => {
    await page.goto('/login');

    const logo = page.locator('img[alt*="Sun"]');
    await expect(logo).toBeVisible();

    // Logo should not have link or button role
    const logoRole = await logo.evaluate((el) => el.getAttribute('role'));
    expect(logoRole).toBeNull();

    // Clicking logo should not navigate
    const urlBefore = page.url();
    await logo.click({ force: true });
    const urlAfter = page.url();
    expect(urlBefore).toBe(urlAfter);

    // Logo should not be wrapped in an anchor or button
    const parent = logo.locator('..');
    await expect(parent).not.toHaveRole('link');
    await expect(parent).not.toHaveRole('button');
  });
});
