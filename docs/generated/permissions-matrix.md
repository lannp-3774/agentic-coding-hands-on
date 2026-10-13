# Permissions Matrix

**Project**: my-app (SAA 2025 — Sun* Annual Awards 2025)
**Generated**: 2026-10-08
**Analysis Scope**: Các điểm kiểm soát truy cập có thật trong code: `proxy.ts`, `lib/supabase/proxy-session.ts`, `app/auth/callback/route.ts`, `lib/supabase/current-user.ts`, `app/_components/header-behaviour/account-region.tsx`, `lib/auth/actions.ts`, `app/login/actions.ts`, `lib/i18n/actions.ts`, `lib/supabase/session-cookie-options.ts`, RLS trong `supabase/migrations/*.sql`. Route tham chiếu theo `route-list.md` (ROUTE001..009), màn hình theo `screen-list.md` (SCR001_Login, SCR003_Homepage, SCR004_AwardsInformation và REG của chúng).

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

> Ghi chú phạm vi: chỉ ghi các kiểm soát **đã được thực thi trong code**. Hai mục UX-only (PERM003, PERM004) được đánh dấu rõ là chỉ ẩn/hiện giao diện, không phải rào chắn phía server. Dự án không có feature flag, experiment, locale-gate hay kiểm tra quyền sở hữu giữa người dùng. Các route `/profile`, `/admin`, `/standards`, `/sun-kudos/[id]`, `/profiles/[id]` có liên kết nhưng chưa có page trong code nên không có PERM (xem mục "Gaps" ở cuối). Từ 2026-10-13 `/sun-kudos` và `GET /api/kudos` đã có (PERM015..PERM019; cổng prelaunch PERM014 áp cho hai `GET` này như mọi page route). `/todo` (SCR002_Todo) đã gỡ ngày 2026-10-08, không còn kiểm soát nào.

## Permissions Index

| Code | Name | Type | Enforced At |
|------|------|------|-------------|
| PERM001_LoginSessionRedirect | Chuyển người đã đăng nhập khỏi `/login` | route-guard | `proxy.ts:22-24`, `lib/supabase/proxy-session.ts:129-135` |
| PERM002_OAuthCallbackPublicEntry | Điểm quay về OAuth công khai, đích cố định | route-guard | `app/auth/callback/route.ts:24-60` |
| PERM005_SessionRoleResolution | Xác định danh tính và vai trò (fail closed) | role-based | `lib/supabase/current-user.ts:33-84` |
| PERM003_AccountRegionAuthState | Vùng tài khoản đổi giao diện theo trạng thái đăng nhập | screen-permission | `app/_components/header-behaviour/account-region.tsx:44-62` |
| PERM004_AdminMenuEntryVisibility | Mục Admin Dashboard chỉ hiện với admin (UX-only) | screen-permission | `app/_components/header-behaviour/account-region.tsx:69-73` |
| PERM006_SignOutOwnSession | Đăng xuất chỉ tác động session của người gọi | action-permission | `lib/auth/actions.ts:19-33` |
| PERM007_GoogleSignInPublicStart | Bắt đầu đăng nhập Google, công khai có kiểm tra origin | action-permission | `app/login/actions.ts:29-105` |
| PERM008_LocaleAllowList | Đổi ngôn ngữ chỉ nhận giá trị trong danh sách cho phép | action-permission | `lib/i18n/actions.ts:8-17` |
| PERM009_AwardsPublicReadServiceWrite | Bảng `awards`: đọc công khai, ghi chỉ `service_role` | data-permission | `supabase/migrations/20261008045411_create_awards.sql:26-36` |
| PERM010_ProfilesSelectOwnServiceWrite | Bảng `profiles`: chỉ đọc dòng của mình, ghi chỉ `service_role` | data-permission | `supabase/migrations/20261008045415_create_profiles.sql:27-63` |
| PERM011_SessionCookieSecureEnvGate | Cookie session chỉ `secure` ở production | env-gate | `lib/supabase/session-cookie-options.ts:11-16` |
| PERM012_AwardPrizesPublicReadServiceWrite | Bảng `award_prizes`: đọc công khai, ghi chỉ `service_role` | data-permission | `supabase/migrations/20261009021753_add_award_details_and_prizes.sql:46-57` |
| PERM013_SiteSettingsPublicReadServiceWrite | Bảng `site_settings`: đọc công khai, ghi chỉ `service_role` | data-permission | `supabase/migrations/20261009083754_create_site_settings.sql:31-43` |
| PERM014_PrelaunchGate | Cổng prelaunch: trước mốc chỉ admin vượt cổng (fail open phía mốc, fail closed phía vai trò) | route-guard | `proxy.ts:22-24`, `lib/supabase/proxy-session.ts:143-160`, `lib/prelaunch/prelaunch-gate-decision.ts:40-56` |
| PERM015_KudosBoardPublicReadServiceWrite | Bảng của bảng Kudos (`departments`, `sunners` theo cột, `kudos`, `hashtags`, `kudos_hashtags`, `kudos_images`, `special_days`): đọc công khai, ghi chỉ `service_role` | data-permission | `supabase/migrations/20261012072146_create_kudos_board.sql:104-129`, `supabase/migrations/20261012072217_create_kudos_likes.sql:47-52,63-67` |
| PERM016_SunnerPrivateColumnsOwnRowRpc | `sunners.email`, `sunners.user_id` không mở cho client; hàng của chính mình chỉ qua `get_my_sunner()`; avatar chỉ đường dẫn cục bộ | field-permission | `supabase/migrations/20261012072146_create_kudos_board.sql:127-128,206-225`, `supabase/migrations/20261013060400_restrict_sunner_avatars_and_index_department.sql:66-73` |
| PERM017_KudosLikesOwnerOnly | `kudos_likes`: chỉ chủ lượt thích đọc, chèn (2 cột), xoá; người gửi không tự thích; trọng số do trigger | resource-ownership | `supabase/migrations/20261012072217_create_kudos_likes.sql:54-59,63-67,71-93` |
| PERM018_SecretBoxesOpenedPublicUnopenedOwner | `secret_boxes`: hộp đã mở đọc công khai, hộp chưa mở chỉ chủ hộp, không client ghi | resource-ownership | `supabase/migrations/20261012072258_create_secret_boxes.sql:36-49` |
| PERM019_KudosHeartActionSessionCheck | `likeKudos`/`unlikeKudos`: id kiểm định dạng, người dùng lấy từ claims đã xác minh, khách bị từ chối phía máy chủ | action-permission | `lib/kudos/kudos-heart-actions.ts:52-82` |

