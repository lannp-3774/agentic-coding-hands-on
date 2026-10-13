"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";

export type KudosFilterNavigation = {
  /** True while the server renders the page for the new filters. */
  pending: boolean;
  navigate: (href: string) => void;
};

/** Same-origin path only: `router.replace` must never get an untrusted URL. */
function isInternalPath(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//") && !href.includes("\\");
}

/**
 * Applies a filter by replacing the URL (F006 A8, FR-302..FR-305, DEC-005).
 * Filters live in the URL's searchParams; the server re-renders Highlight and
 * All Kudos, and the page remounts them via `key`. `replace` keeps Back from
 * stepping through every filter change, `scroll: false` keeps the position.
 */
export function useKudosFilterNavigation(): KudosFilterNavigation {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const navigate = useCallback(
    (href: string) => {
      if (!isInternalPath(href)) return;
      startTransition(() => router.replace(href, { scroll: false }));
    },
    [router],
  );

  return { pending, navigate };
}
