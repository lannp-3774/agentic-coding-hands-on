// Browser-only reads and scroll calls for the awards nav (F004 A3, A4). All
// geometry is measured at call time: the header (64/80px), the tab bar and the
// viewport change with breakpoints, so nothing here is a hard-coded offset.

// Where ALG-001's reference line sits inside the free area under the fixed bars
// (resolves spec §5.3 Q2). An anchored block lands 8-16px below the bars
// (Track A's scroll-mt) and `scrollIntoViewIfNeeded` centres short blocks, so a
// few-pixel pad would miss both; a quarter of the free height covers them while
// the next block (>= 336px image + 80px gap further down) stays below the line.
const READING_LINE_RATIO = 0.25;
// Sub-pixel rounding slack when testing for the end of the page.
const PAGE_BOTTOM_SLACK_PX = 2;

export function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function isAtPageBottom(): boolean {
  const { scrollHeight } = document.documentElement;
  return window.innerHeight + window.scrollY >= scrollHeight - PAGE_BOTTOM_SLACK_PX;
}

// Bottom edge of the fixed site header (in-flow <header> elements are ignored).
function fixedHeaderBottom(): number {
  let bottom = 0;
  for (const header of document.querySelectorAll("header")) {
    if (getComputedStyle(header).position !== "fixed") continue;
    bottom = Math.max(bottom, header.getBoundingClientRect().bottom);
  }
  return bottom;
}

/**
 * ALG-001 reference line, in px from the viewport top: the bottom of whatever
 * covers the content (fixed header, plus the nav while it is the horizontal tab
 * bar stacked above the awards below `lg`), then a reading offset into the rest.
 */
export function measureReadingLine(nav: HTMLElement | null, firstSection: HTMLElement): number {
  let covered = fixedHeaderBottom();
  if (nav) {
    const navBox = nav.getBoundingClientRect();
    const sectionBox = firstSection.getBoundingClientRect();
    // Tab-bar mode: the nav spans the content column instead of sitting beside it.
    const spansContent = navBox.left < sectionBox.right && navBox.right > sectionBox.left;
    if (spansContent) covered = Math.max(covered, navBox.bottom);
  }
  return covered + Math.max(0, window.innerHeight - covered) * READING_LINE_RATIO;
}

/**
 * Keeps the active item visible in the horizontally scrolling tab bar by
 * scrolling the nav alone. `scrollIntoView` on the item would also scroll the
 * window and cancel an in-flight smooth page scroll. No-op from `lg` up, where
 * the nav is a column and does not scroll.
 */
export function revealNavItem(nav: HTMLElement | null, slug: string, behavior: ScrollBehavior): void {
  if (!nav || nav.scrollWidth <= nav.clientWidth) return;
  const item = Array.from(nav.querySelectorAll<HTMLElement>("[data-slug]")).find(
    (element) => element.dataset.slug === slug,
  );
  if (!item) return;
  const navBox = nav.getBoundingClientRect();
  const itemBox = item.getBoundingClientRect();
  if (itemBox.left >= navBox.left && itemBox.right <= navBox.right) return;
  // Centre it so its neighbours stay in sight on both sides.
  const offset = itemBox.left + itemBox.width / 2 - (navBox.left + navBox.width / 2);
  nav.scrollTo({ left: nav.scrollLeft + offset, behavior });
}
