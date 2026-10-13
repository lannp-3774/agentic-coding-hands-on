import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** First row of the `get_my_sunner()` result when it carries a uuid id. */
function sunnerIdOf(data: unknown): string | null {
  const row: unknown = Array.isArray(data) ? data[0] : data;
  if (typeof row !== "object" || row === null) return null;
  const id = (row as Record<string, unknown>).id;
  return typeof id === "string" && UUID_PATTERN.test(id) ? id : null;
}

/**
 * The viewer's own Sunner id, or null (F006 A1, § 4.2). Guests get null
 * without a query (`get_my_sunner` is executable by `authenticated` only);
 * a signed-in user goes through the security-definer `get_my_sunner()`, the
 * only client path to their own row (never `sunners.user_id`).
 *
 * Fails closed: no session, no linked Sunner, an error or a throw => null,
 * so no card is marked `isSender` (the DB still refuses self-likes).
 * Request-time only (call inside `<Suspense>`).
 */
export async function getViewerSunnerId(): Promise<string | null> {
  // Outside the try: Next's prerender bail-out must never be swallowed.
  await connection();

  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_my_sunner");
    if (error) {
      console.error(`[kudos] get_my_sunner failed: ${error.code || "?"} ${error.message}`);
      return null;
    }
    return sunnerIdOf(data);
  } catch (cause) {
    unstable_rethrow(cause);
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error(`[kudos] get_my_sunner threw: ${message}`);
    return null;
  }
}
