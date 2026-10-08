import { test, expect, type Page } from '@playwright/test';

test.describe('@supabase Homepage Awards Grid', () => {
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
      if (!res.ok) {
        throw new Error(`Supabase health check failed: ${res.status}`);
      }
    } catch (err) {
      throw new Error(
        `Cannot run Supabase tests: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  });

  test('awards section displays title', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const title = page.locator('text=Hệ thống giải thưởng');
    await expect(title).toBeVisible();
  });

  test('awards grid is visible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const grid = page.locator('[role="region"]').filter({ hasText: /Hệ thống giải thưởng/i });
    await expect(grid).toBeVisible();
  });

  // One "Chi tiết" link per card, in seed order (sort_order).
  const SLUGS = [
    'top-talent',
    'top-project',
    'top-project-leader',
    'best-manager',
    'signature-2025-creator',
    'mvp',
  ];
  const detailLinks = (page: Page) =>
    page.getByRole('link', { name: /^(Chi tiết|Details)$/ }).and(
      page.locator('a[href^="/awards-information#"]')
    );

  /** Distinct horizontal positions of the 6 cards = number of grid columns. */
  async function columnCount(page: Page): Promise<number> {
    const links = detailLinks(page);
    await expect(links).toHaveCount(6);
    const xs = new Set<number>();
    for (let i = 0; i < 6; i++) {
      const box = await links.nth(i).boundingBox();
      expect(box, `card ${i + 1} has a layout box`).not.toBeNull();
      xs.add(Math.round(box!.x / 10));
    }
    return xs.size;
  }

  for (const [label, width, expected] of [
    ['desktop (1440px)', 1440, 3],
    ['tablet (768px)', 768, 2],
    ['mobile (375px)', 375, 2],
  ] as const) {
    test(`award cards display in ${expected}-column grid on ${label}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      expect(await columnCount(page)).toBe(expected);
    });
  }

  test('each card links image, title and Chi tiết to /awards-information#<slug>', async ({
    page,
  }) => {
    await page.goto('/');
    const links = detailLinks(page);
    await expect(links).toHaveCount(6);
    for (const [i, slug] of SLUGS.entries()) {
      await expect(links.nth(i)).toHaveAttribute('href', `/awards-information#${slug}`);
      // image + title + Chi tiết all point at the same anchor
      await expect(page.locator(`a[href="/awards-information#${slug}"]`)).toHaveCount(3);
    }
  });

  test('award description is clamped to 2 lines', async ({ page }) => {
    await page.goto('/');
    const description = page.getByText('Vinh danh top cá nhân xuất sắc trên mọi phương diện', {
      exact: true,
    });
    await expect(description).toBeVisible();
    await expect(description).toHaveCSS('-webkit-line-clamp', '2');
  });
});
