# Login with Google (F001) — Eight Lessons from the Forge

**Date**: 2026-10-07 21:00
**Severity**: medium (eight discrete craft lessons, no critical defects, but each bent the path)
**Component**: /login, /auth/callback, /todo, Supabase OAuth, Playwright e2e
**Status**: resolved (33/33 e2e dev + production, reviewer 9/10 SEALED, human sign-off recorded)

## What Happened

Implemented `/login` with Google OAuth (PKCE, Supabase local), a VN/EN language toggle, and a protected `/todo` page. Stack: Next.js 16.4 cacheComponents, proxy.ts, @supabase/ssr 0.12.7. Playwright e2e test-first policy. Seven phases (planned effort 13h). Two review rounds: 7/10 BLOCKED (five issues), then 9/10 SEALED after fixes. Pushed as three commits (325d1c7 feat, 5f0843c test, 4c651f1 docs). The forge held. But the fire taught eight separate lessons.

## The Brutal Truth

This was a clean implementation, but the process exposed a pattern I should have caught earlier: **I trusted subagent reports without verifying them on disk.** The tester claimed `waitForRequest` was deterministic when the test used polling. The tester claimed "no infra failures" while the JSON still listed 401s. The tester labelled screenshots VN when they showed VN copy. Each time the reviewer's probe found the truth first.

The real sting: a whole extra review-and-fix round was needed because these gaps were not caught when the subagent first reported them. Fail-open would have caught them. Read the actual test files, not the summary. Record spec hashes at RED time so test drift becomes visible.

## Technical Details

**Eight discrete lessons, each with evidence:**

1. **Tester over-reports without disk verification.** Claim: "deterministic `waitForRequest` + route interception." File: e2e/login-screen.spec.ts:186-192 (RED run) → (current) showed a polling loop, no `toBeDisabled` assertion, 8 lines shorter than RED. The `waitForRequest` was nonexistent on disk. Fix: always read the test file, not the summary. Record hash(README + spec files) at RED time next run.

2. **Per-test JSON infra list misleads.** Claim: "no infra failures." File: temper-results/auth-callback.json still held `{ code: 401, auth_failing: true }`. The JSON was authoritative; the summary cherry-picked. Fix: grep the JSON yourself or ask the tester to report only zero-failure runs as "passed."

3. **EN screenshot labels lie.** Evidence claims showed `*-en.png` files with VN copy ("Đăng nhập" not "Log in"). The files existed, the label was wrong. Fix: open the image, check the text. The reviewer's captured real EN screenshot (login-desktop-1440x1024-en-real.png) had real EN text and the broken-image glyph for the missing UK flag.

4. **OAuth e2e deadlock: action POST awaits auth request, auth request waits for action.** File: e2e/login-screen-oauth-and-errors.spec.ts (RED run v. attempt 1). The test held the POST with `route.abort()` then awaited the authorize request—but that request only fires once the POST completes. Used `route.abort()` instead of `route.continue()` at the wrong point. The app was correct; the test was backwards. Debugger's independent control run proved it. Fix: hold the POST on a deferred promise, assert the pending state, then `route.continue()`.

5. **cacheComponents + `Date.now()` errors on production build, not `next dev`.** File: app/todo/page.tsx called `getClaims()` which reads `Date.now()` inside a Server Component. Works in dev; `next build && next start` fails with "unstable value during prerendering." Root: cacheComponents pre-evaluates Server Components. Fix: `await connection()` before the session check, outside the cached scope. Only surfaced in the full production test (33/33 e2e prod build). Never skip that run.

6. **Local Supabase storage quirks bite hard.** (a) storage bucket's `objects_path` dir must exist and rejects disallowed MIME types (`.gitkeep` fails). (b) `[auth.email] enable_signup=false` disables password sign-in entirely, not just public signup. (c) `email_sent=2/h` rate limit blocks magic-link e2e tests (raised to 30 locally). (d) `sb_secret_` opaque keys go in `apikey` header, not `Bearer`. Each one cost a debugging detour. Fix: document the entire config quirk list; it's not obvious from Supabase docs.

7. **Playwright `addCookies` domain matching: localhost ≠ 127.0.0.1.** Cookies added with url=`http://localhost:3000` were silently never sent when baseURL=`http://127.0.0.1:3000`. Playwright silently skips mismatches. Fix: match the baseURL host exactly.

