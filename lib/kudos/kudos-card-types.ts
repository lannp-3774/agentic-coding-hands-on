// Shared view-model contracts for the Sun* Kudos board (F006-F009). One type
// per concept, imported with `import type` by server loaders, the API route
// and the client lists. Pure types: no runtime, no `next/*`, no Supabase.

/** Hero rank by kudos received (F006 BR-003). */
export type HeroTier = "new" | "rising" | "super" | "legend";

/** Stars shown next to the rank label; 0 stars has no tooltip. */
export type HeroStars = 0 | 1 | 2 | 3;

/** Sender or receiver block on a card. */
export type KudosPerson = {
  id: string;
  name: string;
  /** Department code only (e.g. "CEVC10"); null hides the line. */
  department: string | null;
  /** Already passed through `safeAvatarUrl`; null renders the initial. */
  avatarUrl: string | null;
  tier: HeroTier;
  stars: HeroStars;
};

export type KudosHashtag = { slug: string; label: string };

/** One kudos card as rendered by Highlight and All Kudos. */
export type KudosCard = {
  id: string;
  /** Cursor key of the feed (`kudos.seq`, bigint serialised as a string). */
  seq: string;
  title: string | null;
  /** Slug of the hashtag whose label equals `title`; null = plain text. */
  titleTagSlug: string | null;
  body: string;
  /** `HH:mm - MM/DD/YYYY` in Asia/Ho_Chi_Minh, built server-side (BR-008). */
  timeLabel: string;
  likeCount: number;
  likedByMe: boolean;
  isSender: boolean;
  sender: KudosPerson;
  receiver: KudosPerson;
  hashtags: KudosHashtag[];
  /** Local gallery paths only (`isAllowedImagePath`), at most CARD_IMAGES_MAX. */
  images: string[];
};

/** Viewer-dependent hrefs for one card (guests are routed to `/login`). */
export type KudosCardLinks = {
  detailHref: string;
  senderHref: string;
  receiverHref: string;
  /** Null when the title is not a clickable tag. */
  titleHref: string | null;
  hashtagHrefs: string[];
};

/** Active filters from the URL; null = "Tất cả". */
export type KudosFilters = {
  hashtag: string | null;
  department: string | null;
};

export type KudosFilterOptions = {
  hashtags: KudosHashtag[];
  departments: string[];
};

export type KudosPage = {
  items: KudosCard[];
  /** `seq` of the last item when another page exists, else null. */
  nextCursor: string | null;
};

/** Loader result: readers never throw, they report `error`. */
export type KudosRead<T> = { status: "ok"; data: T } | { status: "error" };
