"use client";

import { useCallback, useState } from "react";

export type HighlightCarousel = {
  /** Index of the visible card, always within 0..total-1 (0 when empty). */
  index: number;
  canPrev: boolean;
  canNext: boolean;
  prev: () => void;
  next: () => void;
};

/** Keeps `index` inside 0..total-1; an empty list pins to 0. */
function clampIndex(index: number, total: number): number {
  return Math.min(Math.max(index, 0), Math.max(total - 1, 0));
}

/**
 * Current-card state of the Highlight carousel (F006 A3, FR-206, DEC-002).
 * The arrows stop at both ends and are both disabled for 0 or 1 cards. The
 * returned index is clamped on every read, so a shrinking `total` can never
 * leave it pointing past the last card.
 */
export function useHighlightCarousel(total: number): HighlightCarousel {
  const [rawIndex, setRawIndex] = useState(0);
  const index = clampIndex(rawIndex, total);

  const prev = useCallback(
    () => setRawIndex((current) => clampIndex(current - 1, total)),
    [total],
  );
  const next = useCallback(
    () => setRawIndex((current) => clampIndex(current + 1, total)),
    [total],
  );

  return { index, canPrev: index > 0, canNext: index < total - 1, prev, next };
}
