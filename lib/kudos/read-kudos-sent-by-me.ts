import { unstable_rethrow } from "next/navigation";
import type { createClient } from "@/lib/supabase/server";
import { NONE } from "./kudos-card-mapping";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

const idOf = (row: unknown): string | null =>
  typeof row === "object" && row !== null && typeof (row as { id?: unknown }).id === "string"
    ? (row as { id: string }).id
    : null;

/**
 * Of the read kudos rows, the ids the viewer sent (F007 FR-203), anonymous kudos included:
 * the card cannot tell, since an anonymous kudos never exposes its sender. Asks the
 * security-definer `kudos_sent_by_me()`, which only ever answers about the caller's own kudos.
 * Guests (no verified claims) get none without the RPC (`authenticated` only); the claims
 * check skips `getCurrentUser`'s profiles lookup, which /api/kudos would otherwise pay.
 *
 * Fails closed: an error or a throw => none (the heart stays enabled; the DB still refuses
 * self-likes). Never throws (Next's own control-flow errors excepted).
 */
export async function readKudosSentByMe(supabase: ServerClient, rows: unknown): Promise<ReadonlySet<string>> {
  const ids = (Array.isArray(rows) ? rows : []).map(idOf).filter((id): id is string => id !== null);
  if (ids.length === 0) return NONE;

  try {
    const { data: claims, error: claimsError } = await supabase.auth.getClaims();
    if (claimsError || typeof claims?.claims.sub !== "string" || claims.claims.sub === "") return NONE;
    const { data, error } = await supabase.rpc("kudos_sent_by_me", { p_kudos_ids: ids });
    if (error) {
      console.error(`[kudos] kudos_sent_by_me failed: ${error.code || "?"}`);
      return NONE;
    }
    return new Set((Array.isArray(data) ? data : []).filter((id): id is string => typeof id === "string"));
  } catch (cause) {
    unstable_rethrow(cause);
    console.error(`[kudos] kudos_sent_by_me threw: ${cause instanceof Error ? cause.name : typeof cause}`);
    return NONE;
  }
}
