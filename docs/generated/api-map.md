# API Map

> Ghi chú: bản đồ API tổng hợp từ `route-list.md` (ROUTE001..ROUTE015) và `behavior-logic.md` (BL001_SupabaseServerClient, BL002_OAuthCallbackExchange, BL003_SessionRefreshProxy). Mỗi hàng bám đúng Method + Path trong `route-list.md`; hàng Server Action giữ hậu tố `[Next-Action: <action>]`. Cột `Handler` ghi `file:line` + ký hiệu, kèm mã BL### xử lý (BL### nằm trong ngoặc vuông sau dấu `→`). Cột `Description` bắt đầu bằng `Auth:` (mô tả bằng lời; mã PERM### chưa gán, sẽ đối chiếu ở Wave 3) và `Route:` (mã ROUTE###). Route không khớp BL nào đánh dấu `[UNMAPPED]`. Template dùng cột `Handler` / `Description`, nên BL### và Auth được gói vào hai cột này thay vì thêm cột mới.
>
> Ghi chú proxy: `proxy.ts` (`config.matcher = ["/((?!_next/|__nextjs|.*\\..*).*)"]`, `proxy.ts:22-24`, phủ mọi page route; F005 mở rộng từ `["/", "/login", "/awards-information"]`) chạy BL003_SessionRefreshProxy trước mọi request khớp matcher (làm mới phiên Supabase). `/auth/callback` khớp matcher nhưng `updateSession` trả tiếp ngay (`lib/supabase/proxy-session.ts:45`) nên không làm mới phiên. BL003 là hạ tầng làm mới token; khi site đã mở nó không chặn khách, chỉ `GET|HEAD /login` có phiên hợp lệ bị 307 về `/`. Cổng prelaunch (F005, `lib/supabase/proxy-session.ts:143-160`): khi site khoá, `GET|HEAD` tới mọi page route (trừ `/login`, `/auth/callback`) của người không phải admin bị 307 về `/countdown`; khi đã mở, `GET|HEAD /countdown` bị 307 về `/`. `POST` không qua cổng.

## Endpoints by Domain

### Homepage

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | `app/page.tsx:7` HomePage → [BL001_SupabaseServerClient, BL003_SessionRefreshProxy] | Route: ROUTE001. Auth: public (session optional — khách xem được trang; có phiên thì hiện menu tài khoản). Render trang chủ SAA: đọc `awards` và `getCurrentUser` qua BL001; BL003 làm mới phiên trước khi render. |

### Awards Information

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/awards-information` | `app/awards-information/page.tsx:7` AwardsInformationPage → [BL001_SupabaseServerClient, BL003_SessionRefreshProxy] | Route: ROUTE008. Auth: public (session optional — khách và người đã đăng nhập thấy cùng nội dung; không ai bị chuyển hướng). Render trang Hệ thống giải: `getAwardDetails` (`lib/awards/get-award-details.ts:24`) đọc `awards` kèm `award_prizes` bằng một truy vấn lồng qua BL001, bên trong `<Suspense>`; neo `#<slug>` và cuộn chỉ chạy ở trình duyệt, không có endpoint. |

