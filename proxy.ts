import type { NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/proxy-session";

/**
 * Next.js 16 proxy (formerly middleware). Runs on the Node runtime before
 * the matched routes render: refreshes the Supabase session, redirects by
 * session state and applies the F005 prelaunch gate. Rules live in
 * lib/supabase/proxy-session.ts.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Must stay a static literal (analyzed at build time). Matches every page
// route, unknown paths and `/` included, for session refresh (token rotation
// lands in a response cookie; Server Components cannot write cookies) and
// for the prelaunch gate. Skipped: `/_next/*`, dev `__nextjs*` endpoints and
// any path with a dot (files in `public/`, `favicon.ico`), so assets always
// load, the countdown page's included. Assumes no page route has a dot in
// its path. Exemptions (`/auth/callback`, `/login`, non-GET/HEAD) are handled
// in code, not here. The gate never redirects guests while the site is open.
export const config = {
  matcher: ["/((?!_next/|__nextjs|.*\\..*).*)"],
};
