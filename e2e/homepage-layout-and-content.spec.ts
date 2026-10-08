import { test, expect } from '@playwright/test';

test.describe('Homepage (/) Layout and Content', () => {
  test('guest user can access homepage (no redirect, SAA page rendered)', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBe(200);
    await expect(page).toHaveURL('http://localhost:3000/');
    // Proves the SAA homepage rendered, not some other page at /
    await expect(page.getByRole('heading', { level: 1, name: 'ROOT FURTHER' })).toBeVisible();
  });

  test('header displays logo with correct alt text', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const logo = page.locator('header img[alt*="Sun"][alt*="Annual"]');
    await expect(logo).toBeVisible();
  });

  test('header displays About SAA 2025 nav link marked as current', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const aboutLink = page.getByRole('banner').getByRole('link', { name: 'About SAA 2025' });
    await expect(aboutLink).toBeVisible();
    await expect(aboutLink).toHaveAttribute('aria-current', 'page');
  });

  test('header displays Awards Information link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const awardsLink = page.getByRole('banner').getByRole('link', { name: 'Awards Information' });
    await expect(awardsLink).toBeVisible();
    await expect(awardsLink).toHaveAttribute('href', '/awards-information');
  });

  test('header displays Sun* Kudos link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const kudosLink = page.getByRole('banner').getByRole('link', { name: 'Sun* Kudos' });
    await expect(kudosLink).toBeVisible();
    await expect(kudosLink).toHaveAttribute('href', '/sun-kudos');
  });

  test('header displays language selector defaulting to VN', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const langButton = page.getByRole('button', { name: /VN/i });
    await expect(langButton).toBeVisible();
  });

  test('guest user sees Login button in account region', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const loginBtn = page.getByRole('link', { name: /Đăng nhập|Login/ });
    await expect(loginBtn.first()).toBeVisible();
  });

  test('guest user does not see notification bell', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // Positive first: the guest variant of the account slot is rendered...
    await expect(page.getByRole('link', { name: 'Đăng nhập', exact: true })).toBeVisible();
    // ...and only then is the absence of the bell meaningful.
    await expect(page.getByRole('button', { name: /^(Thông báo|Notifications)$/ })).toHaveCount(0);
  });

  test('hero section displays ROOT FURTHER title', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const heroTitle = page.locator('h1').filter({ hasText: 'ROOT FURTHER' });
    await expect(heroTitle).toBeVisible();
  });

  test('hero displays event information with correct text', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('text=26/12/2025')).toBeVisible();
    await expect(page.locator('text=Âu Cơ Art Center')).toBeVisible();
    await expect(page.locator('text=Livestream')).toBeVisible();
  });

  test('hero displays ABOUT AWARDS link button', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const aboutAwardsBtn = page.getByRole('link', { name: /ABOUT AWARDS/ });
    await expect(aboutAwardsBtn).toBeVisible();
  });

  test('hero displays ABOUT KUDOS link button', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const aboutKudosBtn = page.getByRole('link', { name: /ABOUT KUDOS/ });
    await expect(aboutKudosBtn).toBeVisible();
  });

  test('awards section title is visible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const awardsTitle = page.locator('text=Hệ thống giải thưởng');
    await expect(awardsTitle).toBeVisible();
  });

  test('Sun* Kudos section displays title', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const kudosTitle = page.getByRole('main').getByRole('heading', { name: 'Sun* Kudos' });
    await expect(kudosTitle).toBeVisible();
  });

  test('Sun* Kudos section displays Chi tiết link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const detailsLink = page.getByRole('link', { name: /Chi tiết/ }).last();
    await expect(detailsLink).toBeVisible();
  });

  test('widget button is accessible with label', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const widget = page.locator('button[aria-label]').filter({ hasText: /hành động|quick actions/i });
    await expect(widget).toBeVisible();
  });

  test('footer displays logo', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const footerLogo = page.locator('footer img[alt*="Sun"][alt*="Annual"]');
    await expect(footerLogo).toBeVisible();
  });

  test('footer displays About SAA 2025 link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const footerAbout = page
      .locator('footer')
      .getByRole('link', { name: 'About SAA 2025' });
    await expect(footerAbout).toBeVisible();
  });

  test('footer displays copyright text', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const copyright = page.locator('text=/Bản quyền|Copyright|© 2025/');
    await expect(copyright).toBeVisible();
  });

  test('clicking header logo scrolls to top', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(100);

    const headerLogo = page.locator('header img[alt*="Sun"]').first();
    await headerLogo.click();

    const scrollPos = await page.evaluate(() => window.scrollY);
    expect(scrollPos).toBeLessThan(100);
  });
});
