import { connection } from "next/server";
import { getMySunnerPerRequest } from "./get-my-sunner-per-request";

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
 * only client path to their own row (never `sunners.user_id`). The RPC runs
 * once per page render, shared with the personal stats (`getMySunnerPerRequest`).
 *
 * Fails closed: no session, no linked Sunner, an error or a throw => null,
 * so no named card is marked `isSender` here (`kudos_sent_by_me()` in the read
 * still marks the viewer's own kudos; the DB refuses self-likes regardless).
 * Request-time only (call inside `<Suspense>`).
 */
export async function getViewerSunnerId(): Promise<string | null> {
  // Next's prerender bail-out must never be swallowed.
  await connection();

  const me = await getMySunnerPerRequest();
  if (me.status === "error") {
    console.error(`[kudos] ${me.reason}`);
    return null;
  }
  return me.status === "ok" ? sunnerIdOf(me.data) : null;
}
