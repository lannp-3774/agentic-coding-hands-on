import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { HASHTAG_COLUMNS } from "./kudos-card-columns";

/** Raw `public.hashtags` rows (callers run their own guards), or why the read failed. */
export type HashtagRowsRead = { status: "ok"; rows: unknown } | { status: "error"; reason: string };

/**
 * The fixed hashtag list (`HASHTAG_COLUMNS`) in filter-list order (`sort_order`,
 * then `slug`), read once per request: Highlight, All Kudos page 1 and the
 * filter bar share one query instead of three (review M4).
 *
 * React `cache` memoizes within one server render pass only, so nothing is
 * shared across requests; Server Actions and Route Handlers are not a render
 * pass, so there (`GET /api/kudos`) every call still runs its own query
 * (Next docs: guides/authentication, "Good to know" on `cache`). Public data,
 * no arguments. Callers must not mutate `rows`.
 *
 * Never throws (Next's own control-flow errors excepted): a failure comes back
 * as `{status:"error"}` for each caller to log and handle its own way.
 * Request-time only (call inside `<Suspense>`).
 */
export const getHashtagRowsPerRequest = cache(async (): Promise<HashtagRowsRead> => {
  // Outside the try: Next's prerender bail-out must never be swallowed.
  await connection();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("hashtags")
      .select(HASHTAG_COLUMNS)
      .order("sort_order", { ascending: true })
      .order("slug", { ascending: true });
    if (error) return { status: "error", reason: `${error.code || "?"} ${error.message}` };
    return { status: "ok", rows: data };
  } catch (cause) {
    unstable_rethrow(cause);
    return { status: "error", reason: `threw: ${cause instanceof Error ? cause.message : String(cause)}` };
  }
});
