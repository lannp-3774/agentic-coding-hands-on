import type { NextRequest } from "next/server";
import { getKudosPage } from "@/lib/kudos/get-kudos-page";
import { KUDOS_CURSOR_PATTERN, parseKudosFiltersStrict } from "@/lib/kudos/kudos-filters";

// GET /api/kudos?cursor=<seq>[&hashtag=<slug>][&department=<code>]
// All Kudos page 2+ for infinite scroll (F006 A5, BR-005, BR-006). A Route
// Handler, not a Server Action: actions queue one at a time and cannot be
// aborted. Body: `KudosPage` `{items, nextCursor}`; `isSender` is false in
// every item (the client applies `withViewerFlags`), `likedByMe` is the
// caller's own like read under RLS with the request's session cookie.
//
// Rendering (Next 16, cacheComponents): reading `request.nextUrl` already makes
// a GET handler run at request time (getting-started/route-handlers, "With
// Cache Components"), so no `connection()` is needed here; `getKudosPage`
// still awaits it per the getter template, a no-op at request time.
//
// Security: every query param is allow-listed before any DB access; 4xx/5xx
// bodies are fixed codes that never echo input or error details; reads use the
// publishable key (anon / authenticated, RLS) and explicit columns only. The
// proxy matcher covers /api, so session refresh and the F005 gate apply.

const NO_STORE = { "Cache-Control": "no-store" };

function json(body: unknown, status: number): Response {
  return Response.json(body, { status, headers: NO_STORE });
}

export async function GET(request: NextRequest): Promise<Response> {
  const params = request.nextUrl.searchParams;

  const cursors = params.getAll("cursor");
  if (cursors.length !== 1 || !KUDOS_CURSOR_PATTERN.test(cursors[0])) {
    return json({ error: "invalid_cursor" }, 400);
  }

  const filters = parseKudosFiltersStrict(params);
  if (filters === null) return json({ error: "invalid_filter" }, 400);

  // Never throws; failures are already logged with `[kudos]`.
  const page = await getKudosPage(filters, cursors[0]);
  if (page.status === "error") return json({ error: "read_failed" }, 500);
  return json(page.data, 200);
}