---

## Permission Details

### PERM001_LoginSessionRedirect: Chuyển người đã đăng nhập khỏi `/login`

**Type**: route-guard
**Enforced At**: `proxy.ts:22-24` (matcher literal phủ định phủ mọi page route; F005 mở rộng từ `["/", "/login", "/awards-information"]`), `lib/supabase/proxy-session.ts:129-135` (`loginRedirectTarget`)

#### Description

`proxy.ts` chạy `updateSession` cho mọi page route (`proxy.ts:10-24`; matcher literal `"/((?!_next/|__nextjs|.*\\..*).*)"` loại `/_next/*`, `__nextjs*` và đường có dấu chấm; F005 thay matcher cũ, `/awards-information` đã được F004 thêm ngày 2026-10-09 chỉ để làm mới phiên). `/auth/callback` khớp matcher nhưng `updateSession` trả tiếp ngay, không làm mới phiên (`proxy-session.ts:45`). `updateSession` làm mới phiên Supabase bằng `getClaims()` (xác thực chữ ký JWT, `proxy-session.ts:110`). Quy tắc chuyển hướng **theo phiên** duy nhất: request `GET` hoặc `HEAD` tới `/login` mà claims hợp lệ thì trả 307 về `/` (`proxy-session.ts:129-135`); cổng prelaunch là quy tắc chuyển hướng riêng, xem PERM014. Khi site đã mở không route nào bị chặn đối với khách; `/` luôn đi tiếp (`proxy-session.ts:13-16`). Request `POST` (Server Action) không bao giờ bị chuyển hướng để không làm hỏng lời gọi action (`proxy-session.ts:35-40,130,162-164`). Đích chuyển hướng là đường dẫn cố định trên cùng origin, không đọc từ query nên không có open redirect (`proxy-session.ts:41-42`). Thiếu/sai `SUPABASE_URL` hoặc `SUPABASE_PUBLISHABLE_KEY`, lỗi `getClaims` hay lỗi mạng đều coi là khách, ghi log, không trả 500 (`proxy-session.ts:81-127`). Đây là fail-safe vì khách không được cấp quyền nào. Proxy không phải rào chắn bảo vệ route: trang và action phải tự kiểm tra lại (`proxy-session.ts:35-37`).

#### Related Routes

- ROUTE001 (GET) `/` — đi tiếp với khách và người đã đăng nhập, chỉ làm mới cookie
- ROUTE008 (GET) `/awards-information` — như ROUTE001: đi tiếp với mọi người, chỉ làm mới cookie
- ROUTE004 (GET) `/login` — người đã đăng nhập bị 307 về `/`
- ROUTE005, ROUTE006 (POST) `/login` — không bị chuyển hướng
- ROUTE002, ROUTE003 (POST) `/` — không bị chuyển hướng
- ROUTE009 (POST) `/awards-information` — không bị chuyển hướng
- ROUTE010 (GET) `/countdown` — đi qua `updateSession` như mọi page route (quy tắc `/login` không áp dụng)

#### Related Screens

