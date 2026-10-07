import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SUCCESS_PATH = "/todo";
const LOGIN_PATH = "/login";
const CANCELLED_BY_USER = "access_denied";

type CallbackOutcome = "success" | "cancelled" | "failed";

/**
 * OAuth (PKCE) return point for Login with Google (A3: FR-402, FR-403,
 * FR-601, BR-002, BR-003, DEC-003).
 *
 *   ?code=…                    -> exchange for a session -> 302 /todo
 *   ?error=access_denied, none -> 302 /login?error=cancelled
 *   other ?error=…, failed or
 *   throwing exchange          -> 302 /login?error=failed
 *
 * The success target is fixed: `next`, `redirect_to` and any other query
 * parameter are ignored, so this route cannot become an open redirect.
 * Redirects are built from fixed paths on the request origin, which also
 * keeps the session cookies on the host the PKCE verifier was set for.
 */
export async function GET(request: NextRequest) {
  const outcome = await completeSignIn(request.nextUrl.searchParams);
  const target =
    outcome === "success" ? SUCCESS_PATH : `${LOGIN_PATH}?error=${outcome}`;

  return NextResponse.redirect(new URL(target, request.url), 302);
}

async function completeSignIn(params: URLSearchParams): Promise<CallbackOutcome> {
  // Supabase forwards provider errors (e.g. the user cancelled at Google)
  // instead of a code. Never exchange a code that arrives alongside an error.
  const providerError = params.get("error");
  if (providerError) {
    return providerError === CANCELLED_BY_USER ? "cancelled" : "failed";
  }

  const code = params.get("code")?.trim();
  if (!code) return "cancelled";

  try {
    // The PKCE verifier cookie is read and the session cookies are written
    // through the client's cookie adapter; Next attaches them to the redirect.
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return "success";

    console.warn(
      `[auth/callback] exchangeCodeForSession failed: ${error.name}: ${error.message}`,
    );
  } catch (cause) {
    // Supabase unreachable, missing env, cookie store failure: never a 500.
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error(`[auth/callback] code exchange threw: ${message}`);
  }

  return "failed";
}
