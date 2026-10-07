import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_OPTIONS } from "./session-cookie-options";
import { getSupabaseEnv } from "./supabase-env";

const LOGIN_PATH = "/login";
const HOME_PATH = "/todo";

type PendingCookie = { name: string; value: string; options: CookieOptions };
type PendingWrites = { cookies: PendingCookie[]; headers: Record<string, string> };

/**
 * Refreshes the Supabase session for this request and applies the
 * session-based redirects (BR-005, DEC-001, DEC-002):
 *   GET|HEAD /login   + valid claims -> 307 /todo
 *   GET|HEAD /todo/*  + no claims    -> 307 /login (no error param)
 * Every other request continues with the refreshed cookies attached.
 *
 * Only GET/HEAD are redirected: Server Actions POST to the page route, and
 * 307-ing an expired-session `signOut` POST into /login would break the
 * action call. Pages and actions re-check the session themselves.
 *
 * Redirect targets are fixed paths on the request origin; nothing from the
 * query string is used, so there is no open redirect.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  // Collect writes instead of building the response inside setAll: setAll may
  // run more than once, and the cache headers arrive only on the first call.
  const pending: PendingWrites = { cookies: [], headers: {} };

  // Must run before any response is built so a token refresh lands in setAll.
  const isAuthenticated = await hasVerifiedSession(request, pending);

  const target = redirectTarget(request, isAuthenticated);
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
 * guest is granted nothing — /todo still redirects to /login.
 */
async function hasVerifiedSession(
  request: NextRequest,
  pending: PendingWrites,
): Promise<boolean> {
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
      return false;
    }
    return Boolean(data?.claims);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error(
      `[proxy] session check threw, treating request as unauthenticated: ${message}`,
    );
    return false;
  }
}

function redirectTarget(request: NextRequest, isAuthenticated: boolean): string | null {
  if (request.method !== "GET" && request.method !== "HEAD") return null;

  const { pathname } = request.nextUrl;
  if (isAuthenticated && pathname === LOGIN_PATH) return HOME_PATH;

  const isHomeRoute = pathname === HOME_PATH || pathname.startsWith(`${HOME_PATH}/`);
  if (!isAuthenticated && isHomeRoute) return LOGIN_PATH;

  return null;
}
