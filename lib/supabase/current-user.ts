import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { createClient } from "./server";

export type UserRole = "user" | "admin";

export type CurrentUser = {
  id: string;
  email: string | null;
  role: UserRole;
};

type ServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * The signed-in user and their role, or `null` for a guest (F003 A4:
 * FR-601, FR-602, BR-001, BR-002, BR-005). Read once per request (`cache`).
 *
 * Identity comes only from verified JWT claims (`getClaims()`, never
 * `getSession()`); the role only from `public.profiles` read under RLS with
 * the user's own session (never `user_metadata`, which the user can write).
 *
 * Fails closed: no claims, an auth error or a throw => `null` (guest); a
 * failed, empty or unexpected role lookup => `"user"`, never `"admin"`.
 * Showing or hiding admin UI from this is UX only — every admin route or
 * action must call this itself and deny unless `role === "admin"` (BR-004).
 *
 * Request-time only: `getClaims()` reads the clock, which cacheComponents
 * rejects during prerendering, so call it inside a `<Suspense>` boundary.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // Outside the try: Next's prerender bail-out must never be swallowed.
  await connection();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error) {
      console.warn(`[auth] getClaims failed, treating request as guest: ${error.name}: ${error.message}`);
      return null;
    }

    const sub: unknown = data?.claims.sub;
    if (typeof sub !== "string" || sub === "") return null;

    const email: unknown = data?.claims.email;
    return {
      id: sub,
      email: typeof email === "string" && email !== "" ? email : null,
      role: await readRole(supabase, sub),
    };
  } catch (cause) {
    unstable_rethrow(cause);
    console.error(`[auth] getCurrentUser threw, treating request as guest: ${errorMessage(cause)}`);
    return null;
  }
});

// BR-001/BR-002: only the literal "admin" grants admin; anything else is "user".
async function readRole(supabase: ServerClient, userId: string): Promise<UserRole> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.error(`[profiles] role lookup failed for ${userId}, using "user": ${error.code || "?"} ${error.message}`);
      return "user";
    }
    if (!data) {
      console.warn(`[profiles] no profile row for ${userId}, using "user"`);
      return "user";
    }
    const role: unknown = data.role;
    return role === "admin" ? "admin" : "user";
  } catch (cause) {
    unstable_rethrow(cause);
    console.error(`[profiles] role lookup threw for ${userId}, using "user": ${errorMessage(cause)}`);
    return "user";
  }
}

function errorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}
