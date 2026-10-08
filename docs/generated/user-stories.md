# User Stories

**Project**: my-app (SAA 2025 — Sun* Annual Awards 2025)
**Generated**: 2026-10-08
**Analysis Scope**: `app/` (page, `_components/`, `login/`, `auth/callback/route.ts`), `lib/` (auth, awards, countdown, i18n, supabase, ui), `proxy.ts`. Chỉ tính màn hình đang hoạt động: SCR001_Login, SCR003_Homepage (kèm SCR003_Homepage/REG001_AccountRegion, SCR003_Homepage/REG002_AwardsGrid). SCR002_Todo đã gỡ (2026-10-08) nên không có US nào.

**Code Format**: All US codes MUST follow `US###_NameSlug` format (e.g., US001_Login, US002_ViewDashboard)

**US Types**:
- `ui` - User-facing stories (require Screen mapping)
- `system` - System stories: hook, event, observer, bg-job, trigger, etc. (no Screen mapping needed)

**Note**: Feature mapping is managed in FeatureList.md only. This document contains user stories without direct feature references. UI US require Screen mapping; system/bg-job US do not. `ui`-typed stories may map to `SCR###` or `SCR###/REG###`; non-`ui` types map to `SCR###` only (or omit).

> Ghi chú tác nhân: dự án có 3 tác nhân theo `permissions-matrix.md` — `guest` (chưa đăng nhập), `signed-in user` (`profiles.role = 'user'`), `admin` (`profiles.role = 'admin'`). Hành vi công khai (xem trang chủ, đổi ngôn ngữ, điều hướng) giống hệt nhau cho cả ba tác nhân (không có PERM phân biệt) nên US ghi tác nhân chính là `guest`; quy tắc này được nhắc lại trong Technical Notes. US có khác biệt theo quyền được tách theo tác nhân (US003 guest, US004..US005/US006 signed-in user, US007 admin).

> Ghi chú đích điều hướng chưa xây: `/awards-information`, `/sun-kudos`, `/standards`, `/profile`, `/admin` là liên kết bấm được trong code nhưng **chưa có page** (truy cập hiện trả 404). Các US điều hướng tới đó (US008, US009, US010, US011, US005, US007) mô tả ý định điều hướng của phần tử có thật; phần "đích đến" ghi rõ là chưa xây, không bịa nội dung trang đích.

## Interaction Inventory

> Complete this table BEFORE writing any US. One row per interactive element per screen.
> Source of truth for US count — every row maps to ≥1 US below (unless merge exception applies).
> See: references/user-stories-ipe-protocol.md for enumeration rules and merge exception.

| Screen | Element | Type | Action | Endpoint |
|--------|---------|------|--------|---------|
| SCR001_Login | GoogleButton — nút submit "LOGIN With Google" (`app/login/_components/google-button.tsx:37`) | primary-action | Gửi form tới `signInWithGoogle`; nút `disabled` + spinner khi chờ; thành công thì `redirect` sang URL authorize của Google (`app/login/actions.ts:29`) → US001 | POST /login [Next-Action: signInWithGoogle] (ROUTE005) |
| SCR001_Login | ErrorAlert `role="alert"` (`google-button.tsx:50-57`) — hiện khi `?error=cancelled\|failed` hoặc action trả `{ error: "failed" }` | secondary-action | Hiển thị thông báo lỗi đăng nhập → US002 | GET /login?error=cancelled\|failed (ROUTE004) |
| SCR001_Login | LanguageSelector — nút mở + hai mục VN/EN (`app/_components/site/language-selector.tsx:85,127`) | secondary-action | Chọn ngôn ngữ, gọi `setLocale` ghi cookie `NEXT_LOCALE` → US012 | POST /login [Next-Action: setLocale] (ROUTE006) |
| — (route handler, không có view) | `/auth/callback` — Google/Supabase đưa trình duyệt về (`app/auth/callback/route.ts:24`) | system-action | Đổi `code` lấy phiên, 302 về `/` hoặc `/login?error=…` → US013 | GET /auth/callback (ROUTE007) |
| — (proxy) | `proxy.ts` — mọi request khớp `/`, `/login` (`proxy.ts:17-19`) | system-action | Làm mới phiên; `GET\|HEAD /login` có phiên → 307 `/` → US014, US015 | GET /login, GET / (ROUTE001, ROUTE004) |
| SCR003_Homepage | SiteHeader — logo "SAA 2025" (`site-header.tsx:18`) và liên kết "About SAA 2025" (`site-header.tsx:32`) | navigation | Liên kết `/` (đã ở trang này) + `SamePageScrollTop` cuộn về đầu trang → US016 | GET / (ROUTE001) |
| SCR003_Homepage | SiteHeader — liên kết "Awards Information" (`site-header.tsx:36`) | navigation | Điều hướng tới `/awards-information` (chưa xây) → US008 | GET /awards-information (chưa có route) |
| SCR003_Homepage | SiteHeader — liên kết "Sun* Kudos" (`site-header.tsx:40`) | navigation | Điều hướng tới `/sun-kudos` (chưa xây) → US009 | GET /sun-kudos (chưa có route) |
| SCR003_Homepage | LanguageSelector (slot ngôn ngữ của header, `home-content.tsx:40`) | secondary-action | Chọn VN/EN, gọi `setLocale` → US017 | POST / [Next-Action: setLocale] (ROUTE003) |
| SCR003_Homepage | HeroSection — CTA "ABOUT AWARDS" (`hero-section.tsx:69`) | navigation | Điều hướng tới `/awards-information` (gộp vào US008) | GET /awards-information (chưa có route) |
| SCR003_Homepage | HeroSection — CTA "ABOUT KUDOS" (`hero-section.tsx:74`) | navigation | Điều hướng tới `/sun-kudos` (gộp vào US009) | GET /sun-kudos (chưa có route) |
| SCR003_Homepage | LiveCountdown — ba ô DAYS/HOURS/MINUTES + "Coming soon" (`countdown.tsx:13`, `countdown-tiles.tsx:24`) | secondary-action | Hiển thị đếm ngược tự cập nhật theo phút, không có thao tác bấm (display-only) → US018 | N/A (đọc `SAA_COUNTDOWN_TARGET` phía server, tính phía client) |
| SCR003_Homepage/REG002_AwardsGrid | AwardsGrid — lưới thẻ + trạng thái rỗng/skeleton (`awards-grid.tsx:20,74`) | secondary-action | Hiển thị các hạng mục giải thưởng đọc từ bảng `awards` (display-only) → US019 | N/A (Server Component đọc `getAwards`, `lib/awards/get-awards.ts:18`) |
| SCR003_Homepage/REG002_AwardsGrid | AwardsGrid — ba liên kết của mỗi thẻ: ảnh, tiêu đề, "Chi tiết/Details" (`awards-grid.tsx:31,50,59`) | navigation | Điều hướng tới `/awards-information#<slug>` (chưa xây) → US011 | GET /awards-information#<slug> (chưa có route) |
| SCR003_Homepage | KudosSection — liên kết "Chi tiết/Details" (`kudos-section.tsx:36`) | navigation | Điều hướng tới `/sun-kudos` (gộp vào US009) | GET /sun-kudos (chưa có route) |
| SCR003_Homepage | WidgetButton — nút nổi góc phải dưới (`widget-button.tsx:9`) | secondary-action | **Inert**: không có handler, không điều hướng (comment code: "Visual only") — không có US `[IPE_INERT]` | N/A |
| SCR003_Homepage | SiteFooter — logo (`site-footer.tsx:15`) và liên kết "About SAA 2025" (`site-footer.tsx:28`) | navigation | Liên kết `/` + cuộn về đầu trang (gộp vào US016) | GET / (ROUTE001) |
| SCR003_Homepage | SiteFooter — liên kết "Awards Information" (`site-footer.tsx:32`) | navigation | Điều hướng tới `/awards-information` (gộp vào US008) | GET /awards-information (chưa có route) |
| SCR003_Homepage | SiteFooter — liên kết "Sun* Kudos" (`site-footer.tsx:36`) | navigation | Điều hướng tới `/sun-kudos` (gộp vào US009) | GET /sun-kudos (chưa có route) |
| SCR003_Homepage | SiteFooter — liên kết "Tiêu chuẩn chung/General Standards" (`site-footer.tsx:40`) | navigation | Điều hướng tới `/standards` (chưa xây) → US010 | GET /standards (chưa có route) |
| SCR003_Homepage/REG001_AccountRegion | GuestLoginLink — "Đăng nhập/Login" (`account-slot-parts.tsx:14`, chỉ khi là khách) | navigation | Điều hướng tới `/login` → US003 | GET /login (ROUTE004) |
| SCR003_Homepage/REG001_AccountRegion | NotificationBell (`account-slot-parts.tsx:26`, chỉ khi đã đăng nhập) | secondary-action | Hiển thị biểu tượng chuông; **không có handler** (UI-only) → US004 | N/A |
| SCR003_Homepage/REG001_AccountRegion | AccountMenu — nút tài khoản mở/đóng menu (`account-menu-view.tsx:26`) | secondary-action | Bấm nút → mở menu (US020); bấm ngoài / `Esc` / Tab ra ngoài / bấm nút lần nữa → đóng (US021) (`lib/ui/use-menu-disclosure.ts:47-54`) | N/A (trạng thái client) |
| SCR003_Homepage/REG001_AccountRegion | AccountMenu — mục "Hồ sơ/Profile" (`account-region.tsx:70`, `account-menu-view.tsx:48`) | navigation | Điều hướng tới `/profile` (chưa xây) → US005 | GET /profile (chưa có route) |
| SCR003_Homepage/REG001_AccountRegion | AccountMenu — mục "Trang quản trị/Admin Dashboard" (`account-region.tsx:71`; chỉ khi `role === "admin"`) | navigation | Điều hướng tới `/admin` (chưa xây, UX-only) → US007 | GET /admin (chưa có route) |
| SCR003_Homepage/REG001_AccountRegion | AccountMenu — mục "Đăng xuất/Sign out" (`account-menu-view.tsx:52-56`) | destructive-action | Gọi `signOut` (kết thúc phiên cục bộ), `redirect("/login")` → US006 | POST / [Next-Action: signOut] (ROUTE002) |
| — (behaviour, không có giao diện) | SamePageScrollTop — lắng nghe click toàn trang (`same-page-scroll-top.tsx:17`) | system-action | Cuộn về đầu trang khi bấm liên kết trỏ về chính trang này; không `preventDefault` — đã tính trong US016 | N/A |

