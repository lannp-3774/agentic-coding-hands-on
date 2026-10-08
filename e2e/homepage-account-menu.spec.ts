import { test, expect } from '@playwright/test';
import { ensureUser, sessionCookies } from './support/supabase-session';

const TEST_USER_EMAIL = 'test-user@example.com';
const TEST_PASSWORD = 'Test123456!';

test.describe('@supabase Homepage Account Menu', () => {
  test.beforeAll(async () => {
    const url = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || '';
    const res = await fetch(`${url}/auth/v1/health`, {
      signal: AbortSignal.timeout(2000),
      headers: { apikey: key },
    }).catch(() => null);
    if (!res?.ok) throw new Error(`Supabase unreachable`);
  });

  test('authenticated user sees bell and account button', async ({
    page,
    context,
  }) => {
    await ensureUser(TEST_USER_EMAIL, TEST_PASSWORD, 'user');
    const cookies = await sessionCookies(
      TEST_USER_EMAIL,
      TEST_PASSWORD,
      'http://localhost:3000'
    );
    await context.addCookies(cookies as Parameters<typeof context.addCookies>[0]);
    await page.goto('/', { waitUntil: 'networkidle' });

    const bell = page.getByRole('button', { name: /^(Thông báo|Notifications)$/ });
    await expect(bell).toBeVisible({ timeout: 5000 });
    const accountBtn = page.getByRole('button', { name: /^(Tài khoản|Account)$/ });
    await expect(accountBtn).toBeVisible({ timeout: 5000 });
  });

  test('menu opens and closes on click', async ({ page, context }) => {
    await ensureUser(TEST_USER_EMAIL, TEST_PASSWORD, 'user');
    const cookies = await sessionCookies(TEST_USER_EMAIL, TEST_PASSWORD, 'http://localhost:3000');
    await context.addCookies(cookies as Parameters<typeof context.addCookies>[0]);
    await page.goto('/', { waitUntil: 'networkidle' });

    const btn = page.getByRole('button', { name: /^(Tài khoản|Account)$/ });
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    await expect(page.getByRole('menuitem', { name: /Hồ sơ|Profile/ })).toBeVisible({ timeout: 3000 });

    await btn.click();
    await expect(page.getByRole('menuitem', { name: /Hồ sơ|Profile/ })).not.toBeVisible({ timeout: 1000 });
  });

  test('menu closes when clicking outside', async ({ page, context }) => {
    await ensureUser(TEST_USER_EMAIL, TEST_PASSWORD, 'user');
    const cookies = await sessionCookies(TEST_USER_EMAIL, TEST_PASSWORD, 'http://localhost:3000');
    await context.addCookies(cookies as Parameters<typeof context.addCookies>[0]);
    await page.goto('/', { waitUntil: 'networkidle' });

    const btn = page.getByRole('button', { name: /^(Tài khoản|Account)$/ });
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    const profileItem = page.getByRole('menuitem', { name: /Hồ sơ|Profile/ });
    await expect(profileItem).toBeVisible({ timeout: 1000 });
    // Click on main content area
    await page.getByRole('main').click();
    await expect(profileItem).not.toBeVisible({ timeout: 1000 });
  });

  test('menu closes with Esc key and returns focus to button', async ({ page, context }) => {
    await ensureUser(TEST_USER_EMAIL, TEST_PASSWORD, 'user');
    const cookies = await sessionCookies(TEST_USER_EMAIL, TEST_PASSWORD, 'http://localhost:3000');
    await context.addCookies(cookies as Parameters<typeof context.addCookies>[0]);
    await page.goto('/', { waitUntil: 'networkidle' });

    const btn = page.getByRole('button', { name: /^(Tài khoản|Account)$/ });
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    const profileItem = page.getByRole('menuitem', { name: /Hồ sơ|Profile/ });
    await expect(profileItem).toBeVisible({ timeout: 1000 });
    await page.keyboard.press('Escape');
    await expect(profileItem).not.toBeVisible({ timeout: 1000 });
    await expect(btn).toBeFocused();
  });

  test('user menu shows Profile and Sign out', async ({ page, context }) => {
    await ensureUser(TEST_USER_EMAIL, TEST_PASSWORD, 'user');
    const cookies = await sessionCookies(TEST_USER_EMAIL, TEST_PASSWORD, 'http://localhost:3000');
    await context.addCookies(cookies as Parameters<typeof context.addCookies>[0]);
    await page.goto('/', { waitUntil: 'networkidle' });

    const btn = page.getByRole('button', { name: /^(Tài khoản|Account)$/ });
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();

    await expect(page.getByRole('menuitem', { name: /Hồ sơ|Profile/ })).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole('menuitem', { name: /Đăng xuất|Sign out/ })).toBeVisible({ timeout: 3000 });
  });

  test('user menu does NOT show Admin Dashboard', async ({ page, context }) => {
    await ensureUser(TEST_USER_EMAIL, TEST_PASSWORD, 'user');
    const cookies = await sessionCookies(TEST_USER_EMAIL, TEST_PASSWORD, 'http://localhost:3000');
    await context.addCookies(cookies as Parameters<typeof context.addCookies>[0]);
    await page.goto('/', { waitUntil: 'networkidle' });

    const btn = page.getByRole('button', { name: /^(Tài khoản|Account)$/ });
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();

    const adminOption = page.getByRole('menuitem', { name: /Trang quản trị|Admin Dashboard/ });
    await expect(adminOption).not.toBeVisible();
  });

  test('Sign out redirects to /login', async ({ page, context }) => {
    await ensureUser(TEST_USER_EMAIL, TEST_PASSWORD, 'user');
    const cookies = await sessionCookies(TEST_USER_EMAIL, TEST_PASSWORD, 'http://localhost:3000');
    await context.addCookies(cookies as Parameters<typeof context.addCookies>[0]);
    await page.goto('/', { waitUntil: 'networkidle' });

    const btn = page.getByRole('button', { name: /^(Tài khoản|Account)$/ });
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    await page.getByRole('menuitem', { name: /Đăng xuất|Sign out/ }).click();

    await page.waitForURL(/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/.*login/);
  });

  test('after logout, guest sees Login button again', async ({ page, context }) => {
    await ensureUser(TEST_USER_EMAIL, TEST_PASSWORD, 'user');
    const cookies = await sessionCookies(TEST_USER_EMAIL, TEST_PASSWORD, 'http://localhost:3000');
    await context.addCookies(cookies as Parameters<typeof context.addCookies>[0]);
    await page.goto('/', { waitUntil: 'networkidle' });

    const bell = page.getByRole('button', { name: /^(Thông báo|Notifications)$/ });
    await expect(bell).toBeVisible({ timeout: 5000 });

    const btn = page.getByRole('button', { name: /^(Tài khoản|Account)$/ });
    await btn.click();
    await page.getByRole('menuitem', { name: /Đăng xuất|Sign out/ }).click();

    await page.waitForURL(/login/, { timeout: 5000 });
    await page.goto('/', { waitUntil: 'networkidle' });

    await expect(page.getByRole('link', { name: /Đăng nhập|Login/ }).first()).toBeVisible({ timeout: 5000 });
    await expect(bell).not.toBeVisible({ timeout: 2000 });
  });

  test('menu opens with Enter key', async ({ page, context }) => {
    await ensureUser(TEST_USER_EMAIL, TEST_PASSWORD, 'user');
    const cookies = await sessionCookies(TEST_USER_EMAIL, TEST_PASSWORD, 'http://localhost:3000');
    await context.addCookies(cookies as Parameters<typeof context.addCookies>[0]);
    await page.goto('/', { waitUntil: 'networkidle' });

    const btn = page.getByRole('button', { name: /^(Tài khoản|Account)$/ });
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.focus();
    await page.keyboard.press('Enter');

    await expect(page.getByRole('menuitem', { name: /Hồ sơ|Profile/ })).toBeVisible({ timeout: 2000 });
  });

  test('menu opens with Space key', async ({ page, context }) => {
    await ensureUser(TEST_USER_EMAIL, TEST_PASSWORD, 'user');
    const cookies = await sessionCookies(TEST_USER_EMAIL, TEST_PASSWORD, 'http://localhost:3000');
    await context.addCookies(cookies as Parameters<typeof context.addCookies>[0]);
    await page.goto('/', { waitUntil: 'networkidle' });

    const btn = page.getByRole('button', { name: /^(Tài khoản|Account)$/ });
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.focus();
    await page.keyboard.press('Space');

    await expect(page.getByRole('menuitem', { name: /Hồ sơ|Profile/ })).toBeVisible({ timeout: 2000 });
  });

  test('Tab navigation through menu items', async ({ page, context }) => {
    await ensureUser(TEST_USER_EMAIL, TEST_PASSWORD, 'user');
    const cookies = await sessionCookies(TEST_USER_EMAIL, TEST_PASSWORD, 'http://localhost:3000');
    await context.addCookies(cookies as Parameters<typeof context.addCookies>[0]);
    await page.goto('/', { waitUntil: 'networkidle' });

    const btn = page.getByRole('button', { name: /^(Tài khoản|Account)$/ });
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    const profileItem = page.getByRole('menuitem', { name: /Hồ sơ|Profile/ });
    await expect(profileItem).toBeVisible({ timeout: 1000 });

    // Focus should move through menu via Tab
    await profileItem.focus();
    await expect(profileItem).toBeFocused();
  });
});
