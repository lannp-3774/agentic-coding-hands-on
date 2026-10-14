import type { KudosFilters } from "./kudos-card-types";

// PostgREST column lists for the Sun* Kudos read layer (F006 ALG-001, INT-001).
// Every list is explicit: `sunners` is granted by column without `email` and
// `user_id`, so `select=*` would be refused, and nothing private is ever asked
// for. Pure strings, safe to import anywhere.

const PERSON_COLUMNS = "id,full_name,department_code,avatar_url,kudos_received_count";

/**
 * One kudos card with its embeds. `seq` is cast to text so the bigint cursor
 * stays exact end to end (JSON numbers lose precision past 2^53). The
 * receiver embed is `!inner` so the department filter narrows the kudos rows;
 * `receiver_id` is NOT NULL, so it never drops a row on its own. `my_like`
 * holds the viewer's own like only (RLS: owner rows; guests get `[]`).
 * The sender comes through `public_sender_id` (F010): `sender_id` is not
 * client-readable, and for an anonymous kudos the column is NULL, so the
 * `sender` embed is null; `is_anonymous` / `anonymous_name` drive the alias.
 */
export const KUDOS_CARD_COLUMNS =
  "id,seq:seq::text,title,body,like_count,created_at,is_anonymous,anonymous_name," +
  `sender:sunners!public_sender_id(${PERSON_COLUMNS}),` +
  `receiver:sunners!receiver_id!inner(${PERSON_COLUMNS}),` +
  "hashtags:kudos_hashtags(hashtag:hashtags(slug,label,sort_order))," +
  "images:kudos_images(image_path,sort_order)," +
  "my_like:kudos_likes(kudos_id)";

/**
 * Second, aliased hashtag embed used only to filter. Filtering on it narrows
 * the kudos rows while the display embed `hashtags` keeps every tag of the
 * card (proven against the local DB, spec §5.3 Q1). Added only while a
 * hashtag filter is active: as an `!inner` join it would otherwise drop
 * kudos that have no hashtag at all.
 */
const HASHTAG_FILTER_EMBED = "filter_tag:kudos_hashtags!inner(hashtag_slug)";

/** Embedded columns the filters compare against (see `applyKudosFilters`). */
export const KUDOS_FILTER_COLUMNS = {
  department: "receiver.department_code",
  hashtag: "filter_tag.hashtag_slug",
} as const;

/** Card columns for a query under `filters`. */
export function kudosCardColumns(filters: KudosFilters): string {
  return filters.hashtag ? `${KUDOS_CARD_COLUMNS},${HASHTAG_FILTER_EMBED}` : KUDOS_CARD_COLUMNS;
}

/** `public.hashtags`: filter list and the title-tag lookup (ALG-002). */
export const HASHTAG_COLUMNS = "slug,label,sort_order";

/** `public.departments`: labels show the code only (clarifications). */
export const DEPARTMENT_COLUMNS = "code";
