import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import type { Locale } from "@/lib/i18n/locales";
import { createClient } from "@/lib/supabase/server";
import { AWARD_COLUMNS, isAwardRow, toAwardCards, type AwardCard } from "./award-card-mapping";

/**
 * Award cards for the homepage grid, in `sort_order` (F002 A3, INT-001,
 * DEC-003). Reads `public.awards` with the request's server client (role
 * `anon` for guests, `authenticated` with a session; RLS allows public read).
 *
 * Never throws: a failed query is logged once with `[awards]` and returns
 * `[]`, because an empty table and an unreadable one render the same message.
 *
 * Request-time only (call inside `<Suspense>`): the Supabase client may read
 * the clock for a session, which cacheComponents rejects during prerendering.
 */
export async function getAwards(locale: Locale): Promise<AwardCard[]> {
  // Outside the try: Next's prerender bail-out must never be swallowed.
  await connection();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("awards")
      .select(AWARD_COLUMNS)
      .order("sort_order", { ascending: true });
    if (error) {
      console.error(`[awards] query failed: ${error.code || "?"} ${error.message}`);
      return [];
    }

    const rows: unknown[] = data ?? [];
    const valid = rows.filter(isAwardRow);
    if (valid.length !== rows.length) {
      console.error(`[awards] skipped ${rows.length - valid.length} malformed row(s)`);
    }
    return toAwardCards(valid, locale);
  } catch (cause) {
    unstable_rethrow(cause);
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error(`[awards] query threw: ${message}`);
    return [];
  }
}