> [IPE_MERGE_CANDIDATE] đã xét và áp dụng ngoại lệ gộp (cùng tác nhân + cùng endpoint + cùng luồng dữ liệu, không rẽ nhánh): (1) US008 gộp ba liên kết cùng đích `/awards-information` (header, hero, footer — ba phần tử; thẻ giải thưởng có `#slug` nên là US011 riêng); (2) US009 gộp bốn liên kết cùng đích `/sun-kudos` (header, hero, kudos-section, footer); (3) US016 gộp bốn liên kết cùng đích `/` (logo + "About" ở header và footer). Không gộp: US017 (ROUTE003) và US012 (ROUTE006) vì endpoint khác nhau dù cùng `setLocale`.
> [IPE_INERT] `WidgetButton` không có hành vi (không onClick, không form) nên không tạo US; `NotificationBell` cũng không có handler nhưng hiển thị phụ thuộc vai trò đăng nhập (PERM003) nên có US004 ghi nhận phần quan sát được.
> [IPE_STATIC] Các khối chỉ có chữ, không tương tác (HeroSection tiêu đề + thông tin sự kiện, RootFurtherSection, tiêu đề KudosSection, Footer bản quyền) không tạo US riêng.

## User Story Index

| Code | Title | Type | Priority | Screens |
|------|-------|------|----------|---------|
| US001_SignInWithGoogle | Đăng nhập bằng Google | ui | High | SCR001_Login |
| US002_ViewLoginError | Xem thông báo lỗi đăng nhập | ui | High | SCR001_Login |
| US012_ChangeLoginLanguage | Đổi ngôn ngữ màn hình Login | ui | Low | SCR001_Login |
| US008_OpenAwardsInformation | Mở trang Awards Information | ui | Medium | SCR003_Homepage |
| US009_OpenSunKudos | Mở trang Sun* Kudos | ui | Medium | SCR003_Homepage |
| US010_OpenStandards | Mở trang Tiêu chuẩn chung | ui | Low | SCR003_Homepage |
| US016_ReturnToHomepageTop | Quay về đầu trang chủ | ui | Low | SCR003_Homepage |
| US017_ChangeHomepageLanguage | Đổi ngôn ngữ trang chủ | ui | Medium | SCR003_Homepage |
| US018_ViewEventCountdown | Xem đồng hồ đếm ngược tới sự kiện | ui | High | SCR003_Homepage |
| US019_ViewAwardCategories | Xem các hạng mục giải thưởng | ui | High | SCR003_Homepage/REG002_AwardsGrid |
| US011_OpenAwardDetails | Mở chi tiết một hạng mục giải thưởng | ui | Medium | SCR003_Homepage/REG002_AwardsGrid |
| US003_OpenLoginFromHeader | Mở màn hình Login từ header | ui | High | SCR003_Homepage/REG001_AccountRegion, SCR001_Login |
| US004_ViewNotificationBell | Xem chuông thông báo | ui | Low | SCR003_Homepage/REG001_AccountRegion |
| US020_OpenAccountMenu | Mở menu tài khoản | ui | High | SCR003_Homepage/REG001_AccountRegion |
| US021_CloseAccountMenu | Đóng menu tài khoản | ui | Medium | SCR003_Homepage/REG001_AccountRegion |
| US005_OpenProfile | Mở trang Hồ sơ | ui | Medium | SCR003_Homepage/REG001_AccountRegion |
| US007_OpenAdminDashboard | Mở trang quản trị | ui | Medium | SCR003_Homepage/REG001_AccountRegion |
| US006_SignOut | Đăng xuất | ui | High | SCR003_Homepage/REG001_AccountRegion |
| US013_CompleteGoogleSignIn | Hoàn tất đăng nhập Google | system | High | SCR001_Login, SCR003_Homepage |
| US014_RedirectSignedInFromLogin | Chuyển người đã đăng nhập khỏi màn hình Login | system | Medium | SCR001_Login, SCR003_Homepage |
| US015_RefreshSession | Làm mới phiên đăng nhập | system | High | SCR003_Homepage |

---

## US001_SignInWithGoogle: Đăng nhập bằng Google

