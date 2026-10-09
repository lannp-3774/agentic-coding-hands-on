// ALG-002 (F005 A2, A4; DEC-001, DEC-002; BR-001, BR-004): the prelaunch gate
// decision for one request. Pure and import-free on purpose (provable with
// plain Node). The role lookup stays outside: `admin-check` tells the proxy to
// ask `profiles.role` (INT-002) before letting a locked request through.

/** Where the gate sends everyone but admins while the site is locked. */
export const COUNTDOWN_PATH = "/countdown";
/** Where `/countdown` sends visitors once the site is open (or the moment is unusable). */
export const OPEN_SITE_PATH = "/";

// Always reachable, the moment is not even consulted: admins must be able to
// sign in while the site is locked (clarifications.md). `/login` keeps its own
// signed-in -> `/` rule in the proxy.
const EXEMPT_PATHS: ReadonlySet<string> = new Set(["/login", "/auth/callback"]);

export type PrelaunchGateInput = {
  method: string;
  pathname: string;
  /** Prelaunch moment in epoch ms; `null` when NULL, missing or unreadable (BR-002). */
  momentMs: number | null;
  /** Server clock in epoch ms (BR-001: the gate compares on the server's time). */
  nowMs: number;
};

export type PrelaunchGateDecision =
  | { kind: "next" }
  | { kind: "redirect"; to: typeof COUNTDOWN_PATH | typeof OPEN_SITE_PATH }
  | { kind: "admin-check" };

/**
 * Decides one request, exactly per ALG-002:
 * - non-GET/HEAD (Server Action POSTs) and exempt paths -> `next` (BR-004);
 * - locked = `momentMs !== null && nowMs < momentMs` (equal = open, BR-001);
 * - `/countdown` -> `next` while locked, else 307 to `/` (DEC-002);
 * - any other path -> `next` while open (fail open on `null`, BR-002),
 *   else `admin-check` (DEC-001). The caller redirects to `/countdown`
 *   unless a verified session's role is exactly `admin` (BR-003, fail closed).
 * Redirect targets are constants, never read from the request (BR-004).
 */
export function decidePrelaunchGate({
  method,
  pathname,
  momentMs,
  nowMs,
}: PrelaunchGateInput): PrelaunchGateDecision {
  if (method !== "GET" && method !== "HEAD") return { kind: "next" };
  if (EXEMPT_PATHS.has(pathname)) return { kind: "next" };

  const locked = momentMs !== null && nowMs < momentMs;

  if (pathname === COUNTDOWN_PATH) {
    return locked ? { kind: "next" } : { kind: "redirect", to: OPEN_SITE_PATH };
  }
  if (!locked) return { kind: "next" };
  return { kind: "admin-check" };
}
