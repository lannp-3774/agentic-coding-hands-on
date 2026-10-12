// ALG-002 (F005 A2, A4; DEC-001, DEC-002; BR-001, BR-004): the prelaunch gate
// decision for one request. Pure and import-free on purpose (provable with
// plain Node). The role lookup stays outside: `admin-check` tells the proxy to
// ask `profiles.role` (INT-002) before letting a locked request through.

/** Where the gate sends everyone but admins while the site is locked. */
export const COUNTDOWN_PATH = "/countdown";

// Always reachable, the moment is not even consulted: admins must be able to
// sign in while the site is locked (clarifications.md), and `/countdown` is
// served in every state so each page stays reachable by URL (DEC-002).
// `/login` keeps its own signed-in -> `/` rule in the proxy.
const EXEMPT_PATHS: ReadonlySet<string> = new Set(["/login", "/auth/callback", COUNTDOWN_PATH]);

export type PrelaunchGateInput = {
  method: string;
  pathname: string;
  /** Prelaunch moment in epoch ms; `null` when NULL, missing or unreadable (BR-002). */
  momentMs: number | null;
  /** Server clock in epoch ms (BR-001: the gate compares on the server's time). */
  nowMs: number;
};

export type PrelaunchGateDecision = { kind: "next" } | { kind: "admin-check" };

/**
 * Decides one request, exactly per ALG-002:
 * - non-GET/HEAD (Server Action POSTs) and exempt paths, `/countdown`
 *   included, -> `next` (BR-004, DEC-002);
 * - locked = `momentMs !== null && nowMs < momentMs` (equal = open, BR-001);
 * - any other path -> `next` while open (fail open on `null`, BR-002),
 *   else `admin-check` (DEC-001). The caller redirects to `/countdown`
 *   unless a verified session's role is exactly `admin` (BR-003, fail closed).
 * The redirect target is a constant, never read from the request (BR-004).
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
  return locked ? { kind: "admin-check" } : { kind: "next" };
}
