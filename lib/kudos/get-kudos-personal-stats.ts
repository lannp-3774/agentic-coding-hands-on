import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMySunnerPerRequest } from "./get-my-sunner-per-request";
import { firstSunnerRow, toPersonalStats } from "./sidebar-mapping";
import type { PersonalStatsResult } from "./sidebar-types";

/**
 * The viewer's D.1 numbers (F009 A1: FR-201..205, FR-209).
 *
 * - guest -> `{status:"guest"}` with no query (the region shows the login prompt);
 * - signed in but no Sunner row, or any read fails -> `{status:"unavailable"}` (every value "—");
 * - otherwise the five counts. Identity comes only from the verified session,
 *   through the per-render `get_my_sunner()` read shared with the page shell.
 *
 * Never throws. Request-time only: call inside `<Suspense>`.
 */
export async function getKudosPersonalStats(): Promise<PersonalStatsResult> {
  // Outside the try: Next's prerender bail-out must never be swallowed.
  await connection();

  const me = await getMySunnerPerRequest();
  if (me.status === "guest") return { status: "guest" };
  if (me.status === "error") return unavailable(me.reason);

  try {
    const sunner = firstSunnerRow(me.data);
    if (!sunner) return unavailable("no Sunner row for the signed-in user");

    // Owner-only boxes are visible through the user's own session (secret_boxes_select_own).
    const supabase = await createClient();
    const count = { count: "exact", head: true } as const;
    const [sent, opened, unopened] = await Promise.all([
      supabase.from("kudos").select("id", count).eq("sender_id", sunner.id),
      supabase.from("secret_boxes").select("id", count).eq("owner_id", sunner.id).not("opened_at", "is", null),
      supabase.from("secret_boxes").select("id", count).eq("owner_id", sunner.id).is("opened_at", null),
    ]);
    const failed = [sent, opened, unopened].find((r) => r.error);
    if (failed?.error) return unavailable(`count failed: ${failed.error.code || "?"} ${failed.error.message}`);
    if (sent.count === null || opened.count === null || unopened.count === null) {
      return unavailable("count missing from response");
    }

    return { status: "ok", stats: toPersonalStats(sunner, sent.count, opened.count, unopened.count) };
  } catch (cause) {
    unstable_rethrow(cause);
    return unavailable(`threw: ${cause instanceof Error ? cause.message : String(cause)}`);
  }
}

function unavailable(reason: string): PersonalStatsResult {
  console.error(`[kudos-sidebar] personal stats ${reason}`);
  return { status: "unavailable" };
}
