---
status: implemented
authored_by: takumi
created: 2026-10-09
lang: vi
---

# Permissions

**Project**: my-app (SAA 2025 — Sun* Annual Awards 2025)
**Generated**: 2026-10-08
**Analysis Scope**: Đăng nhập Google (`/login`, `/auth/callback`), trang chủ công khai (`/`), trang Awards Information công khai (`/awards-information`), menu tài khoản và vai trò admin (`profiles.role`), quyền truy cập dữ liệu của các bảng `awards`, `award_prizes`, `profiles` và `site_settings`, cổng prelaunch toàn site và trang đếm ngược `/countdown`. Các route `/profile`, `/admin`, `/sun-kudos`, `/standards` có liên kết nhưng chưa có page trong code.

> **Curated, plain-language view.** Bản mô tả dễ đọc cho PM, BA và khách hàng, dẫn xuất từ ma trận thô tại [permissions-matrix.md](../generated/permissions-matrix.md). Chi tiết từng điểm kiểm soát và vị trí trong code nằm ở đó, không lặp lại ở đây.

## Authorization System Type

**System Type**: `rbac`

RBAC đơn giản: mỗi người dùng có đúng một vai trò, lưu ở cột `profiles.role` (`user` hoặc `admin`). Không có quyền chi tiết theo từng hành động, không có kiểm tra quyền sở hữu giữa người dùng với nhau. Ở tầng dữ liệu, Supabase RLS dùng vai trò Postgres (`anon`, `authenticated`, `service_role`) để giới hạn đọc ghi bảng. Cổng prelaunch là lần đầu vai trò `admin` quyết định một việc phía server (ai được vượt cổng); đây là cổng ra mắt, không phải kiểm soát quyền theo trang.

**Identified Roles**:
- Anonymous visitor (khách chưa đăng nhập)
- Authenticated user (đã đăng nhập bằng tài khoản Google bất kỳ, `profiles.role = 'user'`)
- Authenticated admin (đã đăng nhập, `profiles.role = 'admin'`)
- `service_role` (khoá phía vận hành: seed, trigger, đổi vai trò, đổi mốc prelaunch; không phải người dùng cuối)

## Curated View

- **Cổng prelaunch**: trước mốc mở site, chỉ trang đếm ngược `/countdown`, `/login` và `/auth/callback` mở cho khách và người dùng thường; mọi trang khác đưa họ về `/countdown`. Admin (đúng chữ `admin` ở `profiles.role`) duyệt toàn site như khi đã mở. Từ mốc trở đi (hoặc khi mốc thiếu, hỏng, không đọc được) cổng không hoạt động và các điều dưới đây áp dụng nguyên văn. Cổng không phải kiểm soát an ninh.
- **Anonymous visitor** (khi site đã mở) xem được trang chủ `/` (header hiện liên kết "Login", lưới giải thưởng hiển thị bình thường), trang Awards Information `/awards-information` (menu sáu giải, mô tả, số lượng và giá trị của từng giải, khối Sun* Kudos) và `/login`, bắt đầu được luồng đăng nhập Google và đổi ngôn ngữ vi/en. Không có chuông thông báo, không có menu tài khoản. Khi site còn khoá, khách chỉ thấy `/countdown` và `/login`.
- **Authenticated user** xem được trang chủ và trang Awards Information (khi site đã mở) với header là chuông thông báo và menu tài khoản (Profile, Đăng xuất); nội dung chung giống khách. Mở `/login` sẽ bị chuyển sang `/`. Đăng xuất chỉ kết thúc phiên ở trình duyệt đang dùng. Khi site còn khoá, user bị đối xử như khách: về `/countdown`.
- **Authenticated admin** làm được mọi việc của user, cộng thêm mục Admin Dashboard trong menu tài khoản, và duyệt toàn site khi còn khoá. Mục menu chỉ là giao diện, không phải kiểm soát truy cập.
- Mọi tài khoản Google đều được phép đăng nhập: không giới hạn theo tên miền email, không có danh sách cho phép. Tài khoản mới tự được tạo ở lần đăng nhập đầu và mặc định là `user`.
- Đổi ngôn ngữ (vi/en) dùng được ở mọi trạng thái; lựa chọn lưu trong cookie `NEXT_LOCALE`, không liên quan đến quyền.
- Ai cũng đọc được danh sách giải thưởng và chi tiết từng giải (mô tả dài, số lượng, các mức giá trị) vì đây là dữ liệu công khai, nhưng không ai ngoài vận hành ghi được. Mốc prelaunch (`site_settings`) cũng đọc công khai và chỉ vận hành ghi. Mỗi người đăng nhập chỉ đọc được dòng hồ sơ (`profiles`) của chính mình và không tự đổi được vai trò.
- Chưa có giao diện cấp hay thu hồi vai trò admin, cũng chưa có giao diện đổi mốc prelaunch; chỉ đổi được bằng khoá `service_role` hoặc truy cập trực tiếp CSDL.