- SCR001_Login - Login (đích bị chuyển hướng khi đã có phiên)
- SCR003_Homepage - Homepage (đích chuyển hướng; khách vào tự do)
- SCR004_AwardsInformation - Awards Information (công khai; proxy chỉ làm mới phiên, không chuyển hướng)

#### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Anonymous visitor | ✓ | `/login`: vào được, không chuyển hướng. `/` và `/awards-information`: vào được. Lỗi `getClaims`/thiếu env → vẫn coi là khách. |
| Authenticated user | ✗ (chỉ `/login`) | `GET|HEAD /login` → 307 `/`. `/` và `/awards-information` vào được. `POST` không bị chuyển hướng. |
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

`/auth/callback` khớp matcher của proxy nhưng `updateSession` trả tiếp ngay (`lib/supabase/proxy-session.ts:45`: không làm mới phiên, không cổng prelaunch), và công khai theo thiết kế, vì đây là nơi session được tạo ra (`route.ts:24`). Lớp bảo vệ nằm ở chính handler: chỉ đổi `code` hợp lệ lấy session (`exchangeCodeForSession`, `route.ts:47`), `?error=` từ nhà cung cấp thì không bao giờ đổi `code` đi kèm (`route.ts:35-38`), thiếu `code` thì coi là huỷ (`route.ts:40-41`). Mọi nhánh trả 302 tới đích cố định `/` hoặc `/login?error=cancelled|failed` trên cùng origin; `next`, `redirect_to` và mọi query khác bị bỏ qua nên không thành open redirect (`route.ts:19-21,26-29`). Lỗi trao đổi hoặc exception không bao giờ ra 500 (`route.ts:53-59`). Phía Supabase, `redirectTo` còn bị đối chiếu với danh sách cho phép `additional_redirect_urls` trong `supabase/config.toml:150`.

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

Mục "Admin" trỏ `/admin` chỉ được thêm vào menu khi `role === "admin"` (`account-region.tsx:71`). Mọi vai trò khác, kể cả lỗi tra cứu (đã rơi về `user`), không thấy mục này. Việc ẩn mục chỉ là UX: `/admin` hiện chưa có page (`app/**/page.tsx` chỉ có `/` và `/login`), nên truy cập trực tiếp trả 404 cho mọi vai trò và không có guard phía server, kể cả proxy (matcher không gồm `/admin`). Comment trong code yêu cầu khi xây `/admin` phải tự kiểm tra lại vai trò ở server (`account-region.tsx:67-68`, `current-user.ts:27-28`). Mục Profile (`/profile`) cũng chưa có page.

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
**Enforced At**: `lib/supabase/current-user.ts:33-84` (`getCurrentUser`, `readRole`), `lib/supabase/user-role.ts:13-15` (`toUserRole`, dùng chung với PERM014)

#### Description

Nguồn sự thật duy nhất của danh tính và vai trò phía server. Danh tính chỉ lấy từ JWT claims đã xác thực (`getClaims()`, không dùng `getSession()`; `current-user.ts:21-22,39`). Vai trò chỉ lấy từ `public.profiles.role` đọc bằng phiên của chính người dùng dưới RLS, không bao giờ từ `user_metadata` (`current-user.ts:22-24,65-69`). Chỉ giá trị chữ `"admin"` mới thành `admin`: hàm thuần `toUserRole` (`user-role.ts:13-15`) được gọi ở `current-user.ts:78`. Fail closed: không có claims, lỗi auth hay exception → `null` (khách) (`current-user.ts:40-58`); không có dòng profile, lỗi tra cứu hay giá trị lạ → `"user"`, không bao giờ `"admin"` (`current-user.ts:70-83`). Kết quả được `cache()` theo request. Đọc trực tiếp bảng nên đổi vai trò có hiệu lực ở request kế tiếp. Chỉ `AccountRegion` đang dùng hàm này (`account-region.tsx:45,51`); chưa có trang hay action nào ra quyết định chặn dựa trên nó.

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
- ROUTE009 (POST) `/awards-information` [Next-Action: setLocale]
- ROUTE014 (POST) `/sun-kudos` [Next-Action: setLocale]

#### Related Screens

- SCR001_Login - Login (LanguageSelector)
- SCR003_Homepage - Homepage (LanguageSelector)
- SCR004_AwardsInformation - Awards Information (LanguageSelector)
- SCR006_SunKudosLiveBoard - Sun* Kudos - Live board (LanguageSelector)

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