**Type**: ui
**Interaction**: primary-action
**Priority**: High
**Estimate**: S

### User Story

As a guest, I want to bấm nút "LOGIN With Google" so that được chuyển sang Google để xác thực và bắt đầu đăng nhập vào SAA 2025.

### Acceptance Criteria

- [ ] Criterion 1: Nút submit "LOGIN With Google" hiển thị ở `/login` (nhãn lấy từ dictionary `login.loginButton`, `google-button.tsx:44-46`).
- [ ] Criterion 2: Khi bấm, nút bị `disabled`, `aria-busy="true"` và biểu tượng Google đổi thành spinner (`google-button.tsx:39-47`).
- [ ] Criterion 3: Server Action `signInWithGoogle` dựng URL callback `/auth/callback` từ origin hợp lệ rồi `redirect` cùng tab sang URL authorize của Google (`app/login/actions.ts:29-56`).
- [ ] Criterion 4: Khi trình duyệt quay lại từ bfcache (`pageshow.persisted`), trang tự tải lại để nút không kẹt ở trạng thái chờ (`google-button.tsx:24-30`).

### Technical Notes

- **Endpoint**: POST /login [Next-Action: signInWithGoogle] (ROUTE005)
- **Data Required**: Header `Origin` hoặc `x-forwarded-host`/`host` hợp lệ; cookie PKCE verifier do Supabase ghi; không có dữ liệu nhập từ người dùng
- **Dependencies**: Supabase Auth provider `google` (`supabase/config.toml`), PERM007_GoogleSignInPublicStart, BL001_SupabaseServerClient. Tiếp nối ở US013 (callback) — US này dừng ngay khi trình duyệt rời sang Google.

### Screens

- SCR001_Login: Login

### Background Logic

- BL001_SupabaseServerClient: Supabase Server Client

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Khách mở `/login`, origin hợp lệ | Bấm "LOGIN With Google" | Nút disabled + spinner, trình duyệt chuyển sang trang authorize của Google |
| Error Case | `signInWithOAuth` lỗi hoặc không có Origin/Host hợp lệ | Bấm "LOGIN With Google" | Action trả `{ error: "failed" }`, nút bật lại, thấy thông báo lỗi (US002), không bị chuyển trang |

---

## US002_ViewLoginError: Xem thông báo lỗi đăng nhập

**Type**: ui
**Interaction**: secondary-action
**Priority**: High
**Estimate**: S

### User Story

As a guest, I want to xem thông báo lỗi trên màn hình Login so that biết đăng nhập chưa thành công và có thể thử lại.

### Acceptance Criteria

- [ ] Criterion 1: `/login?error=cancelled` hoặc `/login?error=failed` hiện đoạn `role="alert"` với nội dung `login.loginFailed` ("Đăng nhập không thành công. Vui lòng thử lại." / "Login failed. Please try again.") (`app/login/page.tsx:11,28-30`, `google-button.tsx:50-57`).
- [ ] Criterion 2: Giá trị `error` khác (hoặc không có) bị bỏ qua, không hiện lỗi và không phản chiếu chuỗi query vào trang (`page.tsx:9-11`).
- [ ] Criterion 3: Thông báo lỗi ẩn khi nút đang chờ (`!pending && state.error`, `google-button.tsx:50`); `cancelled` và `failed` dùng chung một nội dung.

### Technical Notes

- **Endpoint**: GET /login?error=cancelled|failed (ROUTE004)
- **Data Required**: Tham số `error` (allow-list `cancelled`, `failed`); chuỗi dịch `login.loginFailed`
- **Dependencies**: Phát sinh từ US013 (callback 302 về `/login?error=…`) hoặc từ US001 (action trả `{ error: "failed" }`); locale từ cookie `NEXT_LOCALE`

### Screens

- SCR001_Login: Login

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Khách bị callback chuyển về `/login?error=cancelled` | Trang tải xong | Thấy thông báo lỗi `role="alert"`, nút Google bấm lại được |
| Error Case | URL có `?error=<giá trị lạ>` | Trang tải xong | Không có thông báo lỗi, nội dung query không xuất hiện trên trang |

---

## US003_OpenLoginFromHeader: Mở màn hình Login từ header

**Type**: ui
**Interaction**: navigation
**Priority**: High
**Estimate**: S

### User Story

As a guest, I want to bấm nút "Đăng nhập" ở góc phải header so that tới màn hình Login để đăng nhập.

### Acceptance Criteria

- [ ] Criterion 1: Khi `getCurrentUser()` trả `null`, vùng tài khoản hiện liên kết "Đăng nhập/Login" trỏ `/login`; không hiện chuông và menu (`account-region.tsx:50-53`, `account-slot-parts.tsx:14-23`).
- [ ] Criterion 2: Trong lúc đọc phiên, vùng này hiện skeleton 96x40 (không có chữ) nên người đã đăng nhập không thấy "Login" nhấp nháy (`account-region.tsx:35-41`, `account-slot-parts.tsx:9-11`).
- [ ] Criterion 3: Lỗi `getClaims`, thiếu biến môi trường Supabase hay exception đều coi là khách (fail closed) và vẫn hiện liên kết Login (`lib/supabase/current-user.ts:36-57`).
- [ ] Criterion 4: Bấm liên kết điều hướng sang `/login`.

### Technical Notes

- **Endpoint**: GET /login (ROUTE004)
- **Data Required**: Claims JWT (không có → khách); nhãn `accountMenu.login`
- **Dependencies**: PERM003_AccountRegionAuthState, PERM005_SessionRoleResolution, BL001_SupabaseServerClient

### Screens

- SCR003_Homepage/REG001_AccountRegion: AccountRegion
- SCR001_Login: Login

### Background Logic

- BL001_SupabaseServerClient: Supabase Server Client

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Khách ở `/` | Bấm "Đăng nhập" trên header | Điều hướng tới `/login` |
| Error Case | `getClaims` lỗi (mạng/env) | Mở `/` | Vẫn thấy "Đăng nhập" như khách, không có chuông/menu, không trả 500 |

---

## US004_ViewNotificationBell: Xem chuông thông báo

**Type**: ui
**Interaction**: secondary-action
**Priority**: Low
**Estimate**: S

### User Story

As a signed-in user, I want to thấy biểu tượng chuông thông báo trên header so that biết vị trí lối vào thông báo của tài khoản mình.

### Acceptance Criteria

- [ ] Criterion 1: Khi đã đăng nhập (claims hợp lệ), chuông hiện bên trái bộ chọn ngôn ngữ với nhãn truy cập `accountMenu.notifications` ("Thông báo" / "Notifications") (`account-region.tsx:44-48`).
- [ ] Criterion 2: Khách không thấy chuông; vùng chuông không có skeleton nên xuất hiện không đẩy bộ chọn ngôn ngữ (`account-region.tsx:24-32`).
- [ ] Criterion 3: `[INERT_CONTROL]` Chuông chỉ là giao diện: không có huy hiệu, không bảng thông báo, không handler (`account-slot-parts.tsx:25-33`); bấm không có tác dụng.

### Technical Notes

- **Endpoint**: N/A
- **Data Required**: Claims JWT (chỉ để biết đã đăng nhập)
- **Dependencies**: PERM003_AccountRegionAuthState; admin cũng thấy chuông giống signed-in user

### Screens

