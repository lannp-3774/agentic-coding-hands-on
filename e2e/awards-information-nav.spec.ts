import { test, expect } from '@playwright/test';

test.describe('@supabase Awards nav', () => {
  test('left navigation displays 6 labels in correct order', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });

    const nav = page.getByRole('navigation', { name: /Danh mục giải|Award categories/i });
    const navItems = nav.getByRole('link');

    const count = await navItems.count();
    expect(count).toBe(6);

    // Check labels are in order (short forms: Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 Creator, MVP)
    const labels = [
      'Top Talent',
      'Top Project',
      /Top Project.*Leader/,
      'Best Manager',
      /Signature.*Creator/,
      'MVP',
    ];

    for (let i = 0; i < labels.length; i++) {
      const item = navItems.nth(i);
      await expect(item).toContainText(labels[i]);
    }
  });

  test('first navigation item is active by default', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });

    const nav = page.getByRole('navigation', { name: /Danh mục giải|Award categories/i });
    const firstItem = nav.getByRole('link').first();

    await expect(firstItem).toHaveAttribute('aria-current', 'location');
  });

  test('clicking a nav item scrolls to that award block and marks it active', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });

    const nav = page.getByRole('navigation', { name: /Danh mục giải|Award categories/i });
    const secondItem = nav.getByRole('link').nth(1); // Top Project

    // Click the second nav item
    await secondItem.click();

    // The clicked item should now have aria-current (auto-retries through the smooth scroll)
    await expect(secondItem).toHaveAttribute('aria-current', 'location');

    // First item should NOT have aria-current anymore
    const firstItem = nav.getByRole('link').first();
    await expect(firstItem).not.toHaveAttribute('aria-current', 'location');

    // The Top Project block should be in view
    const topProjectBlock = page.locator('section[id="top-project"]');
    await expect(topProjectBlock).toBeInViewport();
  });

  test('only one nav item is active at any time', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });

    const nav = page.getByRole('navigation', { name: /Danh mục giải|Award categories/i });
    const navItems = nav.getByRole('link');

    // Click Best Manager (4th item)
    await navItems.nth(3).click();
    await expect(navItems.nth(3)).toHaveAttribute('aria-current', 'location');

    // Exactly one item has aria-current (query nav directly, not navItems collection)
    await expect(nav.locator('a[aria-current="location"]')).toHaveCount(1);
  });

  test('hovering over a nav item changes its visual state', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });

    const nav = page.getByRole('navigation', { name: /Danh mục giải|Award categories/i });
    const secondItem = nav.getByRole('link').nth(1);

    const bgBefore = await secondItem.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    // Hover over the item (CSS :hover pseudo-class activates, 200ms colour transition)
    await secondItem.hover();

    // The hover background must actually differ from the resting one (auto-retries)
    await expect(secondItem).not.toHaveCSS('background-color', bgBefore);

    // Also test keyboard focus to verify focus-visible state works
    await secondItem.focus();
    await expect(secondItem).toBeFocused();
  });

  test('navigation is horizontally scrollable on mobile viewport @375', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/awards-information', { waitUntil: 'networkidle' });

    const nav = page.getByRole('navigation', { name: /Danh mục giải|Award categories/i });

    // Check that nav has horizontal scroll (scrollWidth > clientWidth)
    const isScrollable = await nav.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(isScrollable).toBe(true);
  });
});
