# Feature List

**Project**: my-app (SAA 2025 — Sun* Annual Awards 2025)
**Generated**: 2026-10-08
**Analysis Scope**: `app/` (page, `_components/`, `login/`, `auth/callback/route.ts`), `lib/` (auth, awards, countdown, i18n, supabase, ui), `proxy.ts`, `supabase/migrations/*.sql`. Tổng hợp từ user-stories.md (US001..US027), screen-list.md, route-list.md, data-model.md, behavior-logic.md, permissions-matrix.md.

**Code Format**: All codes MUST follow `F###_NameSlug` format (e.g., F001_Auth, F002_UserProfile)
**Screen Code Format**: All screen codes MUST follow `SCR###_NameSlug` format (e.g., SCR001_LoginForm)
**User Story Code Format**: All US codes MUST follow `US###_NameSlug` format (e.g., US001_Login)
**Background Logic Code Format**: All BL codes MUST follow `BL###_NameSlug` format (e.g., BL001_ScheduledReport)
**Permission Code Format**: All PERM codes MUST follow `PERM###_NameSlug` format (e.g., PERM001_ViewReports)

**Feature Types**:
- `ui` - Feature has UI screens (SCR###)
- `background` - Feature only has background logic (BL###, no SCR###)
- `mixed` - Feature has both UI screens and background logic

**Related Screens column format**: Accepts `SCR###`, `SCR###/REG###`, or mixed comma-separated (e.g., `SCR001, SCR002/REG003`). Tokenizer splits on `,` then on `/`. No intra-screen shorthand (`SCR###/REG001+REG002` invalid) — enumerate each ref explicitly.

**Partial-screen ownership note**: A feature with only a `SCR###/REG###` ref owns the region, NOT the parent SCR. The screen shell (`SCR###`) must be owned by a separate F### with a bare `SCR###` ref (typically a layout/dashboard feature).

**Cross-reference**: See ScreenList Regions subsection for region definitions and the `REG###_NameSlug` registry.

> Ghi chú mã chuẩn: năm mã F001_LoginWithGoogle, F002_HomepageSaa, F003_AccountMenuAdminRole, F004_AwardsInformation (thêm 2026-10-09), F005_CountdownPrelaunch (thêm 2026-10-09), cùng F006_KudosBoardBrowse, F007_KudosHearts, F008_KudosSpotlight, F009_KudosPersonalSidebar (thêm 2026-10-12 khi promote bản nháp Sun* Kudos Live board), và F010_KudosWrite (thêm 2026-10-14, promote lúc giao) là mã chuẩn (canonical) đã khoá, không đánh số lại. Việc phân cụm bên dưới đối chiếu với `code-formats.md § Feature Clustering Rule` và cho kết quả trùng với các mã chuẩn (xem verdict từng tên ở `> Note:` trong mục Feature Details).

## Feature Hierarchy

**Note**: Features are sorted by priority from highest to lowest (P0 → P1 → P2 → P3). Priority levels:
- **P0**: Core functionality, blocking issues, or essential features
- **P1**: High priority, significant features
- **P2**: Medium priority, standard features
- **P3**: Low priority, nice-to-have features

> Note: Bảng giữ thứ tự mã chuẩn F001 → F002 → F003 (code stability) thay vì sắp P0 → P1; F002 là P0 duy nhất, F001 và F003 cùng P1.

| Code | Name | Type | Language | Workspace | Priority |
|------|------|------|----------|-----------|----------|
| F001_LoginWithGoogle | Login with Google | mixed | TypeScript | my-app | P1 |
| F002_HomepageSaa | Homepage SAA | ui | TypeScript, SQL | my-app | P0 |
| F003_AccountMenuAdminRole | Account Menu & Admin Role | ui | TypeScript, SQL | my-app | P1 |
| F004_AwardsInformation | Awards Information | ui | TypeScript, SQL | my-app | P1 |
| F005_CountdownPrelaunch | Countdown Prelaunch | mixed | TypeScript, SQL | my-app | P1 |
| F006_KudosBoardBrowse | Kudos Board Browse | ui | TypeScript, SQL | my-app | P0 |
| F007_KudosHearts | Kudos Hearts | mixed | TypeScript, SQL | my-app | P1 |
| F008_KudosSpotlight | Kudos Spotlight | ui | TypeScript | my-app | P2 |
| F009_KudosPersonalSidebar | Kudos Personal Sidebar | ui | TypeScript, SQL | my-app | P2 |
| F010_KudosWrite | Kudos Write | ui | TypeScript, SQL | my-app | P1 |

## Feature Details

### F001_LoginWithGoogle: Login with Google

**Type**: mixed
**Description**: Cho khách đăng nhập vào SAA 2025 bằng tài khoản Google và duy trì phiên sau đó. Đầu vào: thao tác bấm "LOGIN With Google" ở `/login` (kèm lựa chọn ngôn ngữ VN/EN). Xử lý: Server Action `signInWithGoogle` dựng URL callback từ origin hợp lệ rồi chuyển sang Google (PKCE qua Supabase Auth); Google/Supabase trả về `/auth/callback`, route handler đổi `code` lấy phiên (huỷ hoặc lỗi thì quay về `/login?error=…`); proxy làm mới cookie phiên ở mỗi request và chuyển người đã có phiên khỏi `/login`. Đầu ra: phiên đăng nhập hợp lệ và trình duyệt được đưa về trang chủ `/`, hoặc thông báo lỗi đăng nhập trên `/login`. Màn hình `/todo` (đích cũ sau đăng nhập) đã gỡ ngày 2026-10-08 nên chỉ còn là tham chiếu lịch sử.

**Workspace**: my-app
**Languages**: TypeScript
**Components**: 9 (SCR001_Login) + route handler `/auth/callback` và `proxy.ts` (không có giao diện)

**Related Screens**:
- SCR001_Login: Login
- SCR002_Todo: Todo (removed 2026-10-08 — tham chiếu lịch sử không còn route và file nguồn; trước đây thuộc F001)

**Related User Stories**:
- US001_SignInWithGoogle: Đăng nhập bằng Google
- US002_ViewLoginError: Xem thông báo lỗi đăng nhập
- US012_ChangeLoginLanguage: Đổi ngôn ngữ màn hình Login
- US013_CompleteGoogleSignIn: Hoàn tất đăng nhập Google
- US014_RedirectSignedInFromLogin: Chuyển người đã đăng nhập khỏi màn hình Login
- US015_RefreshSession: Làm mới phiên đăng nhập

**Related APIs/Routes**:
- (GET) /login — ROUTE004
- (POST) /login [Next-Action: signInWithGoogle] — ROUTE005
- (POST) /login [Next-Action: setLocale] — ROUTE006 (handler `setLocale` dùng chung với F002)
- (GET) /auth/callback — ROUTE007
- (POST) / [Next-Action: setLocale] — ROUTE003 (cùng handler `setLocale`; route-list ghi đồng sở hữu F001, F002; luồng người dùng thuộc US017 của F002)

**Related Data Models**:
- Không có (F001 không sở hữu bảng nào; dòng `profiles` được trigger của DB tạo ở lần đăng nhập đầu — thực thể thuộc F003)

**Related Background Logic**:
- BL001_SupabaseServerClient: Supabase Server Client (dùng chung với F002, F003)
- BL002_OAuthCallbackExchange: OAuth Callback Exchange
- BL003_SessionRefreshProxy: Session Refresh Proxy

**Related Permissions**:
- PERM001_LoginSessionRedirect: Chuyển người đã đăng nhập khỏi `/login`
- PERM002_OAuthCallbackPublicEntry: Điểm quay về OAuth công khai, đích cố định
- PERM007_GoogleSignInPublicStart: Bắt đầu đăng nhập Google, công khai có kiểm tra origin
- PERM008_LocaleAllowList: Đổi ngôn ngữ chỉ nhận giá trị trong danh sách cho phép (dùng chung với F002)
- PERM011_SessionCookieSecureEnvGate: Cookie session chỉ `secure` ở production

> Note: Verdict tên "Login with Google" — một kết quả duy nhất: khách có được phiên đăng nhập (hoặc biết đăng nhập thất bại). Giải thích đủ cả 6 US: US001 bắt đầu, US013 hoàn tất, US002 báo lỗi, US014 và US015 giữ/ra quyết định theo phiên vừa tạo, US012 chọn ngôn ngữ của chính màn hình đăng nhập (US phụ trợ, không phải kết quả riêng). Chấp nhận US015 (làm mới phiên, BL003) ở F001 vì phiên là đầu ra của luồng đăng nhập; nếu coi đây là hạ tầng xuyên suốt thì bị gom theo cơ chế triển khai ("tất cả middleware") — ghi nhận rủi ro nhẹ, giữ nguyên.
> Note: `setLocale` (ROUTE003/ROUTE006, PERM008) là một Server Action dùng chung cho hai màn hình; luồng người dùng chia theo màn hình: US012 + ROUTE006 → F001, US017 + ROUTE003 → F002. Cả hai route được liệt kê ở cả hai feature để khớp cột Owner "F001, F002" của route-list.md.

---

### F002_HomepageSaa: Homepage SAA

**Type**: ui
**Description**: Hiển thị trang chủ công khai `/` của SAA 2025 cho mọi tác nhân (khách, người dùng, admin hành vi giống nhau). Đầu vào: request GET `/` kèm cookie ngôn ngữ `NEXT_LOCALE`, biến môi trường `SAA_COUNTDOWN_TARGET` và bảng `awards`. Xử lý: Server Component đọc ngôn ngữ, mốc đếm ngược và danh mục giải thưởng (RLS cho đọc công khai) rồi ghép vỏ trang (header, hero, đếm ngược, "Root Further", lưới giải thưởng, khối Kudos, footer); bộ chọn ngôn ngữ ghi cookie `NEXT_LOCALE` qua `setLocale`; các liên kết điều hướng ra `/awards-information` (trang của F004), `/sun-kudos` (trang của F006) và `/standards` (chưa xây). Đầu ra: trang chủ đúng ngôn ngữ với đồng hồ đếm ngược tự cập nhật và lưới giải thưởng theo `sort_order`. Vỏ SCR003_Homepage thuộc F002; vùng tài khoản trên header (REG001_AccountRegion) nhường F003.

**Workspace**: my-app
**Languages**: TypeScript, SQL (bảng `awards` và seed)
**Components**: 12 (SCR003_Homepage trừ NotificationBell và AccountControl thuộc F003)

**Related Screens**:
- SCR003_Homepage: Homepage (composite; F002 sở hữu vỏ màn hình)
- SCR003_Homepage/REG002_AwardsGrid: AwardsGrid

**Related User Stories**:
- US008_OpenAwardsInformation: Mở trang Awards Information
- US009_OpenSunKudos: Mở trang Sun* Kudos
- US010_OpenStandards: Mở trang Tiêu chuẩn chung
- US011_OpenAwardDetails: Mở chi tiết một hạng mục giải thưởng
- US016_ReturnToHomepageTop: Quay về đầu trang chủ
- US017_ChangeHomepageLanguage: Đổi ngôn ngữ trang chủ
- US018_ViewEventCountdown: Xem đồng hồ đếm ngược tới sự kiện
- US019_ViewAwardCategories: Xem các hạng mục giải thưởng

**Related APIs/Routes**:
- (GET) / — ROUTE001
- (POST) / [Next-Action: setLocale] — ROUTE003 (handler `setLocale` dùng chung với F001)
- (POST) /login [Next-Action: setLocale] — ROUTE006 (cùng handler `setLocale`; route-list ghi đồng sở hữu F001, F002; luồng người dùng thuộc US012 của F001)

**Related Data Models**:
- MODEL001_Award

**Related Background Logic**:
- BL001_SupabaseServerClient: Supabase Server Client (dùng chung với F001, F003; `getAwards` đọc bảng `awards`)

**Related Permissions**:
- PERM008_LocaleAllowList: Đổi ngôn ngữ chỉ nhận giá trị trong danh sách cho phép (dùng chung với F001)
- PERM009_AwardsPublicReadServiceWrite: Bảng `awards`: đọc công khai, ghi chỉ `service_role`

> Note: Verdict tên "Homepage SAA" — một kết quả duy nhất: khách xem trang chủ SAA 2025 (đếm ngược, danh mục giải thưởng) và đi tiếp từ đó. Giải thích đủ cả 8 US (US018, US019 xem; US008-US011 điều hướng đi tiếp; US016 cuộn về đầu trang; US017 đổi ngôn ngữ trang). Một tác nhân hiệu dụng duy nhất (cả ba hành vi giống nhau). Lưu ý US008-US010 và US011 mô tả ý định điều hướng của phần tử có thật tới trang chưa xây (`[NOT_BUILT]`); không bịa nội dung trang đích.
> Note: Type `ui` đủ điều kiện (SCR### có); F002 tham chiếu BL001 chỉ ở mức dùng chung, không phải background feature.

---

### F003_AccountMenuAdminRole: Account Menu & Admin Role

**Type**: ui
**Description**: Cung cấp vùng tài khoản trên header trang chủ, đổi giao diện theo trạng thái đăng nhập và vai trò. Đầu vào: claims JWT của phiên hiện tại và `profiles.role` đọc dưới RLS. Xử lý: `getCurrentUser()` xác định khách / người dùng / admin (fail closed: lỗi bất kỳ coi là khách, vai trò không phải đúng `"admin"` coi là `user`); khách thấy liên kết "Đăng nhập" tới `/login`; người đã đăng nhập thấy chuông thông báo (chỉ giao diện) và nút tài khoản mở/đóng menu (Hồ sơ, Trang quản trị chỉ khi admin, Đăng xuất); Đăng xuất gọi `signOut` (kết thúc phiên cục bộ) rồi chuyển về `/login`. Đầu ra: header đúng theo vai trò, menu đóng/mở theo bàn phím và chuột, phiên kết thúc khi đăng xuất. Chỉ sở hữu vùng `SCR003_Homepage/REG001_AccountRegion`; vỏ SCR003_Homepage do F002 sở hữu. Việc ẩn mục Admin chỉ là UX — `/admin` và `/profile` chưa có page và chưa có guard phía server.

**Workspace**: my-app
**Languages**: TypeScript, SQL (bảng `profiles` và trigger)
**Components**: 2 (NotificationBell và AccountControl gồm AccountMenu) trong SCR003_Homepage/REG001_AccountRegion

**Related Screens**:
- SCR003_Homepage/REG001_AccountRegion: AccountRegion (feature chỉ sở hữu vùng này; vỏ màn hình do F002 sở hữu)

**Related User Stories**:
- US003_OpenLoginFromHeader: Mở màn hình Login từ header
- US004_ViewNotificationBell: Xem chuông thông báo
- US005_OpenProfile: Mở trang Hồ sơ
- US006_SignOut: Đăng xuất
- US007_OpenAdminDashboard: Mở trang quản trị
- US020_OpenAccountMenu: Mở menu tài khoản
- US021_CloseAccountMenu: Đóng menu tài khoản

**Related APIs/Routes**:
- (POST) / [Next-Action: signOut] — ROUTE002

**Related Data Models**:
- MODEL002_Profile

**Related Background Logic**:
- BL001_SupabaseServerClient: Supabase Server Client (dùng chung với F001, F002; `getCurrentUser` và `signOut`)

**Related Permissions**:
- PERM003_AccountRegionAuthState: Vùng tài khoản đổi giao diện theo trạng thái đăng nhập
- PERM004_AdminMenuEntryVisibility: Mục Admin Dashboard chỉ hiện với admin (UX-only)
- PERM005_SessionRoleResolution: Xác định danh tính và vai trò (fail closed)
- PERM006_SignOutOwnSession: Đăng xuất chỉ tác động session của người gọi
- PERM010_ProfilesSelectOwnServiceWrite: Bảng `profiles`: chỉ đọc dòng của mình, ghi chỉ `service_role`

> Note: Verdict tên "Account Menu & Admin Role" (chứa "&") — một kết quả duy nhất giải thích cả 7 US: "vùng tài khoản trên header nhận biết danh tính và vai trò" (khách: lối vào Login; người dùng: chuông, menu, Hồ sơ, Đăng xuất; admin: thêm lối vào quản trị). "Account Menu" và "Admin Role" không phải hai kết quả độc lập — vai trò admin chỉ tồn tại ở đây như một mục menu có điều kiện (không có màn hình quản trị nào được xây), và ba tác nhân cùng tác động lên một kết quả chung (vùng tài khoản). Không cần tách (SPLIT không khuyến nghị). Nếu sau này xây `/admin` và quyền quản trị thật, "Admin Role" nên tách thành feature riêng.
> Note: US003 (liên kết Login của khách) đặt ở F003 vì nó là trạng thái khách của cùng vùng REG001_AccountRegion; US003 cũng trỏ sang SCR001_Login nhưng SCR001_Login thuộc F001 (không nhân đôi sở hữu).
> Note: Dòng `profiles` role `user` được tạo tự động bởi trigger DB ở lần đăng nhập đầu (US013 của F001); MODEL002_Profile vẫn thuộc F003 vì chỉ F003 đọc `role`.

### F004_AwardsInformation: Awards Information

**Type**: ui
**Description**: Trang công khai `/awards-information` "Hệ thống giải thưởng SAA 2025" cho khách và người đã đăng nhập đọc sáu giải thưởng (ảnh, tên, mô tả dài, số lượng, các mức giá trị). Đầu vào: request GET `/awards-information` (kèm hoặc không kèm neo `#<slug>`), cookie ngôn ngữ `NEXT_LOCALE`, bảng `awards` (thêm năm cột chi tiết) và bảng mới `award_prizes`. Xử lý: `getAwardDetails` đọc bằng một truy vấn lồng, lọc hàng hỏng, ánh xạ thành khối hiển thị; menu bên trái bấm để cuộn mượt và tự đánh dấu theo khối đang xem hoặc neo (scroll-spy ở trình duyệt); header và footer đánh dấu liên kết "Awards Information" là trang hiện tại. Đầu ra: trang có menu sáu giải và sáu khối, hoặc thông báo "sẽ sớm được cập nhật" khi rỗng hay lỗi.

**Workspace**: my-app
**Languages**: TypeScript, SQL (migration thêm cột `awards`, bảng `award_prizes` và seed)
**Components**: 11 thành phần riêng trong SCR004_AwardsInformation (vỏ trang, nội dung, hero, tiêu đề, bộ nạp, bố cục, khối giải, trạng thái rỗng, khung chờ, menu và bản trình bày của menu), cộng các thành phần dùng lại của F002/F003 (header, footer, Kudos, bộ chọn ngôn ngữ, vùng tài khoản)

**Related Screens**:
- SCR004_AwardsInformation: Awards Information (composite; F004 sở hữu cả màn hình)

**Related User Stories**:
- US022_OpenAwardsInformationPage: Mở trang Hệ thống giải thưởng
- US023_ViewAwardDetails: Xem chi tiết sáu giải thưởng
- US024_JumpToAwardFromMenu: Nhảy tới một giải bằng menu
- US025_FollowActiveAwardOnScroll: Thấy mục đang xem được tô sáng khi cuộn hoặc mở bằng neo
- US026_OpenKudosFromAwardsInformation: Đi tới Sun* Kudos từ cuối trang
- US027_ChangeAwardsInformationLanguage: Đổi ngôn ngữ trang Hệ thống giải thưởng

**Related APIs/Routes**:
- (GET) /awards-information — ROUTE008
- (POST) /awards-information [Next-Action: setLocale] — ROUTE009 (handler `setLocale` dùng chung với F001, F002)

**Related Data Models**:
- MODEL001_Award (mở rộng năm cột chi tiết)
- MODEL003_AwardPrize

**Related Background Logic**:
- BL001_SupabaseServerClient: Supabase Server Client (dùng chung; `getAwardDetails` đọc `awards` kèm `award_prizes`)
- BL003_SessionRefreshProxy: Session Refresh Proxy (matcher thêm `/awards-information` để làm mới phiên; thuộc F001)

**Related Permissions**:
- PERM008_LocaleAllowList: Đổi ngôn ngữ chỉ nhận giá trị trong danh sách cho phép (dùng chung với F001, F002)
- PERM009_AwardsPublicReadServiceWrite: Bảng `awards`: đọc công khai, ghi chỉ `service_role` (nay gồm cả cột chi tiết)
- PERM012_AwardPrizesPublicReadServiceWrite: Bảng `award_prizes`: đọc công khai, ghi chỉ `service_role`

> Note: Trạng thái đang chọn của header và footer (prop `currentPage` của SiteHeader/SiteFooter, mã của F002) do F004 thêm; trang chủ không truyền prop nên giữ nguyên hành vi.
> Note: Mã US của F004 được cấp lại thành US022..US027 theo dãy toàn cục (spec của feature ghi US022..US027).

### F005_CountdownPrelaunch: Countdown Prelaunch

**Type**: mixed
**Description**: Trang đếm ngược toàn màn hình `/countdown` ("Sự kiện sẽ bắt đầu sau" / "Event starts in") và cổng prelaunch toàn site. Đầu vào: request `GET`/`HEAD` tới mọi trang, mốc `site_settings.prelaunch_ends_at` (bảng một dòng, đọc công khai, chỉ `service_role` ghi), phiên đăng nhập và `profiles.role`, cookie `NEXT_LOCALE`. Xử lý: proxy đọc mốc song song với `getClaims()`; khi mốc còn ở tương lai thì chuyển 307 mọi trang (trừ `/login`, `/auth/callback`) về `/countdown` cho khách và người dùng thường, admin đi qua; mốc thiếu, `NULL`, hỏng hay không đọc được thì site mở (fail open); sau mốc `/countdown` chuyển về `/`. Trang đếm ngược đếm theo giờ máy chủ (bù độ lệch đồng hồ một lần ở lần đọc đầu phía client) bằng phép tính phút của đồng hồ trang chủ và tự `router.replace("/")` khi chạm 0. Đầu ra: trước giờ mở, người không phải admin chỉ thấy trang đếm ngược; từ giờ mở, site hoạt động như trước.

**Workspace**: my-app
**Languages**: TypeScript, SQL (migration tạo bảng `site_settings` và seed local)
**Components**: 5 thành phần trong SCR005_CountdownPrelaunch (`CountdownPage` + `CountdownPrelaunchContent`, `CountdownPrelaunchView`, `CountdownPrelaunchUnit`, `PrelaunchCountdownLive`, hook `usePrelaunchCountdown`), cộng phần cổng trong proxy (`prelaunchGateTarget`), `decidePrelaunchGate`, `readPrelaunchEndsAt`, `readGateUserRole` và hàm vai trò dùng chung `toUserRole`

**Related Screens**:
- SCR005_CountdownPrelaunch: Countdown Prelaunch (atomic; F005 sở hữu cả màn hình)

**Related User Stories**:
- US028: Xem đồng hồ đếm ngược prelaunch
- US029: Bị giữ ở trang đếm ngược khi mở trang khác trước giờ mở
- US030: Admin duyệt toàn site trước giờ mở
- US031: Tự vào site khi đồng hồ chạm 0
- US032: Rời trang đếm ngược sau giờ mở
- US033: Đặt mốc mở site

**Related APIs/Routes**:
- (GET, HEAD) /countdown — ROUTE010
- Cổng prelaunch trên mọi `GET`/`HEAD` khớp matcher phủ mọi page route của proxy (không phải route riêng; xem PERM014)

**Related Data Models**:
- MODEL004_SiteSettings (bảng một dòng, cột `prelaunch_ends_at`)
- MODEL002_Profile (chỉ đọc `role` để nhận biết admin)

**Related Background Logic**:
- BL003_SessionRefreshProxy: Session Refresh Proxy (mở rộng thành cổng prelaunch, đổi matcher; thuộc F001)

**Related Permissions**:
- PERM013_SiteSettingsPublicReadServiceWrite: Bảng `site_settings`: đọc công khai, ghi chỉ `service_role`
- PERM014_PrelaunchGate: Cổng prelaunch: trước mốc chỉ admin vượt cổng (fail open phía mốc, fail closed phía vai trò)
- PERM010_ProfilesSelectOwnServiceWrite: Bảng `profiles`: chỉ đọc dòng của mình (proxy đọc vai trò bằng phiên của chính người dùng)

> Note: Mã US028..US033 theo dãy toàn cục, tiếp sau US027; user-stories.md chưa có sáu mã này vì file đã vượt giới hạn kích thước (chạy `/tkm:rebuild-spec --artifact user-stories`); nội dung nằm ở `docs/features/F005_CountdownPrelaunch/functional-spec.md` § 7.
> Note: BL003_SessionRefreshProxy chưa có mô tả cổng prelaunch trong behavior-logic.md (chạy `/tkm:rebuild-spec --artifact behavior-logic`); phần cổng được mô tả ở `docs/features/F005_CountdownPrelaunch/technical-spec.md` § 3.2 và PERM014.
> Note: Mốc prelaunch (`site_settings`) độc lập với mốc đồng hồ trang chủ `SAA_COUNTDOWN_TARGET` của F002 (BR-006).

---

### F006_KudosBoardBrowse: Kudos Board Browse

**Type**: ui
**Description**: Trang `/sun-kudos` cho khách và Sunner xem bảng kudos: banner, thanh gửi kudos (A.1), carousel Highlight top 5 theo số tim và dòng All Kudos mới nhất trước, cùng hai bộ lọc Hashtag/Department. Đầu vào: request GET `/sun-kudos` kèm searchParams `hashtag`, `department`, cookie ngôn ngữ, dữ liệu kudos/hashtag/phòng ban/Sunner được seed từ nội dung Figma; trang kế của All Kudos được lấy bằng GET `/api/kudos` (cursor + bộ lọc). Xử lý: Server Component đọc Highlight và trang đầu qua cùng một hàm áp bộ lọc; bộ lọc nằm trên URL, đổi bộ lọc thì carousel về thẻ 1 và danh sách cuộn vô hạn nạp lại; bấm hashtag trên thẻ thì đặt bộ lọc Hashtag; "Copy Link" chép URL tuyệt đối `/sun-kudos/[id]` rồi hiện toast; nhãn danh hiệu Hero và 0–3 sao theo số kudos nhận (0–9 New, 10–19 Rising, 20–49 Super, 50+ Legend); thời gian hiện `HH:mm - MM/DD/YYYY` theo Asia/Ho_Chi_Minh; header và footer đánh dấu "Sun* Kudos" là trang hiện tại. Đầu ra: bảng kudos đã lọc với trạng thái rỗng "Hiện tại chưa có Kudos nào."; liên kết tới `/sun-kudos/[id]` và `/profiles/[id]` (chưa xây, 404) — khách bấm vào avatar, tên hoặc chi tiết thì chuyển tới `/login`; thanh "Tìm kiếm profile Sunner" và nút "Mở Secret Box" hiển thị đúng Figma nhưng chưa làm gì; thanh A.1 mở hộp thoại Viết Kudo của F010 (người đã đăng nhập) hoặc đưa khách tới `/login`.

Quyền sở hữu: F006 sở hữu vỏ màn hình và nền dữ liệu người/kudos dùng chung (bảng Sunner liên kết với tài khoản đăng nhập, kudos, hashtag, phòng ban, ảnh kudos). Ô nút tim trên thẻ do F007 sở hữu; F006 chỉ chừa chỗ (slot) và khung chờ. Vùng Spotlight và vùng sidebar do F008, F009 sở hữu. Từ 2026-10-14 F010 sở hữu hộp thoại Viết Kudo mở từ A.1 và các thay đổi trên thẻ (nội dung Markdown, khối người gửi ẩn danh); F006 chỉ giữ thanh A.1 và thẻ.

**Workspace**: my-app
**Languages**: TypeScript, SQL (migration tạo bảng, trigger đếm kudos nhận và liên kết người dùng, seed local)
**Components**: `SunKudosPage` + `SunKudosContent` (vỏ tĩnh, ba loader `KudosHighlightLoader`, `KudosFeedLoader`, `KudosFilterOptionsLoader`), `KudosBanner`, `KudosSendBar`, `KudosFilterBar` + `KudosFilterBarView`, `HighlightCarousel` + `HighlightCarouselView`, `KudosFeedList` + `KudosFeedView`, `KudosCardView` (cùng `KudosPersonBlock`, `KudosPersonAvatar`, `KudosHeroBadge`, `KudosStarsTooltip`, `KudosCardGallery`, `KudosCardHashtags`), `CopyLinkButton`, `KudosToastProvider`, Route Handler `GET /api/kudos`; getter `getKudosHighlight`, `getKudosPage` / `readKudos`, `getKudosFilterOptions`, `getViewerSunnerId` và hai đọc dùng chung một lần mỗi lần render trang `getHashtagRowsPerRequest`, `getMySunnerPerRequest` (`cache()` của React); hàm thuần `parseKudosFilters`, `applyKudosFilters`, `toKudosCard`, `heroTierOf`, `safeAvatarUrl`, `isAllowedImagePath`; hai trigger `auth.users` và hàm `link_or_create_sunner_for_user`, trigger `kudos_sync_received_count`, hàm `get_my_sunner` (SQL)

**Related Screens**:
- SCR006_SunKudosLiveBoard: Sun* Kudos - Live board (composite; F006 sở hữu cả vỏ màn hình)

**Related User Stories**:
- US034: Mở trang bảng Kudos
- US035: Xem kudos nổi bật bằng carousel
- US036: Cuộn dòng All Kudos
- US037: Lọc kudos theo Hashtag và Phòng ban
- US038: Chép liên kết một kudos
- US039: Mở chi tiết kudos hoặc hồ sơ từ thẻ
- US040: Thấy sao và nhãn Hero của người gửi, người nhận
- US041: Gắn tài khoản đăng nhập với một Sunner

**Related APIs/Routes**:
- (GET) /sun-kudos — ROUTE011
- (GET) /api/kudos — ROUTE015
- (POST) /sun-kudos [Next-Action: setLocale] — ROUTE014 (cùng handler `setLocale`; đồng sở hữu F001, F002, F004, F006)
- Chỉ liên kết, chưa xây: /sun-kudos/[id], /profiles/[id]

**Related Data Models**:
- MODEL005_Department, MODEL006_Sunner, MODEL007_Kudos, MODEL008_Hashtag, MODEL009_KudosHashtag, MODEL010_KudosImage

**Related Background Logic**:
- Không có BL### (trigger DB không thuộc kho BL của dự án, cùng cách xử lý trigger `on_auth_user_created` của `profiles`): trigger `kudos_sync_received_count` cập nhật số kudos nhận khi thêm/xoá kudos (technical-spec A12) và hai trigger `on_auth_user_created_link_sunner`, `on_auth_user_confirmed_link_sunner` trên `auth.users` gắn hoặc tạo Sunner cho tài khoản đã xác nhận email (technical-spec A11)
- BL001_SupabaseServerClient (đọc dữ liệu bảng, dùng chung), BL003_SessionRefreshProxy (khớp `/sun-kudos` và `/api/kudos`)

**Related Permissions**:
- PERM015_KudosBoardPublicReadServiceWrite: các bảng của bảng Kudos đọc công khai, ghi chỉ `service_role`
- PERM016_SunnerPrivateColumnsOwnRowRpc: `sunners.email`, `sunners.user_id`, `sunners.hearts_total` không mở cho client; hàng của chính người xem qua `get_my_sunner()`; avatar chỉ đường dẫn cục bộ
- PERM014_PrelaunchGate: `GET /sun-kudos` và `GET /api/kudos` bị cổng như mọi `GET`
- PERM008_LocaleAllowList: đổi ngôn ngữ chỉ nhận `vi`/`en` (dùng chung)

> Note: Verdict tên "Kudos Board Browse" — một kết quả: người xem tìm và đọc kudos họ quan tâm. Carousel Highlight và All Kudos dùng chung bộ lọc, cùng nguồn dữ liệu và cùng thẻ kudos nên tách ra thì không kiểm thử riêng được (chọn gộp). Copy Link và nhãn Hero là thuộc tính của thẻ nên ở lại đây.
> Note: Các mốc cần xác nhận khi viết spec đã chốt trong clarifications.md: bộ lọc Department theo phòng ban người nhận; một người nhận mỗi kudos; hashtag là danh sách cố định (nhãn tiêu đề là cột chữ tự do `title`); thẻ hai bên của carousel không bấm được; nhãn Hero chỉ trên thẻ và khối người gửi/người nhận, không ở sidebar F009.
> Note: Từ 2026-10-14 (F010) `kudos.sender_id` không còn đọc được từ client: thẻ nhúng người gửi qua `public_sender_id` (`sender:sunners!public_sender_id`), kudos ẩn danh có `sender: null` và `senderAlias`; nội dung thẻ là tập Markdown con (`bodyBlocks`); thanh A.1 không còn inert (D013 của F006 chỉ còn đúng cho thanh "Tìm kiếm profile Sunner").
> Note: Mã US034..US041 theo dãy toàn cục, tiếp sau US033 của F005; như F005, user-stories.md chưa có các mã này vì file đã vượt giới hạn kích thước (chạy `/tkm:rebuild-spec --artifact user-stories`); nội dung ở `docs/features/F006_KudosBoardBrowse/functional-spec.md` § 7.
> Note: e2e `awards-information-page.spec.ts` đã đổi (không còn kỳ vọng `/sun-kudos` là 404) và các docs từng ghi "/sun-kudos chưa xây" (F002, F004, screen-flow, permissions-matrix, system/*) đã cập nhật ở bước giao (Stage 6, 2026-10-13).

---

### F007_KudosHearts: Kudos Hearts

**Type**: mixed
**Description**: Cho Sunner đã đăng nhập thả tim hoặc rút tim ở kudos của người khác, và tính điểm tim cho NGƯỜI GỬI kudos. Đầu vào: thao tác bấm nút tim trên thẻ kudos (ở Highlight hoặc All Kudos), phiên đăng nhập, bảng `special_days` (seed, chưa có giao diện quản trị). Xử lý: Server Action `likeKudos(id)` / `unlikeKudos(id)` (biểu thị ý định, không phải nút bật/tắt) kiểm tra lại phiên phía máy chủ; khách bị đưa tới `/login`; DB giữ bất biến bằng khoá chính và trigger: một lượt thích mỗi người mỗi kudos, người gửi không tự thích kudos của mình, trọng số do DB quyết (+1, hoặc +2 vào ngày đặc biệt theo giờ Asia/Ho_Chi_Minh), số tim của kudos và tổng tim của người gửi cập nhật cùng giao dịch; bỏ thích thì thu hồi đúng trọng số đã lưu. Đầu ra: nút tim chuyển xám/đỏ và số tim ±1 theo lượt thích của người đang xem; nút của người gửi bị vô hiệu; điểm tim của người gửi đổi đúng trọng số.

Quyền sở hữu: F007 chỉ sở hữu vùng nút tim và hành vi thích; thẻ kudos và danh sách do F006 sở hữu. Cả hai cột đếm tim (`kudos.like_count` và `sunners.hearts_total`) thuộc migration nền của F006 (mặc định 0, Highlight cần `like_count` để sắp xếp); F007 chỉ thêm `kudos_likes`, `special_days` và trigger cập nhật các cột đó.

**Workspace**: my-app
**Languages**: TypeScript, SQL (migration, trigger, seed ngày đặc biệt)
**Components**: `KudosHeartButton`, `KudosHeartView`, kho client dùng chung `KudosHeartProvider` + `useKudosHeart` (`lib/kudos/kudos-heart-store.tsx`: thả/rút lạc quan, hoàn tác khi lỗi, nhận số liệu máy chủ mới khi đổi bộ lọc), Server Action `likeKudos` / `unlikeKudos` (`lib/kudos/kudos-heart-actions.ts`); SQL: `kudos_likes_before_insert`, `kudos_likes_after_change`, `release_kudos_like_hearts`

**Related Screens**:
- SCR006_SunKudosLiveBoard: vùng nút tim trên thẻ kudos (REG### chưa khai báo; feature chỉ sở hữu vùng này; vỏ màn hình do F006 sở hữu)

**Related User Stories**:
- US042: Thả tim cho kudos của người khác
- US043: Rút tim đã thả
- US044: Khách bấm tim được đưa tới đăng nhập
- US045: Người gửi không thả tim cho kudos của chính mình
- US046: Người gửi nhận tim theo lượt thích
- US047: Vận hành khai báo ngày đặc biệt

**Related APIs/Routes**:
- (POST) /sun-kudos [Next-Action: likeKudos] — ROUTE012
- (POST) /sun-kudos [Next-Action: unlikeKudos] — ROUTE013

**Related Data Models**:
- MODEL011_KudosLike
- MODEL012_SpecialDay
- Cột đếm tim `kudos.like_count` (MODEL007_Kudos) và `sunners.hearts_total` (MODEL006_Sunner): F006 tạo, F007 bảo trì; từ F010 (review C2) chỉ `like_count` còn công khai, `hearts_total` chỉ chủ đọc qua `get_my_sunner()`

**Related Background Logic**:
- Không có BL### (trigger DB không thuộc kho BL): `kudos_likes_before_insert` (chặn tự thích, gán trọng số; technical-spec A4), `kudos_likes_after_change` (cập nhật số tim kudos và tổng tim người gửi khi chèn/xoá lượt thích; A5) và `kudos_before_delete_release_like_hearts` (BEFORE DELETE trên `kudos`, hàm `release_kudos_like_hearts`: trả lại đúng trọng số đã lưu cho người gửi trước khi cascade xoá lượt thích; A5)

**Related Permissions**:
- PERM017_KudosLikesOwnerOnly: `kudos_likes` chỉ chủ lượt thích đọc/chèn/xoá; người gửi không tự thích; trọng số do trigger
- PERM019_KudosHeartActionSessionCheck: `likeKudos`/`unlikeKudos` kiểm phiên phía máy chủ
- PERM015_KudosBoardPublicReadServiceWrite: `special_days` đọc công khai, ghi chỉ `service_role`

> Note: Verdict tên "Kudos Hearts" — một kết quả: tim của người gửi tăng/giảm đúng theo lượt thích. Tách khỏi F006 vì có bất biến DB riêng, kiểm thử được ở tầng DB và Server Action, và đổi ý định (ghi) khác đọc.
> Note: Mã US042..US047 theo dãy toàn cục, tiếp sau F006.
> Note: Quyết định cố định theo clarifications: người GỬI nhận tim (không phải người nhận như spec C.4.1). Đã chốt: xoá kudos trực tiếp bằng SQL làm giảm tổng tim của người gửi đúng trọng số đã lưu.
> Note: Phụ thuộc F006 (bảng kudos/Sunner, thẻ kudos).

---

### F008_KudosSpotlight: Kudos Spotlight

**Type**: ui
**Description**: Bảng Spotlight trên `/sun-kudos` cho khách và Sunner khám phá những người nhận kudos: tên bố trí tự động, tìm kiếm, kéo/thu phóng, mở kudos. Đầu vào: dữ liệu công khai gồm tên người nhận, thời điểm nhận và tổng số kudos từ DB; chuỗi tìm kiếm tối đa 100 ký tự. Xử lý: máy chủ tính bố cục tất định (không ngẫu nhiên) cho tối đa khoảng 300 tên; phía trình duyệt giữ trạng thái dịch chuyển/thu phóng, bật công tắc Pan/Zoom thì kéo và lăn chuột mới tác động, tắt thì trang cuộn bình thường; chuột hoặc bàn phím đặt vào một tên thì hiện tooltip (tên + thời gian nhận); tìm kiếm tô sáng tên khớp và làm mờ phần còn lại; dải "kudos mới nhất" chạy bên dưới. Đầu ra: tổng số kudos, các tên bấm được dẫn tới `/sun-kudos/[id]` (khách cũng xem được; trang đích chưa xây), trạng thái đang tải và trạng thái rỗng.

Quyền sở hữu: F008 chỉ sở hữu vùng Spotlight; chỉ đọc dữ liệu kudos/Sunner của F006, không thêm bảng.

**Workspace**: my-app
**Languages**: TypeScript
**Components**: `SpotlightSection` (vỏ máy chủ, đọc `getSpotlightData`), `SpotlightBoard` + `SpotlightBoardView` + `SpotlightBoardStage`, `SpotlightSearchBox`, `SpotlightPanZoomButton`, `SpotlightTicker`, `SpotlightTooltip`, `SpotlightTotalLabel`, `SpotlightNodeLink`, hook `useSpotlightPanZoom`, `useSpotlightSearch`, `useSpotlightCompactLayout`; hàm thuần `layoutSpotlightNodes`, `toSpotlightNodes`, `toTickerLines`, `matchSpotlightNodes`, `evaluateSpotlightSearch`

**Related Screens**:
- SCR006_SunKudosLiveBoard: vùng Spotlight (REG### chưa khai báo; feature chỉ sở hữu vùng này; vỏ màn hình do F006 sở hữu)

**Related User Stories**:
- US048: Xem bảng Spotlight và tổng số kudos
- US049: Xem thời gian nhận kudos qua chú thích
- US050: Mở kudos từ một tên
- US051: Tìm tên người nhận
- US052: Kéo và phóng to bảng
- US053: Xem dải kudos mới nhất

**Related APIs/Routes**:
- Không có route riêng: dữ liệu đọc trong Server Component của `GET /sun-kudos` (ROUTE011)

**Related Data Models**:
- Dùng lại MODEL007_Kudos và MODEL006_Sunner của F006; không có bảng mới

**Related Background Logic**:
- Không có

**Related Permissions**:
- PERM015_KudosBoardPublicReadServiceWrite: dữ liệu Spotlight đọc công khai (kế thừa quyền đọc công khai của F006)

> Note: Verdict tên "Kudos Spotlight" — một kết quả: người xem tìm ra một người nhận trong biển tên và mở kudos của họ. Tách khỏi F006 vì có luồng vào→xử lý→ra riêng (bố cục, tìm kiếm, kéo/thu phóng), tương tác riêng và kiểm thử độc lập được.
> Note: Đã chốt trong clarifications.md: mỗi kudos là một nút (một tên); thẻ cảm ứng hai ngón (pinch) không bắt buộc. Mã US048..US053 theo dãy toàn cục, tiếp sau F007.
> Note: Phụ thuộc F006 (dữ liệu và vỏ trang).

---

### F009_KudosPersonalSidebar: Kudos Personal Sidebar

**Type**: ui
**Description**: Cột bên (sidebar) của `/sun-kudos`: khối thống kê cá nhân (D.1) cho Sunner đã đăng nhập và danh sách 10 Sunner nhận quà mới nhất (D.3) cho mọi người. Đầu vào: phiên đăng nhập, thống kê của Sunner đang xem (kudos nhận/gửi, tim nhận, hộp quà đã mở/chưa mở) và bảng quà tặng seed. Xử lý: Server Component đọc `getCurrentUser()`; khách thấy lời nhắc đăng nhập thay cho thống kê; người đã đăng nhập thấy số liệu của chính mình và nút "Mở Secret Box" (chưa làm gì); danh sách quà đọc 10 dòng mới nhất. Đầu ra: khối thống kê hoặc lời nhắc đăng nhập, danh sách 10 người nhận quà, hoặc "Chưa có dữ liệu" khi rỗng. Danh sách khuyến mãi trong spec D không có thiết kế nên ngoài phạm vi.

Quyền sở hữu: F009 chỉ sở hữu vùng sidebar. Số liệu cá nhân đọc lại dữ liệu của F006 (kudos nhận/gửi) và F007 (tổng tim).

**Workspace**: my-app
**Languages**: TypeScript, SQL (migration bảng quà tặng và seed)
**Components**: `KudosSidebar`, `PersonalStatsRegion` + `PersonalStatsView` + `PersonalStatsLoginPrompt`, `GiftRecipientsRegion` + `GiftRecipientsView` + `GiftRecipientAvatar`; getter `getKudosPersonalStats` (dùng `getMySunnerPerRequest`, một RPC mỗi lần render chung với F006), `getRecentGiftRecipients`; hàm thuần `toPersonalStats`, `toGiftRecipients`

**Related Screens**:
- SCR006_SunKudosLiveBoard: vùng sidebar (REG### chưa khai báo; feature chỉ sở hữu vùng này; vỏ màn hình do F006 sở hữu)

**Related User Stories**:
- US054: Xem thống kê Kudos cá nhân
- US055: Được mời đăng nhập thay cho thống kê
- US056: Xem 10 Sunner nhận quà mới nhất
- US057: Mở hồ sơ người vừa nhận quà

**Related APIs/Routes**:
- Không có route riêng: dữ liệu đọc trong Server Component của `GET /sun-kudos` (ROUTE011)

**Related Data Models**:
- MODEL013_SecretBox (chủ sở hữu, tên quà, `opened_at`)
- Số hộp quà đã mở/chưa mở suy từ `opened_at` của `secret_boxes`
- Đọc lại MODEL006_Sunner qua hàm `get_my_sunner()` cho hàng của chính người xem

**Related Background Logic**:
- Không có

**Related Permissions**:
- PERM018_SecretBoxesOpenedPublicUnopenedOwner: hộp đã mở đọc công khai, hộp chưa mở chỉ chủ hộp; ghi chỉ `service_role`
- PERM016_SunnerPrivateColumnsOwnRowRpc: hàng Sunner của chính người xem chỉ qua `get_my_sunner()`
- PERM021_KudosSenderIdNotClientReadable: số "Kudos đã gửi" đọc qua hàm `get_my_sent_kudos_count()` vì `kudos.sender_id` không còn đọc được từ client (F010)

> Note: Verdict tên "Kudos Personal Sidebar" — một kết quả: Sunner nắm được thành tích kudos của mình và ai vừa nhận quà. Hai khối cùng một vùng sidebar; khối D.3 công khai chỉ là phần phụ trợ, không đủ thành feature riêng (không kiểm thử độc lập có ý nghĩa).
> Note: Đã chốt: hộp quà đã mở/chưa mở lấy từ `secret_boxes`; "tim nhận" trong khối D.1 là tổng tim người gửi đã kiếm (theo F007).
> Note: Phụ thuộc F006 (vỏ trang, bảng Sunner) và F007 (tổng tim). Mã US054..US057 theo dãy toàn cục, tiếp sau F008.
> Note: Từ 2026-10-14 số "Kudos đã gửi" lấy từ RPC `get_my_sent_kudos_count()` (đếm cả kudos ẩn danh của chính người xem), không còn đếm client theo `kudos.sender_id`.

---

### F010_KudosWrite: Kudos Write

**Type**: ui
**Description**: Hộp thoại "Viết Kudo" mở từ thanh gửi kudos (A.1) của `/sun-kudos`: Sunner đã đăng nhập chọn người nhận, đặt danh hiệu, viết nội dung bằng thanh công cụ Markdown, chọn 1–5 hashtag, đính kèm tối đa 5 ảnh jpg/png (≤ 5 MB), tuỳ chọn gửi ẩn danh kèm tên ẩn danh; khách bấm A.1 thì tới `/login`. Đầu vào: phiên đăng nhập, danh sách hashtag có sẵn, từ khoá tìm Sunner, tệp ảnh. Xử lý: Server Action `searchSunners` gợi ý người nhận và `@tên`; `POST /api/kudos/images` ghi ảnh nháp vào kho riêng (loại tệp xác định bằng byte đầu tệp), `DELETE` xoá nháp của chính chủ; Server Action `sendKudos` kiểm đầu vào rồi gọi hàm Postgres `create_kudos` (`security definer`, người gửi là Sunner của `auth.uid()`, ghi kudos, hashtag, ảnh cùng một giao dịch); `GET /api/kudos/images/[file]` phục vụ ảnh đã gắn kudos. Ẩn danh thật: cột `kudos.sender_id` không còn đọc được từ trình duyệt, người gửi công khai qua `public_sender_id` (rỗng khi ẩn danh). Đầu ra: hộp thoại đóng, thông báo "Gửi Kudos thành công!", kudos mới đứng đầu All Kudos; thẻ kudos hiện nội dung Markdown (đậm, nghiêng, gạch ngang, danh sách đánh số, trích dẫn, liên kết http/https) và khối người gửi ẩn danh.

Quyền sở hữu: F010 sở hữu hộp thoại, hai route ảnh, hai Server Action, hàm `create_kudos`, hàm `get_my_sent_kudos_count`, bucket `images`, bốn policy Storage và hàm `kudos_image_is_attached`, hai cột ẩn danh cùng cột sinh `public_sender_id`, và các thay đổi trên thẻ (nội dung Markdown, khối người gửi ẩn danh). F006 vẫn sở hữu vỏ trang, thanh gửi kudos (nay mở hộp thoại thay vì inert) và thẻ; F009 đọc số "Kudos đã gửi" qua hàm mới.

**Workspace**: my-app
**Languages**: TypeScript, SQL (migration cột ẩn danh, `create_kudos`, `get_my_sent_kudos_count`, chỉ mục duy nhất ảnh, bucket và policy Storage)
**Components**: `WriteKudosLauncherRegion` (Server Component), `WriteKudosLauncher`, `WriteKudosModal`, `WriteKudosModalView` cùng các trường (`WriteKudosRecipientField`, `WriteKudosTitleField`, `WriteKudosEditor`, `WriteKudosHashtagField`, `WriteKudosImageField`, `WriteKudosAnonymousField`, `WriteKudosFooter`), hook `useWriteKudosForm`, `useBodyEditor`, `useBodyMentions`, `useRecipientField`, `useSunnerSearch`, `useKudosImageUploads`, `useModalBehaviour`; `KudosSendButton` (mới), `KudosRichBody`, `KudosAnonymousSenderBlock`; Server Action `sendKudos`, `searchSunners`; Route Handler `POST /api/kudos/images`, `GET|DELETE /api/kudos/images/[file]`; hàm thuần `validateSendKudos`, `parseKudosMarkdown`, `parseKudosInline`, `applyMarkdownFormat`, `sniffKudosImageType`; hàm SQL `create_kudos`, `get_my_sent_kudos_count`

**Related Screens**:
- SCR006_SunKudosLiveBoard: hộp thoại "Viết Kudo" mở từ thanh gửi kudos (REG### chưa khai báo; vỏ màn hình do F006 sở hữu)

**Related User Stories**:
- US058: Mở hộp thoại Viết Kudo
- US059: Soạn nội dung kudos
- US060: Đính kèm ảnh
- US061: Gửi kudos và thấy nó trên bảng
- US062: Gửi kudos ẩn danh
- US063: Đọc kudos có định dạng

**Related APIs/Routes**:
- (POST) /api/kudos/images — ROUTE016
- (GET) /api/kudos/images/[file] — ROUTE017
- (DELETE) /api/kudos/images/[file] — ROUTE018
- (POST) /sun-kudos [Next-Action: sendKudos] — ROUTE019
- (POST) /sun-kudos [Next-Action: searchSunners] — ROUTE020
- Thanh gửi kudos nằm trên (GET) /sun-kudos — ROUTE011 (F006)

**Related Data Models**:
- MODEL007_Kudos (thêm `is_anonymous`, `anonymous_name`, `public_sender_id`; quyền cột không gồm `sender_id`)
- MODEL010_KudosImage (thêm chỉ mục duy nhất `kudos_images_uploaded_path_key`; `image_path` là `/api/kudos/images/<uuid>.<jpg|png>`)
- Đọc lại MODEL006_Sunner (gợi ý người nhận theo cột được cấp), MODEL008_Hashtag, MODEL009_KudosHashtag
- Bucket `images` của Supabase Storage (không phải MODEL###)

**Related Background Logic**:
- Không có BL### (`create_kudos` là hàm RPC do người dùng gọi, không phải tác vụ nền)
- BL001_SupabaseServerClient (client cookie cho Server Action và route ảnh), BL003_SessionRefreshProxy (khớp `POST /api/kudos/images`, bỏ qua `/api/kudos/images/<uuid>.<ext>` vì có dấu chấm)

**Related Permissions**:
- PERM020_KudosCreateRpcSenderIsCaller: `create_kudos` là đường ghi duy nhất, chỉ `authenticated`, người gửi là Sunner của người gọi
- PERM021_KudosSenderIdNotClientReadable: `kudos.sender_id` không mở cho client; `public_sender_id` rỗng khi ẩn danh; số đã gửi qua `get_my_sent_kudos_count()`
- PERM022_KudosImagesStoragePolicies: bucket `images` riêng tư với bốn policy trên `storage.objects`
- PERM023_KudosImageRoutesSessionAndMagicBytes: `POST`/`DELETE` ảnh cần phiên, kiểm loại bằng byte đầu tệp; `GET` chỉ ảnh đã gắn
- PERM024_KudosWriteActionsSessionCheck: `sendKudos` và `searchSunners` kiểm đầu vào, lấy người dùng từ phiên đã xác minh
- PERM015_KudosBoardPublicReadServiceWrite, PERM016_SunnerPrivateColumnsOwnRowRpc (dùng chung; `kudos` nay đọc theo cột)

> Note: Verdict tên "Kudos Write" — một kết quả: Sunner gửi được lời cảm ơn và thấy nó trên bảng. Hộp thoại, ảnh, ẩn danh và hiển thị Markdown cùng một luồng gửi, không kiểm thử độc lập có ý nghĩa nên không tách.
> Note: Mã US058..US063 theo dãy toàn cục, tiếp sau US057 của F009; như F005..F009, user-stories.md chưa có các mã này (chạy `/tkm:rebuild-spec --artifact user-stories`); nội dung ở `docs/features/F010_KudosWrite/functional-spec.md` § 7.
> Note: Spec F010 được promote lúc giao (Stage 6, 2026-10-14), không phải ở implement-start; chạy `/tkm:rebuild-spec --features F010` để có bản đầy đủ `path:line`.
> Note: F010 thay quyết định D013 của F006 chỉ cho thanh A.1 (mở hộp thoại, khách tới `/login`); thanh "Tìm kiếm profile Sunner" vẫn chưa làm gì. Phụ thuộc F006 (vỏ trang, thẻ, bảng), F007 (trigger tim dùng `sender_id`), F009 (số đã gửi).

---

## Summary

- **Total Features**: 10
- **Total Screens**: 5 màn hình đang hoạt động (SCR001_Login, SCR003_Homepage, SCR004_AwardsInformation, SCR005_CountdownPrelaunch (F005), SCR006_SunKudosLiveBoard (F006 sở hữu vỏ; F007, F008, F009 sở hữu vùng; F010 sở hữu hộp thoại Viết Kudo, REG### chưa khai báo)) + 1 bản ghi đã gỡ (SCR002_Todo, tombstone, không tính) + 2 vùng (SCR003_Homepage/REG001_AccountRegion, SCR003_Homepage/REG002_AwardsGrid)
- **Total User Stories**: 63 (F001: 6, F002: 8, F003: 7, F004: 6, F005: 6, F006: 8, F007: 6, F008: 6, F009: 4, F010: 6); US028..US063 (F005..F010) có trong functional-spec của feature nhưng chưa có trong user-stories.md (file đã vượt giới hạn kích thước; chạy `/tkm:rebuild-spec --artifact user-stories`)
- **Total Routes**: 20 (ROUTE001..ROUTE020; ROUTE003, ROUTE006, ROUTE009 và ROUTE014 dùng chung giữa các feature theo route-list; ROUTE010 là F005; ROUTE011..ROUTE015 của Sun* Kudos: F006 giữ ROUTE011, ROUTE014, ROUTE015, F007 giữ ROUTE012, ROUTE013, F010 giữ ROUTE016..ROUTE020)
- **Total Data Models**: 13 (MODEL001..MODEL004 cũ, MODEL005..MODEL013 của Sun* Kudos)
- **Total Background Logic**: 3 (BL001 dùng chung ba feature)
- **Total Permissions**: 24 (PERM008 dùng chung F001, F002, F004 và F006; PERM013, PERM014 là F005; PERM015..PERM019 của Sun* Kudos; PERM020..PERM024 của F010)
- **Languages Detected**: TypeScript, SQL

## Cross-Reference Validation

- [x] All F### codes are unique
- [x] All F### codes are referenced in UserStories.md  <!-- user-stories.md không chứa F### theo thiết kế (mapping chỉ ở FeatureList); đã kiểm ngược: 21 US xuất hiện đúng 1 lần trong 3 feature -->
- [x] All screen references are valid (SCR### or SCR###/REG### in ScreenList; bare-SCR refs and region refs both accepted)
- [x] All user story references are valid (US### in UserStories)
- [x] All route references are valid (ROUTE### in RouteList)
- [x] All data model references are valid (MODEL### in DataModel)
- [x] All behavior logic references are valid (BL### in BehaviorLogic)
- [x] All permission references are valid (PERM### in Permissions)
- [x] Every US has a parent feature (F###)
- [x] Every screen has a parent feature (F###) — SCR001_Login: F001; SCR002_Todo (removed): F001 (lịch sử); SCR003_Homepage (vỏ): F002; REG001_AccountRegion: F003; REG002_AwardsGrid: F002
- [x] Every route maps to a feature (F###)
- [x] Every data model maps to a feature (F###)
- [x] Every background logic maps to a feature (F###)
- [x] Every permission maps to a feature (F###)
- [x] Feature type rules: F001 mixed (SCR001_Login + BL001..BL003); F002 ui (SCR003_Homepage); F003 ui (REG001_AccountRegion)
- [x] Partial-screen ownership (CE3): SCR003_Homepage có bare ref ở F002; F003 chỉ có ref `SCR003_Homepage/REG001_AccountRegion`; mỗi REG### có đúng 1 owner (khớp bảng Regions của screen-list.md)
