import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { KudosFilters, KudosPage, KudosRead } from "./kudos-card-types";
import { kudosCardColumns } from "./kudos-card-columns";
import { toKudosPage } from "./kudos-card-mapping";
import { KUDOS_PAGE_SIZE } from "./kudos-constants";
import { applyKudosFilters, KUDOS_CURSOR_PATTERN } from "./kudos-filters";
import { getHashtagRowsPerRequest } from "./get-hashtag-rows-per-request";

/** How one filtered kudos read is ordered and cut. */
export type KudosReadShape = {
  order: "hearts" | "newest";
  /** `seq` to read below (exclusive), or null for the top. */
  cursor: string | null;
  limit: number;
};

const errorMessage = (cause: unknown) => (cause instanceof Error ? cause.message : String(cause));

/**
 * One filtered kudos query plus the hashtag lookup (title tags), mapped by
 * `map` (F006 ALG-001, INT-001). Shared by Highlight and All Kudos so both
 * read the same columns through the same filter applier (BR-006).
 *
 * Reads with the request's server client: role `anon` for guests,
 * `authenticated` with a session (the `my_like` embed then holds the viewer's
 * own like). Never throws: a failed query or a throw is logged once with
 * `[kudos]` and returns `{status: "error"}`. A failed hashtag lookup only
 * turns title tags into plain text. The hashtag list is read once per page
 * render (`getHashtagRowsPerRequest`), shared with the other loaders.
 * Request-time only (inside `<Suspense>`).
 */
export async function readKudos<T>(
  filters: KudosFilters,
  shape: KudosReadShape,
  map: (rows: unknown, hashtagRows: unknown) => T,
): Promise<KudosRead<T>> {
  // Outside the try: Next's prerender bail-out must never be swallowed.
  await connection();

  try {
    const supabase = await createClient();
    const base = supabase.from("kudos").select(kudosCardColumns(filters));
    let query = applyKudosFilters(base, filters);
    if (shape.cursor !== null) query = query.lt("seq", shape.cursor);
    if (shape.order === "hearts") query = query.order("like_count", { ascending: false });
    query = query.order("seq", { ascending: false }).limit(shape.limit);

    const [kudos, hashtags] = await Promise.all([query, getHashtagRowsPerRequest()]);
    if (kudos.error) {
      console.error(`[kudos] query failed: ${kudos.error.code || "?"} ${kudos.error.message}`);
      return { status: "error" };
    }
    if (hashtags.status === "error") console.error(`[kudos] hashtag lookup failed: ${hashtags.reason}`);
    return { status: "ok", data: map(kudos.data, hashtags.status === "ok" ? hashtags.rows : []) };
  } catch (cause) {
    unstable_rethrow(cause);
    console.error(`[kudos] query threw: ${errorMessage(cause)}`);
    return { status: "error" };
  }
}

/**
 * One All Kudos page, newest first (F006 A4 page 1 with `cursor = null`, A5
 * page 2+): `seq < cursor`, `KUDOS_PAGE_SIZE + 1` rows to learn whether another
 * page exists (BR-005). `nextCursor` is the last item's `seq` or null.
 * A malformed cursor is refused here too (the route checks it first).
 */
export async function getKudosPage(
  filters: KudosFilters,
  cursor: string | null,
): Promise<KudosRead<KudosPage>> {
  if (cursor !== null && !KUDOS_CURSOR_PATTERN.test(cursor)) {
    console.error("[kudos] refused a malformed cursor");
    return { status: "error" };
  }
  return readKudos(filters, { order: "newest", cursor, limit: KUDOS_PAGE_SIZE + 1 }, (rows, hashtagRows) =>
    toKudosPage(rows, hashtagRows, KUDOS_PAGE_SIZE),
  );
}
