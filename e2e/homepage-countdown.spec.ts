import { test, expect } from '@playwright/test';

test.describe('Homepage Countdown Timer', () => {
  test('countdown displays with valid target time, shows Coming soon', async ({
    page,
  }) => {
    // Set time before target: 2026-12-25 (one day before 2026-12-26T18:30)
    await page.clock.install({ time: new Date('2026-12-25T18:30:00+07:00') });

    await page.goto('/', { waitUntil: 'networkidle' });

    // Check for countdown tiles (DAYS, HOURS, MINUTES)
    const daysLabel = page.locator('text=DAYS');
    const hoursLabel = page.locator('text=HOURS');
    const minutesLabel = page.locator('text=MINUTES');

    await expect(daysLabel).toBeVisible();
    await expect(hoursLabel).toBeVisible();
    await expect(minutesLabel).toBeVisible();

    // Check for "Coming soon" label
    const comingSoon = page.locator('text=/Coming soon/i');
    await expect(comingSoon).toBeVisible();

    // Verify countdown shows non-zero values (should be 1 day, 0 hours, 0 minutes)
    const daysValue = page
      .locator('text=DAYS')
      .locator('..')
      .locator('[class*="value"], [class*="number"]')
      .first();
    const text = await daysValue.textContent();
    expect(text).toMatch(/\d+/);
  });

  test('countdown updates after one minute', async ({ page }) => {
    // Start at 2026-12-25T18:35 (23 hours 55 minutes before target)
    await page.clock.install({
      time: new Date('2026-12-25T18:35:00+07:00'),
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    // Get initial minutes value
    const minuteLocator = page.locator('text=/MINUTES|Minutes/i');
    const minuteContainer = minuteLocator.locator('..').first();

    // Extract numeric value (should be 55)
    const initialText = await minuteContainer.textContent();
    const initialMinutes = parseInt(initialText?.match(/\d+/)?.[0] || '0', 10);

    // Advance time by 1 minute
    await page.clock.runFor('00:01:00');

    // Wait a bit for re-render
    await page.waitForTimeout(100);

    // Get new minutes value
    const newText = await minuteContainer.textContent();
    const newMinutes = parseInt(newText?.match(/\d+/)?.[0] || '0', 10);

    // Minutes should have decreased by 1
    expect(newMinutes).toBe(initialMinutes - 1);
  });

  test('countdown shows 00 00 00 at target time, hides Coming soon', async ({
    page,
  }) => {
    // Set time to target
    await page.clock.install({
      time: new Date('2026-12-26T18:30:00+07:00'),
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    // Should show 00 00 00
    const daysLocator = page.locator('text=/DAYS|Days/i').locator('..').first();
    const hoursLocator = page
      .locator('text=/HOURS|Hours/i')
      .locator('..')
      .first();
    const minutesLocator = page
      .locator('text=/MINUTES|Minutes/i')
      .locator('..')
      .first();

    // Each should contain "00"
    const daysText = await daysLocator.textContent();
    const hoursText = await hoursLocator.textContent();
    const minutesText = await minutesLocator.textContent();

    expect(daysText).toContain('00');
    expect(hoursText).toContain('00');
    expect(minutesText).toContain('00');

    // Coming soon should be hidden
    const comingSoon = page.locator('text=/Coming soon/i');
    await expect(comingSoon).not.toBeVisible();
  });

  test('countdown shows 00 00 00 after target time, hides Coming soon', async ({
    page,
  }) => {
    // Set time after target (2026-12-27)
    await page.clock.install({
      time: new Date('2026-12-27T10:00:00+07:00'),
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    // Should show 00 00 00
    const daysText = await page
      .locator('text=/DAYS|Days/i')
      .locator('..')
      .first()
      .textContent();
    const hoursText = await page
      .locator('text=/HOURS|Hours/i')
      .locator('..')
      .first()
      .textContent();
    const minutesText = await page
      .locator('text=/MINUTES|Minutes/i')
      .locator('..')
      .first()
      .textContent();

    expect(daysText).toContain('00');
    expect(hoursText).toContain('00');
    expect(minutesText).toContain('00');

    // Coming soon should be hidden
    const comingSoon = page.locator('text=/Coming soon/i');
    await expect(comingSoon).not.toBeVisible();
  });

  test('countdown displays two-digit zero-padded values', async ({ page }) => {
    // Set time to 2026-12-20T10:35 (6 days, 7 hours, 55 minutes before target)
    await page.clock.install({
      time: new Date('2026-12-20T10:35:00+07:00'),
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    // Find countdown value elements and wait for real digits (not "--" placeholders)
    const daysValue = page.locator('[class*="countdown-value"]').nth(0);
    const hoursValue = page.locator('[class*="countdown-value"]').nth(1);
    const minutesValue = page.locator('[class*="countdown-value"]').nth(2);

    // Wait for real digits to appear (not "--" placeholder)
    await expect(daysValue).toContainText(/^\d+$/);
    await expect(hoursValue).toContainText(/^\d{2}$/);
    await expect(minutesValue).toContainText(/^\d{2}$/);

    // Assert the specific expected values (6 days, 07 hours, 55 minutes)
    await expect(daysValue).toHaveText('06');
    await expect(hoursValue).toHaveText('07');
    await expect(minutesValue).toHaveText('55');
  });
});
