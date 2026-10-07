import { test, expect } from '@playwright/test';

test.describe('Login Screen — OAuth & Error Handling', () => {
  test('OAuth: clicking login button shows loading state and intercepts authorize', async ({
    page,
  }) => {
    // Registered before the click so the authorize navigation cannot be missed.
    const authorize = page.waitForRequest(/auth\/v1\/authorize/);
    // Never reach Google/Supabase: the request itself is the evidence.
    await page.route(/auth\/v1\/authorize/, (route) => route.abort());

    // Hold only the Server Action POST so the pending state is observable;
    // it is released (not aborted) after the pending assertions.
    let releaseAction!: () => void;
    const actionHeld = new Promise<void>((resolve) => (releaseAction = resolve));
    await page.route('**/login', async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      await actionHeld;
      await route.continue();
    });

    await page.goto('/login');
    const loginBtn = page.getByRole('button', { name: /login with google/i });
    await expect(loginBtn).toBeEnabled();
    await loginBtn.click();

    await expect(loginBtn).toBeDisabled();
    await expect(loginBtn).toHaveAttribute('aria-busy', 'true');

    releaseAction();
    const url = new URL((await authorize).url());
    expect(url.pathname).toBe('/auth/v1/authorize');
    expect(url.searchParams.get('provider')).toBe('google');
    expect(url.searchParams.get('redirect_to')).toBe('http://localhost:3000/auth/callback');
  });

  test('error param cancelled shows error alert', async ({ page }) => {
    await page.goto('/login?error=cancelled');

    // Use getByRole with filter to avoid matching Next.js route announcer
    const alert = page
      .getByRole('alert')
      .filter({
        hasText: 'Đăng nhập không thành công. Vui lòng thử lại',
      });
    await expect(alert).toBeVisible();
  });

  test('error param failed shows error alert', async ({ page }) => {
    await page.goto('/login?error=failed');

    // Use getByRole with filter to avoid matching Next.js route announcer
    const alert = page
      .getByRole('alert')
      .filter({
        hasText: 'Đăng nhập không thành công. Vui lòng thử lại',
      });
    await expect(alert).toBeVisible();
  });

  test('error alert clears on new login attempt', async ({ page }) => {
    await page.goto('/login?error=failed');

    // Error is visible (scoped to avoid route announcer)
    const alert = page
      .getByRole('alert')
      .filter({
        hasText: 'Đăng nhập không thành công. Vui lòng thử lại',
      });
    await expect(alert).toBeVisible();

    // Mock authorize route to avoid actual OAuth
    await page.route('**/auth/v1/authorize**', async (route) => {
      await route.abort();
    });

    // Click login button again
    const loginBtn = page.getByRole('button', {
      name: /login with google/i,
    });
    await loginBtn.click();

    // Error should be cleared (count should be 0)
    await expect(alert).toHaveCount(0);
  });
});
