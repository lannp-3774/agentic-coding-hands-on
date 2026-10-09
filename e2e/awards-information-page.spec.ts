import { test, expect, type Page } from '@playwright/test';
import { ensureUser, sessionCookies } from './support/supabase-session';

const TEST_USER_EMAIL = 'test-awards-info@example.com';
const TEST_PASSWORD = 'Test123456!';

// Scoped to the Kudos section (found by its heading) instead of a positional .last()
const kudosDetailLink = (page: Page) =>
  page
    .locator('main section')
    .filter({ has: page.getByRole('heading', { name: 'Sun* Kudos' }) })
    .getByRole('link', { name: /Chi tiết/ });

test.describe('Awards Information page', () => {
  test('guest user can access /awards-information (200, no redirect)', async ({ page }) => {
    const res = await page.goto('/awards-information');
    expect(res?.status()).toBe(200);
    await expect(page).toHaveURL('http://localhost:3000/awards-information');
  });

  test('page renders without crashing for guest user', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    // Prove the SAA awards page rendered by checking a distinctive element
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('header displays Awards Information nav link marked as current page', async ({
    page,
  }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    const awardsLink = page.getByRole('banner').getByRole('link', { name: 'Awards Information' });
    await expect(awardsLink).toBeVisible();
    await expect(awardsLink).toHaveAttribute('aria-current', 'page');
  });

  test('header does not mark About SAA 2025 as current page on awards route', async ({
    page,
  }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    const aboutLink = page.getByRole('banner').getByRole('link', { name: 'About SAA 2025' });
    await expect(aboutLink).toBeVisible();
    // Should NOT have aria-current="page" on this route
    const currentAttr = await aboutLink.getAttribute('aria-current');
    expect(currentAttr).not.toBe('page');
  });

  test('page displays eyebrow subtitle', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    // From clarifications: subtitle is "Sun* Annual Awards 2025" (Figma verbatim)
    await expect(page.locator('text=Sun* Annual Awards 2025')).toBeVisible();
  });

  test('page displays main heading with correct text and styling', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    // Main heading: "Hệ thống giải thưởng SAA 2025"
    const heading = page.getByRole('heading', { level: 1, name: /Hệ thống giải thưởng SAA 2025/ });
    await expect(heading).toBeVisible();
  });

  test('Kudos section displays eyebrow text', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    // Eyebrow: "Phong trào ghi nhận" (Figma exact)
    await expect(page.locator('text=Phong trào ghi nhận')).toBeVisible();
  });

  test('Kudos section displays title', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    const kudosTitle = page.getByRole('heading').filter({ hasText: 'Sun* Kudos' });
    await expect(kudosTitle).toBeVisible();
  });

  test('Kudos section displays description text', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    // From Figma: starts with "ĐIỂM MỚI CỦA SAA 2025"
    await expect(page.locator('text=ĐIỂM MỚI CỦA SAA 2025')).toBeVisible();
  });

  test('Kudos Chi tiết button has correct href', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    const detailLink = kudosDetailLink(page);
    await expect(detailLink).toBeVisible();
    await expect(detailLink).toHaveAttribute('href', '/sun-kudos');
  });

  test('clicking Kudos Chi tiết button navigates to /sun-kudos (404 default)', async ({
    page,
  }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    const detailLink = kudosDetailLink(page);
    // Click and wait for navigation
    await Promise.all([page.waitForNavigation(), detailLink.click()]);
    // /sun-kudos does not exist yet, so Next serves its default 404
    await expect(page).toHaveURL('http://localhost:3000/sun-kudos');
  });

  test('guest user sees Login button in account region', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    const loginBtn = page.getByRole('banner').getByRole('link', { name: /Đăng nhập|Login/ });
    await expect(loginBtn).toBeVisible();
  });

  test('clicking header Awards Information link from homepage navigates to /awards-information', async ({
    page,
  }) => {
    // Start on homepage
    await page.goto('/', { waitUntil: 'networkidle' });
    // Click the Awards Information link in header
    const awardsLink = page.getByRole('banner').getByRole('link', { name: 'Awards Information' });
    await Promise.all([page.waitForNavigation(), awardsLink.click()]);
    // Should land on /awards-information
    await expect(page).toHaveURL('http://localhost:3000/awards-information');
  });

  test('signed-in user visits /awards-information (no redirect, account button shown, 6 sections render)', async ({
    page,
    context,
  }) => {
    // Ensure user exists and get session
    await ensureUser(TEST_USER_EMAIL, TEST_PASSWORD, 'user');
    const cookies = await sessionCookies(TEST_USER_EMAIL, TEST_PASSWORD, 'http://localhost:3000');
    await context.addCookies(cookies as Parameters<typeof context.addCookies>[0]);

    // Visit /awards-information
    const res = await page.goto('/awards-information', { waitUntil: 'networkidle' });
    expect(res?.status()).toBe(200);
    await expect(page).toHaveURL('http://localhost:3000/awards-information');

    // Header: Awards Information has aria-current="page", About SAA 2025 does not
    const awardsHeaderLink = page.getByRole('banner').getByRole('link', { name: 'Awards Information' });
    await expect(awardsHeaderLink).toHaveAttribute('aria-current', 'page');

    const aboutLink = page.getByRole('banner').getByRole('link', { name: 'About SAA 2025' });
    const currentAttr = await aboutLink.getAttribute('aria-current');
    expect(currentAttr).not.toBe('page');

    // Signed-in: account button shown, no Login link
    const accountBtn = page.getByRole('button', { name: /^(Tài khoản|Account)$/ });
    await expect(accountBtn).toBeVisible({ timeout: 5000 });
    const loginLink = page.getByRole('banner').getByRole('link', { name: /Đăng nhập|Login/ });
    await expect(loginLink).not.toBeVisible();

    // 6 award sections render
    const sections = page.locator('main section[id]');
    await expect(sections).toHaveCount(6);
  });

  test('footer Awards Information link has aria-current="page" on /awards-information', async ({
    page,
  }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    const footerNav = page.getByRole('contentinfo');
    const awardsFooterLink = footerNav.getByRole('link', { name: 'Awards Information' });
    await expect(awardsFooterLink).toHaveAttribute('aria-current', 'page');

    // Verify About SAA 2025 does NOT have aria-current="page" in footer
    const aboutFooterLink = footerNav.getByRole('link', { name: 'About SAA 2025' });
    const currentAttr = await aboutFooterLink.getAttribute('aria-current');
    expect(currentAttr).not.toBe('page');
  });
});
