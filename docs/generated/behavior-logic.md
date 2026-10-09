---
authored_by: rebuild-spec
---
<!-- layout-exempt: rebuild-spec owns all docs/system|features|generated|flows paths — all references here are output targets or internal definitions -->
# Behavior Logic

**Project**: my-app (SAA 2025 — Sun* Annual Awards 2025)
**Generated**: 2026-10-08
**Analysis Scope**: Logic chạy nền / hạ tầng theo `## Background Logic Source Inventory` của `scout-report.md` (3 mục, đều `[SIGNAL_INFERRED]`): `lib/supabase/server.ts`, `app/auth/callback/route.ts`, `lib/supabase/proxy-session.ts`. Các `addEventListener` của giao diện (click ngoài, phím, `pageshow`, `visibilitychange`) là xử lý tương tác UI, đã bị scout loại, không phải BL.

**Code Format**: All codes MUST follow `BL###_NameSlug` format (e.g., BL001_ScheduledReport, BL002_EventListener)

**Behavior Logic Types** (canonical 10 — language-neutral):
- `scheduled-job` — Cron-like scheduled tasks
- `queue-worker` — Background job workers (async queue consumers)
- `event-listener` — Event-driven handlers
- `observer` — Model lifecycle hooks (created/updated/deleted)
- `mail` — Email sending logic
- `notification` — In-app / push notification logic
- `middleware` — Request/response processing chain (non-auth)
- `custom-command` — CLI commands
- `integration` — Third-party integrations (external API clients)
- `webhook` — Incoming/outgoing webhook handlers

**Note**: Auth/permission middleware is NOT included — see Permissions.md

**Note**: Feature and UserStory mapping is managed in FeatureList.md and UserStories.md. This document contains behavior logic items without direct feature/story references.

**Note**: Notification/event/webhook entries SHOULD include `**Payload**` (the async data shape) — this is where async contracts live, since api-contracts.md covers synchronous surfaces only.

**Note**: File-exchange BL types (`queue-worker`/`custom-command`/`integration` matching import/export vocabulary — `import, export, csv, xlsx, upload, download, bulk`) SHOULD include `**File Schema**` (the internal column/header contract of the exchanged file, sourced from `validateHeader()` / schema-array / column-mapping in source code) — the column schema of an exchanged file is settled here and nowhere else; screen-spec cross-references it rather than re-deriving.

> Ghi chú phạm vi: dự án không có job định kỳ, hàng đợi, mail, thông báo đẩy, observer hay webhook; chỉ có 3 mục hạ tầng bên dưới. Không có BL kiểu notification/event/webhook nên không có `Payload`; không có BL trao đổi tệp nên `File Schema` là N/A.

---

## Behavior Logic Index

BA-first summary — one row per `BL###` item, banded by **Type**. `Payload` and `File Schema` are the
two columns BAs ask about most (the async data shape and the exchanged-file contract, respectively);
both are settled here and nowhere else. Full source citations, module/route/data-model links, and the
Cardinality Contract that governs how these items are counted live in the **Dev Appendix** below.

### Type: integration

| Code | Name | Trigger | Payload | File Schema |
|------|------|---------|---------|--------------|
| BL001_SupabaseServerClient | Supabase Server Client | Gọi mỗi request từ Server Component, Server Action hoặc Route Handler cần Supabase (getAwards, getAwardDetails, getCurrentUser, signInWithGoogle, signOut, callback GET) | — | N/A — not a file-exchange type |
| BL002_OAuthCallbackExchange | OAuth Callback Exchange | `GET /auth/callback` khi Supabase/Google redirect trình duyệt về, kèm `?code=` hoặc `?error=` | — | N/A — not a file-exchange type |

### Type: middleware

| Code | Name | Trigger | Payload | File Schema |
|------|------|---------|---------|--------------|
| BL003_SessionRefreshProxy | Session Refresh Proxy | Mọi request khớp `config.matcher` (mọi page route trừ `/_next/*`, `__nextjs*` và đường có dấu chấm), chạy trước khi route render | — | N/A — not a file-exchange type |

---

## Dev Appendix

Source citations, module/route/data-model links, and the deterministic rules `validate_behavior_logic.py`
enforces. Every `BL###` heading below carries the same code as its Index row above.

### Cardinality Contract

