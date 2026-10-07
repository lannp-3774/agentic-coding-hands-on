import type { CookieOptionsWithName } from "@supabase/ssr";

/**
 * Attributes for every cookie @supabase/ssr writes (session chunks and the
 * one-shot PKCE verifier), shared by both server clients so they never drift.
 *
 * httpOnly: the app has no browser Supabase client — only server code reads
 * these cookies — so page scripts never need the access/refresh tokens.
 * secure: on in production; off in dev so http://localhost keeps working.
 */
export const SESSION_COOKIE_OPTIONS: CookieOptionsWithName = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};
