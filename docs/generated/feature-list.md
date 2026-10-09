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

> Ghi chú mã chuẩn: bốn mã F001_LoginWithGoogle, F002_HomepageSaa, F003_AccountMenuAdminRole, F004_AwardsInformation (thêm 2026-10-09) là mã chuẩn (canonical) đã khoá, không đánh số lại, không thêm F### khác. Việc phân cụm bên dưới đối chiếu với `code-formats.md § Feature Clustering Rule` và cho kết quả trùng với các mã chuẩn (xem verdict từng tên ở `> Note:` trong mục Feature Details).

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
**Description**: Hiển thị trang chủ công khai `/` của SAA 2025 cho mọi tác nhân (khách, người dùng, admin hành vi giống nhau). Đầu vào: request GET `/` kèm cookie ngôn ngữ `NEXT_LOCALE`, biến môi trường `SAA_COUNTDOWN_TARGET` và bảng `awards`. Xử lý: Server Component đọc ngôn ngữ, mốc đếm ngược và danh mục giải thưởng (RLS cho đọc công khai) rồi ghép vỏ trang (header, hero, đếm ngược, "Root Further", lưới giải thưởng, khối Kudos, footer); bộ chọn ngôn ngữ ghi cookie `NEXT_LOCALE` qua `setLocale`; các liên kết điều hướng ra `/awards-information` (trang của F004), `/sun-kudos`, `/standards` (hai đích sau chưa xây). Đầu ra: trang chủ đúng ngôn ngữ với đồng hồ đếm ngược tự cập nhật và lưới giải thưởng theo `sort_order`. Vỏ SCR003_Homepage thuộc F002; vùng tài khoản trên header (REG001_AccountRegion) nhường F003.

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

---

## Summary

- **Total Features**: 4
- **Total Screens**: 3 màn hình đang hoạt động (SCR001_Login, SCR003_Homepage, SCR004_AwardsInformation) + 1 bản ghi đã gỡ (SCR002_Todo, tombstone, không tính) + 2 vùng (SCR003_Homepage/REG001_AccountRegion, SCR003_Homepage/REG002_AwardsGrid)
- **Total User Stories**: 27 (F001: 6, F002: 8, F003: 7, F004: 6)
- **Total Routes**: 9 (ROUTE001..ROUTE009; ROUTE003, ROUTE006 và ROUTE009 dùng chung F001, F002 và F004 theo route-list)
- **Total Data Models**: 3
- **Total Background Logic**: 3 (BL001 dùng chung ba feature)
- **Total Permissions**: 12 (PERM008 dùng chung F001, F002 và F004)
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
