"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import type { SunKudosCopy } from "@/lib/i18n/sun-kudos-copy-types";
import type { KudosFilterOptions, KudosFilters } from "@/lib/kudos/kudos-card-types";
import { buildFilterHref } from "@/lib/kudos/kudos-filters";
import { useKudosFilterNavigation } from "@/lib/kudos/use-kudos-filters";
import { useMenuDisclosure } from "@/lib/ui/use-menu-disclosure";
import type { KudosFilterId, KudosFilterOption } from "../sun-kudos/banner/kudos-banner-types";
import { KudosFilterBarView } from "../sun-kudos/banner/kudos-filter-bar-view";

type KudosFilterBarProps = {
  /** Filters of the current URL (already parsed on the server). */
  filters: KudosFilters;
  /** Empty lists when the read failed: each list then offers only "Tất cả" (FR-301). */
  options: KudosFilterOptions;
  copy: SunKudosCopy["filters"];
};

/** "Tất cả" (clears this key, keeps the other) followed by one option per value. */
function toOptions(
  filters: KudosFilters,
  id: KudosFilterId,
  allLabel: string,
  values: { value: string; label: string }[],
): KudosFilterOption[] {
  return [{ value: null, label: allLabel }, ...values].map(({ value, label }) => ({
    value,
    label,
    href: buildFilterHref(filters, { [id]: value }),
  }));
}

/** A plain left click (no modifier), so "open in new tab" keeps the browser default. */
function isPlainClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/**
 * Hashtag / Phòng ban filters of the Highlight header (F006 A7, A8, FR-301..303,
 * DEC-005). Each list is a disclosure (outside click, focus leaving or Esc closes;
 * Esc returns focus to its button); opening one closes the other through the
 * outside-click rule. Choosing an option replaces the URL inside a transition
 * (`useKudosFilterNavigation`); the server then re-renders both blocks.
 */
export function KudosFilterBar({ filters, options, copy }: KudosFilterBarProps) {
  const menus = { hashtag: useMenuDisclosure(), department: useMenuDisclosure() };
  const { pending, navigate } = useKudosFilterNavigation();
  const openMenu = menus.hashtag.open ? menus.hashtag : menus.department.open ? menus.department : null;

  const hashtagValues = options.hashtags.map((tag) => ({ value: tag.slug, label: tag.label }));
  // Department labels are the code only (clarifications, technical default 3).
  const departmentValues = options.departments.map((code) => ({ value: code, label: code }));

  // The option links are rendered by the view; route a plain click through the
  // filter navigation instead of the link's own navigation (Link skips a
  // default-prevented click). The link's onClick still runs and closes the list.
  function handleOptionClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!isPlainClick(event) || !(event.target instanceof Element)) return;
    const href = event.target.closest('a[role="option"]')?.getAttribute("href");
    if (!href) return;
    event.preventDefault();
    navigate(href);
  }

  return (
    <div onClickCapture={handleOptionClickCapture} aria-busy={pending}>
      <KudosFilterBarView
        filters={[
          {
            id: "hashtag",
            buttonLabel: copy.hashtag,
            selectedValue: filters.hashtag,
            options: toOptions(filters, "hashtag", copy.all, hashtagValues),
            expanded: menus.hashtag.open,
          },
          {
            id: "department",
            buttonLabel: copy.department,
            selectedValue: filters.department,
            options: toOptions(filters, "department", copy.all, departmentValues),
            expanded: menus.department.open,
          },
        ]}
        onToggle={(id) => menus[id].toggle()}
        onClose={() => openMenu?.toggle()}
        triggerRefs={{ hashtag: menus.hashtag.triggerRef, department: menus.department.triggerRef }}
        menuRefs={{ hashtag: menus.hashtag.menuRef, department: menus.department.menuRef }}
        onMenuKeyDown={(event: KeyboardEvent<HTMLElement>) => openMenu?.onMenuKeyDown(event)}
      />
    </div>
  );
}
