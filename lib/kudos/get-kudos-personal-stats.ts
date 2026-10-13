import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { firstSunnerRow, toPersonalStats } from "./sidebar-mapping";
import type { PersonalStatsResult } from "./sidebar-types";

/**
 * The viewer's D.1 numbers (F009 A1: FR-201..205, FR-209).
 *
 * - guest -> `{status:"guest"}` with no query (the region shows the login prompt);
 * - signed in but no Sunner row, or any read fails -> `{status:"unavailable"}` (every value "—");
 * - otherwise the five counts. Identity comes only from the verified session.
 *
 * Never throws. Request-time only: call inside `<Suspense>`.
 */
export async function getKudosPersonalStats(): Promise<PersonalStatsResult> {
  // Outside the try: Next's prerender bail-out must never be swallowed.
  await connection();

  try {
    const user = await getCurrentUser();
    if (!user) return { status: "guest" };

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_my_sunner");
    if (error) return unavailable(`get_my_sunner failed: ${error.code || "?"} ${error.message}`);
    const sunner = firstSunnerRow(data);
    if (!sunner) return unavailable("no Sunner row for the signed-in user");

    // Owner-only boxes are visible through the user's own session (secret_boxes_select_own).
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
