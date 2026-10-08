# Screen List

**Project**: my-app (SAA 2025 — Sun* Annual Awards 2025)
**Generated**: 2026-10-08
**Analysis Scope**: `app/` (page, layout, route handler, `_components/`), `lib/` (auth, awards, countdown, i18n, supabase, ui), `proxy.ts`. Nguồn màn hình: `route-view` (Next.js 16.4 App Router) — mỗi file `page.tsx` phục vụ một URL riêng là một ứng viên SCR, đối chiếu `route-list.md` (ROUTE001..007).

**Code Format**: All codes MUST follow `SCR###_NameSlug` format (e.g., SCR001_LoginForm, SCR002_Dashboard) | `SCR###/REG###` for region-scoped references within a composite screen

**Note**: Feature mapping is managed in FeatureList.md only. UserStory mapping is done in UserStories.md (not in this document).

**Region Guidance**: Declare a Region only when it has ≥1 independence signal: distinct API endpoint (read or write), independent loading state, independent scroll container, independent auth / permission gate, distinct business workflow, distinct mutation surface / API cluster (distinct write endpoints or POST/PUT/DELETE namespace — even if the initial GET payload is shared), or distinct validation / action path. Shared initial payload does NOT disqualify a REG — if regions diverge on mutations, validation, or business workflow, they remain separate. Visual separation alone is NOT sufficient (trap 1).

**Region Cross-ref**: Region codes are per-screen; REG001 under SCR001 is distinct from REG001 under SCR002.

**REG Numbering**: Assign REG001, REG002, ... in top-to-bottom visual order as rendered at the screen's default viewport (desktop default if responsive). Ties broken by left-to-right reading order. Researcher documents source file:line for each REG to allow reviewer verification.

**Region Deprecation**: Regions table MAY include a `status` column with values `active` | `deprecated`. Deprecated regions keep their REG### number reserved (no renumbering); downstream refs remain valid; reviewer emits WARNING (not critical) until spec-wide cleanup.

> Ghi chú về mã màn hình: SCR001_Login, SCR002_Todo, SCR003_Homepage là mã chuẩn, ổn định, không đánh số lại. SCR002_Todo đã bị gỡ ngày 2026-10-08 (xoá `app/todo/**`) và được giữ làm bản ghi đã gỡ (tombstone) để dãy mã liền mạch; nó không tính vào số màn hình đang hoạt động và không có route, không có file nguồn.

