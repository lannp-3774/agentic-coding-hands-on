import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import type { Locale } from "@/lib/i18n/locales";
import { createClient } from "@/lib/supabase/server";
import {
  AWARD_DETAIL_COLUMNS,
  isAwardDetailRow,
  toAwardDetails,
  type AwardDetail,
} from "./award-detail-mapping";

/**
 * Award blocks for the Awards Information page, in `sort_order` (F004 INT-001,
 * DEC-001). One query on `public.awards` with the embedded `award_prizes`,
 * read with the request's server client (RLS allows public read).
 *
 * Never throws: a failed query is logged once with `[awards-information]` and
 * returns `[]`, because an empty table and an unreadable one render the same
 * message. Malformed rows are dropped with a count log.
 *
 * Request-time only (call inside `<Suspense>`): the Supabase client may read
 * the clock for a session, which cacheComponents rejects during prerendering.
 */
export async function getAwardDetails(locale: Locale): Promise<AwardDetail[]> {
  // Outside the try: Next's prerender bail-out must never be swallowed.
  await connection();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("awards")
      .select(AWARD_DETAIL_COLUMNS)
      .order("sort_order", { ascending: true });
    if (error) {
      console.error(`[awards-information] query failed: ${error.code || "?"} ${error.message}`);
      return [];
    }

    const rows: unknown[] = data ?? [];
    const valid = rows.filter(isAwardDetailRow);
    if (valid.length !== rows.length) {
      console.error(`[awards-information] skipped ${rows.length - valid.length} malformed row(s)`);
    }
    return toAwardDetails(valid, locale);
  } catch (cause) {
    unstable_rethrow(cause);
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error(`[awards-information] query threw: ${message}`);
    return [];
  }
}