- SCR003_Homepage/REG001_AccountRegion: AccountRegion

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Người dùng đã đăng nhập | Mở `/` | Thấy chuông cạnh bộ chọn ngôn ngữ |
| Error Case | Khách chưa đăng nhập | Mở `/` | Không có chuông trên header |

---

## US005_OpenProfile: Mở trang Hồ sơ

**Type**: ui
**Interaction**: navigation
**Priority**: Medium
**Estimate**: S

### User Story

As a signed-in user, I want to chọn mục "Hồ sơ" trong menu tài khoản so that đi tới trang hồ sơ của mình.

### Acceptance Criteria

- [ ] Criterion 1: Mục "Hồ sơ/Profile" luôn có trong menu của người đã đăng nhập, `role="menuitem"` là `next/link` trỏ `/profile` (`account-region.tsx:70`, `account-menu-view.tsx:48`).
- [ ] Criterion 2: Chọn mục điều hướng sang `/profile`.
- [ ] Criterion 3: `[NOT_BUILT]` `/profile` chưa có page nên hiện trả 404 (admin cũng giống signed-in user).

### Technical Notes

- **Endpoint**: GET /profile (chưa có route trong RouteList)
- **Data Required**: Nhãn `accountMenu.profile`
- **Dependencies**: Phụ thuộc US020; trang đích chưa xây

### Screens

- SCR003_Homepage/REG001_AccountRegion: AccountRegion

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Menu tài khoản đang mở | Chọn "Hồ sơ" | Điều hướng tới `/profile` |
| Error Case | Trang đích chưa xây | Chọn "Hồ sơ" | Nhận 404 từ Next.js |

---

## US006_SignOut: Đăng xuất

**Type**: ui
**Interaction**: destructive-action
**Priority**: High
**Estimate**: S

### User Story

As a signed-in user, I want to chọn mục "Đăng xuất" trong menu tài khoản so that kết thúc phiên đăng nhập trên trình duyệt này.

### Acceptance Criteria

- [ ] Criterion 1: Mục "Đăng xuất/Sign out" là nút submit của `<form action={signOut}>` trong menu (`account-menu-view.tsx:52-56`); admin dùng được giống signed-in user.
- [ ] Criterion 2: `signOut` gọi `supabase.auth.signOut({ scope: "local" })` — chỉ kết thúc phiên ở trình duyệt này, không thu hồi phiên ở thiết bị khác (`lib/auth/actions.ts:19-25`).
- [ ] Criterion 3: Lỗi từ Supabase hoặc exception chỉ ghi log; luôn `redirect("/login")` để rời khỏi phiên không bao giờ thất bại với người dùng (`lib/auth/actions.ts:23-33`).
- [ ] Criterion 4: Không có phiên (đã hết hạn) thì action là no-op rồi vẫn chuyển về `/login`; `POST` không bị proxy chuyển hướng nên action không bị hỏng (`proxy-session.ts:23-25,99-105`).
- [ ] Criterion 5: Không có hộp thoại xác nhận trước khi đăng xuất.

### Technical Notes

- **Endpoint**: POST / [Next-Action: signOut] (ROUTE002)
- **Data Required**: Cookie phiên của chính người gọi; không có dữ liệu nhập
- **Dependencies**: PERM006_SignOutOwnSession, BL001_SupabaseServerClient, BL003_SessionRefreshProxy; phụ thuộc US020

### Screens

- SCR003_Homepage/REG001_AccountRegion: AccountRegion
- SCR001_Login: Login

### Background Logic

- BL001_SupabaseServerClient: Supabase Server Client
- BL003_SessionRefreshProxy: Session Refresh Proxy

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Signed-in user mở menu tài khoản | Chọn "Đăng xuất" | Cookie phiên bị xoá, trình duyệt chuyển tới `/login` và thấy màn hình Login |
| Error Case | Phiên đã hết hạn hoặc Supabase trả lỗi lúc đăng xuất | Chọn "Đăng xuất" | Lỗi chỉ ghi log, vẫn chuyển tới `/login` |

---

## US007_OpenAdminDashboard: Mở trang quản trị

**Type**: ui
**Interaction**: navigation
**Priority**: Medium
**Estimate**: S

### User Story

As an admin, I want to chọn mục "Trang quản trị" trong menu tài khoản so that đi tới khu vực quản trị.

### Acceptance Criteria

- [ ] Criterion 1: Mục "Trang quản trị/Admin Dashboard" trỏ `/admin` chỉ được thêm vào menu khi `role === "admin"` (`account-region.tsx:71`); signed-in user thường và guest không thấy.
- [ ] Criterion 2: Chọn mục điều hướng sang `/admin`.
- [ ] Criterion 3: `[NOT_BUILT]` `/admin` chưa có page và không có kiểm tra vai trò phía server (kể cả proxy); việc ẩn mục chỉ là UX (PERM004_AdminMenuEntryVisibility). Khi xây `/admin`, trang phải tự gọi `getCurrentUser()` và từ chối nếu không phải admin (`account-region.tsx:64-68`, `current-user.ts:26-27`).

### Technical Notes

- **Endpoint**: GET /admin (chưa có route trong RouteList)
- **Data Required**: `profiles.role = 'admin'` đọc dưới RLS; nhãn `accountMenu.admin`
- **Dependencies**: PERM004_AdminMenuEntryVisibility (UX-only), PERM005_SessionRoleResolution, PERM010_ProfilesSelectOwnServiceWrite; phụ thuộc US020

### Screens

- SCR003_Homepage/REG001_AccountRegion: AccountRegion

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Admin mở menu tài khoản | Chọn "Trang quản trị" | Điều hướng tới `/admin` |
| Error Case | Signed-in user thường mở `/admin` bằng URL | Truy cập trực tiếp | Nhận 404 (chưa có page); không có guard phía server — rủi ro cần xử lý khi xây trang |

---

## US008_OpenAwardsInformation: Mở trang Awards Information

**Type**: ui
**Interaction**: navigation
**Priority**: Medium
**Estimate**: S

### User Story

As a guest, I want to bấm liên kết "Awards Information" (hoặc CTA "ABOUT AWARDS") so that đi tới trang thông tin giải thưởng.

### Acceptance Criteria

- [ ] Criterion 1: Ba phần tử trỏ `/awards-information`: liên kết "Awards Information" ở header (`site-header.tsx:36`), CTA "ABOUT AWARDS" ở hero (`hero-section.tsx:69`) và liên kết "Awards Information" ở footer (`site-footer.tsx:32`).
- [ ] Criterion 2: Bấm một trong ba phần tử sẽ điều hướng sang `/awards-information` bằng `next/link`.
- [ ] Criterion 3: `[NOT_BUILT]` Đích `/awards-information` chưa có page trong `app/` nên hiện trả 404; US này ghi lại ý định điều hướng của phần tử có thật.

### Technical Notes

- **Endpoint**: GET /awards-information (chưa có route trong RouteList)
- **Data Required**: Nhãn từ `home.nav.awards`, `home.hero.aboutAwards`
- **Dependencies**: Trang đích chưa xây; cả ba tác nhân (guest, signed-in user, admin) có hành vi giống nhau

### Screens

- SCR003_Homepage: Homepage

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Khách ở `/` | Bấm "ABOUT AWARDS" ở hero | Trình duyệt điều hướng tới `/awards-information` |
| Error Case | Trang đích chưa xây | Bấm liên kết "Awards Information" ở header | Nhận 404 từ Next.js (hành vi hiện tại, không có trang lỗi tuỳ chỉnh) |