### Countdown Prelaunch

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/countdown` | `app/countdown/page.tsx:8` CountdownPage → [BL003_SessionRefreshProxy] | Route: ROUTE010. Auth: public (mọi vai trò kể cả khách, không cần phiên; chỉ hiện khi site khoá, mở rồi thì proxy 307 về `/`). Render trang đếm ngược: `CountdownPrelaunchContent` (`app/countdown/_components/countdown-prelaunch-content.tsx:14`) đọc `site_settings.prelaunch_ends_at` bằng khoá publishable qua `readPrelaunchEndsAt` (`lib/prelaunch/read-prelaunch-ends-at.ts:32`) rồi giao `targetMs` và `serverNowMs` cho đồng hồ client; trình duyệt không gọi Supabase; chạm 0 thì `router.replace("/")`. |

### Sun* Kudos

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/sun-kudos` | `app/sun-kudos/page.tsx:7` SunKudosPage → [BL001_SupabaseServerClient, BL003_SessionRefreshProxy] | Route: ROUTE011. Auth: public (session optional — khách xem toàn bộ nội dung công khai; có phiên thì thẻ có cờ `likedByMe`/`isSender` và thống kê cá nhân). Vỏ tĩnh bọc `<Suspense>`; bên trong đọc cookie ngôn ngữ, bộ lọc `hashtag`/`department`, Highlight (top 5 theo tim), trang đầu All Kudos, Spotlight và sidebar qua `createClient()` (BL001). Danh sách `hashtags` và `get_my_sunner()` đọc một lần mỗi lần render (`cache()` của React). Khi site khoá, người không phải admin → 307 `/countdown` (BL003). |
| GET | `/api/kudos` | `app/api/kudos/route.ts:28` GET (Route Handler) → [BL001_SupabaseServerClient, BL003_SessionRefreshProxy] | Route: ROUTE015. Auth: public (session optional — có phiên thì `likedByMe` là lượt thích của chính người gọi, đọc dưới RLS). Trang kế All Kudos: `cursor` (đúng một giá trị số nguyên dương) và `hashtag`/`department` được kiểm danh sách cho phép trước mọi truy cập DB; 400 `invalid_cursor`/`invalid_filter`, 500 `read_failed` (mã cố định, không lộ chi tiết lỗi); `Cache-Control: no-store`. |
| POST | `/sun-kudos [Next-Action: likeKudos]` | `lib/kudos/kudos-heart-actions.ts:33` likeKudos (Server Action) → [BL001_SupabaseServerClient, BL003_SessionRefreshProxy] | Route: ROUTE012. Auth: session (khách nhận `unauthenticated`, giao diện chuyển tới `/login`). Chèn `kudos_likes` bằng client của chính người dùng (RLS `user_id = auth.uid()`); trigger DB chặn tự thích (`forbidden`), gán trọng số, cộng `like_count` và tim của người gửi. Lặp lại là no-op `ok`. |
| POST | `/sun-kudos [Next-Action: unlikeKudos]` | `lib/kudos/kudos-heart-actions.ts:41` unlikeKudos (Server Action) → [BL001_SupabaseServerClient, BL003_SessionRefreshProxy] | Route: ROUTE013. Auth: session. Xoá lượt thích của chính mình; trigger trừ đúng trọng số đã lưu. Rút khi chưa thích là no-op `ok`. |

### Auth

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/login` | `app/login/page.tsx:15` LoginPage → [BL003_SessionRefreshProxy] | Route: ROUTE004. Auth: public (khách xem; có phiên hợp lệ thì proxy chuyển 307 về `/`). Hiển thị màn hình đăng nhập Google. Trang không gọi Supabase trực tiếp nên chỉ qua BL003. |
| POST | `/login [Next-Action: signInWithGoogle]` | `app/login/actions.ts:29` signInWithGoogle (Server Action) → [BL001_SupabaseServerClient, BL003_SessionRefreshProxy] | Route: ROUTE005. Auth: public (không cần phiên để bắt đầu đăng nhập). Tạo URL authorize Google qua BL001 (ghi cookie PKCE), rồi redirect trình duyệt tới đó; lỗi trả `{ error: "failed" }`. |
| GET | `/auth/callback` | `app/auth/callback/route.ts:24` GET (Route Handler) → [BL002_OAuthCallbackExchange, BL001_SupabaseServerClient] | Route: ROUTE007. Auth: public (điểm vào của luồng OAuth; tạo phiên chứ không đòi phiên). Đổi `?code=` lấy phiên qua BL001; luôn trả 302 về `/` (thành công) hoặc `/login?error=cancelled\|failed`. Khớp matcher nhưng `updateSession` trả tiếp ngay (`lib/supabase/proxy-session.ts:45`) nên không qua BL003. |
| POST | `/ [Next-Action: signOut]` | `lib/auth/actions.ts:19` signOut (Server Action) → [BL001_SupabaseServerClient, BL003_SessionRefreshProxy] | Route: ROUTE002. Auth: session (optional — chỉ tác động lên cookie phiên của người gọi; không có phiên thì là no-op). Đăng xuất `scope: "local"` qua BL001, rồi luôn redirect `/login`. |

### Locale

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/ [Next-Action: setLocale]` | `lib/i18n/actions.ts:8` setLocale (Server Action) → [BL003_SessionRefreshProxy] [UNMAPPED] | Route: ROUTE003. Auth: public. Ghi cookie ngôn ngữ (allow-list qua `isLocale`, `maxAge` 1 năm, `sameSite: lax`), gọi từ bộ chọn ngôn ngữ ở `/`. [UNMAPPED]: không có BL riêng (chỉ ghi cookie, không gọi Supabase); chỉ đi qua BL003 của proxy. |
| POST | `/awards-information [Next-Action: setLocale]` | `lib/i18n/actions.ts:8` setLocale (Server Action) → [BL003_SessionRefreshProxy] [UNMAPPED] | Route: ROUTE009. Auth: public. Cùng action như ROUTE003, gọi từ bộ chọn ngôn ngữ ở `/awards-information`. [UNMAPPED]: không có BL riêng; chỉ đi qua BL003. |
| POST | `/sun-kudos [Next-Action: setLocale]` | `lib/i18n/actions.ts:8` setLocale (Server Action) → [BL003_SessionRefreshProxy] [UNMAPPED] | Route: ROUTE014. Auth: public. Cùng action như ROUTE003, gọi từ bộ chọn ngôn ngữ ở `/sun-kudos`. [UNMAPPED]: không có BL riêng; chỉ đi qua BL003. |
| POST | `/login [Next-Action: setLocale]` | `lib/i18n/actions.ts:8` setLocale (Server Action) → [BL003_SessionRefreshProxy] [UNMAPPED] | Route: ROUTE006. Auth: public. Cùng action như ROUTE003, gọi từ bộ chọn ngôn ngữ ở `/login`. [UNMAPPED]: không có BL riêng; chỉ đi qua BL003. |

