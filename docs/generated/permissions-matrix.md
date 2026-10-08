# Permissions Matrix

**Project**: my-app (SAA 2025 — Sun* Annual Awards 2025)
**Generated**: 2026-10-08
**Analysis Scope**: Các điểm kiểm soát truy cập có thật trong code: `proxy.ts`, `lib/supabase/proxy-session.ts`, `app/auth/callback/route.ts`, `lib/supabase/current-user.ts`, `app/_components/header-behaviour/account-region.tsx`, `lib/auth/actions.ts`, `app/login/actions.ts`, `lib/i18n/actions.ts`, `lib/supabase/session-cookie-options.ts`, RLS trong `supabase/migrations/*.sql`. Route tham chiếu theo `route-list.md` (ROUTE001..007), màn hình theo `screen-list.md` (SCR001_Login, SCR003_Homepage và REG của nó).

> **Raw PERM### matrix.** Machine-generated inventory of every permission item with full
> per-permission detail. The plain-language curated view lives at
> [permissions.md](../system/permissions.md). Write THIS file FIRST, then derive the curated
> view from it.

**Code Format**: All codes MUST follow `PERM###_NameSlug` format (e.g., PERM001_ViewReports, PERM002_EditUsers)

**Permission Types**:
- `route-guard` - Route-level authorization middleware
- `screen-permission` - UI element visibility/enabled rules
- `action-permission` - Button/action execution rules
- `data-permission` - Field-level access control
- `role-based` - Role-based access control rules
- `resource-ownership` - Owner/resource relationship checks
- `field-permission` - Column/field visibility rules
- `api-scope` - API scope/token permission
- `feature-flag` - Runtime-evaluated flag from a feature flag service or config
- `experiment` - A/B test variant assignment gate
- `env-gate` - Hardcoded check against an environment variable (fixed at deploy time)
- `locale-gate` - UI branch conditioned on the active locale or language setting

**source field** (required for `feature-flag`, `experiment`, `env-gate`, `locale-gate` types only):
- **`source:`** — file:line where the gate is referenced (traceability anchor)

**Note**: Feature mapping is managed in FeatureList.md. This document contains permission items without direct feature references.

> Ghi chú phạm vi: chỉ ghi các kiểm soát **đã được thực thi trong code**. Hai mục UX-only (PERM003, PERM004) được đánh dấu rõ là chỉ ẩn/hiện giao diện, không phải rào chắn phía server. Dự án không có feature flag, experiment, locale-gate hay kiểm tra quyền sở hữu giữa người dùng. Các route `/profile`, `/admin`, `/awards-information`, `/sun-kudos`, `/standards` có liên kết nhưng chưa có page trong code nên không có PERM (xem mục "Gaps" ở cuối). `/todo` (SCR002_Todo) đã gỡ ngày 2026-10-08, không còn kiểm soát nào.

## Permissions Index

| Code | Name | Type | Enforced At |
|------|------|------|-------------|
| PERM001_LoginSessionRedirect | Chuyển người đã đăng nhập khỏi `/login` | route-guard | `proxy.ts:17-19`, `lib/supabase/proxy-session.ts:99-105` |
| PERM002_OAuthCallbackPublicEntry | Điểm quay về OAuth công khai, đích cố định | route-guard | `app/auth/callback/route.ts:24-60` |
| PERM005_SessionRoleResolution | Xác định danh tính và vai trò (fail closed) | role-based | `lib/supabase/current-user.ts:32-83` |
| PERM003_AccountRegionAuthState | Vùng tài khoản đổi giao diện theo trạng thái đăng nhập | screen-permission | `app/_components/header-behaviour/account-region.tsx:44-62` |
| PERM004_AdminMenuEntryVisibility | Mục Admin Dashboard chỉ hiện với admin (UX-only) | screen-permission | `app/_components/header-behaviour/account-region.tsx:69-73` |
| PERM006_SignOutOwnSession | Đăng xuất chỉ tác động session của người gọi | action-permission | `lib/auth/actions.ts:19-33` |
| PERM007_GoogleSignInPublicStart | Bắt đầu đăng nhập Google, công khai có kiểm tra origin | action-permission | `app/login/actions.ts:29-105` |
| PERM008_LocaleAllowList | Đổi ngôn ngữ chỉ nhận giá trị trong danh sách cho phép | action-permission | `lib/i18n/actions.ts:8-17` |
| PERM009_AwardsPublicReadServiceWrite | Bảng `awards`: đọc công khai, ghi chỉ `service_role` | data-permission | `supabase/migrations/20261008045411_create_awards.sql:26-36` |
| PERM010_ProfilesSelectOwnServiceWrite | Bảng `profiles`: chỉ đọc dòng của mình, ghi chỉ `service_role` | data-permission | `supabase/migrations/20261008045415_create_profiles.sql:27-63` |
| PERM011_SessionCookieSecureEnvGate | Cookie session chỉ `secure` ở production | env-gate | `lib/supabase/session-cookie-options.ts:11-16` |

