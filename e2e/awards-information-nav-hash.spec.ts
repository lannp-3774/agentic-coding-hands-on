import { test, expect } from '@playwright/test';

test.describe('@supabase Awards nav', () => {
  test('navigating to valid hash loads award section and marks it active', async ({ page }) => {
    // Navigate directly with #signature-2025-creator hash
    await page.goto('/awards-information#signature-2025-creator', {
      waitUntil: 'networkidle',
    });

    const signatureBlock = page.locator('section[id="signature-2025-creator"]');
    await expect(signatureBlock).toBeInViewport();

    // The Signature nav item should be active (5th item, index 4)
    const nav = page.getByRole('navigation', { name: /Danh mục giải|Award categories/i });
    const signatureNavItem = nav.getByRole('link').nth(4);
    await expect(signatureNavItem).toHaveAttribute('aria-current', 'location');
  });

  test('navigating to invalid hash does not error and keeps first item active', async ({
    page,
  }) => {
    // Register the listener BEFORE navigating, otherwise load-time errors are never seen
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    // Navigate with invalid hash
    await page.goto('/awards-information#does-not-exist', {
      waitUntil: 'networkidle',
    });

    // Check scroll position (should stay at top)
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);

    // First nav item should remain active
    const nav = page.getByRole('navigation', { name: /Danh mục giải|Award categories/i });
    const firstItem = nav.getByRole('link').first();
    await expect(firstItem).toHaveAttribute('aria-current', 'location');

    // No page error should occur
    expect(pageErrors).toEqual([]);
  });

  test('malformed hash does not error', async ({ page }) => {
    let errorOccurred = false;
    page.on('pageerror', () => {
      errorOccurred = true;
    });

    // Navigate with malformed hash like %E0%A4%A
    await page.goto('/awards-information#%E0%A4%A', {
      waitUntil: 'networkidle',
    });

    expect(errorOccurred).toBe(false);

    // Scroll position should be at top
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });

  test('with reduced motion, nav click scrolls instantly', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/awards-information', { waitUntil: 'networkidle' });

    const nav = page.getByRole('navigation', { name: /Danh mục giải|Award categories/i });
    const bestManagerItem = nav.getByRole('link').nth(3);

    // Record scroll position before click
    const scrollBefore = await page.evaluate(() => window.scrollY);

    // Click nav item
    await bestManagerItem.click();

    // Instant scroll: the position moves down without a fixed sleep
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollBefore);

    // Best Manager block should be in viewport
    const bestManagerBlock = page.locator('section[id="best-manager"]');
    await expect(bestManagerBlock).toBeInViewport();
  });

  test('back button after hash navigation re-syncs active state', async ({ page }) => {
    // Start on homepage
    await page.goto('/', { waitUntil: 'networkidle' });

    // Click link to Awards page with hash (scope to header to avoid matching footer link)
    const awardsLink = page.locator('header').getByRole('link', { name: 'Awards Information' });
    await awardsLink.click();
    await expect(page).toHaveURL(/\/awards-information$/);

    // Navigate to specific hash
    await page.goto('/awards-information#best-manager', {
      waitUntil: 'networkidle',
    });

    const nav = page.getByRole('navigation', { name: /Danh mục giải|Award categories/i });
    const bestManagerItem = nav.getByRole('link').nth(3);
    await expect(bestManagerItem).toHaveAttribute('aria-current', 'location');

    // Go back
    await page.goBack();

    // Forward again
    await page.goForward();
    await expect(page).toHaveURL(/#best-manager$/);

    // Best Manager should still be active
    await expect(bestManagerItem).toHaveAttribute('aria-current', 'location');
  });

  test('clicking Top Project card from homepage navigates to that award block active', async ({
    page,
  }) => {
    // Start on homepage
    await page.goto('/', { waitUntil: 'networkidle' });

    // Click the Top Project award card (which has a link to /awards-information#top-project)
    // Exact name: a /Top Project/ regex would also match the Top Project Leader card
    const topProjectCard = page.getByRole('link', { name: 'Top Project', exact: true });
    await expect(topProjectCard).toHaveAttribute('href', '/awards-information#top-project');

    // Wait for URL to change and click in parallel (avoids waitForNavigation hang)
    await Promise.all([
      page.waitForURL(/awards-information#top-project$/),
      topProjectCard.click(),
    ]);

    // Verify we're on the correct URL
    await expect(page).toHaveURL(/awards-information#top-project$/);

    // Top Project block should be in view
    const topProjectBlock = page.locator('section[id="top-project"]');
    await expect(topProjectBlock).toBeInViewport();

    // Top Project nav item should be active (2nd item, index 1)
    const nav = page.getByRole('navigation', { name: /Danh mục giải|Award categories/i });
    const topProjectNavItem = nav.getByRole('link').nth(1);
    await expect(topProjectNavItem).toHaveAttribute('aria-current', 'location');
  });
});
