# API Map

> Ghi chú: bản đồ API tổng hợp từ `route-list.md` (ROUTE001..ROUTE021) và `behavior-logic.md` (BL001_SupabaseServerClient, BL002_OAuthCallbackExchange, BL003_SessionRefreshProxy). Mỗi hàng bám đúng Method + Path trong `route-list.md`; hàng Server Action giữ hậu tố `[Next-Action: <action>]`. Cột `Handler` ghi `file:line` + ký hiệu, kèm mã BL### xử lý (BL### nằm trong ngoặc vuông sau dấu `→`). Cột `Description` bắt đầu bằng `Auth:` (mô tả bằng lời; mã PERM### chưa gán, sẽ đối chiếu ở Wave 3) và `Route:` (mã ROUTE###). Route không khớp BL nào đánh dấu `[UNMAPPED]`. Template dùng cột `Handler` / `Description`, nên BL### và Auth được gói vào hai cột này thay vì thêm cột mới.
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
| GET | `/api/kudos` | `app/api/kudos/route.ts:28` GET (Route Handler) → [BL001_SupabaseServerClient, BL003_SessionRefreshProxy] | Route: ROUTE015. Auth: public (session optional — có phiên thì `likedByMe` là lượt thích của chính người gọi, đọc dưới RLS; `isSender` đánh dấu kudos của chính người gọi, kể cả ẩn danh, qua RPC `kudos_sent_by_me()`). Trang kế All Kudos: `cursor` (đúng một giá trị số nguyên dương) và `hashtag`/`department` được kiểm danh sách cho phép trước mọi truy cập DB; 400 `invalid_cursor`/`invalid_filter`, 500 `read_failed` (mã cố định, không lộ chi tiết lỗi); `Cache-Control: no-store`. |
| POST | `/sun-kudos [Next-Action: likeKudos]` | `lib/kudos/kudos-heart-actions.ts:33` likeKudos (Server Action) → [BL001_SupabaseServerClient, BL003_SessionRefreshProxy] | Route: ROUTE012. Auth: session (người chưa có phiên nhận `unauthenticated`: client đã mở phiên ẩn danh bằng ROUTE021 trước nên chỉ gặp khi phiên vừa mất, giao diện tải lại như khách và hiện lỗi ngắn; khách có phiên ẩn danh thích qua Sunner khách). Chèn `kudos_likes` bằng client của chính người dùng (RLS `user_id = auth.uid()`); trigger DB chặn tự thích (`forbidden`), gán trọng số, cộng `like_count` và tim của người gửi. Lặp lại là no-op `ok`. |
| POST | `/sun-kudos [Next-Action: unlikeKudos]` | `lib/kudos/kudos-heart-actions.ts:41` unlikeKudos (Server Action) → [BL001_SupabaseServerClient, BL003_SessionRefreshProxy] | Route: ROUTE013. Auth: session. Xoá lượt thích của chính mình; trigger trừ đúng trọng số đã lưu. Rút khi chưa thích là no-op `ok`. |
| POST | `/sun-kudos [Next-Action: sendKudos]` | `lib/kudos/send-kudos-action.ts:45` sendKudos (Server Action) → [BL001_SupabaseServerClient, BL003_SessionRefreshProxy] | Route: ROUTE019. Auth: session (người chưa có phiên nhận `unauthenticated`, hộp thoại chuyển tới `/login`; phiên ẩn danh của khách được gửi như Sunner khách, `create_kudos` ép kudos ẩn danh và từ chối Sunner khách làm người nhận; người xác định từ `getCurrentUser()`, không nhận từ client). Kiểm hình dạng đầu vào rồi `validateSendKudos`, sau đó gọi RPC `create_kudos` bằng client cookie của người dùng (RLS/`security definer`, không `service_role`): ghi `kudos`, `kudos_hashtags`, `kudos_images` cùng một giao dịch. Kết quả có kiểu: `ok` + `kudosId`, `invalid` + lỗi theo trường (SQLSTATE `22023`), `noSunner` (`P0002`), `unauthenticated`, `error`. |
| POST | `/sun-kudos [Next-Action: searchSunners]` | `lib/kudos/send-kudos-action.ts:104` searchSunners (Server Action) → [BL001_SupabaseServerClient, BL003_SessionRefreshProxy] | Route: ROUTE020. Auth: session (người chưa có phiên nhận `[]`; phiên ẩn danh được tìm). Gợi ý Sunner theo `full_name` (`ilike`, `.eq("is_guest", false)` nên không bao giờ trả Sunner khách, cắt khoảng trắng, thoát `\ % _ *`), tối đa 10, từ khoá rỗng hoặc quá 100 ký tự → `[]`; chỉ đọc cột `sunners` được cấp (`id`, `full_name`, `department_code`, `avatar_url`). Chỉ đọc. |
| POST | `/sun-kudos [Next-Action: ensureGuestSession]` | `lib/supabase/ensure-guest-session.ts` ensureGuestSession (Server Action) → [BL001_SupabaseServerClient, BL003_SessionRefreshProxy] | Route: ROUTE021. Auth: public (không cần phiên, không có đầu vào; guests act as Anonymous). Có claims (tài khoản hoặc phiên ẩn danh) → `ok`, không đổi gì; không có phiên → `signInAnonymously()` trên client cookie của request (response đặt cookie phiên ẩn danh; trigger DB tạo Sunner khách `is_guest`) → `ok`; mọi lỗi khi kiểm tra hoặc đăng nhập (mạng, JWT sai, giới hạn) → `error`, không bao giờ đè phiên tài khoản. Gọi ở hành động đầu tiên của khách (bấm tim, mở Viết Kudo) qua `startGuestSessionOnce` (gộp các lần gọi đồng thời); đọc bảng không gọi. Chưa có giới hạn tốc độ hay captcha, chỉ trần Supabase theo IP. |
| POST | `/api/kudos/images` | `app/api/kudos/images/route.ts:35` POST (Route Handler) → [BL001_SupabaseServerClient, BL003_SessionRefreshProxy] | Route: ROUTE016. Auth: session (người chưa có phiên 401). Một ảnh `multipart/form-data` (trường `file`), tối đa 5 MiB, loại xác định bằng byte đầu tệp (JPEG, PNG; MIME và tên tệp bị bỏ qua: 415). Ghi đối tượng `kudos/<uuid>.<jpg\|png>` vào bucket riêng `images` bằng client cookie của người dùng (policy Storage `insert_own`); trả `{path: "/api/kudos/images/<uuid>.<ext>"}`. Ảnh là nháp cho tới khi `create_kudos` gắn vào kudos. |
| GET | `/api/kudos/images/[file]` | `app/api/kudos/images/[file]/route.ts:53` GET (Route Handler) | Route: ROUTE017. Auth: public (khách và người đăng nhập thấy như nhau; không cần phiên). Phục vụ ảnh **đã gắn** vào một kudos bằng client không cookie (vai `anon`, policy Storage `select_attached`); ảnh nháp, tên sai dạng hoặc byte không khớp đuôi → 404; cache công khai một năm. Matcher của proxy bỏ đường có dấu chấm nên không qua BL003 và không bị cổng prelaunch. |
| DELETE | `/api/kudos/images/[file]` | `app/api/kudos/images/[file]/route.ts:93` DELETE (Route Handler) → [BL001_SupabaseServerClient] | Route: ROUTE018. Auth: session (người chưa có phiên 401). Chủ ảnh xoá ảnh nháp chưa gắn kudos bằng client cookie (policy `delete_own_draft`); không xoá được ảnh của người khác hoặc ảnh đã gắn → 404; thành công 204. Không qua BL003 (đường có dấu chấm). |