---

## Permission Details

### PERM001_LoginSessionRedirect: Chuyển người đã đăng nhập khỏi `/login`

**Type**: route-guard
**Enforced At**: `proxy.ts:17-19` (matcher `["/", "/login"]`), `lib/supabase/proxy-session.ts:99-105` (`redirectTarget`)

#### Description

`proxy.ts` chạy `updateSession` cho `/` và `/login` (`proxy.ts:9-19`). `updateSession` làm mới phiên Supabase bằng `getClaims()` (xác thực chữ ký JWT, `proxy-session.ts:82`). Quy tắc chuyển hướng **duy nhất** của dự án: request `GET` hoặc `HEAD` tới `/login` mà claims hợp lệ thì trả 307 về `/` (`proxy-session.ts:100-102`). Không route nào bị chặn đối với khách; `/` luôn đi tiếp (`proxy-session.ts:18-21`). Request `POST` (Server Action) không bao giờ bị chuyển hướng để không làm hỏng lời gọi action (`proxy-session.ts:23-25,100`). Đích chuyển hướng là đường dẫn cố định trên cùng origin, không đọc từ query nên không có open redirect (`proxy-session.ts:27-28`). Thiếu/sai `SUPABASE_URL` hoặc `SUPABASE_PUBLISHABLE_KEY`, lỗi `getClaims` hay lỗi mạng đều coi là khách, ghi log, không trả 500 (`proxy-session.ts:54-96`). Đây là fail-safe vì khách không được cấp quyền nào. Proxy không phải rào chắn bảo vệ route: trang và action phải tự kiểm tra lại (`proxy-session.ts:23-25`).

#### Related Routes

- ROUTE001 (GET) `/` — đi tiếp với khách và người đã đăng nhập, chỉ làm mới cookie
- ROUTE004 (GET) `/login` — người đã đăng nhập bị 307 về `/`
- ROUTE005, ROUTE006 (POST) `/login` — không bị chuyển hướng
- ROUTE002, ROUTE003 (POST) `/` — không bị chuyển hướng

#### Related Screens

- SCR001_Login - Login (đích bị chuyển hướng khi đã có phiên)
- SCR003_Homepage - Homepage (đích chuyển hướng; khách vào tự do)

#### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Anonymous visitor | ✓ | `/login`: vào được, không chuyển hướng. `/`: vào được. Lỗi `getClaims`/thiếu env → vẫn coi là khách. |
| Authenticated user | ✗ (chỉ `/login`) | `GET|HEAD /login` → 307 `/`. `/` vào được. `POST` không bị chuyển hướng. |
| Authenticated admin | ✗ (chỉ `/login`) | Giống Authenticated user; vai trò không ảnh hưởng quy tắc này. |

#### Related Modules

- `proxy.ts`
- `lib/supabase/proxy-session.ts` (BL003_SessionRefreshProxy)
- `lib/supabase/supabase-env.ts`
- `lib/supabase/session-cookie-options.ts`

---

### PERM002_OAuthCallbackPublicEntry: Điểm quay về OAuth công khai, đích cố định

**Type**: route-guard
**Enforced At**: `app/auth/callback/route.ts:24-60`

