import type { SupabaseClient } from "@supabase/supabase-js";
import { toUserRole, type UserRole } from "../supabase/user-role";

// INT-002 (F005 A2; BR-003, DEC-001): the role check behind `admin-check`.
// F003 `getCurrentUser()` cannot run in the proxy (it reads next/headers and
// is wrapped in React `cache`), so the proxy has its own lookup; the admin
// rule itself is the shared `toUserRole`.

// Same bound as the moment read: a hung lookup must not hold the request.
// A timeout is just another failure, so it fails closed ("user").
const ROLE_READ_TIMEOUT_MS = 2_000;

/**
 * The role of a verified user for the prelaunch gate. `client` must be the
 * proxy's cookie-bound client AFTER `getClaims()` (role `authenticated`, RLS
 * `profiles_select_own`), and `userId` the verified claims `sub` — never
 * `user_metadata`, which the user can write.
 *
 * Fails closed and never throws: a query error, timeout, missing profile row
 * or any value other than the exact string `admin` -> `"user"`, logged with
 * `[profiles]` at error level, no retry. The caller then redirects to
 * `/countdown`.
 */
export async function readGateUserRole(client: SupabaseClient, userId: string): Promise<UserRole> {
  try {
    const { data, error } = await client
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .abortSignal(AbortSignal.timeout(ROLE_READ_TIMEOUT_MS))
      .retry(false) // INT-002: no retry (postgrest-js retries GETs by default)
      .maybeSingle();
    if (error) {
      console.error(
        `[profiles] prelaunch gate role lookup failed for ${userId}, using "user": ${error.code || "?"} ${error.message}`,
      );
      return "user";
    }
    if (!data) {
      console.error(`[profiles] prelaunch gate found no profile row for ${userId}, using "user"`);
      return "user";
    }
    return toUserRole(data.role);
  } catch (cause) {
    const message = cause instanceof Error ? `${cause.name}: ${cause.message}` : String(cause);
    console.error(`[profiles] prelaunch gate role lookup threw for ${userId}, using "user": ${message}`);
    return "user";
  }
}
