---
status: implemented
authored_by: takumi
created: 2026-10-07
lang: vi
---

# Permissions

**Project**: my-app
**Generated**: 2026-10-07
**Analysis Scope**: Tính năng đăng nhập Google (`/login`, `/auth/callback`, `/todo`) — bản nháp thiết kế, chưa có code.

> Bản mô tả dễ đọc cho PM/BA. Mã `PERM###`: `TBD (draft)` — sẽ được cấp khi đối chiếu với code thực tế và ma trận sinh tự động.

## Authorization System Type

**System Type**: `other` — chỉ phân biệt "đã đăng nhập" và "chưa đăng nhập"; không có vai trò, không có RBAC, không có kiểm tra quyền sở hữu.

**Identified Roles**:
- Anonymous visitor (khách chưa đăng nhập)
- Authenticated user (người dùng đã đăng nhập bằng tài khoản Google bất kỳ)

## Curated View

- **Anonymous visitor** xem được `/` và `/login`, và bắt đầu được luồng đăng nhập Google. Truy cập `/todo` sẽ bị chuyển sang `/login`.
- **Authenticated user** vào được `/todo`, thấy email của mình và đăng xuất được. Vào `/login` sẽ bị chuyển sang `/todo`.
- Mọi tài khoản Google đều được phép đăng nhập; không giới hạn theo tên miền email, không có danh sách cho phép.
- Người dùng đổi ngôn ngữ (vi/en) được ở cả hai trạng thái; lựa chọn lưu trong cookie `NEXT_LOCALE`, không liên quan đến quyền.

## Access Boundaries

Ranh giới duy nhất là có session hợp lệ hay không. Không có ranh giới giữa các người dùng đã đăng nhập (chưa có dữ liệu riêng của từng người trong phạm vi này).

| Route | Anonymous visitor | Authenticated user |
|-------|-------------------|--------------------|
| `/login` | Cho phép | Chuyển sang `/todo` |
| `/todo` | Chuyển sang `/login` | Cho phép |
| `/auth/callback` | Cho phép (công khai) | Cho phép (công khai) |
| `/` | Cho phép (giữ nguyên như hiện tại) | Cho phép (giữ nguyên như hiện tại) |

`/auth/callback` phải công khai vì đây là nơi session được tạo ra; route này chỉ nhận `code` hợp lệ từ Supabase, nếu không thì chuyển về `/login?error=cancelled|failed`. Đích sau đăng nhập luôn là `/todo`, không đọc từ tham số URL.

### Enforcement Points

| Điểm kiểm tra | Cách thực hiện |
|---------------|----------------|
| `proxy.ts` | Gọi `getClaims()` (xác thực chữ ký JWT) để làm mới session và quyết định chuyển hướng cho `/login` và `/todo/:path*`. Chuyển hướng giữ lại cookie vừa được làm mới. |
| Trang `/todo` | Kiểm tra lại claims phía server; không có claims thì `redirect("/login")` (phòng thủ nhiều lớp, vì proxy chạy cả khi prefetch và không đủ một mình). |
| Server Action `signOut` | Tự kiểm tra lại session bên trong action, vì Server Action là POST tới route của trang và có thể gọi mà không qua kiểm tra của trang. |
| Server Action `signInWithGoogle` | Công khai theo thiết kế; không cần session. |
| Server Action `setLocale` | Công khai; chỉ ghi cookie `NEXT_LOCALE` sau khi kiểm tra giá trị thuộc {`vi`, `en`}. |

Quy tắc bắt buộc: phía server không bao giờ tin `getSession()`; chỉ dùng `getClaims()` (hoặc `getUser()`) để biết người dùng là ai.

## Special Conditions

- **Session**: lưu bằng cookie của Supabase SSR, tên dạng `sb-<ref>-auth-token` (local: `sb-127-auth-token`, có thể bị tách thành nhiều mảnh nếu dài). Access token hết hạn sau 3600 giây (`jwt_expiry`); refresh token có xoay vòng (`enable_refresh_token_rotation = true`). Proxy làm mới session ở mỗi request thuộc matcher.
- **Đăng xuất**: `signOut` xoá cookie session rồi chuyển về `/login`.
- **PKCE**: cookie verifier tạm thời được ghi khi bấm "Login with Google" và dùng một lần ở `/auth/callback`.
- **Đăng ký tài khoản**: `[auth] enable_signup = true` nên tài khoản Google mới được tạo tự động ở lần đăng nhập đầu. Đăng ký bằng email/mật khẩu chỉ bật ở local cho E2E; giao diện không có form này.
- **Tài khoản test**: khi Google consent screen ở chế độ Testing, chỉ các test user đã khai báo mới đăng nhập được (ràng buộc của Google, không phải của ứng dụng).