### Auth

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/login` | `app/login/page.tsx:15` LoginPage → [BL003_SessionRefreshProxy] | Route: ROUTE004. Auth: public (khách xem; có phiên hợp lệ của tài khoản thì proxy chuyển 307 về `/`; phiên ẩn danh của khách không bị chuyển). Hiển thị màn hình đăng nhập Google. Trang không gọi Supabase trực tiếp nên chỉ qua BL003. |
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
| outgoing | Supabase Auth | `signInAnonymously` | `ensureGuestSession` (ROUTE021) mở phiên ẩn danh cho khách ở hành động đầu tiên (bấm tim, mở Viết Kudo); trigger `create_guest_sunner` tạo Sunner khách. Cần `enable_anonymous_sign_ins = true` (local ở `supabase/config.toml`; dự án hosted phải bật). Chịu trần Supabase theo IP (`anonymous_users`; local 1000), chưa có captcha. |
| outgoing | Supabase Auth | `signOut` (`scope: "local"`) | `signOut` (ROUTE002) kết thúc phiên của trình duyệt hiện tại. Qua BL001. |
| outgoing | Supabase PostgREST | bảng `departments`, `sunners` (theo cột gồm `is_guest`, không `email`/`user_id`/`hearts_total`), `kudos` (theo cột, không `sender_id`), `hashtags`, `kudos_hashtags`, `kudos_images`, `special_days`, `secret_boxes`; ghi `kudos_likes`; RPC `get_my_sunner()`, `create_kudos(...)` (F010, `sendKudos`), `get_my_sent_kudos_count()` (F010, sidebar F009), `kudos_sent_by_me(uuid[])` (sửa lỗi 2026-10-15, đặt `isSender` cho kudos của chính người xem) | Đọc/ghi của `/sun-kudos` và `GET /api/kudos` (`lib/kudos/*`), qua BL001; không có `service_role` ở phía app. |
| outgoing | Supabase Storage | bucket `images` (riêng tư): `upload`, `download`, `remove` đối tượng `kudos/<uuid>.<jpg\|png>` | Route ảnh của F010 (ROUTE016..ROUTE018): tải lên và xoá bằng client cookie của người dùng, tải xuống bằng client không cookie (vai `anon`); policy RLS trên `storage.objects` quyết định; không có `service_role`. |
| outgoing | Supabase PostgREST | bảng `awards`, `award_prizes`, `profiles` (cột `role`), `site_settings` (cột `prelaunch_ends_at`) | Đọc danh sách giải thưởng (`lib/awards/get-awards.ts:23`), chi tiết giải kèm các mức giá trị bằng một truy vấn lồng (`lib/awards/get-award-details.ts:30-33`) và vai trò người dùng (`lib/supabase/current-user.ts:38`). Qua BL001. Cổng prelaunch (F005) đọc `site_settings.prelaunch_ends_at` bằng client không cookie (`lib/prelaunch/read-prelaunch-ends-at.ts:32`, hạn chờ 2 giây, không retry) ở proxy và ở `/countdown`, và đọc `profiles.role` bằng client cookie của proxy khi site khoá (`lib/prelaunch/read-gate-user-role.ts:24`, hạn chờ 2 giây, không retry); hai đường này không đi qua BL001. |
| incoming (redirect) | Google OAuth qua Supabase | `GET /auth/callback?code=` hoặc `?error=` | Trình duyệt quay về sau bước đăng nhập; xử lý bởi BL002 (ROUTE007). Không phải webhook máy chủ-máy chủ. |
