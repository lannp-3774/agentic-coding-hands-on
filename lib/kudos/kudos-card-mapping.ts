import { heroTierOf } from "./hero-tier";
import type { KudosCard, KudosHashtag, KudosPage, KudosPerson } from "./kudos-card-types";
import { CARD_IMAGES_MAX } from "./kudos-constants";
import { HASHTAG_SLUG_PATTERN } from "./kudos-filters";
import { parseKudosMarkdown } from "./kudos-markdown";
import { formatKudosTime } from "./kudos-time";
import { isAllowedImagePath, safeAvatarUrl } from "./safe-media-path";

// Pure mapping from `KUDOS_CARD_COLUMNS` rows to cards (F006 ALG-002, BR-003,
// BR-007, BR-008; F007 FR-202 `likedByMe`). Untyped PostgREST rows are checked
// by guards first; malformed rows are dropped and counted in one log line.
// F010: an anonymous row has no sender embed (public_sender_id is NULL) and maps
// to `sender: null` + `senderAlias`; the body is parsed into `bodyBlocks` here.

type PersonRow = {
  id: string;
  full_name: string;
  department_code: string | null;
  avatar_url: unknown;
  kudos_received_count: number;
};

export type HashtagRow = { slug: string; label: string; sort_order: number };
type ImageRow = { image_path: unknown; sort_order: number };

export type KudosRow = {
  id: string;
  seq: string;
  title: string | null;
  body: string;
  like_count: number;
  created_at: string;
  is_anonymous: boolean;
  anonymous_name: string | null;
  /** Null exactly when `is_anonymous` (embed through `public_sender_id`). */
  sender: PersonRow | null;
  receiver: PersonRow;
  hashtags: { hashtag: HashtagRow }[];
  images: ImageRow[];
  my_like: unknown[];
};

/** Trimmed hashtag label -> slug, for the clickable title tag (D014). */
export type SlugByLabel = ReadonlyMap<string, string>;

// Ids end up in hrefs (`/sun-kudos/<id>`, `/profiles/<id>`): uuid shape only.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SEQ_PATTERN = /^[1-9]\d*$/;

type Guard<T> = (value: unknown) => value is T;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const isString = (v: unknown): v is string => typeof v === "string";
const isNonBlank = (v: unknown): v is string => isString(v) && v.trim() !== "";
const isNullableString = (v: unknown): v is string | null => v === null || isString(v);
const isUuid = (v: unknown): v is string => isString(v) && UUID_PATTERN.test(v);
const isCount = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0;
const isSeq = (v: unknown): v is string => isString(v) && SEQ_PATTERN.test(v);

export function isHashtagRow(v: unknown): v is HashtagRow {
  return isRecord(v) && isString(v.slug) && HASHTAG_SLUG_PATTERN.test(v.slug) &&
    isNonBlank(v.label) && Number.isInteger(v.sort_order);
}

function isPersonRow(v: unknown): v is PersonRow {
  return isRecord(v) && isUuid(v.id) && isNonBlank(v.full_name) &&
    isNullableString(v.department_code) && isCount(v.kudos_received_count);
}

// The path itself is checked per image when mapping (a bad path hides that image only).
const isImageRow = (v: unknown): v is ImageRow => isRecord(v) && Number.isInteger(v.sort_order);
const isTagLink = (v: unknown): boolean => isRecord(v) && isHashtagRow(v.hashtag);

/** Runtime guard for one untyped kudos row with its embeds. */
export function isKudosRow(v: unknown): v is KudosRow {
  return isRecord(v) && isUuid(v.id) && isSeq(v.seq) && isNullableString(v.title) &&
    isString(v.body) && isCount(v.like_count) &&
    isString(v.created_at) && !Number.isNaN(Date.parse(v.created_at)) &&
    typeof v.is_anonymous === "boolean" && isNullableString(v.anonymous_name) &&
    (v.is_anonymous ? v.sender === null : isPersonRow(v.sender)) && isPersonRow(v.receiver) &&
    Array.isArray(v.hashtags) && v.hashtags.every(isTagLink) &&
    Array.isArray(v.images) && v.images.every(isImageRow) &&
    Array.isArray(v.my_like);
}