#### Description

`/auth/callback` ngoài matcher của proxy và công khai theo thiết kế, vì đây là nơi session được tạo ra (`route.ts:24`). Lớp bảo vệ nằm ở chính handler: chỉ đổi `code` hợp lệ lấy session (`exchangeCodeForSession`, `route.ts:47`), `?error=` từ nhà cung cấp thì không bao giờ đổi `code` đi kèm (`route.ts:35-38`), thiếu `code` thì coi là huỷ (`route.ts:40-41`). Mọi nhánh trả 302 tới đích cố định `/` hoặc `/login?error=cancelled|failed` trên cùng origin; `next`, `redirect_to` và mọi query khác bị bỏ qua nên không thành open redirect (`route.ts:19-21,26-29`). Lỗi trao đổi hoặc exception không bao giờ ra 500 (`route.ts:53-59`). Phía Supabase, `redirectTo` còn bị đối chiếu với danh sách cho phép `additional_redirect_urls` trong `supabase/config.toml:150`.

#### Related Routes

- ROUTE007 (GET) `/auth/callback`

#### Related Screens

- SCR001_Login - Login (đích khi huỷ/lỗi)
- SCR003_Homepage - Homepage (đích khi thành công)

#### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Anonymous visitor | ✓ | Mở được route. Chỉ có `code` hợp lệ cùng PKCE verifier cookie mới tạo được session; còn lại 302 `/login?error=…`. |
| Authenticated user | ✓ | Không có chuyển hướng riêng; cùng quy tắc `code`. |
| Authenticated admin | ✓ | Như Authenticated user. |

#### Related Modules

- `app/auth/callback/route.ts` (BL002_OAuthCallbackExchange)
- `lib/supabase/server.ts` (BL001_SupabaseServerClient)

---

### PERM003_AccountRegionAuthState: Vùng tài khoản đổi giao diện theo trạng thái đăng nhập

**Type**: screen-permission
**Enforced At**: `app/_components/header-behaviour/account-region.tsx:44-62` (UX-only; không cấp hay chặn quyền)

#### Description

Phía server quyết định phần giao diện bên phải header theo `getCurrentUser()`. Khách thấy liên kết "Login" tới `/login` (`account-region.tsx:53`). Người đã đăng nhập thấy chuông thông báo (`account-region.tsx:44-48`) và nút tài khoản kèm menu (`account-region.tsx:55-61`). Chuông chỉ là giao diện, chưa có handler. Danh sách mục menu được lọc ở server nên vai trò không xuống trình duyệt (`account-menu.tsx:11-14`). Mỗi phần có `Suspense` riêng (`account-region.tsx:28,38`). Đây chỉ là hiển thị, không phải kiểm soát truy cập.

#### Related Routes

- ROUTE001 (GET) `/`
- ROUTE002 (POST) `/` [Next-Action: signOut] — gọi từ menu

#### Related Screens

- SCR003_Homepage/REG001_AccountRegion - AccountRegion

#### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Anonymous visitor | ✓ (liên kết Login) | Không thấy chuông và menu. |
| Authenticated user | ✓ (chuông + menu) | Menu có Profile và Đăng xuất. |
| Authenticated admin | ✓ (chuông + menu) | Như user, thêm mục Admin (PERM004). |

#### Related Modules

- `app/_components/header-behaviour/account-region.tsx`
- `app/_components/header-behaviour/account-menu.tsx`
- `app/_components/site/account-slot-parts.tsx`
- `lib/supabase/current-user.ts` (PERM005)

---

### PERM004_AdminMenuEntryVisibility: Mục Admin Dashboard chỉ hiện với admin (UX-only)

**Type**: screen-permission
**Enforced At**: `app/_components/header-behaviour/account-region.tsx:69-73` (`accountMenuItems`). UX-only: **không có kiểm tra phía server cho `/admin`**.

#### Description