RLS bật trên `public.awards`. Policy `awards_select_public` cho `anon` và `authenticated` đọc mọi dòng (`using (true)`, `:28-30`). Quyền được viết tường minh: thu hồi hết rồi cấp `select` cho `anon, authenticated` và toàn quyền DML cho `service_role` (`:34-36`). Không có policy hay GRANT `insert/update/delete/truncate` cho người dùng nên không có đường ghi từ app; dữ liệu nạp qua `supabase/seeds/common/01-awards.sql` bằng `service_role`. Dữ liệu là công khai nên ở `/` khách cũng thấy lưới giải thưởng. Từ 2026-10-09 bảng có thêm năm cột chi tiết (`detail_description_vi`, `quantity`, `unit_vi`, `unit_en`, `nav_label`, `supabase/migrations/20261009021753_add_award_details_and_prizes.sql:26-31`); migration chỉ thêm cột, không đổi policy hay GRANT nên các cột mới được đọc công khai theo cùng policy `awards_select_public`; trang chủ chọn cột tường minh nên không đọc chúng, còn `/awards-information` đọc chúng qua `getAwardDetails`.

#### Related Routes

- ROUTE001 (GET) `/` — đọc bảng qua `getAwards`
- ROUTE008 (GET) `/awards-information` — đọc bảng kèm `award_prizes` qua `getAwardDetails`

#### Related Screens

- SCR003_Homepage/REG002_AwardsGrid - AwardsGrid
- SCR004_AwardsInformation - Awards Information

#### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| anon | ✓ (select) | Mọi dòng. Không có insert/update/delete. |
| authenticated | ✓ (select) | Mọi dòng. Không có insert/update/delete. |
| service_role | ✓ (select, insert, update, delete) | Bỏ qua RLS; dùng cho seed và vận hành. |

#### Related Modules

- `lib/awards/get-awards.ts`
- `lib/awards/get-award-details.ts`
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

### PERM012_AwardPrizesPublicReadServiceWrite: Bảng `award_prizes`: đọc công khai, ghi chỉ `service_role`

**Type**: data-permission
**Enforced At**: `supabase/migrations/20261009021753_add_award_details_and_prizes.sql:46-57` (RLS bật; policy `award_prizes_select_public`; GRANT tường minh)

#### Description

Cùng mẫu với PERM009. RLS bật trên `public.award_prizes` (`:46`); policy `award_prizes_select_public` cho `anon` và `authenticated` đọc mọi dòng (`using (true)`, `:48-50`). Quyền viết tường minh: thu hồi hết rồi cấp `select` cho `anon, authenticated` và toàn quyền DML cho `service_role` (`:55-57`); không có policy hay GRANT ghi cho người dùng nên không có đường ghi từ app. Dữ liệu (các mức giá trị của từng giải) là công khai nên khách đọc được ở `/awards-information`. Dữ liệu nạp qua `supabase/seeds/common/02-award-details.sql` bằng `service_role`.

#### Related Routes

- ROUTE008 (GET) `/awards-information` — đọc bảng bằng truy vấn lồng từ `awards` qua `getAwardDetails`

#### Related Screens

- SCR004_AwardsInformation - Awards Information

#### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| anon | ✓ (select) | Mọi dòng. Không có insert/update/delete. |
| authenticated | ✓ (select) | Mọi dòng. Không có insert/update/delete. |
| service_role | ✓ (select, insert, update, delete) | Bỏ qua RLS; dùng cho seed và vận hành. |

#### Related Modules

- `lib/awards/get-award-details.ts`
- MODEL003_AwardPrize

---

### PERM013_SiteSettingsPublicReadServiceWrite: Bảng `site_settings`: đọc công khai, ghi chỉ `service_role`

**Type**: data-permission
**Enforced At**: `supabase/migrations/20261009083754_create_site_settings.sql:31-43` (RLS bật; policy `site_settings_select_public`; GRANT tường minh)

#### Description

Cùng mẫu với PERM009. RLS bật trên `public.site_settings` (`:31`); policy `site_settings_select_public` cho `anon` và `authenticated` đọc mọi dòng (`using (true)`, `:33-35`). Quyền viết tường minh: thu hồi hết quyền của `public`, `anon`, `authenticated` rồi cấp `select` cho `anon, authenticated` và toàn quyền DML cho `service_role` (`:41-43`); không có policy hay GRANT ghi cho người dùng nên không có đường ghi từ app. Mọi cột đều đọc công khai nên không được lưu giá trị nhạy cảm ở đây. Khoá chính `singleton boolean` kèm `check (singleton)` giữ tối đa một dòng (`:22-27`); migration chèn sẵn dòng với `prelaunch_ends_at = NULL` (cổng tắt, `:46`); seed local `supabase/seeds/common/03-site-settings.sql:7-11` đặt mốc quá khứ. Proxy và trang `/countdown` đọc bằng khoá publishable (vai trò `anon`, không cookie) ở `lib/prelaunch/read-prelaunch-ends-at.ts:32-66`.

#### Related Routes

- ROUTE010 (GET) `/countdown` — đọc mốc để hiển thị đồng hồ
- ROUTE001, ROUTE008 (GET) `/`, `/awards-information` — proxy đọc mốc để quyết định cổng (PERM014)

#### Related Screens

- SCR005_CountdownPrelaunch - Countdown Prelaunch

#### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| anon | ✓ (select) | Mọi dòng. Không có insert/update/delete. |
| authenticated | ✓ (select) | Mọi dòng. Không có insert/update/delete. |
| service_role | ✓ (select, insert, update, delete) | Bỏ qua RLS; dùng cho vận hành (đặt hoặc xoá mốc), seed và helper E2E. |

#### Related Modules

- `lib/prelaunch/read-prelaunch-ends-at.ts`
- `e2e/support/prelaunch-setting.ts` (helper E2E ghi bằng `service_role`)
- MODEL004_SiteSettings

---

### PERM014_PrelaunchGate: Cổng prelaunch: trước mốc chỉ admin vượt cổng

**Type**: route-guard
**Enforced At**: `proxy.ts:22-24` (matcher), `lib/supabase/proxy-session.ts:43-79,143-160` (`updateSession`, `prelaunchGateTarget`), `lib/prelaunch/prelaunch-gate-decision.ts:40-56` (`decidePrelaunchGate`), `lib/prelaunch/read-gate-user-role.ts:24-49` (`readGateUserRole`), `lib/supabase/user-role.ts:13-15` (`toUserRole`)

#### Description

Cổng ra mắt (F005), không phải kiểm soát an ninh (FR-602). Chỉ `GET`/`HEAD` được xét (`lib/supabase/proxy-session.ts:54,162-164`); `/login` và `/auth/callback` luôn được miễn (`lib/prelaunch/prelaunch-gate-decision.ts:14`; `/auth/callback` còn trả tiếp ngay ở `lib/supabase/proxy-session.ts:45`). Mốc đọc từ `site_settings.prelaunch_ends_at` song song với `getClaims()` (`lib/supabase/proxy-session.ts:55-58`). Khoá khi `momentMs !== null && nowMs < momentMs` (bằng nhau là mở, `lib/prelaunch/prelaunch-gate-decision.ts:49`). Khi khoá: `/countdown` hiện cho mọi vai trò (`:51-52`); mọi page route khác chuyển 307 `/countdown` trừ khi phiên đã xác minh có `profiles.role` đúng chữ `admin` (`lib/supabase/proxy-session.ts:157-159`). Khi mở hoặc mốc không dùng được: `/countdown` chuyển 307 `/` (`lib/prelaunch/prelaunch-gate-decision.ts:52`), mọi trang khác đi tiếp. Mốc **fail open** (thiếu dòng, `NULL`, sai, quá 2 giây hay lỗi mạng đều là site mở, không retry, `lib/prelaunch/read-prelaunch-ends-at.ts:9,32-66`); vai trò **fail closed**: lỗi, quá 2 giây, không có hồ sơ hay giá trị khác `admin` đều là `user` (`lib/prelaunch/read-gate-user-role.ts:11,24-49`). Đích chuyển hướng là hằng `/countdown` hoặc `/`, không đọc từ request (`lib/prelaunch/prelaunch-gate-decision.ts:7,9`), nên không có open redirect. Vì `POST` không qua cổng nên mọi trang và Server Action vẫn phải tự kiểm tra quyền.

#### Related Routes

- ROUTE001, ROUTE008 (GET) `/`, `/awards-information` — bị 307 `/countdown` khi khoá với người không phải admin; các trang khác cũng vậy
- ROUTE010 (GET) `/countdown` — hiện khi khoá; 307 `/` khi mở
- ROUTE011 (GET) `/sun-kudos`, ROUTE015 (GET) `/api/kudos` — cùng cổng như mọi `GET` (khi khoá, người không phải admin → 307 `/countdown`)
- ROUTE004 (GET) `/login`, ROUTE007 (GET) `/auth/callback` — luôn được miễn
- ROUTE002, ROUTE003, ROUTE005, ROUTE006, ROUTE009, ROUTE012, ROUTE013, ROUTE014 (POST) — không qua cổng

#### Related Screens

- SCR005_CountdownPrelaunch - Countdown Prelaunch (đích bị chuyển hướng khi khoá)
- SCR003_Homepage - Homepage; SCR004_AwardsInformation - Awards Information (bị chuyển hướng khi khoá với người không phải admin)

#### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Anonymous visitor | ✗ (khi khoá, chỉ `/countdown`, `/login`, `/auth/callback`) | Mọi page route khác → 307 `/countdown`, không tra `profiles`. Khi mở hoặc mốc không dùng được: vào được mọi trang. |
| Authenticated user | ✗ (khi khoá, như khách) | Vai trò `user`, tra vai trò lỗi, quá 2 giây hoặc không có hồ sơ → 307 `/countdown`. |
| Authenticated admin | ✓ | `profiles.role = 'admin'` đọc được bằng phiên của chính người dùng; duyệt toàn site khi khoá, `/countdown` cũng hiện cho admin. |

#### Related Modules

