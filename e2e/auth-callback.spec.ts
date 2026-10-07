import { test, expect } from '@playwright/test';

test.describe('OAuth Callback — /auth/callback', () => {
  test('callback without code param redirects to /login?error=cancelled', async ({
    page,
  }) => {
    // Navigate to /auth/callback with no code
    await page.goto('/auth/callback');

    // Should redirect to /login with error=cancelled
    expect(page.url()).toContain('/login');
    expect(page.url()).toContain('error=cancelled');
  });

  test('callback without code shows error alert', async ({ page }) => {
    await page.goto('/auth/callback');

    // Should see the error alert
    const alert = page
      .getByRole('alert')
      .filter({
        hasText: 'Đăng nhập không thành công. Vui lòng thử lại',
      });
    await expect(alert).toBeVisible();
  });

  test('callback with bogus code redirects to /login?error=failed', async ({
    page,
  }) => {
    // Navigate to /auth/callback with a fake code
    await page.goto('/auth/callback?code=bogus_code_12345');

    // Should redirect to /login with error=failed
    expect(page.url()).toContain('/login');
    expect(page.url()).toContain('error=failed');
  });

  test('callback with bogus code shows error alert', async ({ page }) => {
    await page.goto('/auth/callback?code=bogus_code_12345');

    // Should see the error alert
    const alert = page
      .getByRole('alert')
      .filter({
        hasText: 'Đăng nhập không thành công. Vui lòng thử lại',
      });
    await expect(alert).toBeVisible();
  });

  test('callback with open-redirect attempt (next param) never leaves origin', async ({
    page,
  }) => {
    // Try to redirect to an external site via next param
    await page.goto(
      '/auth/callback?code=bogus&next=https://example.com/evil'
    );

    // Should stay on localhost
    const url = new URL(page.url());
    expect(url.hostname).toBe('localhost');

    // Should be redirected to /login with error param
    expect(page.url()).toContain('/login');
  });

  test('callback with open-redirect attempt (redirect_to param) never leaves origin', async ({
    page,
  }) => {
    // Try to redirect to an external site via redirect_to param (alternative param name)
    await page.goto(
      '/auth/callback?code=bogus&redirect_to=https://evil.example.com'
    );

    // Should stay on localhost
    const url = new URL(page.url());
    expect(url.hostname).toBe('localhost');

    // Should be redirected to /login with error param
    expect(page.url()).toContain('/login');
  });

  test('/login with unknown error value shows no alert', async ({ page }) => {
    // Navigate to /login with an unknown error param
    await page.goto('/login?error=unknown_error_xyz');

    // Should show the /login page (positive assertion first)
    const loginBtn = page.getByRole('button', {
      name: /login with google/i,
    });
    await expect(loginBtn).toBeVisible();

    // Should NOT show the login-failed alert
    const alert = page
      .getByRole('alert')
      .filter({
        hasText: 'Đăng nhập không thành công. Vui lòng thử lại',
      });
    await expect(alert).toHaveCount(0);
  });

  test('callback with error=access_denied redirects to /login?error=cancelled', async ({
    page,
  }) => {
    // Supabase sends error=access_denied when user cancels OAuth consent
    await page.goto('/auth/callback?error=access_denied');

    // Should redirect to /login with error=cancelled
    expect(page.url()).toContain('/login');
    expect(page.url()).toContain('error=cancelled');
  });

  test('callback with error=access_denied shows error alert', async ({
    page,
  }) => {
    await page.goto('/auth/callback?error=access_denied');

    // Should see the error alert
    const alert = page
      .getByRole('alert')
      .filter({
        hasText: 'Đăng nhập không thành công. Vui lòng thử lại',
      });
    await expect(alert).toBeVisible();
  });

  test('bogus callback code redirects to /login with error', async ({
    page,
  }) => {
    // Navigate with a bogus code that cannot be exchanged
    await page.goto('/auth/callback?code=invalid_code_format');

    // Should redirect to /login with error=failed
    expect(page.url()).toContain('/login');
    expect(page.url()).toContain('error=failed');
  });
});