Mục "Admin" trỏ `/admin` chỉ được thêm vào menu khi `role === "admin"` (`account-region.tsx:71`). Mọi vai trò khác, kể cả lỗi tra cứu (đã rơi về `user`), không thấy mục này. Việc ẩn mục chỉ là UX: `/admin` hiện chưa có page (`app/**/page.tsx` chỉ có `/` và `/login`), nên truy cập trực tiếp trả 404 cho mọi vai trò và không có guard phía server, kể cả proxy (matcher không gồm `/admin`). Comment trong code yêu cầu khi xây `/admin` phải tự kiểm tra lại vai trò ở server (`account-region.tsx:67-68`, `current-user.ts:26-27`). Mục Profile (`/profile`) cũng chưa có page.

#### Related Routes

- ROUTE001 (GET) `/` — nơi mục được render
- `/admin` — chưa có route trong `route-list.md` (không có ROUTE###)

#### Related Screens

- SCR003_Homepage/REG001_AccountRegion - AccountRegion

#### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Anonymous visitor | ✗ | Không có menu tài khoản. |
| Authenticated user | ✗ | Mục Admin không được thêm vào danh sách. |
| Authenticated admin | ✓ (chỉ hiển thị) | `profiles.role = 'admin'`. Bấm vào dẫn tới `/admin` chưa xây (404). |

#### Related Modules

- `app/_components/header-behaviour/account-region.tsx`
- `lib/supabase/current-user.ts` (PERM005)
- MODEL002_Profile

---

### PERM005_SessionRoleResolution: Xác định danh tính và vai trò (fail closed)

**Type**: role-based
**Enforced At**: `lib/supabase/current-user.ts:32-83` (`getCurrentUser`, `readRole`)

#### Description

Nguồn sự thật duy nhất của danh tính và vai trò phía server. Danh tính chỉ lấy từ JWT claims đã xác thực (`getClaims()`, không dùng `getSession()`; `current-user.ts:20-21,38`). Vai trò chỉ lấy từ `public.profiles.role` đọc bằng phiên của chính người dùng dưới RLS, không bao giờ từ `user_metadata` (`current-user.ts:21-23,63-67`). Chỉ giá trị chữ `"admin"` mới thành `admin` (`current-user.ts:77`). Fail closed: không có claims, lỗi auth hay exception → `null` (khách) (`current-user.ts:39-57`); không có dòng profile, lỗi tra cứu hay giá trị lạ → `"user"`, không bao giờ `"admin"` (`current-user.ts:68-82`). Kết quả được `cache()` theo request. Đọc trực tiếp bảng nên đổi vai trò có hiệu lực ở request kế tiếp. Chỉ `AccountRegion` đang dùng hàm này (`account-region.tsx:45,51`); chưa có trang hay action nào ra quyết định chặn dựa trên nó.

#### Related Routes

- ROUTE001 (GET) `/` — nơi hàm được gọi (qua vùng tài khoản)

#### Related Screens

- SCR003_Homepage/REG001_AccountRegion - AccountRegion

#### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Anonymous visitor | ✓ (kết quả `null`) | Không có claims hợp lệ, `getClaims` lỗi, hoặc exception. |
| Authenticated user | ✓ (kết quả `user`) | Claims hợp lệ và `profiles.role = 'user'`; cũng là kết quả khi thiếu dòng profile, lỗi đọc, hay giá trị khác `"admin"`. |
| Authenticated admin | ✓ (kết quả `admin`) | Claims hợp lệ và `profiles.role = 'admin'` đọc được dưới RLS. |

#### Related Modules

- `lib/supabase/current-user.ts`
- `lib/supabase/server.ts` (BL001_SupabaseServerClient)
- MODEL002_Profile (cột `role`, DISC-001)

---

### PERM006_SignOutOwnSession: Đăng xuất chỉ tác động session của người gọi

**Type**: action-permission
**Enforced At**: `lib/auth/actions.ts:19-33` (Server Action `signOut`)

#### Description

Server Action không kiểm tra session trước: nó chỉ làm việc trên cookie session của chính người gọi nên không cần phân quyền; không có session thì là no-op (`actions.ts:10-14`). Dùng `signOut({ scope: "local" })`, chỉ kết thúc session ở trình duyệt này, không thu hồi session ở thiết bị khác (`actions.ts:22,16-18`). Lỗi chỉ ghi log; luôn `redirect("/login")` (`actions.ts:23-32`). Do là `POST`, proxy không chuyển hướng action này (PERM001).

#### Related Routes

- ROUTE002 (POST) `/` [Next-Action: signOut]

#### Related Screens

- SCR003_Homepage/REG001_AccountRegion - AccountRegion (nút Đăng xuất trong menu)

#### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Anonymous visitor | ✓ | No-op rồi chuyển về `/login`; không tác động ai khác. |
| Authenticated user | ✓ | Chỉ xoá session cục bộ của chính mình. |
| Authenticated admin | ✓ | Như Authenticated user. |

#### Related Modules

- `lib/auth/actions.ts`
- `lib/supabase/server.ts` (BL001_SupabaseServerClient)

---

### PERM007_GoogleSignInPublicStart: Bắt đầu đăng nhập Google, công khai có kiểm tra origin

**Type**: action-permission
**Enforced At**: `app/login/actions.ts:29-105` (Server Action `signInWithGoogle`)

#### Description

Công khai theo thiết kế: không cần session để bắt đầu đăng nhập (`actions.ts:24`). Action dựng origin của URL callback từ header `Origin` (chỉ `http:`/`https:`) hoặc từ `x-forwarded-host`/`host` đã đối chiếu `HOST_PATTERN` (`actions.ts:71-105`). Không có origin hợp lệ thì trả `{ error: "failed" }` thay vì đoán (`actions.ts:34-37`). Next còn chặn Server Action có `Origin` khác `Host` (CSRF, `actions.ts:64-67`), và Supabase đối chiếu `redirectTo` với `additional_redirect_urls` (`supabase/config.toml:150`). Mọi lỗi trả `{ error: "failed" }`. Mọi tài khoản Google đều được phép đăng nhập: không có allow-list email hay tên miền; `[auth] enable_signup = true` (`supabase/config.toml:163`) nên tài khoản mới tự tạo ở lần đăng nhập đầu, mặc định role `user` (PERM010).

#### Related Routes

- ROUTE005 (POST) `/login` [Next-Action: signInWithGoogle]

#### Related Screens

- SCR001_Login - Login (nút Google)

#### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Anonymous visitor | ✓ | Cần header Origin/Host hợp lệ; chuyển trình duyệt sang URL authorize của Google. |
| Authenticated user | ✓ | Không bị chặn ở tầng action (người đã đăng nhập không thấy `/login` vì PERM001, nhưng POST trực tiếp không bị từ chối). |
| Authenticated admin | ✓ | Như Authenticated user. |

#### Related Modules

- `app/login/actions.ts`
- `lib/supabase/server.ts` (BL001_SupabaseServerClient)
- `supabase/config.toml` (`[auth.external.google]`, `additional_redirect_urls`)

---

### PERM008_LocaleAllowList: Đổi ngôn ngữ chỉ nhận giá trị trong danh sách cho phép

**Type**: action-permission
**Enforced At**: `lib/i18n/actions.ts:8-17`, danh sách ở `lib/i18n/locales.ts:1-11`

#### Description

Server Action `setLocale` công khai; dữ liệu từ client được kiểm bằng allow-list `{vi, en}` (`isLocale`) trước khi ghi cookie `NEXT_LOCALE`, giá trị khác bị bỏ qua không báo lỗi (`actions.ts:9-10`). Cookie: `path: "/"`, `maxAge` một năm, `sameSite: "lax"` (`actions.ts:12-16`). Đây là kiểm tra đầu vào, không liên quan đến vai trò. Dự án không có locale-gate (không có nhánh quyền theo ngôn ngữ).

#### Related Routes

- ROUTE003 (POST) `/` [Next-Action: setLocale]
- ROUTE006 (POST) `/login` [Next-Action: setLocale]

#### Related Screens

- SCR001_Login - Login (LanguageSelector)
- SCR003_Homepage - Homepage (LanguageSelector)

#### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Anonymous visitor | ✓ | `locale` ∈ {`vi`, `en`}; giá trị khác bị bỏ qua. |
| Authenticated user | ✓ | Như trên. |
| Authenticated admin | ✓ | Như trên. |

#### Related Modules

- `lib/i18n/actions.ts`
- `lib/i18n/locales.ts`
- `lib/i18n/get-locale.ts`

---

### PERM009_AwardsPublicReadServiceWrite: Bảng `awards`: đọc công khai, ghi chỉ `service_role`

**Type**: data-permission
**Enforced At**: `supabase/migrations/20261008045411_create_awards.sql:26-36` (RLS bật; policy `awards_select_public`; GRANT tường minh)

#### Description

RLS bật trên `public.awards`. Policy `awards_select_public` cho `anon` và `authenticated` đọc mọi dòng (`using (true)`, `:28-30`). Quyền được viết tường minh: thu hồi hết rồi cấp `select` cho `anon, authenticated` và toàn quyền DML cho `service_role` (`:34-36`). Không có policy hay GRANT `insert/update/delete/truncate` cho người dùng nên không có đường ghi từ app; dữ liệu nạp qua `supabase/seeds/common/01-awards.sql` bằng `service_role`. Dữ liệu là công khai nên ở `/` khách cũng thấy lưới giải thưởng.

#### Related Routes

- ROUTE001 (GET) `/` — đọc bảng qua `getAwards`

#### Related Screens

- SCR003_Homepage/REG002_AwardsGrid - AwardsGrid

#### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| anon | ✓ (select) | Mọi dòng. Không có insert/update/delete. |
| authenticated | ✓ (select) | Mọi dòng. Không có insert/update/delete. |
| service_role | ✓ (select, insert, update, delete) | Bỏ qua RLS; dùng cho seed và vận hành. |

#### Related Modules

- `lib/awards/get-awards.ts`
- MODEL001_Award

---

### PERM010_ProfilesSelectOwnServiceWrite: Bảng `profiles`: chỉ đọc dòng của mình, ghi chỉ `service_role`

**Type**: data-permission
**Enforced At**: `supabase/migrations/20261008045415_create_profiles.sql:27-63` (RLS, policy `profiles_select_own`, GRANT, trigger `on_auth_user_created`)

#### Description

RLS bật trên `public.profiles`. Policy `profiles_select_own` chỉ cho `authenticated` đọc dòng có `auth.uid() = id` (`:29-31`). `anon` không có GRANT. `authenticated` chỉ có `select`; không có insert/update/delete nên người dùng không tự nâng quyền được (`:33-37`). Ràng buộc `check (role in ('user','admin'))`, mặc định `'user'` (`:20`). Dòng profile do trigger `handle_new_user` (`security definer`, `search_path = ''`) tạo khi có `auth.users` mới, vai trò luôn lấy giá trị mặc định, không lấy từ metadata (`:39-58`); hàm bị thu hồi `execute` khỏi `public, anon, authenticated` (`:54`). Việc cấp hay thu hồi `admin` chưa có giao diện: chỉ `service_role` hoặc SQL trực tiếp. Ứng dụng không đọc `SUPABASE_SECRET_KEY` (chỉ E2E dùng để dựng tài khoản admin thử).

#### Related Routes

- ROUTE001 (GET) `/` — đọc `role` qua `getCurrentUser`

#### Related Screens

- SCR003_Homepage/REG001_AccountRegion - AccountRegion

#### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| anon | ✗ | Không có GRANT. |
| authenticated | ✓ (select) | Chỉ dòng có `id = auth.uid()`. Không insert/update/delete. |
| service_role | ✓ (select, insert, update, delete) | Bỏ qua RLS; trigger tạo profile và đổi vai trò đi qua đường này. |

#### Related Modules

- `lib/supabase/current-user.ts` (PERM005)
- MODEL002_Profile (DISC-001 `role`)

---

### PERM011_SessionCookieSecureEnvGate: Cookie session chỉ `secure` ở production

**Type**: env-gate
**Enforced At**: `lib/supabase/session-cookie-options.ts:11-16`

#### Description

Thuộc tính của mọi cookie `@supabase/ssr` ghi ra (mảnh session và PKCE verifier), dùng chung cho proxy và client server. `httpOnly: true`, `sameSite: "lax"`, `path: "/"` cố định. `secure` bật theo `NODE_ENV`; giá trị chốt lúc triển khai, không đổi ở runtime. Ứng dụng không có Supabase client phía trình duyệt nên script trang không bao giờ cần token.

**source:** `lib/supabase/session-cookie-options.ts:13` (`secure: process.env.NODE_ENV === "production"`)
**effect:** production → cookie chỉ gửi qua HTTPS; dev/test → bỏ `secure` để `http://localhost` vẫn hoạt động

#### Related Modules

- `lib/supabase/session-cookie-options.ts`
- `lib/supabase/proxy-session.ts` (PERM001)
- `lib/supabase/server.ts` (BL001_SupabaseServerClient)

---

## Summary

- **Total Permission Items**: 11
- **By Type**: route-guard: 2, screen-permission: 2, action-permission: 3, data-permission: 2, role-based: 1, resource-ownership: 0, field-permission: 0, api-scope: 0, feature-flag: 0, experiment: 0, env-gate: 1, locale-gate: 0
- **UX-only (không phải rào chắn server)**: PERM003, PERM004
- **Authorization model**: RBAC đơn giản (`profiles.role` ∈ {`user`, `admin`}) cộng RLS theo vai trò Postgres; không có phân quyền theo sở hữu giữa người dùng.

### Gaps (ghi nhận, không phải PERM)

- `/admin` chưa có page và chưa có kiểm tra vai trò phía server; hiện chỉ có việc ẩn mục menu (PERM004). Khi xây phải gọi `getCurrentUser()` và từ chối nếu không phải `admin` (yêu cầu từ code: `current-user.ts:26-27`).
- `/profile`, `/awards-information`, `/sun-kudos`, `/standards` có liên kết nhưng chưa có page, truy cập hiện trả 404; chưa có quy tắc quyền để ghi.
- `getCurrentUser()` mới chỉ phục vụ vùng tài khoản; chưa trang hay action nào chặn truy cập dựa trên vai trò.

---

## Cross-Reference Validation

- [x] All PERM### codes are unique
- [x] All PERM### codes are referenced in FeatureList.md
- [x] All related route references are valid (ROUTE### in RouteList: ROUTE001..007 đều tồn tại; `/admin` chỉ ghi chú là chưa có route)
- [x] All related screen references are valid (SCR001_Login, SCR003_Homepage, SCR003_Homepage/REG001_AccountRegion, SCR003_Homepage/REG002_AwardsGrid theo ScreenList; PERM003/PERM004 nhắm vùng REG001_AccountRegion — chỉ ẩn/hiện giao diện, UX-only)
- [x] All related module references are valid
- [x] No orphaned permission references

---

## Client-Side Gates

Các gate không đi qua kiểm tra role/permission phía server. Mỗi mục đều có `source:` hoặc đã được ghi rõ là UX-only.

| Gate type | Mục | source | Ghi chú |
|-----------|-----|--------|---------|
| env-gate | PERM011_SessionCookieSecureEnvGate | `lib/supabase/session-cookie-options.ts:13` | `secure` theo `NODE_ENV === "production"` |
| screen-permission (UX-only) | PERM003_AccountRegionAuthState | `account-region.tsx:44-62` | Hiển thị theo trạng thái đăng nhập |
| screen-permission (UX-only) | PERM004_AdminMenuEntryVisibility | `account-region.tsx:69-73` | Chỉ ẩn/hiện mục menu, không có guard cho `/admin` |
| feature-flag / experiment / locale-gate | — | — | Không có trong code |

> Ghi chú: `SAA_COUNTDOWN_TARGET` (cấu hình đếm ngược, `home-content.tsx:31`) chỉ là dữ liệu hiển thị, không quyết định quyền truy cập nên không ghi làm env-gate. Việc chọn nội dung theo ngôn ngữ (`NEXT_LOCALE`) là chọn bản dịch, không phải cổng quyền (xem PERM008).
