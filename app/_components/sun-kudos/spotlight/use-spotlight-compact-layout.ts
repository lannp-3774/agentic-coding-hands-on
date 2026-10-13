"use client";

import { useSyncExternalStore } from "react";

// Tailwind `md`: below it the Spotlight controls leave the board (compact layout).
const COMPACT_QUERY = "(max-width: 767.98px)";

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(COMPACT_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/**
 * True below the `md` breakpoint. The server (and the hydration pass) render the md+
 * layout; a narrow client switches right after hydration. Controls exist once in the
 * tree, so only their placement changes, never how many there are.
 */
export function useSpotlightCompactLayout(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(COMPACT_QUERY).matches, () => false);
}
