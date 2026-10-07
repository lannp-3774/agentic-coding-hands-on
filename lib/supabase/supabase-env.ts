/**
 * Server-only Supabase connection settings, shared by the request-scoped
 * server client (server.ts) and the proxy session helper (proxy-session.ts).
 *
 * The values carry no NEXT_PUBLIC_ prefix on purpose: they must never be
 * inlined into a client bundle. They are read on every call (not at module
 * load) so a missing value fails loudly at client creation with a clear
 * message instead of surfacing later as an opaque auth error.
 */
export type SupabaseEnv = {
  url: string;
  publishableKey: string;
};

export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.SUPABASE_URL?.trim();
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

  const missing = [
    url ? null : "SUPABASE_URL",
    publishableKey ? null : "SUPABASE_PUBLISHABLE_KEY",
  ].filter((name): name is string => name !== null);

  if (!url || !publishableKey) {
    throw new Error(
      `Missing Supabase environment variable(s): ${missing.join(", ")}. ` +
        "Set them server-side (no NEXT_PUBLIC_ prefix), e.g. in .env.local.",
    );
  }

  if (!isHttpUrl(url)) {
    throw new Error(
      "SUPABASE_URL must be an absolute http(s) URL, e.g. http://127.0.0.1:54321.",
    );
  }

  return { url, publishableKey };
}

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}
