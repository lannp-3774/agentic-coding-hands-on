import { test, expect } from '@playwright/test';

test.describe('@supabase Award blocks', () => {
  test('page displays 6 award sections in correct order', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });

    // Check that all 6 award sections exist with their IDs
    const expectedSlugs = ['top-talent', 'top-project', 'top-project-leader', 'best-manager', 'signature-2025-creator', 'mvp'];
    for (const slug of expectedSlugs) {
      const section = page.locator(`section[id="${slug}"]`);
      await expect(section).toBeVisible();
    }

    // Exactly these 6 sections, in DOM order (top to bottom)
    const ids = await page.locator('section[id]').evaluateAll((els) => els.map((el) => el.id));
    expect(ids).toEqual(expectedSlugs);
  });

  test('Top Talent block displays correct content', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    const section = page.locator('section[id="top-talent"]');

    // Title (use role to avoid matching description)
    await expect(section.getByRole('heading', { name: /Top Talent/ })).toBeVisible();

    // Quantity: "10 Cá nhân" (Figma: unit is Cá nhân, not Đơn vị as per spec)
    await expect(section.getByText('10', { exact: true })).toBeVisible();
    // Use exact match to avoid matching description text
    await expect(section.getByText('Cá nhân', { exact: true })).toBeVisible();

    // Amount: "7.000.000 VNĐ"
    await expect(section.getByText('7.000.000 VNĐ')).toBeVisible();

    // Note line: "cho mỗi giải thưởng"
    await expect(section.getByText('cho mỗi giải thưởng')).toBeVisible();
  });

  test('Top Project block displays correct content', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    const section = page.locator('section[id="top-project"]');

    // Title (use role to avoid matching description)
    await expect(section.getByRole('heading', { name: /Top Project/ })).toBeVisible();

    // Quantity: "02 Tập thể"
    await expect(section.getByText('02', { exact: true })).toBeVisible();
    // Use exact match to avoid matching description text
    await expect(section.getByText('Tập thể', { exact: true })).toBeVisible();

    // Amount: "15.000.000 VNĐ"
    await expect(section.getByText('15.000.000 VNĐ')).toBeVisible();

    // Note line: "cho mỗi giải thưởng"
    await expect(section.getByText('cho mỗi giải thưởng')).toBeVisible();
  });

  test('Top Project Leader block displays correct content', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    const section = page.locator('section[id="top-project-leader"]');

    // Title (use role to avoid matching description)
    await expect(section.getByRole('heading', { name: /Top Project Leader/ })).toBeVisible();

    // Quantity: "03 Cá nhân"
    await expect(section.getByText('03', { exact: true })).toBeVisible();
    // Use exact match to avoid matching description text
    await expect(section.getByText('Cá nhân', { exact: true })).toBeVisible();

    // Amount: "7.000.000 VNĐ"
    await expect(section.getByText('7.000.000 VNĐ')).toBeVisible();

    // Note line: "cho mỗi giải thưởng"
    await expect(section.getByText('cho mỗi giải thưởng')).toBeVisible();
  });

  test('Best Manager block displays correct content and no note line', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    const section = page.locator('section[id="best-manager"]');

    // Title (use role to avoid matching description)
    await expect(section.getByRole('heading', { name: /Best Manager/ })).toBeVisible();

    // Quantity: "01 Cá nhân"
    await expect(section.getByText('01', { exact: true })).toBeVisible();
    // Use exact match to avoid matching description text
    await expect(section.getByText('Cá nhân', { exact: true })).toBeVisible();

    // Amount: "10.000.000 VNĐ"
    await expect(section.getByText('10.000.000 VNĐ')).toBeVisible();

    // Best Manager has NO note line (per Figma, design shows no note under amount)
    const noteCount = await section.locator('text=cho mỗi').count();
    expect(noteCount).toBe(0);
  });

  test('Signature 2025 Creator block displays two prize tiers with Or separator', async ({
    page,
  }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    const section = page.locator('section[id="signature-2025-creator"]');

    // Title (use role to avoid matching description)
    await expect(section.getByRole('heading', { name: /Signature.*Creator/ })).toBeVisible();

    // Quantity: "01 Cá nhân hoặc tập thể"
    await expect(section.getByText('01', { exact: true })).toBeVisible();
    // Use exact match for the quantity label to avoid matching the description
    await expect(section.getByText('Cá nhân hoặc tập thể', { exact: true })).toBeVisible();

    // First prize tier: "5.000.000 VNĐ" + "cho giải cá nhân"
    await expect(section.getByText('5.000.000 VNĐ')).toBeVisible();
    await expect(section.getByText('cho giải cá nhân')).toBeVisible();

    // Separator: "Hoặc"
    await expect(section.getByText('Hoặc', { exact: true })).toBeVisible();

    // Second prize tier: "8.000.000 VNĐ" + "cho giải tập thể"
    await expect(section.getByText('8.000.000 VNĐ')).toBeVisible();
    await expect(section.getByText('cho giải tập thể')).toBeVisible();
  });

  test('MVP block displays correct content and no note line', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    const section = page.locator('section[id="mvp"]');

    // Title: "MVP" (use role to avoid matching description paragraph)
    await expect(section.getByRole('heading', { name: /MVP/ })).toBeVisible();

    // Quantity: "01 Cá nhân"
    await expect(section.getByText('01', { exact: true })).toBeVisible();
    // Use exact match to avoid matching description text
    await expect(section.getByText('Cá nhân', { exact: true })).toBeVisible();

    // Amount: "15.000.000 VNĐ"
    await expect(section.getByText('15.000.000 VNĐ')).toBeVisible();

    // MVP has NO note line (per Figma)
    const noteCount = await section.locator('text=cho mỗi').count();
    expect(noteCount).toBe(0);
  });

  test('award blocks display images at desktop viewport', async ({ page }) => {
    // Set viewport to @1440 (desktop)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/awards-information', { waitUntil: 'networkidle' });

    // Check that award section images exist (336x336 per spec)
    // One image per award section (auto-retries until all 6 are rendered)
    await expect(page.locator('section[id] img')).toHaveCount(6);

    // Verify first image dimensions (approximate, allowing for some CSS scaling)
    const firstImage = page.locator('section[id="top-talent"] img');
    await expect(firstImage).toBeVisible();
    const boundingBox = await firstImage.boundingBox();
    expect(boundingBox).not.toBeNull();
    // Should be approximately 336x336
    expect(Math.abs(boundingBox!.width - 336)).toBeLessThan(50);
    expect(Math.abs(boundingBox!.height - 336)).toBeLessThan(50);
  });

  test('award block images alternate left-right at desktop (1440)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/awards-information', { waitUntil: 'networkidle' });

    const sectionIds = ['top-talent', 'top-project', 'top-project-leader', 'best-manager', 'signature-2025-creator', 'mvp'];
    const expectedImageSides = ['left', 'right', 'left', 'right', 'left', 'right'];

    for (let i = 0; i < sectionIds.length; i++) {
      const section = page.locator(`section[id="${sectionIds[i]}"]`);
      const img = section.locator('img');
      await expect(img).toBeVisible();
      const sectionBox = await section.boundingBox();
      const imgBox = await img.boundingBox();
      expect(sectionBox).not.toBeNull();
      expect(imgBox).not.toBeNull();

      // Image on left if startX < midpoint, right if startX >= midpoint
      const midpoint = sectionBox!.x + sectionBox!.width / 2;
      const imageSide = imgBox!.x < midpoint ? 'left' : 'right';
      expect(imageSide).toBe(expectedImageSides[i]);
    }
  });

  test('award block descriptions are visible', async ({ page }) => {
    await page.goto('/awards-information', { waitUntil: 'networkidle' });
    const section = page.locator('section[id="top-talent"]');

    // Each award has a long description (seed: detail_description_vi)
    await expect(
      section.getByText(/^Giải thưởng Top Talent vinh danh những cá nhân xuất sắc/)
    ).toBeVisible();
  });
});