Rules enforced by Wave 2b researcher and Wave 7a reviewer. Violations are critical.

- **Rule C1 — 1 BL per inventory entry**: Mode A stacks (folder convention): 1 file = 1 BL. Mode B stacks (annotation/decorator): 1 decorator hit = 1 BL (multiple hits in same file → multiple BL items). Aggregation is a critical violation.
- **Rule C2 — Source fields mandatory, single-valued**: Every BL item MUST include `**Source File**` (one relative path) and `**Source Symbol**` (one symbol — class name for Mode A; `ClassName::method` or `module::function` for Mode B). Multi-symbol forms forbidden in either field — split on `,`, `;`, or whitespace-bounded conjunction (` and `, ` & `, ` + `) and produce separate BL items. `/` is NOT a delimiter here (collides with composite-ref `SCR###/REG###` and path-shaped symbols); `+`/`&` require surrounding whitespace so language tokens like Swift `MyClass+Extension` and reference operators inside symbol names are not aggregated. Both fields must match the scout inventory entry 1-to-1.
- **Rule C3 — Unmatched BL warning**: A BL item whose Source File does not appear in the scout `## Background Logic Source Inventory` → warning; researcher must provide justification in Description (may be a legitimate `[SIGNAL_INFERRED]` case). Unmatched BL with no justification → critical.

### Inclusion/Exclusion Matrix (scout-side filter)

> **Precedence:** Applies at Wave 0 scout inventory only. Once an entry reaches `## Background Logic Source Inventory`, **Rule C1 dominates unconditionally** — researcher emits one BL per inventory entry. Scout MUST drop excluded files (e.g., abstract bases in `app/Mail/`) upfront; researcher does not filter post-inventory.

| Include | Exclude |
|---------|---------|
| All files/symbols in scout `## Background Logic Source Inventory` | Abstract base classes, traits, interfaces |
| `[SIGNAL_INFERRED]`-tagged inventory entries (with justification) | Vendor overrides and third-party library subclasses |
| | `*Test.php`, `*Spec.rb`, `test_*.py`, `*.test.ts` and all test files |
| | Files < 10 LOC (scaffolding/stubs) |
| | Auth/ACL/OAuth/JWT middleware (→ Permissions.md) |

**Scout responsibility:** Wave 0 must apply these filters before emitting `## Background Logic Source Inventory`. See `references/pipeline-w0-w5.md` Wave 0 step (5).

### Anti-Patterns: Aggregation Forbidden

Aggregating multiple source files into a single BL item violates Rule C1 and will be flagged critical by the reviewer.

- ❌ `BLnnn_EmailNotifications` — Description: "Covers all 25 Mail classes (WelcomeMail, InvoiceMail, ...)"
- ✅ `BLnnn_SendWelcomeMail` (Source File: `app/Mail/WelcomeMail.php`) + `BLnnn_SendInvoiceMail` (Source File: `app/Mail/InvoiceMail.php`) + ...

- ❌ `BLnnn_AuditLogWorkers` — Description: "Umbrella for 12 audit log job variants"
- ✅ One BL per Job class with individual Source File + Source Symbol fields

- ❌ `BLnnn_AuditEvents` — Source Symbol: `AuditService::onCreated, AuditService::onUpdated, AuditService::onDeleted` (comma-list forbidden)
- ✅ One BL per symbol: `BLnnn_AuditOnCreated` / `BLnnn_AuditOnUpdated` / `BLnnn_AuditOnDeleted`

---

## BL001_SupabaseServerClient: Supabase Server Client

**Type**: integration
**Trigger**: Gọi mỗi request từ Server Component, Server Action hoặc Route Handler cần Supabase (callers: `lib/awards/get-awards.ts:23`, `lib/awards/get-award-details.ts:29`, `lib/supabase/current-user.ts:38`, `app/login/actions.ts:39`, `lib/auth/actions.ts:21`, `app/auth/callback/route.ts:46`)
**Payload**: — (không phải loại event/notification)
**File Schema**: N/A — not a file-exchange type
**Source File**: lib/supabase/server.ts
**Source Symbol**: createClient

### Description

