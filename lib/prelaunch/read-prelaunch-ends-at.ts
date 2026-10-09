import { createClient } from "@supabase/supabase-js";
import { parseCountdownTarget, reportOnce } from "../countdown/parse-countdown-target";
import { getSupabaseEnv } from "../supabase/supabase-env";

// INT-001 (F005 A1, A2, A4; BR-001, BR-002): reads the prelaunch moment from
// `public.site_settings` for the proxy gate and the /countdown page.

// Short on purpose: the proxy waits on this read for every gated page request.
const READ_TIMEOUT_MS = 2_000;
const SOURCE = "[prelaunch] site_settings";
const VALUE_LABEL = `${SOURCE}.prelaunch_ends_at`;

// An operator update must take effect on the very next request (and E2E flips
// the row between tests), so the read never comes from a fetch cache.
const fetchNoStore: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

/**
 * The prelaunch moment in epoch ms, or `null` meaning "not locked" (BR-002,
 * fail open). Never throws:
 * - column `NULL` -> `null` silently (the gate is deliberately off);
 * - missing/invalid env, HTTP or PostgREST error, timeout, network failure,
 *   missing row, non-string or unparsable value -> `null` plus one
 *   `[prelaunch]` log line per distinct message per server process.
 *
 * Uses a session-less client (publishable key, role `anon`, no cookies): the
 * proxy runs this in parallel with `getClaims()` on its cookie-bound client,
 * and sharing that client could race two refreshes of one refresh token.
 * No in-process cache (Next advises against proxy globals; E2E needs instant
 * effect). Does not call `connection()`: a Server Component caller must.
 */
export async function readPrelaunchEndsAt(): Promise<number | null> {
  try {
    const { url, publishableKey } = getSupabaseEnv();
    const supabase = createClient(url, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: fetchNoStore },
    });

    const { data, error } = await supabase
      .from("site_settings")
      .select("prelaunch_ends_at")
      .eq("singleton", true)
      .abortSignal(AbortSignal.timeout(READ_TIMEOUT_MS))
      // No retry (INT-001): postgrest-js would back off 1 s, 2 s on a network
      // error, so a down DB would cost every page the full timeout instead of
      // failing open at once.
      .retry(false)
      .maybeSingle();
    if (error) {
      reportFailure(`${SOURCE} read failed, site stays open: ${error.code || "?"} ${error.message}`);
      return null;
    }
    if (!data) {
      reportFailure(`${SOURCE} row is missing, site stays open`);
      return null;
    }

    const value: unknown = data.prelaunch_ends_at;
    return toMomentMs(value);
  } catch (cause) {
    const message = cause instanceof Error ? `${cause.name}: ${cause.message}` : String(cause);
    reportFailure(`${SOURCE} read threw, site stays open: ${message}`);
    return null;
  }
}

// Boundary check on the DB value: timestamptz arrives as an ISO string with
// offset (parsed by the shared F002 parser, which logs its own failures).
function toMomentMs(value: unknown): number | null {
  if (value === null) return null; // NULL = gate off on purpose: no log (BR-002)
  if (typeof value !== "string") {
    reportFailure(`${VALUE_LABEL} has unexpected type ${typeof value}, site stays open`);
    return null;
  }
  return parseCountdownTarget(value, VALUE_LABEL);
}

// One log line per distinct message per process: a DB outage must not flood.
function reportFailure(message: string): void {
  reportOnce(`[prelaunch]|${message}`, message);
}