- `proxy.ts`
- `lib/supabase/proxy-session.ts` (BL003_SessionRefreshProxy)
- `lib/prelaunch/prelaunch-gate-decision.ts`, `lib/prelaunch/read-prelaunch-ends-at.ts`, `lib/prelaunch/read-gate-user-role.ts`
- `lib/supabase/user-role.ts`
- MODEL004_SiteSettings, MODEL002_Profile (cột `role`, DISC-001)

---

### PERM015_KudosBoardPublicReadServiceWrite: Bảng của bảng Kudos: đọc công khai, ghi chỉ `service_role`

**Type**: data-permission
**Enforced At**: `supabase/migrations/20261012072146_create_kudos_board.sql:104-129` (RLS bật trên sáu bảng; policy `*_select_public`; REVOKE rồi GRANT tường minh), `supabase/migrations/20261012072217_create_kudos_likes.sql:47,50-52,63-67` (`special_days`)

#### Description

Cùng mẫu với PERM009. RLS bật trên `departments`, `sunners`, `kudos`, `hashtags`, `kudos_hashtags`, `kudos_images` và `special_days`; mỗi bảng có policy `<bảng>_select_public` cho `anon` và `authenticated` đọc mọi dòng. Thu hồi hết quyền của `public`, `anon`, `authenticated` (kể cả sequence `kudos_seq_seq`) rồi chỉ cấp `select`; `insert/update/delete` chỉ `service_role` (seed, vận hành), kể cả hai bộ đếm `kudos.like_count`, `sunners.kudos_received_count`, `sunners.hearts_total` (chỉ đổi qua trigger `security definer`). `sunners` chỉ được đọc theo cột (xem PERM016). Vì dữ liệu là công khai nên khách xem được toàn bộ bảng kudos.

#### Related Routes

- ROUTE011 (GET) `/sun-kudos`, ROUTE015 (GET) `/api/kudos` — đọc các bảng này bằng client publishable (`anon` hoặc `authenticated`)

#### Related Screens

- SCR006_SunKudosLiveBoard - Sun* Kudos - Live board

#### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| anon | ✓ (select) | Mọi dòng; `sunners` chỉ các cột trong column grant. Không có insert/update/delete. |
| authenticated | ✓ (select) | Như `anon`. Không có insert/update/delete, không sửa bộ đếm. |
| service_role | ✓ (select, insert, update, delete) | Bỏ qua RLS; dùng cho seed và vận hành. |

#### Related Modules

- `lib/kudos/get-kudos-page.ts`, `lib/kudos/get-kudos-filter-options.ts`, `lib/kudos/get-hashtag-rows-per-request.ts`, `lib/kudos/get-spotlight-data.ts`
- MODEL005_Department, MODEL006_Sunner, MODEL007_Kudos, MODEL008_Hashtag, MODEL009_KudosHashtag, MODEL010_KudosImage, MODEL012_SpecialDay

---

### PERM016_SunnerPrivateColumnsOwnRowRpc: `sunners.email`, `sunners.user_id` không mở cho client; hàng của chính mình chỉ qua `get_my_sunner()`

**Type**: field-permission
**Enforced At**: `supabase/migrations/20261012072146_create_kudos_board.sql:127-128` (column grant), `supabase/migrations/20261012072146_create_kudos_board.sql:206-225` (`get_my_sunner`, REVOKE/GRANT `execute`), `supabase/migrations/20261013060400_restrict_sunner_avatars_and_index_department.sql:66-73` (CHECK avatar cục bộ), `supabase/migrations/20261013060400_restrict_sunner_avatars_and_index_department.sql:84-110` (hàm gắn Sunner không sao chép avatar)

#### Description

`email` (khoá gắn tài khoản) và `user_id` (tài khoản đã liên kết) không nằm trong column grant của `anon`/`authenticated`, nên `select=*` trên `sunners` bị từ chối (42501) và client không đọc được chúng. Hàng Sunner của chính người xem lấy bằng `public.get_my_sunner()` (`security definer`, `set search_path = ''`, `where user_id = auth.uid()`, tối đa một hàng, không có `email`/`user_id`): `execute` thu của `public`, `anon`, `authenticated` rồi chỉ cấp `authenticated`; khách không gọi RPC (`getMySunnerPerRequest` trả `guest` không truy vấn). Hàm gắn tài khoản (`link_or_create_sunner`, `link_or_create_sunner_for_user`) cùng các hàm trigger bị thu `execute` khỏi mọi role client, chạy từ trigger `auth.users` và chỉ với tài khoản đã xác nhận email. `sunners.avatar_url` chỉ là đường dẫn cục bộ dưới `/public` (CHECK; không sao chép từ `user_metadata`), nên trình duyệt không bao giờ bị trỏ tới máy chủ ngoài (review M1, 2026-10-13).

#### Related Routes

- ROUTE011 (GET) `/sun-kudos` — `getViewerSunnerId` và `getKudosPersonalStats` gọi `get_my_sunner()` một lần mỗi lần render