> Ghi chú: `/profile` và `/admin` được liên kết từ menu tài khoản nhưng chưa có trang trong code (chưa xây) nên không có hàng nào ở đây.

## Background Jobs

> Ghi chú: code không có job định kỳ, hàng đợi, observer, mail hay thông báo đẩy (xem `behavior-logic.md`). Ba BL hiện có là hạ tầng chạy trong vòng đời request, không có lịch chạy riêng.

| Code | Name | Type | Trigger | Schedule |
|------|------|------|---------|----------|
| BL001_SupabaseServerClient | Supabase Server Client | integration | Mỗi request từ Server Component / Server Action / Route Handler cần Supabase | on-demand |
| BL002_OAuthCallbackExchange | OAuth Callback Exchange | integration | `GET /auth/callback` khi Supabase/Google redirect về | on-demand |
| BL003_SessionRefreshProxy | Session Refresh Proxy | middleware | Mọi request khớp `config.matcher` (mọi page route trừ `/_next/*`, `__nextjs*` và đường có dấu chấm), trước khi route render; mở rộng thêm cổng prelaunch (F005) | on-demand |

## Webhooks / External Calls

> Ghi chú: không có webhook đến hoặc đi trong code. Chỉ có cuộc gọi ra dịch vụ ngoài (Supabase Auth / PostgREST, Google OAuth) và một redirect quay về qua `/auth/callback` (không phải webhook — trình duyệt của người dùng thực hiện redirect đó).

| Direction | Target / Source | Event / Endpoint | Description |
|-----------|----------------|------------------|-------------|
| outgoing | Supabase Auth | `signInWithOAuth` (provider `google`) | `signInWithGoogle` (ROUTE005) xin URL authorize; `redirectTo` = `<origin>/auth/callback`. Qua BL001. |
| outgoing | Supabase Auth | `exchangeCodeForSession` | `GET /auth/callback` (ROUTE007) đổi `code` lấy phiên. Qua BL002 + BL001. |
| outgoing | Supabase Auth | `getClaims` | BL003 làm mới token trên mọi page route khớp matcher (trừ `/auth/callback`); `getCurrentUser` đọc claims khi render `/`. |
| outgoing | Supabase Auth | `signOut` (`scope: "local"`) | `signOut` (ROUTE002) kết thúc phiên của trình duyệt hiện tại. Qua BL001. |
| outgoing | Supabase PostgREST | bảng `departments`, `sunners` (theo cột, không `email`/`user_id`), `kudos`, `hashtags`, `kudos_hashtags`, `kudos_images`, `special_days`, `secret_boxes`; ghi `kudos_likes`; RPC `get_my_sunner()` | Đọc/ghi của `/sun-kudos` và `GET /api/kudos` (`lib/kudos/*`), qua BL001; không có `service_role` ở phía app. |
| outgoing | Supabase PostgREST | bảng `awards`, `award_prizes`, `profiles` (cột `role`), `site_settings` (cột `prelaunch_ends_at`) | Đọc danh sách giải thưởng (`lib/awards/get-awards.ts:23`), chi tiết giải kèm các mức giá trị bằng một truy vấn lồng (`lib/awards/get-award-details.ts:30-33`) và vai trò người dùng (`lib/supabase/current-user.ts:38`). Qua BL001. Cổng prelaunch (F005) đọc `site_settings.prelaunch_ends_at` bằng client không cookie (`lib/prelaunch/read-prelaunch-ends-at.ts:32`, hạn chờ 2 giây, không retry) ở proxy và ở `/countdown`, và đọc `profiles.role` bằng client cookie của proxy khi site khoá (`lib/prelaunch/read-gate-user-role.ts:24`, hạn chờ 2 giây, không retry); hai đường này không đi qua BL001. |
| incoming (redirect) | Google OAuth qua Supabase | `GET /auth/callback?code=` hoặc `?error=` | Trình duyệt quay về sau bước đăng nhập; xử lý bởi BL002 (ROUTE007). Không phải webhook máy chủ-máy chủ. |
