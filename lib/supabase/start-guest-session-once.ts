import { ensureGuestSession, type GuestSessionResult } from "./ensure-guest-session";

export type { GuestSessionResult } from "./ensure-guest-session";

// Browser only (imported by client components): the in-flight request lives in this
// module, so it must never run on the server, where it would be shared across requests.
let inflight: Promise<GuestSessionResult> | null = null;

/**
 * Calls `ensureGuestSession` from the browser. Concurrent callers (two hearts, or a heart
 * and the send bar, clicked before the first answer) share one request, so one guest
 * never gets two anonymous users. Never rejects: a transport failure (network, a stale
 * action id after a deploy) is `error`.
 */
export function startGuestSessionOnce(): Promise<GuestSessionResult> {
  inflight ??= ensureGuestSession()
    .catch((cause: unknown): GuestSessionResult => {
      console.error(`[auth] guest session request failed: ${cause instanceof Error ? cause.message : String(cause)}`);
      return { status: "error" };
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
