import type { NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/proxy-session";

/**
 * Next.js 16 proxy (formerly middleware). Runs on the Node runtime before
 * the matched routes render: refreshes the Supabase session and redirects by
 * session state. Rules live in lib/supabase/proxy-session.ts.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Must stay a static literal (analyzed at build time). `"/"` matches the root
// only. `"/"` and `"/awards-information"` are public pages, matched for session
// refresh only so token rotation lands in a response cookie (Server Components
// cannot write cookies) — guests there are never redirected. `/_next/*`, assets
// and other routes are not matched.
export const config = {
  matcher: ["/", "/login", "/awards-information"],
};
