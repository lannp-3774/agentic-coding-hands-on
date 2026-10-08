---
status: implemented
authored_by: rebuild-spec
reconciled_from: takumi forward-draft
lang: vi
---

# Permissions

**Project**: my-app (SAA 2025 — Sun* Annual Awards 2025)
**Generated**: 2026-10-08
**Analysis Scope**: Đăng nhập Google (`/login`, `/auth/callback`), trang chủ công khai (`/`), menu tài khoản và vai trò admin (`profiles.role`), quyền truy cập dữ liệu của hai bảng `awards` và `profiles`. Các route `/profile`, `/admin`, `/awards-information`, `/sun-kudos`, `/standards` có liên kết nhưng chưa có page trong code.

> **Curated, plain-language view.** Bản mô tả dễ đọc cho PM, BA và khách hàng, dẫn xuất từ ma trận thô tại [permissions-matrix.md](../generated/permissions-matrix.md). Chi tiết từng điểm kiểm soát và vị trí trong code nằm ở đó, không lặp lại ở đây.

## Authorization System Type

**System Type**: `rbac`

RBAC đơn giản: mỗi người dùng có đúng một vai trò, lưu ở cột `profiles.role` (`user` hoặc `admin`). Không có quyền chi tiết theo từng hành động, không có kiểm tra quyền sở hữu giữa người dùng với nhau. Ở tầng dữ liệu, Supabase RLS dùng vai trò Postgres (`anon`, `authenticated`, `service_role`) để giới hạn đọc ghi bảng.

**Identified Roles**:
- Anonymous visitor (khách chưa đăng nhập)
- Authenticated user (đã đăng nhập bằng tài khoản Google bất kỳ, `profiles.role = 'user'`)
- Authenticated admin (đã đăng nhập, `profiles.role = 'admin'`)
- `service_role` (khoá phía vận hành: seed, trigger, đổi vai trò; không phải người dùng cuối)

## Curated View

- **Anonymous visitor** xem được trang chủ `/` (header hiện liên kết "Login", lưới giải thưởng hiển thị bình thường) và `/login`, bắt đầu được luồng đăng nhập Google và đổi ngôn ngữ vi/en. Không có chuông thông báo, không có menu tài khoản.
- **Authenticated user** xem được trang chủ với header là chuông thông báo và menu tài khoản (Profile, Đăng xuất). Mở `/login` sẽ bị chuyển sang `/`. Đăng xuất chỉ kết thúc phiên ở trình duyệt đang dùng.
- **Authenticated admin** làm được mọi việc của user, cộng thêm mục Admin Dashboard trong menu tài khoản. Mục này chỉ là giao diện, không phải kiểm soát truy cập.
- Mọi tài khoản Google đều được phép đăng nhập: không giới hạn theo tên miền email, không có danh sách cho phép. Tài khoản mới tự được tạo ở lần đăng nhập đầu và mặc định là `user`.
- Đổi ngôn ngữ (vi/en) dùng được ở mọi trạng thái; lựa chọn lưu trong cookie `NEXT_LOCALE`, không liên quan đến quyền.
- Ai cũng đọc được danh sách giải thưởng (dữ liệu công khai), nhưng không ai ngoài vận hành ghi được. Mỗi người đăng nhập chỉ đọc được dòng hồ sơ (`profiles`) của chính mình và không tự đổi được vai trò.
- Chưa có giao diện cấp hay thu hồi vai trò admin; chỉ đổi được bằng khoá `service_role` hoặc truy cập trực tiếp CSDL.

## Access Boundaries

Ranh giới gồm hai lớp: có phiên đăng nhập hợp lệ hay không, và `profiles.role` có là `admin` hay không. Giữa các người dùng đã đăng nhập không có ranh giới dữ liệu riêng trong phạm vi hiện tại, ngoài việc mỗi người chỉ đọc được hồ sơ của mình.

Theo từng đường dẫn:

- `/`: mở cho mọi người. Khách không bao giờ bị chuyển hướng; header khác nhau theo trạng thái đăng nhập. Proxy vẫn chạy ở đây để làm mới phiên.
- `/login`: khách vào được. Người đã đăng nhập mở bằng `GET` hoặc `HEAD` sẽ bị chuyển sang `/` (307). Đây là quy tắc chuyển hướng duy nhất của proxy; người đã đăng nhập bấm đăng nhập lần nữa bằng `POST` trực tiếp thì không bị từ chối.
- `/auth/callback`: công khai vì đây là nơi phiên được tạo ra. Chỉ một `code` hợp lệ từ Supabase mới tạo được phiên; ngược lại chuyển về `/login?error=cancelled` hoặc `/login?error=failed`. Đích khi thành công luôn là `/`, không đọc từ tham số URL nên không có open redirect.
- `/todo`: đã gỡ ngày 2026-10-08 (màn hình SCR002_Todo chỉ còn là bản ghi đã gỡ), truy cập trả 404.
- `/profile`, `/awards-information`, `/sun-kudos`, `/standards`: có liên kết trong giao diện nhưng chưa có page, trả 404 cho mọi vai trò; chưa có quy tắc quyền để ghi.
- `/admin`: có liên kết trong menu của admin nhưng chưa có page, trả 404 cho mọi vai trò, và **chưa có kiểm tra phía server**. Khi xây trang này phải tự kiểm tra vai trò ở server (qua `getCurrentUser()`), vì ẩn mục menu hay chặn ở proxy đều không đủ.