<!-- ANTI-COMPRESSION RULE: One SCR per distinct view/page file. Do NOT collapse a namespace or
     wildcard route (e.g. /admin/system/*) into a single composite SCR. ≥2 view files under one
     namespace/route prefix → emit one SCR per file (apply H6). A wildcard route as a single SCR
     is FORBIDDEN — expand to concrete child routes from RouteList first.
     See: composite-screen-detection.md § Composite Hard Guard -->
## Screen Index

| Code | Name | Type | Components | Data Displayed |
|------|------|------|------------|----------------|
| SCR001_Login | Login | atomic | 9 | 3 |
| SCR002_Todo | Todo | removed (2026-10-08) | 0 | 0 |
| SCR003_Homepage | Homepage | composite | 14 | 5 |

---

## SCR001_Login: Login

**Type**: atomic

### Description

Màn hình đăng nhập công khai tại `/login` (`app/login/page.tsx:15`). Người dùng bấm nút Google để bắt đầu đăng nhập OAuth (PKCE) qua Supabase; có bộ chọn ngôn ngữ vi/en ở header. Trang tự bọc `Suspense` và đọc `searchParams` + cookie ngôn ngữ bên trong (`page.tsx:23-44`) để Next prerender được phần vỏ.

Luồng dữ liệu và lời gọi dịch vụ (đầu vào cho BehaviorLogic):
- Nút Google gọi Server Action `signInWithGoogle` (`app/login/actions.ts:29`, ROUTE005): dựng origin từ header, gọi `supabase.auth.signInWithOAuth` qua `createClient` (BL001_SupabaseServerClient), rồi `redirect` sang URL authorize của Google. Lỗi nào cũng trả `{ error: "failed" }`.
- Bộ chọn ngôn ngữ gọi Server Action `setLocale` (`lib/i18n/actions.ts:8`, ROUTE006) để ghi cookie `NEXT_LOCALE`.
- Google/Supabase trả trình duyệt về `/auth/callback` (ROUTE007, route handler không có giao diện — `app/auth/callback/route.ts:24`, BL002_OAuthCallbackExchange); thành công thì 302 về `/` (SCR003_Homepage), huỷ hoặc lỗi thì 302 về `/login?error=cancelled|failed`.
- `proxy.ts` (BL003_SessionRefreshProxy) khớp `/login`: người đã đăng nhập mở `/login` bị chuyển 307 về `/` (`lib/supabase/proxy-session.ts:102`).

> Note: Phân loại theo H-rule (thứ tự H6 → H4 → H5 → H2 → H3 → H1 → cổng 2-of-3): H6 không áp dụng (không có outlet/route con), H4 không có tab, H5 không có stepper, H2 = 0 (không import từ `features/*`, `modules/*`, `domains/*`), H3 = 0 (chỉ có landmark `<header>`/`<main>`/`<footer>`, không có `<section>`/`<article>`/`<aside>`/`role="region"`) [H3_RAW_DIV], H1 = 1 (chỉ F001) → 0/3 tín hiệu đạt cổng → atomic, không có REG. Cảnh báo: dự án dùng div thuần nên H3 dễ bị đánh giá thấp (giới hạn phát hiện đã biết).

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| LoginScreen (`app/login/_components/login-screen.tsx:20`) | container | Khung toàn trang: nền, phân lớp, ghép header / nội dung / footer |
| KeyVisual (`login-screen.tsx:33-45`) | image | Ảnh nền key visual và lớp gradient trang trí |
| Header (`login-screen.tsx:48-59`) | header | Logo SAA 2025 cố định ở đầu trang |
| LanguageSelector (`app/_components/site/language-selector.tsx:23`) | dropdown | Chọn VN/EN, gọi `setLocale` (ROUTE006) trong `startTransition` (`:50-57`) |
| Title (`login-screen.tsx:65-76`) | heading | Tiêu đề "ROOT FURTHER" dạng ảnh, kèm chữ ẩn cho trình đọc màn hình |
| IntroText (`login-screen.tsx:80-83`) | text | Hai đoạn giới thiệu theo ngôn ngữ (dictionary `login`) |
| GoogleButton (`app/login/_components/google-button.tsx:13`) | form button | Gửi form tới `signInWithGoogle` bằng `useActionState`; hiện spinner khi đang chờ; tải lại trang khi bfcache khôi phục (`:24-30`) |
| ErrorAlert (`google-button.tsx:50-57`) | alert | Thông báo lỗi đăng nhập (`role="alert"`), hiện khi `state.error` có giá trị |
| Footer (`login-screen.tsx:101-106`) | footer | Dòng bản quyền cố định ở cuối trang |

### Data Displayed

- Data Entity 1: Chuỗi giao diện theo ngôn ngữ (`getDictionary(locale).login`, `lib/i18n/dictionary.ts`) — không phải bảng DB
- Data Entity 2: Cookie `NEXT_LOCALE` (ngôn ngữ hiện tại, `lib/i18n/get-locale.ts:9`)
- Data Entity 3: Tham số `?error` (chỉ nhận `cancelled` | `failed`, `app/login/page.tsx:11,28-30`)

### Routes/URLs

- `/login` (GET, ROUTE004)
- POST `/login` [Next-Action: signInWithGoogle] (ROUTE005)
- POST `/login` [Next-Action: setLocale] (ROUTE006)
- Đường quay về OAuth: `/auth/callback` (GET, ROUTE007) — route handler không có view, thuộc luồng F001, không phải màn hình riêng

### Related Screens

- SCR003_Homepage: Homepage (navigation — đích sau đăng nhập thành công và khi đã có phiên mà mở `/login`)
- SCR002_Todo: Todo (đã gỡ — đích cũ sau đăng nhập, không còn)

---

## SCR002_Todo: Todo

**Type**: removed

**Status:** removed (2026-10-08)

### Description

Màn hình Todo (`/todo`) từng tồn tại trong F001 (trang tối thiểu hiển thị email và nút Đăng xuất). Toàn bộ `app/todo/**` đã bị xoá khỏi working tree ngày 2026-10-08; không còn route, không còn file nguồn. Mã được giữ để các tham chiếu cũ trong tài liệu (feature-list, screen spec) không trôi mã. Không tính vào tổng số màn hình đang hoạt động và không có cạnh điều hướng trong ScreenFlow.

### Related Screens

- SCR003_Homepage: Homepage (thay thế — `/` là đích sau đăng nhập)

---

## SCR003_Homepage: Homepage

**Type**: composite

### Description

Trang chủ công khai `/` của SAA 2025 (`app/page.tsx:7`): header cố định (logo, điều hướng, chuông thông báo, bộ chọn ngôn ngữ, vùng tài khoản), khối hero có đếm ngược, đoạn "Root Further", lưới giải thưởng đọc từ DB, khối Sun* Kudos, nút widget nổi và footer. Mọi dữ liệu theo request (cookie ngôn ngữ, phiên, DB) đọc bên trong `Suspense` để vỏ trang prerender được (`app/page.tsx:5-6`, `home-content.tsx:22-26`). Khách không bao giờ bị chuyển hướng ở `/`.

Luồng dữ liệu và lời gọi dịch vụ (đầu vào cho BehaviorLogic):
- `HomeContent` đọc cookie ngôn ngữ (`getLocale`), đọc biến môi trường `SAA_COUNTDOWN_TARGET` qua `parseCountdownTarget` (`home-content.tsx:31`) rồi chuyển số mili giây xuống đồng hồ phía client.
- Lưới giải thưởng: `getAwards(locale)` (`lib/awards/get-awards.ts:18`) đọc bảng `awards` qua `createClient` (BL001_SupabaseServerClient) — MODEL001_Award.
- Vùng tài khoản: `getCurrentUser()` (`lib/supabase/current-user.ts:32`) lấy claims JWT rồi đọc `profiles.role` dưới RLS — MODEL002_Profile; bấm Đăng xuất gọi Server Action `signOut` (`lib/auth/actions.ts:19`, ROUTE002).
- Bộ chọn ngôn ngữ gọi `setLocale` (ROUTE003). `SamePageScrollTop` cuộn lên đầu khi bấm liên kết cùng trang (`header-behaviour/same-page-scroll-top.tsx:17`).
- `proxy.ts` (BL003_SessionRefreshProxy) khớp `/` để làm mới cookie phiên; khách không bị chuyển hướng.

> Note: Phân loại theo H-rule (thứ tự H6 → H4 → H5 → H2 → H3 → H1 → cổng 2-of-3): H6 không áp dụng (không có outlet), H4 không có tab, H5 không có stepper. H2 = 0: không có import khớp `features/*`, `modules/*`, `domains/*` (các module `lib/awards`, `lib/countdown`, `lib/i18n`, `lib/supabase`, `lib/auth` không nằm trong mẫu include của bảng JS/TS). H3 = 4 vỏ vùng ngữ nghĩa đặt tên: `<section>` ở `hero-section.tsx:13`, `root-further-section.tsx:16`, `awards-section.tsx:6` (`role="region"`) và `kudos-section.tsx:9` → đạt. H1 = 3: các route của màn hình mang owner F002 (ROUTE001), F003 (ROUTE002), F001+F002 (ROUTE003) → đạt, nhưng ở mức biên (code màn hình chỉ chú thích trực tiếp F002 và F003; F001 chỉ vào qua đồng sở hữu ROUTE003). Cổng 2-of-3: H1∧H3 → composite. Không dùng [SIGNAL_INFERRED]. Đồng hồ đếm ngược, hero và Kudos không tách REG vì không có tín hiệu độc lập (không có endpoint, trạng thái tải hay cổng quyền riêng — Trap 1/Trap 4). Nếu người duyệt coi H1 chưa đạt thì màn hình về atomic và REG001_AccountRegion chuyển thành vùng ghi chú; giữ composite vì F003 sở hữu vùng tài khoản (feature-list: "vùng của SCR003").

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| SaaPageShell (`app/_components/site/saa-page-shell.tsx:5`) | container | Nền, màu chữ và biến font dùng chung cho các trang SAA |
| SiteHeader (`app/_components/site/site-header.tsx:11`) | header | Logo (liên kết `/`) và ba liên kết điều hướng `/`, `/awards-information`, `/sun-kudos`; nhận ba slot bell / ngôn ngữ / tài khoản |
| NotificationBell (`app/_components/site/account-slot-parts.tsx:26`) | icon button | Chuông thông báo, chỉ hiện khi đã đăng nhập, chỉ là giao diện (không có handler) — REG001_AccountRegion |
| LanguageSelector (`app/_components/site/language-selector.tsx:23`) | dropdown | Chọn VN/EN, gọi `setLocale` (ROUTE003) |
| AccountControl (`app/_components/header-behaviour/account-region.tsx:50`) | conditional | Khách: `GuestLoginLink` tới `/login` (`account-slot-parts.tsx:14`); đã đăng nhập: `AccountMenu` (`account-menu.tsx:16`) với Profile, Admin (chỉ vai trò admin), Đăng xuất — REG001_AccountRegion |
| HeroSection (`app/_components/home/hero-section.tsx:10`) | section | Tiêu đề, thông tin sự kiện, hai nút CTA tới `/awards-information` và `/sun-kudos` |
| LiveCountdown (`app/_components/home/countdown.tsx:13`) | client widget | Đếm ngược ngày/giờ/phút tới `SAA_COUNTDOWN_TARGET`, hiện `--` trước khi hydrate, ẩn "Coming soon" và hiện 00 00 00 khi chưa đặt/không hợp lệ hoặc đã tới mốc |
| RootFurtherSection (`app/_components/home/root-further-section.tsx:9`) | section | Đoạn văn "Root Further" và trích dẫn |
| AwardsSection (`app/_components/home/awards-section.tsx:3`) | section | Tiêu đề khối giải thưởng, bọc lưới giải thưởng — REG002_AwardsGrid |
| AwardsGrid (`app/_components/home/awards-grid.tsx:20`) | list | Lưới thẻ giải thưởng (hình, tên, mô tả, liên kết `/awards-information#<slug>`); `AwardsGridSkeleton` (`:74`) khi đang tải; thông báo rỗng khi không có dữ liệu — REG002_AwardsGrid |
| KudosSection (`app/_components/home/kudos-section.tsx:6`) | section | Khối giới thiệu Sun* Kudos với liên kết `/sun-kudos` |
| WidgetButton (`app/_components/home/widget-button.tsx:6`) | button | Nút nổi góc phải dưới, chỉ là giao diện (không có hành động) |
| SiteFooter (`app/_components/site/site-footer.tsx:8`) | footer | Logo và bốn liên kết `/`, `/awards-information`, `/sun-kudos`, `/standards`, dòng bản quyền |
| SamePageScrollTop (`app/_components/header-behaviour/same-page-scroll-top.tsx:17`) | behaviour | Không có giao diện; cuộn lên đầu khi bấm liên kết trỏ về chính trang này |

### Data Displayed

- Data Entity 1: MODEL001_Award — danh sách giải thưởng (slug, tên vi/en, mô tả, ảnh) theo `sort_order` (REG002_AwardsGrid)
- Data Entity 2: MODEL002_Profile — chỉ cột `role` để quyết định có hiện mục Admin (REG001_AccountRegion); vai trò không lộ xuống trình duyệt (`account-menu.tsx:11-14`)
- Data Entity 3: Biến môi trường `SAA_COUNTDOWN_TARGET` — mốc đếm ngược (cấu hình, không phải bảng DB)
- Data Entity 4: Chuỗi giao diện theo ngôn ngữ (`getDictionary(locale).home`, `.accountMenu`) — không phải bảng DB
- Data Entity 5: Cookie `NEXT_LOCALE` (ngôn ngữ hiện tại)

### Routes/URLs

- `/` (GET, ROUTE001)
- POST `/` [Next-Action: signOut] (ROUTE002)
- POST `/` [Next-Action: setLocale] (ROUTE003)
- Liên kết ra khỏi trang nhưng chưa có page trong code: `/awards-information`, `/sun-kudos`, `/standards`, `/profile`, `/admin` — không phải màn hình, không có mã SCR

### Related Screens

- SCR001_Login: Login (navigation — nút "Login" của khách; sau Đăng xuất luôn về `/login`)

### Regions

| Code | Label | Owner | Independence Signals |
|------|-------|-------|---------------------|
| REG001_AccountRegion | AccountRegion (chuông + nút tài khoản trên header) | F003_AccountMenuAdminRole | cổng auth/quyền riêng (khách / người dùng / admin; mục Admin chỉ khi `role === "admin"`, `account-region.tsx:69-72`); trạng thái tải riêng (hai `Suspense` riêng, `account-region.tsx:28,38`); endpoint đọc riêng (claims JWT + `profiles.role`, `lib/supabase/current-user.ts:38,63`); bề mặt ghi riêng (`POST /` [Next-Action: signOut], ROUTE002) |
| REG002_AwardsGrid | AwardsGrid (lưới giải thưởng) | F002_HomepageSaa | endpoint đọc riêng (bảng `awards` qua `getAwards`, `lib/awards/get-awards.ts:24-27`); trạng thái tải riêng (`Suspense` + `AwardsGridSkeleton`, `home-content.tsx:51-53`); trạng thái rỗng/lỗi riêng (`awards-grid.tsx:21-23`) |

---

## Summary

- **Total Screens**: 2 (đang hoạt động: SCR001_Login, SCR003_Homepage); SCR002_Todo đã gỡ, không tính
- **Composite Screens**: 1 (SCR003_Homepage, 2 vùng REG)
- **Atomic Screens**: 1 (SCR001_Login)

---

## Cross-Reference Validation

- [x] All SCR### codes are unique
- [x] All SCR### codes are referenced in ScreenFlow.md
- [x] All related screen references are valid
- [x] All route URLs are properly formatted  <!-- route-view only; dfm-form: replace with "All invocation edges cite file:line" -->
- [x] All SCR### codes are referenced in FeatureList.md
- [x] No orphaned screen references
