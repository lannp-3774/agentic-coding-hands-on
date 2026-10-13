import type { ReactNode, Ref } from "react";
import type { SunKudosCopy } from "@/lib/i18n/sun-kudos-copy-types";

// Prop contracts of the Sun* Kudos board frames (F006 phase 04). Every string
// arrives through props (copy lives in `lib/i18n`); the frames hold no state.

/** Page grid: slots filled by the page composer (phase 17). */
export type SunKudosBoardLayoutProps = {
  /** Key visual + title + send bar, rendered full-bleed above the board. */
  banner: ReactNode;
  /** Heading, filter bar and carousel of the Highlight block. */
  highlight: ReactNode;
  /** Spotlight block (own heading), a fixed-size placeholder until phase 15. */
  spotlight: ReactNode;
  /** All Kudos list column (left on desktop). */
  feed: ReactNode;
  /** Right sidebar column (below the feed under desktop width). */
  sidebar: ReactNode;
  /** Optional All Kudos heading, laid out full width above the two columns (Figma C.1). */
  feedHeader?: ReactNode;
  /** `id` of the heading that names the All Kudos region; when set, the block becomes a labelled `<section>`. */
  feedLabelledBy?: string;
};

export type HighlightCarouselLabels = Pick<SunKudosCopy["highlight"], "prev" | "next" | "slideOf">;

/** Stateless carousel: the wrapper owns `index` and the callbacks (phase 09 hook). */
export type HighlightCarouselViewProps = {
  /** One server-rendered card per slide (phase 03 card, offset 0 is interactive). */
  slides: ReactNode[];
  /** Zero-based index of the focused slide. */
  index: number;
  onPrev: () => void;
  onNext: () => void;
  labels: HighlightCarouselLabels;
  /**
   * Accessible name of the carousel region. Must differ from the section heading
   * text: two regions with the same name break role-based lookups.
   */
  label?: string;
};

export type KudosFeedStatus = "idle" | "loading" | "error" | "done";

export type KudosFeedViewProps = {
  /** Loaded cards, newest first. */
  children: ReactNode;
  status: KudosFeedStatus;
  /** Attached to the always-mounted element below the list; the observer watches it. */
  sentinelRef: Ref<HTMLDivElement>;
  onRetry: () => void;
  labels: Pick<SunKudosCopy["feed"], "loadMoreError" | "retry">;
};

export type KudosEmptyStateProps = { message: string };

export type KudosToastTone = "success" | "error";

export type KudosToastViewProps = {
  tone: KudosToastTone;
  message: string;
  visible: boolean;
};