Tạo client Supabase phía server gắn với cookie của request hiện tại: `createClient()` lấy `url` và `publishableKey` từ `getSupabaseEnv()` (biến môi trường `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, chỉ đọc ở server) rồi gọi `createServerClient` của `@supabase/ssr` với `getAll` đọc cookie và `setAll` ghi cookie phiên (`lib/supabase/server.ts:19-50`). Đây là điểm vào duy nhất tới Supabase Auth và PostgREST cho mọi lời gọi phía server: đọc `awards`, đọc claims và `profiles.role`, bắt đầu OAuth, đăng xuất, đổi code lấy phiên.

Quy tắc: mỗi request tạo một client riêng, không dùng chung giữa các request (client giữ phiên và header cache một lần của request đó). Ghi cookie trong Server Component bị Next từ chối; lỗi đó được bỏ qua có chủ đích vì `proxy.ts` đã làm mới và ghi cookie trước khi render, còn ở Server Action / Route Handler thì ghi log `[supabase] writing session cookies failed` (`server.ts:37-45`). Header thứ hai của `setAll` (như `Cache-Control: no-store`) không áp dụng được ở đây (`server.ts:30-32`). Danh tính chỉ xác định qua `getClaims()`, không tin `getSession()` ở server.

[SIGNAL_INFERRED] — Intent matched: integration, client của dịch vụ ngoài (Supabase Auth và PostgREST). No-row reason: stack Next.js 16 App Router, bảng theo stack của `bl-source-patterns.md` không có dòng Next.js. Observed pattern: hàm async `createClient()` (khai báo công khai) trả `createServerClient(url, publishableKey, { cookieOptions, cookies: { getAll, setAll } })` (`server.ts:19-50`).

### Related Modules

- lib/supabase (`session-cookie-options.ts`, `supabase-env.ts`)
- lib/awards (`get-awards.ts`, `get-award-details.ts`)
- lib/supabase (`current-user.ts`)
- app/login (`actions.ts`)
- lib/auth (`actions.ts`)
- app/auth/callback (`route.ts`)

### Related Routes

- (GET) / — ROUTE001 (đọc `awards`, `getCurrentUser` khi render)
- (GET) /awards-information — ROUTE008 (đọc `awards` kèm `award_prizes`)
- (POST) / [Next-Action: signOut] — ROUTE002
- (POST) /login [Next-Action: signInWithGoogle] — ROUTE005
- (GET) /auth/callback — ROUTE007

### Related Data Models

- MODEL001_Award
- MODEL002_Profile

---

## BL002_OAuthCallbackExchange: OAuth Callback Exchange

**Type**: integration
**Trigger**: `GET /auth/callback` khi Supabase/Google redirect trình duyệt về sau bước đăng nhập (query `?code=…` hoặc `?error=…`)
**Payload**: — (không phải loại event/notification)
**File Schema**: N/A — not a file-exchange type
**Source File**: app/auth/callback/route.ts
**Source Symbol**: GET

### Description

Điểm quay về của luồng Login with Google (OAuth PKCE), là Route Handler `GET` (`app/auth/callback/route.ts:24`). `completeSignIn` quyết định kết quả: có `error` từ nhà cung cấp thì không bao giờ đổi `code` kèm theo (`access_denied` → `cancelled`, lỗi khác → `failed`, `route.ts:35-38`); không có `code` → `cancelled` (`route.ts:40-41`); có `code` thì gọi `supabase.auth.exchangeCodeForSession(code)` qua `createClient` (BL001_SupabaseServerClient) để đổi lấy phiên, cookie phiên ghi qua adapter cookie và Next gắn vào redirect (`route.ts:43-48`). Đổi lỗi hoặc ném lỗi → `failed`, ghi log `[auth/callback]`, không bao giờ trả 500 (`route.ts:49-59`).

Kết quả luôn là 302 tới đường dẫn cố định trên chính origin của request: thành công → `/` (SCR003_Homepage), còn lại → `/login?error=cancelled|failed` (SCR001_Login) (`route.ts:26-29`). Tham số `next`, `redirect_to` và mọi query khác bị bỏ qua nên không thành open redirect; redirect trên origin của request cũng giữ cookie phiên đúng host đã đặt cookie PKCE. Route này khớp `config.matcher` của proxy (matcher phủ mọi page route) nhưng `updateSession` trả tiếp ngay nên proxy không chạm vào request (`lib/supabase/proxy-session.ts:45`).

[SIGNAL_INFERRED] — Intent matched: integration, đổi mã OAuth phía server với Supabase Auth khi nhà cung cấp redirect về. No-row reason: stack Next.js 16 App Router, không có dòng Next.js trong bảng theo stack. Observed pattern: Route Handler hàm async `GET(request)` (khai báo công khai) → `completeSignIn` → `supabase.auth.exchangeCodeForSession(code)` → 302 (`route.ts:24-60`).

### Related Modules

- app/auth/callback
- lib/supabase (`server.ts`)
- app/login (`actions.ts` — phát sinh `redirectTo` tới `/auth/callback`)

### Related Routes

- (GET) /auth/callback — ROUTE007
- (POST) /login [Next-Action: signInWithGoogle] — ROUTE005 (khởi tạo luồng, đặt cookie PKCE)

### Related Data Models

- Không có (phiên nằm ở Supabase Auth, bảng `auth.users` là thực thể ngoài, không có MODEL###)

---

## BL003_SessionRefreshProxy: Session Refresh Proxy

**Type**: middleware
**Trigger**: Mọi request khớp `config.matcher = ["/((?!_next/|__nextjs|.*\\..*).*)"]` của `proxy.ts` (mọi page route; F005 mở rộng từ `["/", "/login", "/awards-information"]`), chạy trước khi route render (`proxy.ts:10,22-24`)
**Payload**: — (không phải loại event/notification)
**File Schema**: N/A — not a file-exchange type
**Source File**: lib/supabase/proxy-session.ts
**Source Symbol**: updateSession

### Description

Chuỗi xử lý request (Next.js 16 `proxy.ts`, trước đây là middleware) do `proxy(request)` uỷ quyền cho `updateSession(request)` (`proxy.ts:10-12`, `lib/supabase/proxy-session.ts:43`). Thứ tự: (1) `verifySession` tạo `createServerClient` trên cookie của request rồi gọi `supabase.auth.getClaims()` để làm mới token; cookie mới được gom vào `pending` (và phản chiếu lên request để Server Component cùng request đọc được token mới) (`proxy-session.ts:88-127`); (2) `loginRedirectTarget` quyết định chuyển hướng `/login` (`proxy-session.ts:129-135`), và F005 thêm cổng prelaunch `prelaunchGateTarget` (`proxy-session.ts:143-160`; đọc mốc song song với `getClaims()`, `:55-58`); (3) gắn cookie và header đã gom vào response, kể cả khi là redirect, nếu không sẽ mất token mới và gây vòng đăng xuất (`proxy-session.ts:70-76`). `/auth/callback` khớp matcher nhưng được trả tiếp ngay trước bước (1) (`proxy-session.ts:45`).

Quy tắc chuyển hướng theo phiên: chỉ `GET`/`HEAD` và `pathname === "/login"` khi đã có claims hợp lệ → 307 `/` (`proxy-session.ts:129-135`); `POST` (Server Action) luôn đi tiếp để không làm hỏng lời gọi `signOut` khi phiên đã hết hạn. Khi site đã mở không route nào bị chặn đối với khách: khách ở `/`, `/login` và `/awards-information` đi tiếp bình thường. Khi site còn khoá (F005), cổng prelaunch chuyển người không phải admin về `/countdown` và chuyển `/countdown` về `/` khi site đã mở; phần cổng (mốc fail open, vai trò fail closed, hạn chờ 2 giây, không retry) mô tả ở `permissions-matrix.md` (PERM014) và `docs/features/F005_CountdownPrelaunch/technical-spec.md`; file này chưa có BL riêng cho cổng và các hàm trong `lib/prelaunch/` (chạy `/tkm:rebuild-spec --artifact behavior-logic`). Mọi lỗi (không có claims, claims lỗi, mạng lỗi, thiếu hoặc sai biến môi trường Supabase) đều coi là khách, request đi tiếp, ghi log `[proxy]`, không bao giờ trả 500 (`proxy-session.ts:110-126`). Đích chuyển hướng là đường dẫn cố định trên origin của request, không dùng query nên không thành open redirect. Phần quy tắc chuyển hướng `/login` → `/` được mô tả ở Permissions; ở đây chỉ ghi phần làm mới phiên.

[SIGNAL_INFERRED] — Intent matched: middleware, chuỗi xử lý request chạy trước route, làm mới cookie phiên (token refresh là hạ tầng, không phải kiểm soát truy cập). No-row reason: stack Next.js 16 (`proxy.ts`, trước là `middleware.ts`), không có dòng Next.js trong bảng theo stack. Observed pattern: `proxy.ts` hàm async `proxy(request)` (khai báo công khai) với `config.matcher = ["/((?!_next/|__nextjs|.*\\..*).*)"]` uỷ quyền cho `updateSession(request)` (`proxy-session.ts:43-79`).

### Related Modules

- proxy.ts
- lib/supabase (`session-cookie-options.ts`, `supabase-env.ts`)

### Related Routes

- (GET) / — ROUTE001
- (POST) / [Next-Action: signOut] — ROUTE002
- (POST) / [Next-Action: setLocale] — ROUTE003
- (GET) /login — ROUTE004
- (POST) /login [Next-Action: signInWithGoogle] — ROUTE005
- (POST) /login [Next-Action: setLocale] — ROUTE006
- (GET) /awards-information — ROUTE008
- (POST) /awards-information [Next-Action: setLocale] — ROUTE009

---

## Summary

- **Total Behavior Logic Items**: 3
- **By Type**: custom-command: 0, event-listener: 0, integration: 2, mail: 0, middleware: 1, notification: 0, observer: 0, queue-worker: 0, scheduled-job: 0, webhook: 0

---

## Cross-Reference Validation

- [x] All BL### codes are unique
- [x] All BL### codes are referenced in UserStories.md (type=system)
- [x] All BL### codes are referenced in FeatureList.md
- [x] All related route references are valid (ROUTE### in RouteList — validate_feature_api_link.py enforces this)
- [x] All related data model references are valid (MODEL### in DataModel)
- [x] No orphaned behavior logic references
- [x] All BL items have Source File + Source Symbol fields (Rule C2)
- [x] All Source File paths match scout Background Logic Source Inventory entries (Rule C2/C3)

---

## Client-Side Logic

Document client-side patterns found in the codebase. For each, record: pattern type, trigger location (file:line), and brief description of what it does.

### Debounce / Throttle

**Extraction signature:** timer wrapper around a handler — `setTimeout`, `clearTimeout`, `debounce(fn, ms)`, `throttle(fn, ms)`, `useDebounce`, `useDebouncedCallback`

Có một mẫu throttle/debounce (F004): trình nghe `scroll` của menu giải thưởng chỉ đặt lại mục đang chọn tối đa một lần mỗi khung hình bằng `requestAnimationFrame` (`app/_components/awards-nav-behaviour/use-awards-nav-active-slug.ts:119-122`), và một hẹn giờ nhàn rỗi 150 ms (`:11,17-30`) nhả "ghim" mục vừa bấm khi không còn sự kiện cuộn (dự phòng cho trình duyệt không có `scrollend`; `scrollend`, `wheel`, `touchstart`, `keydown` cũng nhả ghim, `:128-131`). Ngoài ra không có mẫu nào khác. (`lib/countdown/use-countdown.ts:74` dùng `setTimeout` để căn nhịp đồng hồ cục bộ, không bọc handler người dùng.)

### Optimistic UI

**Extraction signature:** mutation applied immediately before API response, with rollback on error — `setState` before `await`, undo on catch, `optimisticUpdate`, `useOptimistic`

N/A — no optimistic UI patterns detected.

### Polling

**Extraction signature:** recurring API call — `setInterval`, recursive `setTimeout` calling an API, `usePolling`, `refetchInterval`

N/A — no polling patterns detected. (Đồng hồ đếm ngược chỉ tính lại giờ cục bộ bằng `setTimeout`, không gọi API.)

### Upload Progress

**Extraction signature:** file upload with progress tracking — `XHR.upload.onprogress`, `FormData` with `onUploadProgress`, `fetch` streaming, `useUpload`, `onProgress`

N/A — no upload progress patterns detected.

### Realtime (WebSocket / SSE / EventSource)

**Extraction signature:** persistent connection to server — `new WebSocket(...)`, `new EventSource(...)`, `useWebSocket`, `subscribe(channel)`, SSE `listen` handler, reconnect logic

N/A — no realtime patterns detected.
