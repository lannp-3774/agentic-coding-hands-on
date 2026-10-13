import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";

/**
 * Result of the viewer's `get_my_sunner()` call. `data` is the raw RPC result
 * (a 0-or-1 row table); callers run their own guards on it.
 */
export type MySunnerRead =
  | { status: "guest" }
  | { status: "ok"; data: unknown }
  | { status: "error"; reason: string };

/**
 * The viewer's own Sunner through the security-definer `get_my_sunner()` (the
 * only client path to it; never `sunners.user_id`), called once per request:
 * the page shell (viewer flags) and the personal stats share it (review M4).
 * Guests get `{status:"guest"}` without a query (`get_my_sunner` is executable
 * by `authenticated` only).
 *
 * React `cache` memoizes within one server render pass only, and identity comes
 * from that request's verified session (`getCurrentUser`), so one user's row is
 * never served to another request. Not for Server Actions or Route Handlers
 * (no render pass there; the memo would do nothing).
 *
 * Never throws (Next's own control-flow errors excepted).
 * Request-time only (call inside `<Suspense>`).
 */
export const getMySunnerPerRequest = cache(async (): Promise<MySunnerRead> => {
  // Outside the try: Next's prerender bail-out must never be swallowed.
  await connection();

  try {
    const user = await getCurrentUser();
    if (!user) return { status: "guest" };

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_my_sunner");
    if (error) return { status: "error", reason: `get_my_sunner failed: ${error.code || "?"} ${error.message}` };
    return { status: "ok", data };
  } catch (cause) {
    unstable_rethrow(cause);
    return { status: "error", reason: `get_my_sunner threw: ${cause instanceof Error ? cause.message : String(cause)}` };
  }
});