## Access Boundaries

Ranh giới gồm ba lớp: mốc prelaunch đã qua hay chưa (cổng), có phiên đăng nhập hợp lệ hay không, và `profiles.role` có là `admin` hay không. Giữa các người dùng đã đăng nhập không có ranh giới dữ liệu riêng trong phạm vi hiện tại, ngoài việc mỗi người chỉ đọc được hồ sơ của mình.

Theo từng đường dẫn (cổng chỉ áp cho `GET`/`HEAD`; "khi khoá" = mốc prelaunch còn ở tương lai):

- `/`: mở cho mọi người khi site đã mở. Khách không bao giờ bị chuyển hướng; header khác nhau theo trạng thái đăng nhập. Khi khoá: khách và user về `/countdown`, admin vào được. Proxy vẫn chạy ở đây để làm mới phiên.
- `/awards-information`: mở cho mọi người khi site đã mở, giống trang chủ. Khách và người đã đăng nhập thấy cùng nội dung. Khi khoá: như `/`. Phần `#<mã giải>` trên địa chỉ chỉ chạy ở trình duyệt, không liên quan đến quyền; neo không khớp giải nào bị bỏ qua, không lỗi.
- `/countdown`: trang đếm ngược, mở cho mọi vai trò kể cả khách, không cần đăng nhập, chỉ khi đang khoá. Từ mốc trở đi (hoặc mốc thiếu, `NULL`, hỏng, không đọc được) bị chuyển sang `/` (307) bằng `GET`/`HEAD`.
- `/login`: luôn mở cho khách, kể cả khi khoá. Người đã đăng nhập mở bằng `GET` hoặc `HEAD` sẽ bị chuyển sang `/` (307) như trước; khi khoá, user thường tiếp tục bị cổng chuyển sang `/countdown` (hai lần chuyển), admin ở lại `/`. Người đã đăng nhập bấm đăng nhập lần nữa bằng `POST` trực tiếp thì không bị từ chối.
- `/auth/callback`: luôn công khai vì đây là nơi phiên được tạo ra, kể cả khi khoá; matcher của proxy có khớp đường này nhưng `updateSession` trả tiếp ngay, nên proxy không làm gì (không làm mới phiên, không đọc mốc, không cổng; `lib/supabase/proxy-session.ts:45`). Chỉ một `code` hợp lệ từ Supabase mới tạo được phiên; ngược lại chuyển về `/login?error=cancelled` hoặc `/login?error=failed`. Đích khi thành công luôn là `/` (khi khoá, user thường tiếp tục về `/countdown`, admin vào trang chủ), không đọc từ tham số URL nên không có open redirect.
- Mọi đường dẫn page khác (kể cả `/profile`, `/admin`, `/sun-kudos`, `/standards` chưa có page): khi khoá, khách và user về `/countdown` thay vì 404, admin thấy 404 như hiện nay; khi đã mở, hành vi như bên dưới. Tệp tĩnh dưới `public/` và `/_next/*` không đi qua cổng nên luôn tải được.
- `/todo`: đã gỡ ngày 2026-10-08 (màn hình SCR002_Todo chỉ còn là bản ghi đã gỡ), truy cập trả 404 (khi khoá: như mọi đường dẫn page khác).
- `/profile`, `/sun-kudos`, `/standards`: có liên kết trong giao diện nhưng chưa có page, trả 404 cho mọi vai trò khi site đã mở; chưa có quy tắc quyền để ghi.
- `/admin`: có liên kết trong menu của admin nhưng chưa có page, trả 404 cho mọi vai trò khi site đã mở, và **chưa có kiểm tra phía server**. Khi xây trang này phải tự kiểm tra vai trò ở server (qua `getCurrentUser()`), vì ẩn mục menu, chặn ở proxy hay vượt cổng prelaunch đều không đủ: cổng cho admin qua nhưng cũng cho mọi người qua sau mốc.

Theo hành động (Server Action):

- Đăng nhập Google: công khai, không cần phiên. Action chỉ dựng URL quay về trên đúng host mà người dùng đang duyệt; không xác định được host hợp lệ thì báo lỗi thay vì đoán. Supabase còn đối chiếu URL quay về với danh sách cho phép.
- Đăng xuất: ai gọi cũng được, vì chỉ tác động lên cookie phiên của chính người gọi. Không có phiên thì không làm gì. Luôn kết thúc ở `/login`; lỗi chỉ ghi log.
- Đổi ngôn ngữ: ai cũng gọi được, nhưng chỉ nhận `vi` hoặc `en`; giá trị khác bị bỏ qua. Dùng được ở trang chủ, trang Awards Information và màn hình Login với cùng một action.
- Server Action là `POST` tới chính route nên không bị cổng prelaunch chuyển hướng; cổng không phải chốt chặn của bất kỳ action nào.

