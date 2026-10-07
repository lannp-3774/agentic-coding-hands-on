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

  test('authenticated user visiting /login is redirected to /todo', async ({
    page,
  }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });

    // Should redirect to /todo
    expect(page.url()).toContain('/todo');
  });

  test('/todo displays user email and logout button', async ({ page }) => {
    await page.goto('/todo', { waitUntil: 'networkidle' });

    // Should show user's email
    await expect(page.locator(`text=${TEST_EMAIL}`)).toBeVisible();

    // Should have logout button
    const logoutBtn = page.getByRole('button', {
      name: /Đăng xuất|Log out/i,
    });
    await expect(logoutBtn).toBeVisible();
  });

  test('clicking logout redirects to /login', async ({ page }) => {
    await page.goto('/todo');

    const logoutBtn = page.getByRole('button', {
      name: /Đăng xuất|Log out/i,
    });
    await logoutBtn.click();

    // Should redirect to /login
    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('after logout, /todo redirects back to /login', async ({ page }) => {
    await page.goto('/todo');

    // Log out
    const logoutBtn = page.getByRole('button', {
      name: /Đăng xuất|Log out/i,
    });
    await logoutBtn.click();

    // Wait for redirect to /login
    await page.waitForURL('**/login', { timeout: 5000 });

    // Now try to access /todo again — should redirect to /login
    await page.goto('/todo', { waitUntil: 'networkidle' });
    expect(page.url()).toContain('/login');
  });

  test('with NEXT_LOCALE=en cookie, logout button reads "Log out"', async ({
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

    await page.goto('/todo', { waitUntil: 'networkidle' });

    const logoutBtn = page.getByRole('button', { name: /Log out/i });
    await expect(logoutBtn).toBeVisible();
  });
});
