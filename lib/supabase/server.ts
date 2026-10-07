import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SESSION_COOKIE_OPTIONS } from "./session-cookie-options";
import { getSupabaseEnv } from "./supabase-env";

// Next's message for a cookie write outside a Server Action / Route Handler.
const READONLY_COOKIES_MESSAGE = "Cookies can only be modified in a Server Action or Route Handler";

/**
 * Creates a Supabase client bound to the current request's cookies.
 *
 * Call it once per request (Server Component, Server Action, Route Handler)
 * and never share the result across requests: the client holds that
 * request's session and the one-shot cache headers @supabase/ssr emits.
 *
 * Identify the user with `supabase.auth.getClaims()` only — never trust
 * `getSession()` on the server.
 */
export async function createClient() {
  const { url, publishableKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookieOptions: SESSION_COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // The 2nd `headers` argument (Cache-Control: no-store …) is not applied
        // here: next/headers exposes no writable response headers. Dynamic
        // responses that set cookies are not cached by Next.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch (cause) {
          // Expected only in Server Components, which cannot write cookies:
          // safe to ignore there because proxy.ts refreshes the session and
          // writes the cookies before render. Anywhere else (Server Action,
          // Route Handler) a failed write loses the session, so say so.
          const message = cause instanceof Error ? cause.message : String(cause);
          if (!message.startsWith(READONLY_COOKIES_MESSAGE)) {
            console.error(`[supabase] writing session cookies failed: ${message}`);
          }
        }
      },
    },
  });
}
