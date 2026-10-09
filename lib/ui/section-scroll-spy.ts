// Pure scroll-spy helpers (F004 ALG-001, BR-007, BR-008). No DOM access, so the
// rules can be reasoned about and proven without a browser.

export type ActiveSectionInput = {
  // Viewport-relative top of each section, in document order.
  tops: readonly number[];
  // Reference line (px from the viewport top) a section must reach to be active.
  line: number;
  // Page scrolled to the end: the last section may never reach the line.
  atBottom: boolean;
};

/**
 * Index of the active section: the last one whose top has reached the line;
 * the first when none has (BR-007 default); the last when the page is at its
 * bottom (DEC-004). Returns -1 only for an empty list (nothing to activate).
 */
export function pickActiveSectionIndex({ tops, line, atBottom }: ActiveSectionInput): number {
  if (tops.length === 0) return -1;
  if (atBottom) return tops.length - 1;
  let active = 0;
  tops.forEach((top, index) => {
    if (top <= line) active = index;
  });
  return active;
}

/**
 * Resolves an untrusted `location.hash` to one of the known section slugs
 * (BR-008). Strips the leading "#", decodes it safely (a malformed escape such
 * as "%E0%A4%A" yields null instead of throwing) and requires an exact match.
 * The result is always an element of `slugs`, never raw user input.
 */
export function matchSectionHash(hash: string, slugs: readonly string[]): string | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (raw === "") return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  return slugs.includes(decoded) ? decoded : null;
}