Theo dữ liệu (Supabase RLS):

- Bảng `awards` (nay có thêm cột chi tiết: mô tả dài, số lượng, đơn vị, nhãn menu): khách và người đã đăng nhập chỉ đọc được; ghi chỉ qua `service_role`. Quyền đọc áp cho cả bảng nên cột mới được đọc công khai như cột cũ.
- Bảng `award_prizes` (các mức giá trị của từng giải): cùng mẫu với `awards` — khách và người đã đăng nhập chỉ đọc được; ghi chỉ qua `service_role`.
- Bảng `site_settings` (một dòng duy nhất nhờ khoá `singleton boolean` kèm `check (singleton)`; cột `prelaunch_ends_at`, `NULL` = cổng tắt): cùng mẫu với `awards` — khách và người đã đăng nhập chỉ đọc được; ghi chỉ qua `service_role` (`supabase/migrations/20261009083754_create_site_settings.sql:31-43`). Mọi cột của bảng đọc công khai nên không để giá trị nhạy cảm ở đây.
- Bảng `profiles`: khách không có quyền; người đã đăng nhập chỉ đọc dòng của mình; không ai ngoài `service_role` ghi được. Vai trò tuyệt đối không suy ra từ `user_metadata` (người dùng tự ghi được).

Hai điểm kiểm soát phía server và một điểm chỉ là giao diện:

- Proxy (`proxy.ts`) làm mới phiên bằng cách xác thực chữ ký JWT (`getClaims()`) ở mọi page route: matcher là literal tĩnh `"/((?!_next/|__nextjs|.*\\..*).*)"` (`proxy.ts:22-24`; trước đây chỉ `/`, `/login`, `/awards-information`), không khớp `/_next/*`, `__nextjs*` và mọi đường có dấu chấm (tệp tĩnh); `/auth/callback` khớp nhưng được trả tiếp ngay. Proxy còn áp cổng prelaunch (`lib/supabase/proxy-session.ts:143-160`, `lib/prelaunch/prelaunch-gate-decision.ts:40-56`): chỉ `GET`/`HEAD` (`POST` của Server Action không bao giờ bị cổng), miễn `/login` và `/auth/callback`; đọc mốc bằng khoá publishable (client không cookie, hạn chờ 2 giây, không retry); chỉ khi đang khoá và có phiên đã xác minh mới đọc `profiles.role` bằng phiên của người dùng (hạn chờ 2 giây, không retry) để biết có phải admin — admin là đúng chữ `"admin"` qua hàm `toUserRole` (`lib/supabase/user-role.ts:13-15`); khách không có phiên bị chuyển ngay, không tra `profiles`. Đây không phải rào chắn bảo vệ route: mọi trang và action sau này phải tự kiểm tra lại, không dựa riêng vào proxy.
- `getCurrentUser()` là nguồn xác định người dùng và vai trò phía server cho Server Component. Nó đọc `profiles.role` dưới RLS bằng phiên của chính người dùng nên đổi vai trò có hiệu lực ngay ở request kế tiếp. Hiện chỉ vùng tài khoản trên header dùng nó; chưa trang hay action nào chặn truy cập dựa trên vai trò ngoài cổng prelaunch của proxy, vốn tự truy vấn vai trò (không gọi được `getCurrentUser()`) nhưng dùng chung hàm thuần `toUserRole` với `getCurrentUser()` để áp đúng một quy tắc: chỉ đúng chữ `admin` mới là admin (`lib/supabase/current-user.ts:78`).
- Mục "Admin Dashboard" hiện hay ẩn là UX, không phải phân quyền. Danh sách mục menu được lọc ở server nên vai trò không xuống trình duyệt. Trạng thái "đang chọn" của các liên kết điều hướng trong header (đổi theo trang hiện tại) cũng chỉ là giao diện.

Quy tắc bắt buộc: phía server không bao giờ tin `getSession()`; chỉ dùng `getClaims()` (hoặc `getUser()`) để biết người dùng là ai.

## Special Conditions

