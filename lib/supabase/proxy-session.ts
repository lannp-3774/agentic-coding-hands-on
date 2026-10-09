import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { COUNTDOWN_PATH, decidePrelaunchGate } from "../prelaunch/prelaunch-gate-decision";
import { readGateUserRole } from "../prelaunch/read-gate-user-role";
import { readPrelaunchEndsAt } from "../prelaunch/read-prelaunch-ends-at";
import { SESSION_COOKIE_OPTIONS } from "./session-cookie-options";
import { getSupabaseEnv } from "./supabase-env";

const LOGIN_PATH = "/login";
// The session is created here; the proxy must not touch this request at all.
const AUTH_CALLBACK_PATH = "/auth/callback";
// Where a signed-in user belongs (BR-002, DEC-001). Only a redirect target:
// it is NOT a protected-route prefix — "/" is the public homepage, so guests
// on it must never be redirected while the site is open.
const POST_LOGIN_PATH = "/";

type PendingCookie = { name: string; value: string; options: CookieOptions };
type PendingWrites = { cookies: PendingCookie[]; headers: Record<string, string> };
/** A verified session: both set, or both null (guest). */
type VerifiedSession = { userId: string | null; client: SupabaseClient | null };

const GUEST: VerifiedSession = { userId: null, client: null };

/**
 * Refreshes the Supabase session for this request, then applies, in order:
 *   1. `/auth/callback` -> untouched (as when it was outside the matcher);
 *   2. GET|HEAD /login + valid claims -> 307 / (BR-005, DEC-001, unchanged);
 *   3. the F005 prelaunch gate (A2, A4; DEC-001, DEC-002) on every other
 *      GET|HEAD: while locked, everyone but an admin -> 307 /countdown;
 *      once open, /countdown -> 307 /. A missing or unreadable moment means
 *      open (BR-002), so guests on public pages are never redirected then.
 * Everything else continues with the refreshed cookies attached.
 *
 * The gate is a launch gate, not access control (FR-602): it fails open and
 * never sees POSTs, so a page or Server Action must check the session and
 * role itself. Only GET/HEAD are redirected: Server Actions POST to the page
 * route, and 307-ing an expired-session `signOut` POST would break the call.
 *
 * Redirect targets are fixed paths on the request origin; nothing from the
 * query string or headers is used, so there is no open redirect (BR-004).
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  if (pathname === AUTH_CALLBACK_PATH) return NextResponse.next();

  // Collect writes instead of building the response inside setAll: setAll may
  // run more than once, and the cache headers arrive only on the first call.
  const pending: PendingWrites = { cookies: [], headers: {} };

  // INT-001 in parallel with getClaims(): the moment read uses its own
  // cookie-less client, so the two never race one refresh token. No read
  // where the gate cannot apply (non-GET/HEAD, /login). Both never throw.
  const gateApplies = isGetOrHead(request.method) && pathname !== LOGIN_PATH;
  const [session, momentMs] = await Promise.all([
    verifySession(request, pending),
    gateApplies ? readPrelaunchEndsAt() : Promise.resolve(null),
  ]);

  // Resolved in full (role read included) before any response is built, so a
  // token refresh during either call still lands in `pending`.
  const target =
    loginRedirectTarget(request, session) ??
    (gateApplies ? await prelaunchGateTarget(request, session, momentMs) : null);

  const response = target
    ? NextResponse.redirect(new URL(target, request.url))
    : NextResponse.next({ request: { headers: request.headers } });

  // Without this, a redirect would drop the refreshed token -> logout loop.
  pending.cookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options),
  );
  Object.entries(pending.headers).forEach(([key, value]) =>
    response.headers.set(key, value),
  );

  return response;
}

/**
 * BR-005: absent claims, a verification error or a network failure all mean
 * "guest". Missing or invalid Supabase env is read inside the try on purpose
 * and also means "guest" (logged, never a 500): this fails safe because a
 * guest is granted nothing — on a locked site a guest is sent to /countdown.
 * The client is returned only with a verified `sub`, for the role read.
 */
async function verifySession(
  request: NextRequest,
  pending: PendingWrites,
): Promise<VerifiedSession> {
  try {
    const { url, publishableKey } = getSupabaseEnv();
    const supabase = createServerClient(url, publishableKey, {
      cookieOptions: SESSION_COOKIE_OPTIONS,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // Mirror onto the request so Server Components in this same request
          // read the refreshed token, then queue them for the response.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          pending.cookies.push(...cookiesToSet);
          Object.assign(pending.headers, headers);
        },
      },
    });

    const { data, error } = await supabase.auth.getClaims();
    if (error) {
      console.warn(
        `[proxy] getClaims failed, treating request as unauthenticated: ${error.name}: ${error.message}`,
      );
      return GUEST;
    }
    const sub: unknown = data?.claims?.sub;
    if (typeof sub !== "string" || sub === "") return GUEST;
    return { userId: sub, client: supabase };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error(
      `[proxy] session check threw, treating request as unauthenticated: ${message}`,
    );
    return GUEST;
  }
}

function loginRedirectTarget(request: NextRequest, session: VerifiedSession): string | null {
  if (!isGetOrHead(request.method)) return null;

  if (session.userId && request.nextUrl.pathname === LOGIN_PATH) return POST_LOGIN_PATH;

  return null;
}

/**
 * ALG-002 plus the INT-002 role read on `admin-check`. The role is read only
 * for a verified session, on the same cookie-bound client after getClaims()
 * (RLS `profiles_select_own`); a guest is redirected without a lookup.
 * The role read fails closed, so only an exact `admin` passes.
 */
async function prelaunchGateTarget(
  request: NextRequest,
  session: VerifiedSession,
  momentMs: number | null,
): Promise<string | null> {
  const decision = decidePrelaunchGate({
    method: request.method,
    pathname: request.nextUrl.pathname,
    momentMs,
    nowMs: Date.now(),
  });
  if (decision.kind === "next") return null;
  if (decision.kind === "redirect") return decision.to;

  if (!session.userId || !session.client) return COUNTDOWN_PATH;
  const role = await readGateUserRole(session.client, session.userId);
  return role === "admin" ? null : COUNTDOWN_PATH;
}

function isGetOrHead(method: string): boolean {
  return method === "GET" || method === "HEAD";
}
