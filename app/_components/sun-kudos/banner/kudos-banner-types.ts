import type { ReactNode, Ref, KeyboardEvent } from "react";

// Props of the stateless /sun-kudos banner views. Every string comes from the
// caller (copy in lib/i18n/sun-kudos-copy.ts); nothing here imports runtime
// code from lib/**.

export type KudosBannerProps = {
  /** Banner title (Figma 2940:13439). */
  title: string;
};

export type KudosSendBarProps = {
  /** Hint inside the send pill (Figma A.1, 2940:13449). */
  placeholder: string;
  /** Label of the "search Sunner profile" pill (Figma 2940:13450). */
  searchProfileLabel: string;
  /**
   * Replaces the inert send pill (A.1). A client launcher passes a
   * `KudosSendButton` with `onClick` so the banner itself stays a server component.
   */
  sendButton?: ReactNode;
};

export type KudosSectionHeadingProps = {
  /** Small line above the rule, e.g. "Sun* Annual Awards 2025". */
  eyebrow: string;
  /** Big yellow title, e.g. "HIGHLIGHT KUDOS". */
  title: string;
  /** Heading level of the title. */
  as?: "h2" | "h3";
  /** id on the heading so the surrounding <section> can aria-labelledby it. */
  id?: string;
  /** Right-hand slot on the title row (e.g. the filter buttons). */
  actions?: ReactNode;
};

export type KudosFilterId = "hashtag" | "department";

export type KudosFilterOption = {
  /** Filter value; `null` is the "Tất cả" (no filter) option. */
  value: string | null;
  label: string;
  /** Target URL with this option applied (built by the filter bar container). */
  href: string;
};

export type KudosFilterView = {
  id: KudosFilterId;
  /** Resting button text, e.g. "Hashtag" / "Phòng ban". */
  buttonLabel: string;
  /** `value` of the active option, or null when the filter is not applied. */
  selectedValue: string | null;
  /** First entry is "Tất cả" (`value: null`). */
  options: KudosFilterOption[];
  expanded: boolean;
};

export type KudosFilterBarViewProps = {
  filters: KudosFilterView[];
  onToggle: (id: KudosFilterId) => void;
  /** Called when an option is chosen so the owner can close the list. */
  onClose: () => void;
  /** Wire to useMenuDisclosure().triggerRef so Esc can return focus. */
  triggerRefs?: Partial<Record<KudosFilterId, Ref<HTMLButtonElement>>>;
  /** Wire to useMenuDisclosure().menuRef so outside-click detection sees the list. */
  menuRefs?: Partial<Record<KudosFilterId, Ref<HTMLDivElement>>>;
  /** Wire to useMenuDisclosure().onMenuKeyDown (Esc closes the list). */
  onMenuKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
};
