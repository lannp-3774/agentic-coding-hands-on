"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type RefObject } from "react";
import type { AwardsNavItem } from "@/app/_components/awards-information/awards-information-types";
import { matchSectionHash, pickActiveSectionIndex } from "@/lib/ui/section-scroll-spy";
import { isAtPageBottom, measureReadingLine, prefersReducedMotion, revealNavItem } from "./awards-nav-scroll-dom";

// A click or deep-link scroll pins its item (DEC-004) until the page settles:
// `scrollend`, or this long without a `scroll` event (no `scrollend` support,
// or the page was already in place so nothing scrolled at all).
const SCROLL_IDLE_MS = 150;
// Input meaning the reader took over the scroll: drop the pin at once.
const TAKEOVER_EVENTS = ["wheel", "touchstart", "keydown"] as const;

type ScrollPin = { hold: () => void; release: () => void; isHeld: () => boolean };

function createScrollPin(): ScrollPin {
  let held = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const release = () => {
    held = false;
    clearTimeout(timer);
  };
  return {
    // Pin (or stay pinned) and restart the idle countdown.
    hold: () => {
      held = true;
      clearTimeout(timer);
      timer = setTimeout(release, SCROLL_IDLE_MS);
    },
    release,
    isHeld: () => held,
  };
}

// Modified or non-primary clicks keep the browser's own link handling (DEC-003).
function isPlainPrimaryClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export type AwardsNavActiveSlug = {
  activeSlug: string;
  navRef: RefObject<HTMLElement | null>;
  onItemClick: (slug: string, event: MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * Single writer of the active award (BR-007): nav click (A3), manual scroll
 * (A4, ALG-001) and `#slug` deep links / `hashchange` (BR-008) all end in one
 * `setSelected`. Sections are found by `document.getElementById(slug)` only.
 */
export function useAwardsNavActiveSlug(items: readonly AwardsNavItem[]): AwardsNavActiveSlug {
  // Effects key on the slugs' content, not the array identity, so a server
  // re-render with equal data (language switch) does not replay the deep link.
  const slugKey = items.map((item) => item.slug).join("\n");
  const slugs = useMemo(() => (slugKey === "" ? [] : slugKey.split("\n")), [slugKey]);
  const [selected, setSelected] = useState(() => slugs[0] ?? "");
  // Exactly one active item, even if the list changes under the selection.
  const activeSlug = slugs.includes(selected) ? selected : (slugs[0] ?? "");
  const navRef = useRef<HTMLElement>(null);
  const [pin] = useState(createScrollPin);

  // Click and deep link share one path: activate, pin, then scroll.
  const goTo = useCallback(
    (slug: string, target: HTMLElement, behavior: ScrollBehavior) => {
      setSelected(slug);
      pin.hold();
      target.scrollIntoView({ behavior, block: "start" });
    },
    [pin],
  );

  const onItemClick = useCallback(
    (slug: string, event: MouseEvent<HTMLAnchorElement>) => {
      if (!isPlainPrimaryClick(event)) return;
      const target = document.getElementById(slug);
      if (!target) return; // block missing: let the plain #slug link run
      event.preventDefault();
      goTo(slug, target, prefersReducedMotion() ? "instant" : "smooth");
      try {
        // Shareable URL, no history entry per click, and no `hashchange`.
        window.history.replaceState(null, "", `#${encodeURIComponent(slug)}`);
      } catch {
        // Browsers throttle history writes (SecurityError); the URL is a nicety.
      }
    },
    [goTo],
  );

  useEffect(() => {
    if (slugs.length === 0) return;
    let frame = 0;

    // The hash is untrusted: only a known slug is ever looked up (BR-008).
    const applyHash = (): boolean => {
      const slug = matchSectionHash(window.location.hash, slugs);
      const target = slug === null ? null : document.getElementById(slug);
      if (slug === null || target === null) return false;
      goTo(slug, target, "instant");
      return true;
    };

    const syncFromScroll = () => {
      frame = 0;
      if (pin.isHeld()) return;
      const sections = slugs.flatMap((slug) => {
        const element = document.getElementById(slug);
        return element ? [{ slug, element }] : [];
      });
      if (sections.length === 0) return;
      const index = pickActiveSectionIndex({
        tops: sections.map(({ element }) => element.getBoundingClientRect().top),
        line: measureReadingLine(navRef.current, sections[0].element),
        atBottom: isAtPageBottom(),
      });
      setSelected(sections[index].slug);
    };

    const onScroll = () => {
      if (pin.isHeld()) pin.hold();
      else if (frame === 0) frame = requestAnimationFrame(syncFromScroll);
    };
    const onHashChange = () => {
      applyHash();
    };
    const release = () => pin.release();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", release);
    window.addEventListener("hashchange", onHashChange);
    for (const type of TAKEOVER_EVENTS) window.addEventListener(type, release, { passive: true });
    // First pass after paint: honour a `#slug` deep link, else match the position.
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!applyHash()) syncFromScroll();
    });

    return () => {
      cancelAnimationFrame(frame);
      pin.release();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", release);
      window.removeEventListener("hashchange", onHashChange);
      for (const type of TAKEOVER_EVENTS) window.removeEventListener(type, release);
    };
  }, [slugs, goTo, pin]);

  useEffect(() => {
    revealNavItem(navRef.current, activeSlug, prefersReducedMotion() ? "instant" : "smooth");
  }, [activeSlug]);

  return { activeSlug, navRef, onItemClick };
}
