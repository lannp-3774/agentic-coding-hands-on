"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Action state shared with `GoogleButton` (useActionState). */
export type SignInState = { error: "failed" | null };

type HeaderReader = Pick<Headers, "get">;

const CALLBACK_PATH = "/auth/callback";
// A bare host[:port]: DNS-style name, IPv4 or bracketed IPv6. No path/userinfo.
const HOST_PATTERN = /^(?:[a-z0-9-]+(?:\.[a-z0-9-]+)*|\[[0-9a-f:.]+\])(?::\d{1,5})?$/i;
// Only these may be assumed plain http when no x-forwarded-proto says so.
const LOOPBACK_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);

/**
 * Starts Login with Google (A2: FR-401, BR-006, INT-001).
 *
 * Builds the Supabase authorize URL (writing the one-shot PKCE verifier
 * cookie) and sends the browser there in the same tab. Any failure returns
 * `{ error: "failed" }` so the button re-enables and shows the inline error.
 * Public by design: no session is required to start a sign-in.
 *
 * Takes no parameters: useActionState passes (prevState, formData), and
 * neither is needed, so the unused ones are simply omitted.
 */
export async function signInWithGoogle(): Promise<SignInState> {
  let authorizeUrl: string | null = null;

  try {
    const origin = requestOrigin(await headers());
    if (!origin) {
      console.error("[login] no valid Origin or Host header; cannot build the callback URL");
      return { error: "failed" };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: new URL(CALLBACK_PATH, origin).toString() },
    });

    if (error) {
      console.error(
        `[login] signInWithOAuth failed: ${error.name}: ${error.message}`,
      );
    } else {
      authorizeUrl = data.url;
    }
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error(`[login] signInWithOAuth threw: ${message}`);
  }

  if (!authorizeUrl) return { error: "failed" };

  // Outside try/catch: redirect() throws Next's control-flow error.
  redirect(authorizeUrl);
}

/**
 * The callback must live on the host the user is browsing so the PKCE
 * verifier cookie set here is sent back to /auth/callback. Next's Server
 * Action CSRF check already rejects an Origin that does not match the Host;
 * a request without Origin is let through, so fall back to the host the
 * request was addressed to. Returns null instead of guessing. Supabase still
 * checks the final redirectTo against its allow-list.
 */
function requestOrigin(requestHeaders: HeaderReader): string | null {
  return (
    parseHttpOrigin(requestHeaders.get("origin")) ?? originFromHost(requestHeaders)
  );
}

function parseHttpOrigin(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const isHttp = url.protocol === "http:" || url.protocol === "https:";
    return isHttp ? url.origin : null;
  } catch {
    return null;
  }
}

function originFromHost(requestHeaders: HeaderReader): string | null {
  const host =
    firstListValue(requestHeaders.get("x-forwarded-host")) ??
    firstListValue(requestHeaders.get("host"));
  if (!host || !HOST_PATTERN.test(host)) return null;

  try {
    const { hostname } = new URL(`http://${host}`);
    const forwardedProto = firstListValue(requestHeaders.get("x-forwarded-proto"));
    const protocol =
      forwardedProto === "http" || forwardedProto === "https"
        ? forwardedProto
        : LOOPBACK_HOSTNAMES.has(hostname) ? "http" : "https";
    return new URL(`${protocol}://${host}`).origin;
  } catch {
    return null; // e.g. a port outside 0-65535
  }
}

/** Proxies may chain values ("client, proxy1"); the first is the client-facing one. */
function firstListValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim().toLowerCase() || null;
}
