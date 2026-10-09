"use client";

import { AwardsNavView } from "@/app/_components/awards-information/awards-nav-view";
import type { AwardsNavItem } from "@/app/_components/awards-information/awards-information-types";
import { useAwardsNavActiveSlug } from "./use-awards-nav-active-slug";

export type AwardsNavProps = {
  ariaLabel: string;
  // Award slugs (= section ids rendered by AwardBlock) with their short labels, in page order.
  items: AwardsNavItem[];
};

/**
 * Award categories nav (F004 A3, A4). Owns the active item: click smooth-scrolls
 * (instant under reduced motion), manual scrolling follows the blocks, and a
 * `#slug` deep link or hash change activates that award. The markup is Track A's
 * controlled AwardsNavView. Renders nothing for an empty list (no empty landmark).
 */
export function AwardsNav({ ariaLabel, items }: AwardsNavProps) {
  const { activeSlug, navRef, onItemClick } = useAwardsNavActiveSlug(items);
  if (items.length === 0) return null;

  return (
    <AwardsNavView
      ariaLabel={ariaLabel}
      items={items}
      activeSlug={activeSlug}
      navRef={navRef}
      onItemClick={onItemClick}
    />
  );
}