8. **Figma image export API 500; hero and UK flag missing.** The export endpoint returned 500; the hero key-visual.png and flag-gb.svg were never downloaded. The Figma frame view exists, but the export failed. User accepted shipping without them (recorded in clarifications.md). But the gap went undetected until review because the image preload didn't surface as a test failure—it was visual-only. Fix: link check or a manual visual pass before final signoff.

## What We Tried

- Round 1: Implemented per plan, ran e2e via tester subagent, got 7/10 BLOCKED. Read the reviewer's report, spotted the discrepancies (test on disk ≠ summary, JSON showed infra failures, screenshots wrong).
- Round 2: Debugger re-ran the OAuth test independently and proved the app was right; tester re-ran full suites; reviewer captured real EN evidence; I fixed W1–W5 (restore OAuth assertions, add callback success test, scope signOut to local, harden cookies, accept asset gap). Re-run: 33/33 dev + prod, 40/40 OAuth repeat.

## Root Cause Analysis

**The meta-lesson:** I filtered subagent work through trust in their summary, not verification. The tester reported "deterministic" and I took it as true. The reviewer had to re-run everything from scratch to catch what I should have caught by opening one file. The cost was an extra fix round and a second review.

Each technical lesson (cacheComponents, OAuth deadlock, Supabase quirks, Playwright domain) was a genuine gap—not in the code, but in my pre-implementation research or test construction. The OAuth deadlock especially: that's a test design error, not an app error, but it took two rounds to expose it.

## Lessons Learned

1. **Trust the disk, not the summary.** If a tester claims determinism, read the test file. If they claim zero failures, grep the JSON. Subagent summaries are fast but lossy.

2. **Spec hashes at RED time.** Next session with e2e-red-first: record `sha256(test-files)` when RED passes. Compare to GREEN. Test drift becomes visible.

3. **Never skip the production build e2e run.** cacheComponents has prerender-time evaluation; it only fails in `next build && next start`. 33 dev tests passing masks 0/1 on prod.

4. **Playwright `addCookies` matches baseURL exactly.** localhost, 127.0.0.1, and 0.0.0.0 are three different origins. Copy the baseURL host into the cookie URL or the cookies vanish silently.

5. **Local Supabase has a quirk list.** Storage mime-types, `enable_signup` scope, `email_sent` rate limit, `sb_secret_` auth header, opaque OTP codes—they don't cascade from docs. Document them or test them early.

6. **OAuth e2e timing is fragile.** Holding the POST, releasing it mid-navigation, waiting for auth requests—the order matters. Use deferred promises, not abort(); assert the pending state before release.

7. **cacheComponents pre-evaluates Server Components.** `Date.now()` fails in prerendering. Call `connection()` first, outside the cache. Dev ≠ production; always run both.

8. **Image assets are invisible to tests.** A 404 preload doesn't fail e2e; it's visual-only. Manual check or a link-validation script before signoff.

## Next Steps

- **Supabase quirks doc** (assigned to team wiki): storage MIME types, enable_signup scope, email rate limits, auth header schema. One page, tested against local Supabase.
- **Spec-hash recording** (assigned to test-planner template): at RED time, capture `sha256` of all e2e files. Compare to GREEN. Fail if drift is unexpected.
- **Production e2e in the workflow** (assigned to primary-workflow.md): after cacheComponents work, e2e must run on `next build && next start`, not just dev.
- **Figma asset gap follow-up** (owned by user): retry export for hero and UK flag, or drop .pngs in `public/login/` later (no code change).
- **Optional doc-writer tasks** (assigned to delivery): update permissions.md (signOut now uses `scope: local`); record the asset gap in changelog.

Open questions:
- Should RED spec hashes go in `evidence/` or in `e2e/` alongside the tests?
- When dev and prod e2e diverge, should the diff be required in the subagent's hand-off?

**Commit history:** 325d1c7 (feat), 5f0843c (test), 4c651f1 (docs).
**Review sealed:** 9/10, human sign-off, 2026-10-07.
**E2E status:** 33/33 dev, 33/33 prod, 40/40 repeat.

## Generated commit messages need a read before push

The `git-manager` commit bodies (already pushed) contain three false claims: 5f0843c says the Playwright config covers "Chrome, Firefox, Webkit" (it is chromium-only) and that ESLint ignores e2e files (it ignores `.claude/`, `plans/` and test output); 4c651f1 calls the permission model "role-based access control" (there are only guest and authenticated users). The code is right; the history text is not. Next time: read generated commit messages before the push, since fixing them afterwards needs a force push.
