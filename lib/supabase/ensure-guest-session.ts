"use server";

import { isAuthRetryableFetchError } from "@supabase/supabase-js";
import { unstable_rethrow } from "next/navigation";
import { createClient } from "./server";

export type GuestSessionResult = { status: "ok" } | { status: "error" };

/**
 * Guests act as Anonymous (plan 261014-1505-guest-anonymous-access): the first action
 * of a visitor without a session (opening Viết Kudo, clicking a heart) calls this, then
 * acts. Reading the board never does, so crawlers and visitors create no auth users.
 *
 * - Verified claims (an account or an anonymous guest) -> `ok`, nothing changes.
 * - No session at all -> `signInAnonymously()` on the request's cookie client, so this
 *   response sets the new session's cookies; the auth.users trigger creates the guest
 *   Sunner. Next re-renders the page because cookies changed.
 * - Any error while checking (unreachable, invalid JWT, key rotation, rate limit) ->
 *   `error`, never a sign-in: a live account session must never be replaced by a guest.
 *
 * Public POST endpoint without input: it grants nothing an anonymous sign-in would not
 * (Supabase's per-IP anonymous rate limit applies). Never throws (Next's control-flow
 * errors excepted); logs error codes only.
 */
export async function ensureGuestSession(): Promise<GuestSessionResult> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    // Any error means "a session may exist but could not be verified" (network, rotated key,
    // invalid JWT, 429): never replace it with a guest. auth-js drops a dead session itself,
    // so the next attempt sees "no session" and signs in.
    if (error) {
      const kind = isAuthRetryableFetchError(error) ? "unreachable" : (error.code ?? error.name);
      console.error(`[auth] guest session: session check failed: ${kind}`);
      return { status: "error" };
    }
    if (typeof data?.claims.sub === "string" && data.claims.sub !== "") return { status: "ok" };

    const { data: signIn, error: signInError } = await supabase.auth.signInAnonymously();
    if (signInError || !signIn.session) {
      const code = signInError ? (signInError.code ?? signInError.status ?? signInError.name) : "no session";
      console.error(`[auth] guest session: anonymous sign-in failed: ${code}`);
      return { status: "error" };
    }
    return { status: "ok" };
  } catch (cause) {
    unstable_rethrow(cause);
    console.error(`[auth] guest session threw: ${cause instanceof Error ? cause.name : typeof cause}`);
    return { status: "error" };
  }
}