---

## US009_OpenSunKudos: Mở trang Sun* Kudos

**Type**: ui
**Interaction**: navigation
**Priority**: Medium
**Estimate**: S

### User Story

As a guest, I want to bấm liên kết "Sun* Kudos" (hoặc CTA "ABOUT KUDOS", hoặc "Chi tiết" ở khối Kudos) so that đi tới trang giới thiệu Sun* Kudos.

### Acceptance Criteria

- [ ] Criterion 1: Bốn phần tử trỏ `/sun-kudos`: liên kết header (`site-header.tsx:40`), CTA "ABOUT KUDOS" ở hero (`hero-section.tsx:74`), liên kết "Chi tiết/Details" ở khối Kudos (`kudos-section.tsx:36`) và liên kết footer (`site-footer.tsx:36`).
- [ ] Criterion 2: Bấm một trong bốn phần tử sẽ điều hướng sang `/sun-kudos`.
- [ ] Criterion 3: `[NOT_BUILT]` Đích `/sun-kudos` chưa có page nên hiện trả 404.

### Technical Notes

- **Endpoint**: GET /sun-kudos (chưa có route trong RouteList)
- **Data Required**: Nhãn từ `home.nav.kudos`, `home.hero.aboutKudos`, `home.kudos.details`
- **Dependencies**: Trang đích chưa xây; cả ba tác nhân có hành vi giống nhau

### Screens

- SCR003_Homepage: Homepage

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Khách ở `/`, cuộn tới khối Kudos | Bấm "Chi tiết" | Trình duyệt điều hướng tới `/sun-kudos` |
| Error Case | Trang đích chưa xây | Bấm "Sun* Kudos" ở header | Nhận 404 từ Next.js |

---

## US010_OpenStandards: Mở trang Tiêu chuẩn chung

**Type**: ui
**Interaction**: navigation
**Priority**: Low
**Estimate**: S

### User Story

As a guest, I want to bấm liên kết "Tiêu chuẩn chung" ở footer so that đi tới trang tiêu chuẩn chung của giải thưởng.

### Acceptance Criteria

- [ ] Criterion 1: Footer có liên kết `home.nav.standards` ("Tiêu chuẩn chung" / "General Standards") trỏ `/standards` (`site-footer.tsx:40`); header không có liên kết này.
- [ ] Criterion 2: Bấm liên kết điều hướng sang `/standards`.
- [ ] Criterion 3: `[NOT_BUILT]` `/standards` chưa có page nên hiện trả 404.

### Technical Notes

- **Endpoint**: GET /standards (chưa có route trong RouteList)
- **Data Required**: Nhãn từ `home.nav.standards`
- **Dependencies**: Trang đích chưa xây

### Screens

- SCR003_Homepage: Homepage

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Khách ở `/` | Bấm "Tiêu chuẩn chung" ở footer | Trình duyệt điều hướng tới `/standards` |
| Error Case | Trang đích chưa xây | Bấm liên kết | Nhận 404 từ Next.js |

---

## US011_OpenAwardDetails: Mở chi tiết một hạng mục giải thưởng

**Type**: ui
**Interaction**: navigation
**Priority**: Medium
**Estimate**: S

### User Story

As a guest, I want to bấm vào một thẻ giải thưởng so that đi tới phần chi tiết của đúng hạng mục đó.

### Acceptance Criteria

- [ ] Criterion 1: Mỗi thẻ có ba liên kết cùng `href` (ảnh, tên, "Chi tiết/Details"); liên kết ảnh có `tabIndex=-1` và `aria-hidden` để không lặp thứ tự Tab (`awards-grid.tsx:31-36,50,59`).
- [ ] Criterion 2: `href` = `/awards-information#<slug>` (slug được `encodeURIComponent`), hoặc `/awards-information` khi hàng không có slug (`lib/awards/award-card-mapping.ts:60`).
- [ ] Criterion 3: `[NOT_BUILT]` Đích `/awards-information` chưa có page nên hiện trả 404; phần neo `#<slug>` chưa có nơi nhận.

### Technical Notes

- **Endpoint**: GET /awards-information#<slug> (chưa có route trong RouteList)
- **Data Required**: Cột `slug` của MODEL001_Award
- **Dependencies**: Phụ thuộc US019 (lưới có dữ liệu) và trang đích chưa xây; cả ba tác nhân giống nhau

### Screens

- SCR003_Homepage/REG002_AwardsGrid: AwardsGrid

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Lưới có thẻ với slug `top-talent` | Bấm "Chi tiết" của thẻ đó | Điều hướng tới `/awards-information#top-talent` |
| Error Case | Hàng awards không có slug | Bấm thẻ | Điều hướng tới `/awards-information` (không có neo) |

---

## US012_ChangeLoginLanguage: Đổi ngôn ngữ màn hình Login

**Type**: ui
**Interaction**: secondary-action
**Priority**: Low
**Estimate**: S

### User Story

As a guest, I want to chọn VN hoặc EN ở bộ chọn ngôn ngữ so that đọc màn hình Login bằng ngôn ngữ mình quen.

### Acceptance Criteria

- [ ] Criterion 1: Bấm nút trigger (nhãn truy cập "Ngôn ngữ: VN" / "Language: EN") mở menu hai mục VN, EN; mục đang chọn được focus và tô nền (`language-selector.tsx:85-92,117-133`).
- [ ] Criterion 2: Chọn ngôn ngữ khác ngôn ngữ hiện tại gọi `setLocale` trong `startTransition`, ghi cookie `NEXT_LOCALE` (`path=/`, `maxAge` 1 năm, `sameSite=lax`) và chữ trên màn hình đổi (`language-selector.tsx:47-58`, `lib/i18n/actions.ts:8-17`).
- [ ] Criterion 3: Chọn lại đúng ngôn ngữ hiện tại chỉ đóng menu, không gọi action (`language-selector.tsx:49`).
- [ ] Criterion 4: `Esc` đóng menu và trả focus về trigger; Tab đóng menu; ArrowUp/ArrowDown di chuyển giữa hai mục; bấm ra ngoài đóng menu (`language-selector.tsx:33-40,60-79`).
- [ ] Criterion 5: Action lỗi chỉ ghi log `[language] switch failed`, giữ ngôn ngữ cũ, không vào error boundary (`language-selector.tsx:51-56`).

### Technical Notes

- **Endpoint**: POST /login [Next-Action: setLocale] (ROUTE006)
- **Data Required**: `locale` ∈ {`vi`, `en`} (giá trị khác bị `isLocale` bỏ qua); cookie `NEXT_LOCALE`
- **Dependencies**: PERM008_LocaleAllowList; dictionary `lib/i18n/dictionary.ts`

### Screens

- SCR001_Login: Login

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Màn hình Login đang ở VN | Mở menu, chọn EN | Cookie `NEXT_LOCALE=en` được ghi, chữ chuyển sang tiếng Anh, trigger hiện "EN" |
| Error Case | `setLocale` ném lỗi | Chọn ngôn ngữ khác | Ngôn ngữ giữ nguyên, lỗi chỉ ghi log, trang không vỡ |

---

## US013_CompleteGoogleSignIn: Hoàn tất đăng nhập Google

