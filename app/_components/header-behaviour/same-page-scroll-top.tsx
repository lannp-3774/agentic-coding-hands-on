"use client";

import { useEffect } from "react";

/**
 * Same-page links scroll back to the top (F002 FR-103, FR-104, FR-105,
 * DEC-002). Next's <Link> keeps the scroll position when the target page is
 * already visible, so clicking the logo or "About SAA 2025" while on `/`
 * would otherwise do nothing visible.
 *
 * One delegated click listener covers header and footer without a prop
 * contract on the presentational links. It only scrolls — it never calls
 * preventDefault, so Next's own navigation still runs. The jump is instant
 * (no smooth animation), which also satisfies prefers-reduced-motion.
 * Renders nothing; mount once per page.
 */
export function SamePageScrollTop() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!isPlainPrimaryClick(event)) return;
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      if (!anchor || !isSamePageLinkWithoutHash(anchor)) return;
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}

// Modified or non-primary clicks open a new tab/window: leave this page alone.
function isPlainPrimaryClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function isSamePageLinkWithoutHash(anchor: HTMLAnchorElement): boolean {
  if (anchor.hasAttribute("download")) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  return (
    anchor.origin === window.location.origin &&
    anchor.pathname === window.location.pathname &&
    anchor.hash === ""
  );
}