/** Keeps the rows that pass `guard` (order kept); logs how many were dropped. */
export function keepValid<T>(rows: unknown, guard: Guard<T>, what: string): T[] {
  const list: unknown[] = Array.isArray(rows) ? rows : [];
  const valid = list.filter(guard);
  if (valid.length !== list.length) {
    console.error(`[kudos] skipped ${list.length - valid.length} malformed ${what} row(s)`);
  }
  return valid;
}

export function toSlugByLabel(hashtags: readonly HashtagRow[]): SlugByLabel {
  return new Map(hashtags.map((tag) => [tag.label.trim(), tag.slug]));
}

function toPerson(row: PersonRow): KudosPerson {
  return {
    id: row.id,
    name: row.full_name,
    department: row.department_code?.trim() || null,
    avatarUrl: safeAvatarUrl(row.avatar_url),
    ...heroTierOf(row.kudos_received_count),
  };
}

/** No kudos sent by the viewer (guests, failed reads, or callers that do not ask). */
export const NONE: ReadonlySet<string> = new Set();

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order;

function toHashtags(links: KudosRow["hashtags"]): KudosHashtag[] {
  // Every tag is kept: the view shows the first CARD_HASHTAGS_MAX and "..." for the rest.
  return links
    .map((link) => link.hashtag)
    .sort((a, b) => bySortOrder(a, b) || a.slug.localeCompare(b.slug))
    .map(({ slug, label }) => ({ slug, label }));
}

function toImages(images: readonly ImageRow[]): string[] {
  return [...images]
    .sort(bySortOrder)
    .map((image) => image.image_path)
    .filter(isAllowedImagePath)
    .slice(0, CARD_IMAGES_MAX);
}

/**
 * One row to one card. `isSender` is true when the viewer sent it (`sentByMe`,
 * from `kudos_sent_by_me()`, the only source for an anonymous kudos);
 * `withViewerFlags` adds the named-sender match. `likedByMe` is true when the RLS-scoped `my_like` embed has a row.
 * An anonymous kudos has `sender: null` and `senderAlias` = the trimmed alias,
 * or null for the default copy; a named kudos always has `senderAlias: null`.
 */
export function toKudosCard(row: KudosRow, slugByLabel: SlugByLabel, sentByMe: ReadonlySet<string> = NONE): KudosCard {
  const title = row.title?.trim() ? row.title : null;
  return {
    id: row.id,
    seq: row.seq,
    title,
    titleTagSlug: title === null ? null : (slugByLabel.get(title.trim()) ?? null),
    body: row.body,
    bodyBlocks: parseKudosMarkdown(row.body),
    timeLabel: formatKudosTime(row.created_at),
    likeCount: row.like_count,
    likedByMe: row.my_like.length > 0,
    isSender: sentByMe.has(row.id),
    sender: row.sender === null ? null : toPerson(row.sender),
    senderAlias: row.is_anonymous ? row.anonymous_name?.trim() || null : null,
    receiver: toPerson(row.receiver),
    hashtags: toHashtags(row.hashtags),
    images: toImages(row.images),
  };
}

/** Untyped kudos rows + hashtag rows to cards, order kept, malformed rows dropped. */
export function toKudosCards(rows: unknown, hashtagRows: unknown, sentByMe: ReadonlySet<string> = NONE): KudosCard[] {
  const slugByLabel = toSlugByLabel(keepValid(hashtagRows, isHashtagRow, "hashtag"));
  return keepValid(rows, isKudosRow, "kudos").map((row) => toKudosCard(row, slugByLabel, sentByMe));
}

const seqOf = (row: unknown): string | null => (isRecord(row) && isSeq(row.seq) ? row.seq : null);

/**
 * BR-005 page from up to `pageSize + 1` rows in `seq desc` order: the extra
 * row only proves another page exists. The cursor is taken from the raw rows,
 * so a dropped malformed row never ends the feed early.
 */
export function toKudosPage(
  rows: unknown,
  hashtagRows: unknown,
  pageSize: number,
  sentByMe: ReadonlySet<string> = NONE,
): KudosPage {
  const list: unknown[] = Array.isArray(rows) ? rows : [];
  const pageRows = list.slice(0, pageSize);
  const items = toKudosCards(pageRows, hashtagRows, sentByMe);
  const lastSeq = seqOf(pageRows[pageRows.length - 1]) ?? items[items.length - 1]?.seq ?? null;
  return { items, nextCursor: list.length > pageSize ? lastSeq : null };
}
