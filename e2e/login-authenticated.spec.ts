import { test, expect } from '@playwright/test';
import { ensureUser, sessionCookies } from './support/supabase-session';

const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Test123456!';

test.describe('@supabase Authenticated Flows', () => {
  test.beforeAll(async () => {
    // Probe Supabase health before running tests
    const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
    const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || '';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
        signal: controller.signal,
        headers: {
          apikey: supabaseKey,
        },
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(
          `Supabase health check failed: ${res.status} ${res.statusText}`
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(
        `Cannot run authenticated tests: Supabase is not reachable. ` +
        `Start Supabase with 'supabase start' and try again. ` +
        `Details: ${message}`
      );
    }
  });

  test.beforeEach(async ({ context }) => {
    // Seed user
    await ensureUser(TEST_EMAIL, TEST_PASSWORD);

    // Obtain session cookies with baseURL for proper domain/path handling
    const cookies = await sessionCookies(
      TEST_EMAIL,
      TEST_PASSWORD,
      'http://localhost:3000'
    );

    // Add cookies to context
    await context.addCookies(
      cookies as Parameters<typeof context.addCookies>[0]
    );
  });

  test('authenticated user visiting /login is redirected to /', async ({
    page,
  }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });

    // Should redirect to homepage (/) exactly
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('/ displays authenticated header with account button', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Should show account button (notification bell or account button)
    const accountBtn = page.getByRole('button', { name: /^(Tài khoản|Account)$/ });
    await expect(accountBtn).toBeVisible({ timeout: 5000 });

    // Should have logout accessible via account menu
    await accountBtn.click();

    const logoutBtn = page.getByRole('menuitem', {
      name: /Đăng xuất|Sign out/i,
    });
    await expect(logoutBtn).toBeVisible({ timeout: 3000 });
  });

  test('/todo returns 404 not found', async ({ page }) => {
    // After homepage replaces boilerplate, /todo should not exist
    const response = await page.goto('/todo', { waitUntil: 'networkidle' });

    // Should get 404
    expect(response?.status()).toBe(404);
  });

  test('with NEXT_LOCALE=en cookie, account menu shows English', async ({
    page,
    context,
  }) => {
    // Add language cookie before navigating
    await context.addCookies([
      {
        name: 'NEXT_LOCALE',
        value: 'en',
        url: 'http://localhost:3000',
      },
    ]);

    await page.goto('/', { waitUntil: 'networkidle' });

    // Account menu should have "Sign out" in English
    const accountBtn = page.getByRole('button', { name: /^(Tài khoản|Account)$/ });
    await expect(accountBtn).toBeVisible({ timeout: 5000 });
    await accountBtn.click();

    const signOutBtn = page.getByRole('menuitem', { name: /Sign out/i });
    await expect(signOutBtn).toBeVisible({ timeout: 3000 });
  });
});
