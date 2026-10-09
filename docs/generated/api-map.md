# API Map

> Ghi chú: bản đồ API tổng hợp từ `route-list.md` (ROUTE001..ROUTE009) và `behavior-logic.md` (BL001_SupabaseServerClient, BL002_OAuthCallbackExchange, BL003_SessionRefreshProxy). Mỗi hàng bám đúng Method + Path trong `route-list.md`; hàng Server Action giữ hậu tố `[Next-Action: <action>]`. Cột `Handler` ghi `file:line` + ký hiệu, kèm mã BL### xử lý (BL### nằm trong ngoặc vuông sau dấu `→`). Cột `Description` bắt đầu bằng `Auth:` (mô tả bằng lời; mã PERM### chưa gán, sẽ đối chiếu ở Wave 3) và `Route:` (mã ROUTE###). Route không khớp BL nào đánh dấu `[UNMAPPED]`. Template dùng cột `Handler` / `Description`, nên BL### và Auth được gói vào hai cột này thay vì thêm cột mới.
>
> Ghi chú proxy: `proxy.ts` (`config.matcher = ["/", "/login", "/awards-information"]`, `proxy.ts:18-20`) chạy BL003_SessionRefreshProxy trước mọi request khớp matcher (làm mới phiên Supabase). `/auth/callback` nằm ngoài matcher nên không qua BL003. BL003 là hạ tầng làm mới token, không chặn khách; chỉ `GET|HEAD /login` có phiên hợp lệ bị 307 về `/`.

## Endpoints by Domain

### Homepage

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | `app/page.tsx:7` HomePage → [BL001_SupabaseServerClient, BL003_SessionRefreshProxy] | Route: ROUTE001. Auth: public (session optional — khách xem được trang; có phiên thì hiện menu tài khoản). Render trang chủ SAA: đọc `awards` và `getCurrentUser` qua BL001; BL003 làm mới phiên trước khi render. |

### Awards Information

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/awards-information` | `app/awards-information/page.tsx:7` AwardsInformationPage → [BL001_SupabaseServerClient, BL003_SessionRefreshProxy] | Route: ROUTE008. Auth: public (session optional — khách và người đã đăng nhập thấy cùng nội dung; không ai bị chuyển hướng). Render trang Hệ thống giải: `getAwardDetails` (`lib/awards/get-award-details.ts:24`) đọc `awards` kèm `award_prizes` bằng một truy vấn lồng qua BL001, bên trong `<Suspense>`; neo `#<slug>` và cuộn chỉ chạy ở trình duyệt, không có endpoint. |

### Auth

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/login` | `app/login/page.tsx:15` LoginPage → [BL003_SessionRefreshProxy] | Route: ROUTE004. Auth: public (khách xem; có phiên hợp lệ thì proxy chuyển 307 về `/`). Hiển thị màn hình đăng nhập Google. Trang không gọi Supabase trực tiếp nên chỉ qua BL003. |
| POST | `/login [Next-Action: signInWithGoogle]` | `app/login/actions.ts:29` signInWithGoogle (Server Action) → [BL001_SupabaseServerClient, BL003_SessionRefreshProxy] | Route: ROUTE005. Auth: public (không cần phiên để bắt đầu đăng nhập). Tạo URL authorize Google qua BL001 (ghi cookie PKCE), rồi redirect trình duyệt tới đó; lỗi trả `{ error: "failed" }`. |
| GET | `/auth/callback` | `app/auth/callback/route.ts:24` GET (Route Handler) → [BL002_OAuthCallbackExchange, BL001_SupabaseServerClient] | Route: ROUTE007. Auth: public (điểm vào của luồng OAuth; tạo phiên chứ không đòi phiên). Đổi `?code=` lấy phiên qua BL001; luôn trả 302 về `/` (thành công) hoặc `/login?error=cancelled\|failed`. Ngoài matcher của proxy nên không qua BL003. |
| POST | `/ [Next-Action: signOut]` | `lib/auth/actions.ts:19` signOut (Server Action) → [BL001_SupabaseServerClient, BL003_SessionRefreshProxy] | Route: ROUTE002. Auth: session (optional — chỉ tác động lên cookie phiên của người gọi; không có phiên thì là no-op). Đăng xuất `scope: "local"` qua BL001, rồi luôn redirect `/login`. |

### Locale

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/ [Next-Action: setLocale]` | `lib/i18n/actions.ts:8` setLocale (Server Action) → [BL003_SessionRefreshProxy] [UNMAPPED] | Route: ROUTE003. Auth: public. Ghi cookie ngôn ngữ (allow-list qua `isLocale`, `maxAge` 1 năm, `sameSite: lax`), gọi từ bộ chọn ngôn ngữ ở `/`. [UNMAPPED]: không có BL riêng (chỉ ghi cookie, không gọi Supabase); chỉ đi qua BL003 của proxy. |
| POST | `/awards-information [Next-Action: setLocale]` | `lib/i18n/actions.ts:8` setLocale (Server Action) → [BL003_SessionRefreshProxy] [UNMAPPED] | Route: ROUTE009. Auth: public. Cùng action như ROUTE003, gọi từ bộ chọn ngôn ngữ ở `/awards-information`. [UNMAPPED]: không có BL riêng; chỉ đi qua BL003. |
| POST | `/login [Next-Action: setLocale]` | `lib/i18n/actions.ts:8` setLocale (Server Action) → [BL003_SessionRefreshProxy] [UNMAPPED] | Route: ROUTE006. Auth: public. Cùng action như ROUTE003, gọi từ bộ chọn ngôn ngữ ở `/login`. [UNMAPPED]: không có BL riêng; chỉ đi qua BL003. |

