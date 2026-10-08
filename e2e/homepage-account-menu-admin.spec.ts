import { test, expect } from '@playwright/test';
import { ensureUser, sessionCookies } from './support/supabase-session';

const TEST_ADMIN_EMAIL = 'test-admin@example.com';
const TEST_PASSWORD = 'Test123456!';

test.describe('@admin @supabase Homepage Account Menu - Admin', () => {
  test.beforeAll(async () => {
    const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
    const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || '';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
        signal: controller.signal,
        headers: { apikey: supabaseKey },
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    } catch (err) {
      throw new Error(
        `Cannot run Supabase tests: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  });

  test('admin user menu shows Admin Dashboard', async ({
    page,
    context,
  }) => {
    await ensureUser(TEST_ADMIN_EMAIL, TEST_PASSWORD, 'admin');

    const cookies = await sessionCookies(
      TEST_ADMIN_EMAIL,
      TEST_PASSWORD,
      'http://localhost:3000'
    );
    await context.addCookies(cookies as Parameters<typeof context.addCookies>[0]);

    await page.goto('/', { waitUntil: 'networkidle' });

    const accountBtn = page.getByRole('button', { name: /^(Tài khoản|Account)$/ });
    await expect(accountBtn).toBeVisible({ timeout: 5000 });

    await accountBtn.click();

    const profileOption = page.getByRole('menuitem', { name: /Hồ sơ|Profile/i });
    const signOutOption = page.getByRole('menuitem', { name: /Đăng xuất|Sign out/i });
    const adminOption = page.getByRole('menuitem', { name: /Trang quản trị|Admin Dashboard/i });

    await expect(profileOption).toBeVisible({ timeout: 3000 });
    await expect(signOutOption).toBeVisible({ timeout: 3000 });
    await expect(adminOption).toBeVisible({ timeout: 3000 });
  });

  test('admin sees Trang quản trị (Admin Dashboard) option with correct href', async ({
    page,
    context,
  }) => {
    await ensureUser(TEST_ADMIN_EMAIL, TEST_PASSWORD, 'admin');

    const cookies = await sessionCookies(
      TEST_ADMIN_EMAIL,
      TEST_PASSWORD,
      'http://localhost:3000'
    );
    await context.addCookies(cookies as Parameters<typeof context.addCookies>[0]);

    await page.goto('/', { waitUntil: 'networkidle' });

    const accountBtn = page.getByRole('button', { name: /^(Tài khoản|Account)$/ });
    await expect(accountBtn).toBeVisible({ timeout: 5000 });
    await accountBtn.click();

    const adminOption = page.getByRole('menuitem', { name: /Trang quản trị|Admin Dashboard/i });
    await expect(adminOption).toBeVisible({ timeout: 3000 });

    const href = await adminOption.getAttribute('href');
    expect(href).toContain('/admin');
  });

  test('admin menu has exactly Profile, Sign out, and Admin Dashboard', async ({
    page,
    context,
  }) => {
    await ensureUser(TEST_ADMIN_EMAIL, TEST_PASSWORD, 'admin');

    const cookies = await sessionCookies(
      TEST_ADMIN_EMAIL,
      TEST_PASSWORD,
      'http://localhost:3000'
    );
    await context.addCookies(cookies as Parameters<typeof context.addCookies>[0]);

    await page.goto('/', { waitUntil: 'networkidle' });

    const accountBtn = page.getByRole('button', { name: /^(Tài khoản|Account)$/ });
    await expect(accountBtn).toBeVisible({ timeout: 5000 });
    await accountBtn.click();

    // All three items must be present
    const profileOption = page.getByRole('menuitem', { name: /Hồ sơ|Profile/i });
    const signOutOption = page.getByRole('menuitem', { name: /Đăng xuất|Sign out/i });
    const adminOption = page.getByRole('menuitem', { name: /Trang quản trị|Admin Dashboard/i });

    // Count menu items
    const menuItems = page.locator('a[role="menuitem"], button[role="menuitem"]');
    const itemCount = await menuItems.count();

    // Admin menu should have exactly 3 items
    expect(itemCount).toBe(3);
    await expect(profileOption).toBeVisible({ timeout: 3000 });
    await expect(signOutOption).toBeVisible({ timeout: 3000 });
    await expect(adminOption).toBeVisible({ timeout: 3000 });
  });
});
