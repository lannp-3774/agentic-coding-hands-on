import type { HeroTier } from "@/lib/kudos/kudos-card-types";

// Shape of the Sun* Kudos board (/sun-kudos) copy, one value per locale in
// `sun-kudos-copy.ts`. Strings only (templates, no functions) so the object
// crosses the server/client boundary. Templates use `{n}`, `{total}` and
// `{gift}` placeholders, filled by the view. Only UI labels are translated;
// kudos content stays as written (F002 rule).

export type SunKudosCopy = {
  banner: { title: string; sendPlaceholder: string; searchProfile: string };
  eyebrow: string;
  highlight: {
    title: string;
    prev: string;
    next: string;
    /** "{n}/{total}" slide counter. */
    slideOf: string;
    /** Carousel region name; must differ from `title` (one region per name). */
    carouselLabel: string;
  };
  filters: { hashtag: string; department: string; all: string };
  card: {
    copyLink: string;
    viewDetail: string;
    heart: string;
    heroLabels: Record<HeroTier, string>;
    /** Tooltip for 1, 2 and 3 stars (0 stars has none). */
    starTooltips: [string, string, string];
  };
  feed: { title: string; empty: string; loadMoreError: string; retry: string };
  toast: { copied: string; copyFailed: string; heartFailed: string };
  spotlight: {
    title: string;
    /** Suffix after the total, e.g. "{total} KUDOS". */
    kudosSuffix: string;
    searchPlaceholder: string;
    searchRequired: string;
    searchTooLong: string;
    noMatch: string;
    /** "{n}" matching names. */
    matchCount: string;
    panZoom: string;
    /** Ticker sentence after the name, "đã nhận được một Kudos mới". */
    tickerSuffix: string;
  };
  sidebar: {
    received: string;
    sent: string;
    hearts: string;
    boxesOpened: string;
    boxesUnopened: string;
    openBox: string;
    loginPrompt: string;
    loginButton: string;
    giftTitle: string;
    /** "Nhận được 1 {gift}". */
    giftLine: string;
    empty: string;
  };
};
