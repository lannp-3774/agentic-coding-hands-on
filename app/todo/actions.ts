"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Logs the user out (A7: FR-406, INT-001, US007), then always lands on /login.
 *
 * Acts only on the caller's own session cookies, so no separate session
 * check is needed first: without a session there is nothing to revoke and
 * the call is a no-op. Supabase clears the session cookies even when the
 * revoke request fails or the refresh token is already dead (expired
 * session), so errors are only logged — leaving must never fail for the user.
 *
 * Scope is "local": only this browser's session ends. The default ("global")
 * would also revoke the user's sessions on every other device and tab.
 */
export async function signOut(): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      console.warn(`[todo] signOut reported: ${error.name}: ${error.message}`);
    }
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error(`[todo] signOut threw: ${message}`);
  }

  // Outside try/catch: redirect() throws Next's control-flow error.
  redirect("/login");
}