**Type**: system
**Interaction**: system-action
**Priority**: High
**Estimate**: M

### User Story

As a guest, I want to được đưa về ứng dụng sau khi xác thực xong với Google so that có phiên đăng nhập và vào trang chủ, hoặc biết đăng nhập bị huỷ hoặc thất bại.

### Acceptance Criteria

- [ ] Criterion 1: `GET /auth/callback?code=…` hợp lệ: đổi `code` lấy phiên bằng `exchangeCodeForSession`, ghi cookie phiên và trả 302 về `/` (`app/auth/callback/route.ts:24-29,43-48`).
- [ ] Criterion 2: Có `?error=access_denied` (người dùng bấm huỷ ở Google) thì 302 về `/login?error=cancelled`; `?error=` khác thì `/login?error=failed`; không bao giờ đổi `code` đi kèm một `error` (`route.ts:35-38`).
- [ ] Criterion 3: Thiếu `code` thì coi là huỷ → `/login?error=cancelled` (`route.ts:40-41`).
- [ ] Criterion 4: Đổi `code` lỗi hoặc ném exception (Supabase không tới được, thiếu env, thiếu cookie PKCE) → `/login?error=failed`, ghi log `[auth/callback]`, không bao giờ trả 500 (`route.ts:49-59`).
- [ ] Criterion 5: Đích luôn là đường dẫn cố định trên origin của request; `next`, `redirect_to` và mọi query khác bị bỏ qua nên không có open redirect (`route.ts:19-21,26-29`).

### Technical Notes

- **Endpoint**: GET /auth/callback (ROUTE007)
- **Data Required**: Query `code` hoặc `error`; cookie PKCE verifier (ghi ở US001); tài khoản mới tự tạo dòng `profiles` role `user` qua trigger khi đăng nhập lần đầu (`supabase/migrations/20261008045415_create_profiles.sql`)
- **Dependencies**: PERM002_OAuthCallbackPublicEntry, PERM007_GoogleSignInPublicStart; nối tiếp US001; kết quả lỗi hiển thị ở US002. Route nằm ngoài `config.matcher` của proxy.

### Screens

- SCR001_Login: Login
- SCR003_Homepage: Homepage

### Background Logic

- BL002_OAuthCallbackExchange: OAuth Callback Exchange
- BL001_SupabaseServerClient: Supabase Server Client

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Khách vừa đồng ý ở Google, `code` hợp lệ cùng cookie PKCE | Trình duyệt gọi `/auth/callback?code=…` | Phiên được tạo, 302 về `/`, trang chủ hiện menu tài khoản |
| Error Case | Khách bấm huỷ ở Google (`?error=access_denied`) | Trình duyệt gọi `/auth/callback?error=access_denied` | 302 về `/login?error=cancelled`, thấy thông báo lỗi, không tạo phiên |

---

## US014_RedirectSignedInFromLogin: Chuyển người đã đăng nhập khỏi màn hình Login

**Type**: system
**Interaction**: system-action
**Priority**: Medium
**Estimate**: S

### User Story

As a signed-in user, I want to được đưa thẳng về trang chủ khi mở `/login` so that không phải xem màn hình đăng nhập khi đã có phiên.

### Acceptance Criteria

- [ ] Criterion 1: `GET` hoặc `HEAD` `/login` với claims hợp lệ trả 307 về `/` (`lib/supabase/proxy-session.ts:99-105`, matcher `["/", "/login"]` ở `proxy.ts:17-19`).
- [ ] Criterion 2: Khách (không claims, claims lỗi, lỗi mạng hoặc thiếu env Supabase) vào `/login` bình thường, không bị chuyển hướng, không trả 500 (`proxy-session.ts:54-96`).
- [ ] Criterion 3: `POST` (Server Action như `signInWithGoogle`, `setLocale`, `signOut`) không bao giờ bị chuyển hướng (`proxy-session.ts:23-25`).
- [ ] Criterion 4: Đích là đường dẫn cố định `/`, không đọc từ query nên không có open redirect (`proxy-session.ts:27-28`). Quy tắc chuyển hướng duy nhất của dự án; `/` không bao giờ chuyển hướng khách.

### Technical Notes

- **Endpoint**: GET /login (ROUTE004)
- **Data Required**: Cookie phiên Supabase; claims JWT đã xác thực chữ ký (`getClaims()`)
- **Dependencies**: PERM001_LoginSessionRedirect, BL003_SessionRefreshProxy. Proxy không phải rào chắn bảo vệ route — trang và action phải tự kiểm tra lại khi cần.

### Screens

- SCR001_Login: Login
- SCR003_Homepage: Homepage

### Background Logic

- BL003_SessionRefreshProxy: Session Refresh Proxy

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Người dùng có phiên hợp lệ | Mở `/login` | 307 về `/`, thấy trang chủ |
| Error Case | `getClaims` lỗi hoặc thiếu env Supabase | Mở `/login` | Được coi là khách, thấy màn hình Login, proxy ghi log `[proxy]` |

---

## US015_RefreshSession: Làm mới phiên đăng nhập

**Type**: system
**Interaction**: system-action
**Priority**: High
**Estimate**: M

### User Story

As a signed-in user, I want to có phiên tự được làm mới khi mở trang chủ so that không bị đăng xuất giữa chừng khi token sắp hết hạn.

### Acceptance Criteria

- [ ] Criterion 1: Mỗi request khớp `/` hoặc `/login` chạy `updateSession`, gọi `supabase.auth.getClaims()` để xác thực và làm mới token (`proxy.ts:9-19`, `proxy-session.ts:60-97`).
- [ ] Criterion 2: Cookie mới được gom lại, phản chiếu lên request để Server Component cùng request đọc được token mới, và gắn vào response kể cả khi là redirect (`proxy-session.ts:43-50`).
- [ ] Criterion 3: Cookie phiên có `httpOnly`, `sameSite=lax`, `path=/`; `secure` chỉ bật khi `NODE_ENV === "production"` (`lib/supabase/session-cookie-options.ts:11-16`).
- [ ] Criterion 4: Mọi lỗi làm mới đều coi là khách, request đi tiếp, chỉ ghi log `[proxy]`, không trả 500; khách không bao giờ bị chặn ở `/` (`proxy-session.ts:82-96`).

### Technical Notes

