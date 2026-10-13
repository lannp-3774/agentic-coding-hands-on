import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { KUDOS_GIFT_LIST_LIMIT } from "./kudos-constants";
import type { KudosRead } from "./kudos-card-types";
import { GIFT_BOX_SELECT, isGiftBoxRow, toGiftRecipients } from "./sidebar-mapping";
import type { GiftRecipient } from "./sidebar-types";

/**
 * The most recently opened Secret Boxes, newest first, one row per box
 * (F009 A2: FR-210, BR-003). Opened boxes are public read, so guests and
 * signed-in viewers get the same rows; the caller adds `href` per viewer.
 *
 * Never throws: a failed read logs once and returns `{status:"error"}`; a
 * malformed row is skipped. Request-time only: call inside `<Suspense>`.
 */
export async function getRecentGiftRecipients(): Promise<KudosRead<Omit<GiftRecipient, "href">[]>> {
  // Outside the try: Next's prerender bail-out must never be swallowed.
  await connection();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("secret_boxes")
      .select(GIFT_BOX_SELECT)
      .not("opened_at", "is", null)
      .order("opened_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(KUDOS_GIFT_LIST_LIMIT);
    if (error) {
      console.error(`[kudos-sidebar] gift list query failed: ${error.code || "?"} ${error.message}`);
      return { status: "error" };
    }

    const rows: unknown[] = data ?? [];
    const valid = rows.filter(isGiftBoxRow);
    if (valid.length !== rows.length) {
      console.error(`[kudos-sidebar] gift list skipped ${rows.length - valid.length} malformed row(s)`);
    }
    return { status: "ok", data: toGiftRecipients(valid) };
  } catch (cause) {
    unstable_rethrow(cause);
    console.error(`[kudos-sidebar] gift list threw: ${cause instanceof Error ? cause.message : String(cause)}`);
    return { status: "error" };
  }
}