Theo hành động (Server Action):

- Đăng nhập Google: công khai, không cần phiên. Action chỉ dựng URL quay về trên đúng host mà người dùng đang duyệt; không xác định được host hợp lệ thì báo lỗi thay vì đoán. Supabase còn đối chiếu URL quay về với danh sách cho phép.
- Đăng xuất: ai gọi cũng được, vì chỉ tác động lên cookie phiên của chính người gọi. Không có phiên thì không làm gì. Luôn kết thúc ở `/login`; lỗi chỉ ghi log.
- Đổi ngôn ngữ: ai cũng gọi được, nhưng chỉ nhận `vi` hoặc `en`; giá trị khác bị bỏ qua.

Theo dữ liệu (Supabase RLS):

- Bảng `awards`: khách và người đã đăng nhập chỉ đọc được; ghi chỉ qua `service_role`.
- Bảng `profiles`: khách không có quyền; người đã đăng nhập chỉ đọc dòng của mình; không ai ngoài `service_role` ghi được. Vai trò tuyệt đối không suy ra từ `user_metadata` (người dùng tự ghi được).

Hai điểm kiểm soát phía server và một điểm chỉ là giao diện:

- Proxy (`proxy.ts`) làm mới phiên bằng cách xác thực chữ ký JWT (`getClaims()`) ở `/` và `/login`, nhưng không phải rào chắn bảo vệ route: mọi trang và action sau này phải tự kiểm tra lại, không dựa riêng vào proxy.
- `getCurrentUser()` là nguồn xác định người dùng và vai trò phía server. Nó đọc `profiles.role` dưới RLS bằng phiên của chính người dùng nên đổi vai trò có hiệu lực ngay ở request kế tiếp. Hiện chỉ vùng tài khoản trên header dùng nó; chưa trang hay action nào chặn truy cập dựa trên vai trò.
- Mục "Admin Dashboard" hiện hay ẩn là UX, không phải phân quyền. Danh sách mục menu được lọc ở server nên vai trò không xuống trình duyệt.

Quy tắc bắt buộc: phía server không bao giờ tin `getSession()`; chỉ dùng `getClaims()` (hoặc `getUser()`) để biết người dùng là ai.

## Special Conditions

- **Fail closed**: nếu không xác định được người dùng (thiếu hay sai `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY`, lỗi `getClaims`, lỗi mạng) thì coi là khách, ghi log, không trả lỗi 500; an toàn vì khách không được cấp gì. Nếu tra cứu `profiles.role` lỗi, không có dòng hồ sơ hay giá trị lạ thì coi là `user`, không bao giờ là `admin`.
- **Session**: lưu bằng cookie Supabase SSR, tên dạng `sb-<ref>-auth-token` (môi trường local: `sb-127-auth-token`, có thể bị tách thành nhiều mảnh nếu dài). Cookie session và cookie PKCE dùng chung thuộc tính `httpOnly`, `sameSite: lax`, `path: /`; `secure` chỉ bật ở production (theo `NODE_ENV`, chốt lúc triển khai). Ứng dụng không có client Supabase phía trình duyệt nên script trang không đọc được token. Access token hết hạn sau 3600 giây; refresh token có xoay vòng (`enable_refresh_token_rotation = true`). Proxy làm mới phiên ở mọi request thuộc matcher, kể cả `/`.
- **Đăng xuất**: chỉ kết thúc phiên ở trình duyệt này (phạm vi `local`), không thu hồi phiên ở thiết bị khác. Nút nằm trong menu tài khoản.
- **PKCE**: cookie verifier tạm thời được ghi khi bấm "Login with Google" và dùng một lần ở `/auth/callback`.
- **Vai trò**: `profiles.role` mặc định `user`; dòng hồ sơ do trigger trên `auth.users` tạo khi có tài khoản mới (vai trò luôn lấy giá trị mặc định, không lấy từ metadata). Tài khoản admin cho E2E được dựng bằng helper dùng `SUPABASE_SECRET_KEY`; biến này chỉ E2E đọc, ứng dụng không đọc.
- **Đăng ký tài khoản**: `[auth] enable_signup = true` nên tài khoản Google mới được tạo tự động ở lần đăng nhập đầu. Đăng ký bằng email/mật khẩu chỉ bật ở local để E2E dựng phiên (cấu hình ghi rõ không đẩy lên project thật); giao diện không có form này. Đăng nhập ẩn danh tắt.
- **Nhà cung cấp Google**: `supabase/config.toml` bật `[auth.external.google]` (`enabled = true`), `client_id` và `secret` lấy từ biến môi trường `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, `skip_nonce_check = false`, `email_optional = false`. Repo không có thêm quy tắc nào giới hạn tài khoản Google được đăng nhập.

> Note: cấu hình OAuth consent screen (chế độ Testing/Production, danh sách test user) nằm ở Google Cloud Console, ngoài repo — không kiểm chứng được từ code.
- **Chuông thông báo và nút widget nổi**: chỉ là giao diện, chưa có handler, quyền hay dữ liệu đi kèm.
- **Không có** feature flag, thử nghiệm A/B hay quy tắc quyền theo ngôn ngữ. Cấu hình `SAA_COUNTDOWN_TARGET` (mốc đếm ngược) chỉ ảnh hưởng nội dung hiển thị, không ảnh hưởng quyền. Chi tiết từng điểm kiểm soát xem [permissions-matrix.md](../generated/permissions-matrix.md).