- **Fail closed**: nếu không xác định được người dùng (thiếu hay sai `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY`, lỗi `getClaims`, lỗi mạng) thì coi là khách, ghi log, không trả lỗi 500; an toàn vì khách không được cấp gì. Nếu tra cứu `profiles.role` lỗi, quá hạn chờ (cổng prelaunch đặt 2 giây), không có dòng hồ sơ hay giá trị lạ thì coi là `user`, không bao giờ là `admin`; với cổng prelaunch điều này nghĩa là không được vượt cổng. Trang Awards Information cũng fail an toàn theo cách riêng: nếu không đọc được `awards` hoặc `award_prizes`, trang vẫn hiện (khách thấy thông báo "sẽ sớm được cập nhật"), lỗi chỉ ghi log máy chủ.
- **Fail open (cổng prelaunch)**: ngược với các mục trên, nếu mốc prelaunch thiếu, `NULL`, sai, quá thời gian chờ (2 giây) hay không đọc được thì cổng không hoạt động: site mở, không retry, lỗi ghi log `[prelaunch]` ở máy chủ (mỗi thông báo khác nhau một lần mỗi tiến trình; `NULL` là tắt có chủ ý nên im lặng). Lý do: đây là cổng ra mắt chứ không phải kiểm soát an ninh; một lỗi cấu hình không được khoá cả site. Phía vượt cổng của admin vẫn fail closed như trên.
- **Cổng prelaunch**: chuyển hướng bằng 307 tới đích cố định (`/countdown` hoặc `/`), chỉ với `GET`/`HEAD`, không đọc đích từ URL nên không có open redirect. Mốc đọc mỗi request, không cache ở phiên bản đầu. Trang `/countdown` đếm theo giờ máy chủ (máy chủ gửi giờ hiện tại, trình duyệt bù độ lệch) nên đồng hồ máy người xem lệch không làm trình duyệt sang `/` trước khi cổng mở.
- **Session**: lưu bằng cookie Supabase SSR, tên dạng `sb-<ref>-auth-token` (môi trường local: `sb-127-auth-token`, có thể bị tách thành nhiều mảnh nếu dài). Cookie session và cookie PKCE dùng chung thuộc tính `httpOnly`, `sameSite: lax`, `path: /`; `secure` chỉ bật ở production (theo `NODE_ENV`, chốt lúc triển khai). Ứng dụng không có client Supabase phía trình duyệt nên script trang không đọc được token. Access token hết hạn sau 3600 giây; refresh token có xoay vòng (`enable_refresh_token_rotation = true`). Proxy làm mới phiên ở mọi request thuộc matcher, nay là mọi page route trừ `/_next/*`, `__nextjs*` và tệp tĩnh (đường có dấu chấm), kể cả `/` và `/awards-information`; `/auth/callback` khớp matcher nhưng không được làm mới.
- **Đăng xuất**: chỉ kết thúc phiên ở trình duyệt này (phạm vi `local`), không thu hồi phiên ở thiết bị khác. Nút nằm trong menu tài khoản.
- **PKCE**: cookie verifier tạm thời được ghi khi bấm "Login with Google" và dùng một lần ở `/auth/callback`.
- **Vai trò**: `profiles.role` mặc định `user`; dòng hồ sơ do trigger trên `auth.users` tạo khi có tài khoản mới (vai trò luôn lấy giá trị mặc định, không lấy từ metadata). Tài khoản admin cho E2E được dựng bằng helper dùng `SUPABASE_SECRET_KEY`; biến này chỉ E2E đọc, ứng dụng không đọc. Một helper E2E dùng cùng khoá (`e2e/support/prelaunch-setting.ts`) cũng đặt và khôi phục mốc prelaunch.
- **Đăng ký tài khoản**: `[auth] enable_signup = true` nên tài khoản Google mới được tạo tự động ở lần đăng nhập đầu. Đăng ký bằng email/mật khẩu chỉ bật ở local để E2E dựng phiên (cấu hình ghi rõ không đẩy lên project thật); giao diện không có form này. Đăng nhập ẩn danh tắt.
- **Nhà cung cấp Google**: `supabase/config.toml` bật `[auth.external.google]` (`enabled = true`), `client_id` và `secret` lấy từ biến môi trường `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, `skip_nonce_check = false`, `email_optional = false`. Repo không có thêm quy tắc nào giới hạn tài khoản Google được đăng nhập.

> Note: cấu hình OAuth consent screen (chế độ Testing/Production, danh sách test user) nằm ở Google Cloud Console, ngoài repo — không kiểm chứng được từ code.
- **Chuông thông báo và nút widget nổi**: chỉ là giao diện, chưa có handler, quyền hay dữ liệu đi kèm.
- **Không có** feature flag, thử nghiệm A/B hay quy tắc quyền theo ngôn ngữ. Cấu hình `SAA_COUNTDOWN_TARGET` (mốc đếm ngược của trang chủ) chỉ ảnh hưởng nội dung hiển thị, không ảnh hưởng quyền. Mốc prelaunch (`site_settings.prelaunch_ends_at`) thì khác: nó quyết định site có bị khoá hay không, nhưng cũng là dữ liệu cấu hình chứ không phải quyền theo người dùng; hai mốc độc lập nhau. Chi tiết từng điểm kiểm soát xem [permissions-matrix.md](../generated/permissions-matrix.md).