#### Related Screens

- SCR006_SunKudosLiveBoard - Sun* Kudos - Live board

#### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| anon | ✓ (select cột công khai) ✗ (`email`, `user_id`, RPC) | `select *` → 42501; không có quyền `execute` `get_my_sunner`. |
| authenticated | ✓ (select cột công khai, `get_my_sunner()`) ✗ (`email`, `user_id`) | RPC chỉ trả hàng của `auth.uid()`. |
| service_role | ✓ | Bỏ qua RLS; đọc/ghi mọi cột. |

#### Related Modules

- `lib/kudos/get-my-sunner-per-request.ts`, `lib/kudos/get-viewer-sunner-id.ts`, `lib/kudos/get-kudos-personal-stats.ts`, `lib/kudos/safe-media-path.ts`
- MODEL006_Sunner

---

### PERM017_KudosLikesOwnerOnly: `kudos_likes`: chỉ chủ lượt thích; người gửi không tự thích

**Type**: resource-ownership
**Enforced At**: `supabase/migrations/20261012072217_create_kudos_likes.sql:48,54-59` (RLS, ba policy), `supabase/migrations/20261012072217_create_kudos_likes.sql:63-67` (quyền), `supabase/migrations/20261012072217_create_kudos_likes.sql:71-93` (trigger `kudos_likes_before_insert`)

#### Description

Policy `kudos_likes_select_own` (`anon`, `authenticated`), `kudos_likes_insert_own` và `kudos_likes_delete_own` (`authenticated`) đều ràng `user_id = (select auth.uid())`; không ai biết ai đã thích kudos nào. Client chỉ có `insert (kudos_id, user_id)` theo cột nên không chọn được `weight` hay `created_at`, không có `update`. Trigger `kudos_likes_before_insert` (`security definer`) từ chối tài khoản không có Sunner hoặc là người gửi kudos (`check_violation`, 23514 → action trả `forbidden`) rồi đặt `weight` theo `special_days` (Asia/Ho_Chi_Minh). Bộ đếm `kudos.like_count`, `sunners.hearts_total` chỉ đổi qua `kudos_likes_after_change`; xoá kudos bằng SQL được `release_kudos_like_hearts` (BEFORE DELETE trên `kudos`) trả lại đúng trọng số cho người gửi. Nút tim vô hiệu cho người gửi là UX; ràng buộc thật ở RLS và trigger.

#### Related Routes

- ROUTE012, ROUTE013 (POST) `/sun-kudos [Next-Action: likeKudos | unlikeKudos]`
- ROUTE011 (GET) `/sun-kudos`, ROUTE015 (GET) `/api/kudos` — embed `my_like` chỉ trả lượt thích của chính người gọi

#### Related Screens

- SCR006_SunKudosLiveBoard - Sun* Kudos - Live board (vùng nút tim, F007)

#### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| anon | ✓ (select, kết quả rỗng) ✗ (insert, delete) | RLS `user_id = auth.uid()` không khớp dòng nào. |
| authenticated | ✓ (select/insert/delete dòng của mình) ✗ (update, người gửi tự thích, ghi `weight`) | Chỉ khi có Sunner liên kết và không phải người gửi; một lượt mỗi kudos (PK ghép). |
| service_role | ✓ (select, insert, update, delete) | Bỏ qua RLS; seed và vận hành. |

#### Related Modules

- `lib/kudos/kudos-heart-actions.ts`, `lib/kudos/kudos-heart-store.tsx`
- MODEL011_KudosLike, MODEL012_SpecialDay

---

### PERM018_SecretBoxesOpenedPublicUnopenedOwner: `secret_boxes`: hộp đã mở đọc công khai, hộp chưa mở chỉ chủ hộp

**Type**: resource-ownership
**Enforced At**: `supabase/migrations/20261012072258_create_secret_boxes.sql:36-49` (RLS, hai policy, quyền)

#### Description

Policy `secret_boxes_select_opened_public` (`anon`, `authenticated`, `opened_at is not null`) cho danh sách "10 SUNNER NHẬN QUÀ MỚI NHẤT"; policy `secret_boxes_select_own` (`authenticated`, `owner_id = (select me.id from public.get_my_sunner() as me)`) cho chủ hộp đếm hộp chưa mở, vì `sunners.user_id` không cấp cho client. Thu hồi hết quyền rồi chỉ cấp `select`; không client nào ghi (mở hộp ngoài phạm vi), `service_role` ghi.

#### Related Routes

- ROUTE011 (GET) `/sun-kudos` — sidebar F009 (D.1 đếm hộp của chính mình, D.3 liệt kê hộp đã mở)

#### Related Screens

- SCR006_SunKudosLiveBoard - Sun* Kudos - Live board (vùng sidebar, F009)

#### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| anon | ✓ (select) | Chỉ hộp đã mở. |
| authenticated | ✓ (select) | Hộp đã mở của mọi người và hộp chưa mở của chính mình. Không insert/update/delete. |
| service_role | ✓ (select, insert, update, delete) | Bỏ qua RLS; seed và vận hành. |

#### Related Modules

- `lib/kudos/get-recent-gift-recipients.ts`, `lib/kudos/get-kudos-personal-stats.ts`
- MODEL013_SecretBox

---

### PERM019_KudosHeartActionSessionCheck: `likeKudos`/`unlikeKudos` kiểm phiên phía máy chủ

**Type**: action-permission
**Enforced At**: `lib/kudos/kudos-heart-actions.ts:52-82` (`writeHeart`)

#### Description

Hai Server Action là endpoint `POST` công khai nên không tin dữ liệu từ client: `kudosId` phải khớp mẫu UUID, nếu không trả `error` và log; người dùng lấy từ claims đã xác minh (`getCurrentUser()`, fail closed thành khách), khách nhận `unauthenticated` (giao diện chuyển tới `/login`); ghi bằng client cookie của chính người dùng nên RLS (PERM017) và trigger quyết định phần còn lại. Mã lỗi Postgres 23505 (đã thích) là `ok` idempotent, 23514 là `forbidden`; mọi lỗi khác chỉ log mã, không lộ chi tiết. Server Action không qua cổng prelaunch (`POST`, PERM014) nên tự kiểm phiên.

#### Related Routes

- ROUTE012, ROUTE013 (POST) `/sun-kudos [Next-Action: likeKudos | unlikeKudos]`

#### Related Screens

- SCR006_SunKudosLiveBoard - Sun* Kudos - Live board (vùng nút tim, F007)

#### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Anonymous visitor | ✗ | `unauthenticated`, không ghi DB. |
| Authenticated user | ✓ | Không phải người gửi kudos và có Sunner (do trigger DB kiểm). |
| Authenticated admin | ✓ | Như người dùng thường; vai trò không ảnh hưởng. |

#### Related Modules

- `lib/kudos/kudos-heart-actions.ts`, `lib/supabase/current-user.ts` (PERM005)
- MODEL011_KudosLike

---

## Summary

- **Total Permission Items**: 19
- **By Type**: route-guard: 3, screen-permission: 2, action-permission: 4, data-permission: 5, role-based: 1, resource-ownership: 2, field-permission: 1, api-scope: 0, feature-flag: 0, experiment: 0, env-gate: 1, locale-gate: 0
- **UX-only (không phải rào chắn server)**: PERM003, PERM004
- **Authorization model**: RBAC đơn giản (`profiles.role` ∈ {`user`, `admin`}) cộng RLS theo vai trò Postgres; không có phân quyền theo sở hữu giữa người dùng.

### Gaps (ghi nhận, không phải PERM)

- `/admin` chưa có page và chưa có kiểm tra vai trò phía server; hiện chỉ có việc ẩn mục menu (PERM004). Khi xây phải gọi `getCurrentUser()` và từ chối nếu không phải `admin` (yêu cầu từ code: `current-user.ts:27-28`).
- `/profile`, `/standards`, `/sun-kudos/[id]`, `/profiles/[id]` có liên kết nhưng chưa có page, truy cập hiện trả 404; chưa có quy tắc quyền để ghi. Khi xây `/sun-kudos/[id]` và `/profiles/[id]` phải tự kiểm quyền ở server (khách bấm từ bảng kudos đã được đưa tới `/login` ở phía giao diện).
- Việc đăng ký hiện không giới hạn tên miền email ở dự án hosted: tài khoản đã xác nhận email nào cũng được tạo Sunner (review M2, hoãn); `/api/kudos` chưa giới hạn tốc độ.
- `getCurrentUser()` mới chỉ phục vụ vùng tài khoản; chưa trang hay action nào chặn truy cập dựa trên vai trò. Cổng prelaunch (PERM014) có dùng vai trò `admin` nhưng chỉ để quyết định ai vượt cổng ra mắt, nó fail open ở phía mốc và không thấy `POST`, nên không thay việc tự kiểm tra quyền.

---

## Cross-Reference Validation

- [x] All PERM### codes are unique
- [x] All PERM### codes are referenced in FeatureList.md
- [x] All related route references are valid (ROUTE### in RouteList: ROUTE001..015 đều tồn tại; `/admin` chỉ ghi chú là chưa có route)
- [x] All related screen references are valid (SCR001_Login, SCR003_Homepage, SCR003_Homepage/REG001_AccountRegion, SCR003_Homepage/REG002_AwardsGrid, SCR004_AwardsInformation, SCR005_CountdownPrelaunch, SCR006_SunKudosLiveBoard theo ScreenList; PERM003/PERM004 nhắm vùng REG001_AccountRegion — chỉ ẩn/hiện giao diện, UX-only)
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