- **Endpoint**: GET / (ROUTE001); cũng áp dụng cho POST / (ROUTE002, ROUTE003) và các route `/login` (ROUTE004..006)
- **Data Required**: Cookie phiên Supabase; biến môi trường `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (chỉ tên, không giá trị)
- **Dependencies**: BL003_SessionRefreshProxy, PERM011_SessionCookieSecureEnvGate; vùng tài khoản (US003..US006) đọc phiên đã làm mới qua `getCurrentUser()`

### Screens

- SCR003_Homepage: Homepage
- SCR001_Login: Login

### Background Logic

- BL003_SessionRefreshProxy: Session Refresh Proxy

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Signed-in user có access token sắp hết hạn | Mở `/` | Token được làm mới, cookie mới có trong response, vùng tài khoản vẫn hiện menu |
| Error Case | Refresh token đã chết hoặc mạng lỗi | Mở `/` | Được coi là khách, trang vẫn tải (hiện liên kết "Đăng nhập"), không trả 500 |

---

## US016_ReturnToHomepageTop: Quay về đầu trang chủ

**Type**: ui
**Interaction**: navigation
**Priority**: Low
**Estimate**: S

### User Story

As a guest, I want to bấm logo hoặc liên kết "About SAA 2025" khi đang ở trang chủ so that được cuộn ngay về đầu trang.

### Acceptance Criteria

- [ ] Criterion 1: Logo và "About SAA 2025" ở header (`site-header.tsx:18,32`) và ở footer (`site-footer.tsx:15,28`) đều trỏ `/`.
- [ ] Criterion 2: Click chính (không Ctrl/Meta/Shift/Alt, không chuột phải), cùng origin, cùng pathname, không có hash, không `target` khác `_self`, không `download` thì cuộn tức thì (`behavior: "instant"`) về `top: 0` (`same-page-scroll-top.tsx:19-24,34-46`).
- [ ] Criterion 3: Listener không gọi `preventDefault`; điều hướng của `next/link` vẫn chạy bình thường (`same-page-scroll-top.tsx:9-10`).

### Technical Notes

- **Endpoint**: GET / (ROUTE001)
- **Data Required**: Không có
- **Dependencies**: Component `SamePageScrollTop` gắn một lần ở `home-content.tsx:36`; không áp dụng cho `/login` (không gắn)

### Screens

- SCR003_Homepage: Homepage

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Khách đang cuộn xuống giữa trang chủ | Bấm logo ở header | Trang cuộn tức thì về đầu |
| Error Case | Khách giữ Ctrl khi bấm logo | Click | Không cuộn trang hiện tại (trình duyệt mở tab mới theo hành vi mặc định) |

---

## US017_ChangeHomepageLanguage: Đổi ngôn ngữ trang chủ

**Type**: ui
**Interaction**: secondary-action
**Priority**: Medium
**Estimate**: S

### User Story

As a guest, I want to chọn VN hoặc EN ở bộ chọn ngôn ngữ trên header so that đọc trang chủ bằng ngôn ngữ mình quen.

### Acceptance Criteria

- [ ] Criterion 1: Bộ chọn nằm ở slot ngôn ngữ của header, giữa chuông và vùng tài khoản (`home-content.tsx:38-42`), dùng cùng component `LanguageSelector` với màn hình Login.
- [ ] Criterion 2: Chọn ngôn ngữ khác gọi `setLocale` (ROUTE003), ghi cookie `NEXT_LOCALE`; chữ giao diện của trang chủ (nav, nhãn hero và đếm ngược, nhãn sự kiện, tiêu đề mục, nút "Chi tiết", footer, menu tài khoản) đổi theo ngôn ngữ mới; nội dung dài (bài Root Further, mô tả giải thưởng, nội dung Kudos, giá trị sự kiện) giữ tiếng Việt (`home-content.tsx:28-29`).
- [ ] Criterion 3: Hành vi mở/đóng menu, phím `Esc`/Tab/mũi tên và xử lý lỗi giống US012 (`language-selector.tsx:33-79`).
- [ ] Criterion 4: Cookie ngôn ngữ hợp lệ được nhớ giữa các lần mở trang và cũng áp dụng cho `/login`.

### Technical Notes

- **Endpoint**: POST / [Next-Action: setLocale] (ROUTE003)
- **Data Required**: `locale` ∈ {`vi`, `en`}; cookie `NEXT_LOCALE`; nội dung giải thưởng trả theo locale (`getAwards(locale)`)
- **Dependencies**: PERM008_LocaleAllowList; cả ba tác nhân có hành vi giống nhau

### Screens

- SCR003_Homepage: Homepage

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Trang chủ đang ở VN | Chọn EN | Cookie `NEXT_LOCALE=en`, chữ nav/hero/giải thưởng chuyển sang tiếng Anh |
| Error Case | Cookie `NEXT_LOCALE` có giá trị ngoài {`vi`, `en`} | Mở trang chủ | `getLocale` rơi về ngôn ngữ mặc định, trang vẫn hiển thị bình thường |

---

## US018_ViewEventCountdown: Xem đồng hồ đếm ngược tới sự kiện

**Type**: ui
**Interaction**: secondary-action
**Priority**: High
**Estimate**: M

### User Story

As a guest, I want to xem đồng hồ đếm ngược DAYS/HOURS/MINUTES ở hero so that biết còn bao lâu nữa đến sự kiện SAA 2025.

### Acceptance Criteria

- [ ] Criterion 1: Hero có ba ô ngày/giờ/phút, mỗi ô đệm tối thiểu hai chữ số (`countdown-tiles.tsx:24-45`, `lib/countdown/countdown-math.ts:20-28`).
- [ ] Criterion 2: Trước khi hydrate, ba ô hiện `--` và không có dòng "Coming soon" (`lib/countdown/use-countdown.ts:20-23,44`).
- [ ] Criterion 3: Sau hydrate, số phút còn lại làm tròn lên và tự cập nhật đúng lúc đổi phút; quay lại tab đang ẩn thì đọc lại đồng hồ ngay (`use-countdown.ts:50-75`, `countdown-math.ts:15-17,34-40`).
- [ ] Criterion 4: Dòng "Coming soon" chỉ hiện khi mốc còn ở tương lai (`showComingSoon: minutes > 0`, `use-countdown.ts:45`).
- [ ] Criterion 5: Khi `SAA_COUNTDOWN_TARGET` thiếu, trống, không phải ISO-8601 có offset (`Z` hoặc `±hh:mm`) hoặc không hợp lệ, đồng hồ hiện 00 00 00 và ẩn "Coming soon"; mỗi giá trị sai chỉ ghi log `[countdown]` một lần mỗi tiến trình (`lib/countdown/parse-countdown-target.ts:5-40`).

### Technical Notes

- **Endpoint**: N/A (biến môi trường `SAA_COUNTDOWN_TARGET` đọc phía server ở `home-content.tsx:31`, số mili giây truyền xuống client)
- **Data Required**: `SAA_COUNTDOWN_TARGET` (ISO-8601 có offset); nhãn `home.countdown`
- **Dependencies**: Không có BL; không có tương tác bấm — US ghi nhận hành vi hiển thị quan sát được; hành vi giống nhau cho cả ba tác nhân

### Screens

- SCR003_Homepage: Homepage

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Mốc đặt cách hiện tại 2 ngày 3 giờ 15 phút | Trang chủ hydrate xong | Ba ô hiện 02 / 03 / 15 và "Coming soon" hiện |
| Error Case | `SAA_COUNTDOWN_TARGET` thiếu hoặc sai định dạng | Mở trang chủ | Ba ô hiện 00 00 00, không có "Coming soon", server log một dòng `[countdown]` |

---

## US019_ViewAwardCategories: Xem các hạng mục giải thưởng

**Type**: ui
**Interaction**: secondary-action
**Priority**: High
**Estimate**: M

### User Story

As a guest, I want to xem lưới các hạng mục giải thưởng ở trang chủ so that biết SAA 2025 có những giải nào.

### Acceptance Criteria

- [ ] Criterion 1: Lưới hiển thị mỗi hạng mục một thẻ gồm ảnh, tên, mô tả (tối đa 2 dòng) và liên kết "Chi tiết/Details", theo thứ tự `sort_order` (`awards-grid.tsx:25-67`, `lib/awards/get-awards.ts:24-27`).
- [ ] Criterion 2: Tên hạng mục theo ngôn ngữ hiện tại (`title_vi`/`title_en`, `getAwards(locale)`); mô tả luôn là tiếng Việt (`description_vi`) ở cả hai ngôn ngữ.
- [ ] Criterion 3: Khách và người đã đăng nhập đều thấy lưới (RLS `awards_select_public` cho `anon` và `authenticated`).
- [ ] Criterion 4: Trong lúc tải hiện skeleton sáu ô không có chữ/liên kết (`awards-grid.tsx:74-`, `home-content.tsx:51-53`).
- [ ] Criterion 5: Khi không có hàng nào, hoặc truy vấn lỗi, hoặc trả dữ liệu hỏng, lưới hiện thông báo `home.awards.empty` ("Thông tin giải thưởng sẽ sớm được cập nhật."); lỗi chỉ ghi log `[awards]`, không làm vỡ trang (`awards-grid.tsx:21-23`, `get-awards.ts:28-45`).

### Technical Notes

- **Endpoint**: N/A (Server Component đọc bảng `awards` qua PostgREST; không có endpoint HTTP riêng) — ROUTE001 render
- **Data Required**: MODEL001_Award (slug, tên vi/en, mô tả vi/en, ảnh, `sort_order`)
- **Dependencies**: PERM009_AwardsPublicReadServiceWrite, BL001_SupabaseServerClient; vùng độc lập `Suspense` riêng nên hero không bị chặn bởi truy vấn chậm

### Screens

- SCR003_Homepage/REG002_AwardsGrid: AwardsGrid

### Background Logic

- BL001_SupabaseServerClient: Supabase Server Client

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Bảng `awards` có 6 hạng mục đã seed | Khách mở `/` | Thấy 6 thẻ theo `sort_order`, chữ đúng ngôn ngữ hiện tại |
| Error Case | Truy vấn `awards` lỗi hoặc bảng rỗng | Khách mở `/` | Thấy thông báo "sẽ sớm được cập nhật", phần còn lại của trang hiển thị bình thường |

---

## US020_OpenAccountMenu: Mở menu tài khoản

**Type**: ui
**Interaction**: secondary-action
**Priority**: High
**Estimate**: S

### User Story

As a signed-in user, I want to bấm nút tài khoản trên header so that xem các mục của menu tài khoản.

### Acceptance Criteria

- [ ] Criterion 1: Người đã đăng nhập thấy nút tài khoản 40x40 (biểu tượng người dùng, nhãn truy cập `accountMenu.account`) với `aria-haspopup="menu"`, `aria-expanded` (`account-menu-view.tsx:26-37`).
- [ ] Criterion 2: Bấm nút (hoặc Enter/Space) mở menu `role="menu"` có mục "Hồ sơ/Profile" và "Đăng xuất/Sign out"; admin thấy thêm "Trang quản trị/Admin Dashboard" ở giữa (`account-region.tsx:69-73`, `account-menu-view.tsx:38-57`).
- [ ] Criterion 3: Danh sách mục được lọc ở server theo `getCurrentUser().role`; vai trò không đi xuống trình duyệt; vai trò không phải đúng chuỗi `"admin"` (kể cả lỗi tra cứu) thì không có mục Admin (`account-menu.tsx:11-14`, `current-user.ts:68-82`).
- [ ] Criterion 4: Menu mở thì `aria-controls` trỏ id menu; các mục theo thứ tự Tab (không có điều hướng mũi tên) (`account-menu-view.tsx:32`, `use-menu-disclosure.ts:14-17`).

### Technical Notes

- **Endpoint**: N/A (trạng thái mở/đóng ở client; vai trò đọc từ `profiles.role` ở server)
- **Data Required**: Claims JWT; `profiles.role` dưới RLS (MODEL002_Profile)
- **Dependencies**: PERM003_AccountRegionAuthState, PERM004_AdminMenuEntryVisibility, PERM005_SessionRoleResolution, PERM010_ProfilesSelectOwnServiceWrite, BL001_SupabaseServerClient

### Screens

- SCR003_Homepage/REG001_AccountRegion: AccountRegion

### Background Logic

- BL001_SupabaseServerClient: Supabase Server Client

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Signed-in user (role `user`) ở `/` | Bấm nút tài khoản | Menu mở với "Hồ sơ" và "Đăng xuất", không có mục Admin |
| Error Case | Không đọc được dòng `profiles` của người dùng | Bấm nút tài khoản | Menu vẫn mở với vai trò `user`, không lộ mục Admin |

---

## US021_CloseAccountMenu: Đóng menu tài khoản

**Type**: ui
**Interaction**: secondary-action
**Priority**: Medium
**Estimate**: S

### User Story

As a signed-in user, I want to đóng menu tài khoản đang mở so that menu không che nội dung và focus quay lại nút tài khoản.

### Acceptance Criteria

- [ ] Criterion 1: Nhấn `Esc` (dù focus ở trigger, trong menu hay trên trang) đóng menu và trả focus về nút tài khoản (`use-menu-disclosure.ts:44-50,64-70`).
- [ ] Criterion 2: `pointerdown` ngoài nút + menu, hoặc focus chuyển ra ngoài (Tab/Shift+Tab ra khỏi menu) đóng menu (`use-menu-disclosure.ts:41-43,52-54`).
- [ ] Criterion 3: Bấm lại nút tài khoản khi menu đang mở đóng menu (`toggle`, `use-menu-disclosure.ts:61`).
- [ ] Criterion 4: Mọi listener toàn trang chỉ gắn khi menu đang mở và được gỡ khi đóng (`use-menu-disclosure.ts:55-60`).

### Technical Notes

- **Endpoint**: N/A (trạng thái client)
- **Data Required**: Không có
- **Dependencies**: Phụ thuộc US020 (menu đã mở)

### Screens

- SCR003_Homepage/REG001_AccountRegion: AccountRegion

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Menu tài khoản đang mở, focus trong menu | Nhấn `Esc` | Menu đóng, focus về nút tài khoản |
| Error Case | Menu đang mở | Bấm vào vùng trống ngoài menu | Menu đóng, focus không bị kéo về nút (người dùng đã chọn chỗ khác) |

---

## Screen → US Map

| Screen | US Codes |
|--------|---------|
| SCR001_Login | US001, US002, US012, US003, US006, US013, US014, US015 |
| SCR002_Todo | — (đã gỡ 2026-10-08, không có US) |
| SCR003_Homepage | US008, US009, US010, US016, US017, US018, US013, US014, US015 |
| SCR003_Homepage/REG001_AccountRegion | US003, US004, US020, US021, US005, US007, US006 |
| SCR003_Homepage/REG002_AwardsGrid | US019, US011 |

> Screens with 0 US mapped → emit `[IPE_ZERO]` warning. Không có màn hình đang hoạt động nào có 0 US; SCR002_Todo là bản ghi đã gỡ nên không tính `[IPE_ZERO]`.
> Số US `ui` = 18 ≥ số màn hình đang hoạt động = 2. Số US system = 3, phủ đủ BL001, BL002, BL003.

## Cross-Reference Validation

- [x] All US### codes are unique
- [x] All acceptance criteria are testable
- [x] All technical notes are complete
- [x] All US### codes are referenced in FeatureList.md
- [x] All `ui` US### mapped to SCR### or SCR###/REG### (parent SCR must exist in ScreenList; system US excluded)
- [x] All system US### have at least one BL### mapped (UI US excluded)
