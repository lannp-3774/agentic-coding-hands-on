import { test, expect } from '@playwright/test';

test.describe('@supabase Awards nav', () => {
  test('scrolling to a block marks its nav item as active', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });

    const nav = page.getByRole('navigation', { name: /Danh mục giải|Award categories/i });

    // Scroll down to Best Manager block
    const bestManagerBlock = page.locator('section[id="best-manager"]');
    await bestManagerBlock.scrollIntoViewIfNeeded();

    // Best Manager nav item should now be active once scroll-spy updates (4th item, index 3)
    const bestManagerNavItem = nav.getByRole('link').nth(3);
    await expect(bestManagerNavItem).toHaveAttribute('aria-current', 'location');
  });

  test('scrolling to bottom marks MVP as active', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });

    const nav = page.getByRole('navigation', { name: /Danh mục giải|Award categories/i });
    const mvpBlock = page.locator('section[id="mvp"]');

    // Scroll to MVP block
    await mvpBlock.scrollIntoViewIfNeeded();

    // MVP nav item should be active once scroll-spy updates (6th item, index 5)
    const mvpNavItem = nav.getByRole('link').nth(5);
    await expect(mvpNavItem).toHaveAttribute('aria-current', 'location');
  });

  test('scrolling to page bottom marks MVP as the only active nav item', async ({
    page,
  }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });

    const nav = page.getByRole('navigation', { name: /Danh mục giải|Award categories/i });

    // Start by verifying first item is active
    const firstItem = nav.getByRole('link').first();
    await expect(firstItem).toHaveAttribute('aria-current', 'location');

    // Scroll to document bottom using window.scrollTo
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

    // MVP nav item should be the only one with aria-current="location" (6th item, index 5)
    const mvpNavItem = nav.getByRole('link').nth(5);
    await expect(mvpNavItem).toHaveAttribute('aria-current', 'location');

    // Verify only one item has aria-current="location"
    await expect(nav.locator('a[aria-current="location"]')).toHaveCount(1);
  });
});
