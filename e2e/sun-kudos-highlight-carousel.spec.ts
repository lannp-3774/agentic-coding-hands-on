import { test, expect, type Page } from '@playwright/test';
import { highlightOrder, type KudosFilter } from './support/kudos-board-seed';

/**
 * F006 SC-003, SC-004 · FR-205, FR-206, BR-004, DEC-002, D019.
 * Carousel contract (F006 A3): wrapper role=region aria-roledescription="carousel", every
 * card aria-roledescription="slide" (all 1-5 rendered, far ones hidden), centre card
 * interactive, adjacent cards `inert`; arrows are buttons named "...trước" / "...sau";
 * the counter reads `n/total`.
 */
const highlight = (page: Page) => page.getByRole('region', { name: 'HIGHLIGHT KUDOS', exact: true });
const slides = (page: Page) => highlight(page).locator('[aria-roledescription="slide"]');
const prevArrow = (page: Page) => highlight(page).getByRole('button', { name: /trước/i });
const nextArrow = (page: Page) => highlight(page).getByRole('button', { name: /sau/i });
const counter = (page: Page, text: string) => highlight(page).getByText(text, { exact: true });

async function expectSlideOrder(page: Page, expected: { timeLabel: string }[]) {
  await expect(slides(page)).toHaveCount(expected.length);
  for (const [i, row] of expected.entries()) {
    await expect(slides(page).nth(i)).toContainText(row.timeLabel);
  }
}

async function openFiltered(page: Page, query: KudosFilter) {
  const params = new URLSearchParams(query as Record<string, string>);
  await page.goto(`/sun-kudos?${params.toString()}`, { waitUntil: 'networkidle' });
}

test.describe('Sun* Kudos — Highlight carousel', () => {
  test('shows the 5 kudos with most hearts, like_count desc (SC-003, BR-004)', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });

    await expect(highlight(page).getByRole('heading', { name: 'HIGHLIGHT KUDOS', exact: true })).toBeVisible();
    await expect(highlight(page).locator('[aria-roledescription="carousel"]')).toBeVisible();
    await expectSlideOrder(page, highlightOrder());
  });

  test('fills 5 cards with 0-heart kudos when fewer have hearts, newest first on ties (SC-003, D019)', async ({ page }) => {
    const expected = highlightOrder({ department: 'CEVC10' });
    expect(expected.map((r) => r.likeCount)).toEqual([4, 3, 0, 0, 0]);

    await openFiltered(page, { department: 'CEVC10' });

    await expectSlideOrder(page, expected);
    await expect(counter(page, '1/5')).toBeVisible();
  });

  test('starts at 1/5 with prev disabled; next x4 reaches 5/5 with next disabled (SC-004, DEC-002)', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });

    await expect(counter(page, '1/5')).toBeVisible();
    await expect(prevArrow(page)).toBeDisabled();
    await expect(nextArrow(page)).toBeEnabled();

    await nextArrow(page).click();
    await expect(counter(page, '2/5')).toBeVisible();
    await expect(prevArrow(page)).toBeEnabled();
    for (let step = 3; step <= 5; step++) {
      await nextArrow(page).click();
      await expect(counter(page, `${step}/5`)).toBeVisible();
    }
    await expect(nextArrow(page)).toBeDisabled();
    await expect(prevArrow(page)).toBeEnabled();

    await prevArrow(page).click();
    await expect(counter(page, '4/5')).toBeVisible();
    await expect(nextArrow(page)).toBeEnabled();
  });

  test('centre card is interactive, adjacent cards are inert (SC-004, FR-206)', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    await expect(slides(page)).toHaveCount(5);

    await expect(slides(page).nth(0)).not.toHaveAttribute('inert');
    await expect(slides(page).nth(1)).toHaveAttribute('inert');

    await nextArrow(page).click();
    await expect(counter(page, '2/5')).toBeVisible();
    await expect(slides(page).nth(1)).not.toHaveAttribute('inert');
    await expect(slides(page).nth(0)).toHaveAttribute('inert');
    await expect(slides(page).nth(2)).toHaveAttribute('inert');
  });

  test('a single matching kudos shows 1/1 with both arrows disabled (SC-004, DEC-002)', async ({ page }) => {
    const expected = highlightOrder({ hashtag: 'creative', department: 'CEVC10' });
    expect(expected).toHaveLength(1);

    await openFiltered(page, { hashtag: 'creative', department: 'CEVC10' });

    await expectSlideOrder(page, expected);
    await expect(counter(page, '1/1')).toBeVisible();
    await expect(prevArrow(page)).toBeDisabled();
    await expect(nextArrow(page)).toBeDisabled();
  });
});
