import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SPOTLIGHT_MAX_NODES } from "./kudos-constants";
import {
  EMPTY_SPOTLIGHT_SOURCE,
  SPOTLIGHT_COLUMNS,
  isSpotlightRow,
  toSpotlightNodes,
  toTickerLines,
  type SpotlightSource,
} from "./spotlight-mapping";

/**
 * Spotlight data (F008 A2, INT-001): the newest `SPOTLIGHT_MAX_NODES` kudos with
 * their receiver, plus the exact count of all kudos (BR-004). Public read with the
 * request's server client; the board ignores the page filters (D001).
 *
 * Nodes come back unpositioned: the section lays them out and picks each `href`.
 * Never throws: a failed query is logged once with `[spotlight]` and returns an
 * empty source, which the view shows as the empty state.
 *
 * Request-time only (call inside `<Suspense>`): the Supabase client may read the
 * clock for a session, which cacheComponents rejects during prerendering.
 */
export async function getSpotlightData(): Promise<SpotlightSource> {
  // Outside the try: Next's prerender bail-out must never be swallowed.
  await connection();

  try {
    const supabase = await createClient();
    const [list, count] = await Promise.all([
      supabase
        .from("kudos")
        .select(SPOTLIGHT_COLUMNS)
        .order("seq", { ascending: false })
        .limit(SPOTLIGHT_MAX_NODES),
      supabase.from("kudos").select("id", { count: "exact", head: true }),
    ]);
    const failure = list.error ?? count.error;
    if (failure) {
      console.error(`[spotlight] query failed: ${failure.code || "?"} ${failure.message}`);
      return EMPTY_SPOTLIGHT_SOURCE;
    }

    const rows: unknown[] = list.data ?? [];
    const valid = rows.filter(isSpotlightRow);
    if (valid.length !== rows.length) {
      console.error(`[spotlight] skipped ${rows.length - valid.length} malformed row(s)`);
    }
    return {
      total: count.count ?? valid.length,
      nodes: toSpotlightNodes(valid),
      ticker: toTickerLines(valid),
    };
  } catch (cause) {
    unstable_rethrow(cause);
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error(`[spotlight] query threw: ${message}`);
    return EMPTY_SPOTLIGHT_SOURCE;
  }
}