> Ghi chú: `/profile` và `/admin` được liên kết từ menu tài khoản nhưng chưa có trang trong code (chưa xây) nên không có hàng nào ở đây.

## Background Jobs

> Ghi chú: code không có job định kỳ, hàng đợi, observer, mail hay thông báo đẩy (xem `behavior-logic.md`). Ba BL hiện có là hạ tầng chạy trong vòng đời request, không có lịch chạy riêng.

| Code | Name | Type | Trigger | Schedule |
|------|------|------|---------|----------|
| BL001_SupabaseServerClient | Supabase Server Client | integration | Mỗi request từ Server Component / Server Action / Route Handler cần Supabase | on-demand |
| BL002_OAuthCallbackExchange | OAuth Callback Exchange | integration | `GET /auth/callback` khi Supabase/Google redirect về | on-demand |
| BL003_SessionRefreshProxy | Session Refresh Proxy | middleware | Mọi request khớp `config.matcher` (`/`, `/login`, `/awards-information`), trước khi route render | on-demand |

## Webhooks / External Calls

> Ghi chú: không có webhook đến hoặc đi trong code. Chỉ có cuộc gọi ra dịch vụ ngoài (Supabase Auth / PostgREST, Google OAuth) và một redirect quay về qua `/auth/callback` (không phải webhook — trình duyệt của người dùng thực hiện redirect đó).

| Direction | Target / Source | Event / Endpoint | Description |
|-----------|----------------|------------------|-------------|
| outgoing | Supabase Auth | `signInWithOAuth` (provider `google`) | `signInWithGoogle` (ROUTE005) xin URL authorize; `redirectTo` = `<origin>/auth/callback`. Qua BL001. |
| outgoing | Supabase Auth | `exchangeCodeForSession` | `GET /auth/callback` (ROUTE007) đổi `code` lấy phiên. Qua BL002 + BL001. |
| outgoing | Supabase Auth | `getClaims` | BL003 làm mới token trên `/`, `/login` và `/awards-information`; `getCurrentUser` đọc claims khi render `/`. |
| outgoing | Supabase Auth | `signOut` (`scope: "local"`) | `signOut` (ROUTE002) kết thúc phiên của trình duyệt hiện tại. Qua BL001. |
| outgoing | Supabase PostgREST | bảng `awards`, `award_prizes`, `profiles` (cột `role`) | Đọc danh sách giải thưởng (`lib/awards/get-awards.ts:23`), chi tiết giải kèm các mức giá trị bằng một truy vấn lồng (`lib/awards/get-award-details.ts:30-33`) và vai trò người dùng (`lib/supabase/current-user.ts:37`). Qua BL001. |
| incoming (redirect) | Google OAuth qua Supabase | `GET /auth/callback?code=` hoặc `?error=` | Trình duyệt quay về sau bước đăng nhập; xử lý bởi BL002 (ROUTE007). Không phải webhook máy chủ-máy chủ. |
