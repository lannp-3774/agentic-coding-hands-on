import { test, expect, type Locator, type Page } from '@playwright/test';
import { KUDOS_BY_N, SUNNERS, TEST_ACCOUNTS } from './support/kudos-board-seed';
import { signInBrowser } from './support/kudos-board-db';

/**
 * F006 SC-009 (Copy Link, DEC-006, BR-013) and SC-010 (card links, DEC-007, BR-010, US006).
 * Copy Link writes `origin + /sun-kudos/<id>`; toast role=status "Link copied — ready to share!";
 * fallback textarea + execCommand when navigator.clipboard is missing; error toast when both fail.
 */
const ORIGIN = 'http://localhost:3000';
const COPIED = 'Link copied — ready to share!';
const COPY_FAILED = 'Không sao chép được liên kết';
const feed = (page: Page) => page.getByRole('region', { name: 'ALL KUDOS', exact: true });
const feedCard = (page: Page, n: number) =>
  feed(page).getByRole('article').filter({ hasText: KUDOS_BY_N(n).timeLabel });
const firstSlide = (page: Page) =>
  page.getByRole('region', { name: 'HIGHLIGHT KUDOS', exact: true }).locator('[aria-roledescription="slide"]').nth(0);
const newest = KUDOS_BY_N(60);
const top = KUDOS_BY_N(49); // Highlight slide 1: SENDER -> QUY

/** Init script: hide navigator.clipboard; record what execCommand('copy') would copy. */
function stubClipboard(execResult: boolean) {
  Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
  const w = window as unknown as { __copied: string[] };
  w.__copied = [];
  document.execCommand = (command: string) => {
    if (command === 'copy') {
      document.querySelectorAll('textarea').forEach((t) => w.__copied.push(t.value));
    }
    return execResult;
  };
}

const hrefsOf = (scope: Locator, name: string) =>
  scope.getByRole('link', { name, exact: true }).evaluateAll((els) => els.map((el) => el.getAttribute('href')));

test.describe('Sun* Kudos — Copy Link', () => {
  test('copies the absolute detail URL and shows the toast (SC-009, US005-1)', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });

    const copy = feedCard(page, 60).getByRole('button', { name: 'Copy Link', exact: true });
    await expect(copy).toBeVisible();
    await copy.click();

    await expect(page.getByRole('status').filter({ hasText: COPIED })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${ORIGIN}/sun-kudos/${newest.id}`);
  });

  test('falls back to textarea + execCommand when navigator.clipboard is missing (SC-009, US005-2)', async ({ page }) => {
    await page.addInitScript(stubClipboard, true);
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });

    const copy = feedCard(page, 60).getByRole('button', { name: 'Copy Link', exact: true });
    await expect(copy).toBeVisible();
    await copy.click();

    await expect(page.getByRole('status').filter({ hasText: COPIED })).toBeVisible();
    const copied = await page.evaluate(() => (window as unknown as { __copied: string[] }).__copied);
    expect(copied).toContain(`${ORIGIN}/sun-kudos/${newest.id}`);
    await expect(page.locator('textarea')).toHaveCount(0);
  });

  test('shows the error toast when both copy paths fail (SC-009, DEC-006)', async ({ page }) => {
    await page.addInitScript(stubClipboard, false);
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });

    const copy = feedCard(page, 60).getByRole('button', { name: 'Copy Link', exact: true });
    await expect(copy).toBeVisible();
    await copy.click();

    await expect(page.getByRole('status').filter({ hasText: COPY_FAILED })).toBeVisible();
    await expect(page.getByText(COPIED, { exact: true })).toHaveCount(0);
  });
});

test.describe('Sun* Kudos — detail and profile links', () => {
  test('signed-in: detail -> /sun-kudos/<id>, avatar/name -> /profiles/<id> (SC-010, US006-1)', async ({ page, context }) => {
    await signInBrowser(context, TEST_ACCOUNTS.VIEWER);
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    await expect(firstSlide(page)).toContainText(top.timeLabel);

    await expect(firstSlide(page).getByRole('link', { name: 'Xem chi tiết', exact: true }))
      .toHaveAttribute('href', `/sun-kudos/${top.id}`);
    const senderHrefs = await hrefsOf(firstSlide(page), SUNNERS.SENDER.name);
    expect(senderHrefs.length).toBeGreaterThan(0);
    expect(new Set(senderHrefs)).toEqual(new Set([`/profiles/${SUNNERS.SENDER.id}`]));
    const receiverHrefs = await hrefsOf(firstSlide(page), SUNNERS.QUY.name);
    expect(new Set(receiverHrefs)).toEqual(new Set([`/profiles/${SUNNERS.QUY.id}`]));
    // feed cards have no "Xem chi tiết": the body (stretched link) is the detail link
    await expect(feedCard(page, 60).locator(`a[href="/sun-kudos/${newest.id}"]`)).toHaveCount(1);

    await firstSlide(page).getByRole('link', { name: 'Xem chi tiết', exact: true }).click();
    await expect(page).toHaveURL(`${ORIGIN}/sun-kudos/${top.id}`);
  });

  test('guest: every detail/profile link points to /login and lands there (SC-010, US006-2)', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    await expect(firstSlide(page)).toContainText(top.timeLabel);

    await expect(firstSlide(page).getByRole('link', { name: 'Xem chi tiết', exact: true })).toHaveAttribute('href', '/login');
    for (const scope of [firstSlide(page), feedCard(page, 60)]) {
      await expect(scope.locator('a[href^="/profiles/"], a[href^="/sun-kudos/"]')).toHaveCount(0);
    }
    const receiverHrefs = await hrefsOf(feedCard(page, 60), SUNNERS.CHUC.name);
    expect(receiverHrefs.length).toBeGreaterThan(0);
    expect(new Set(receiverHrefs)).toEqual(new Set(['/login']));

    // avatar (alt = name) and name are both links to the receiver; click the name text link
    await feedCard(page, 60).getByRole('link', { name: SUNNERS.CHUC.name, exact: true }).last().click();
    await expect(page).toHaveURL(`${ORIGIN}/login`);
  });
});
