# Route List

**Project**: SAA 2025 (my-app)
**Generated**: 2026-10-08

## Backend Routes

> **Completeness Contract:** emit exactly ONE row per leaf route (HTTP method + concrete path). Expand framework resource macros (Rails `resources :x` → 7 RESTful rows). FORBIDDEN: resource-summary tables (`| Resource | Actions |`), approximation markers (`~N`, `(+nhiều)`, `see routes.rb`, `etc.`), wildcard paths (`/x/*`). Scout counts are estimates, not authority.

> **Code Column Contract:** `Code` is mandatory going forward — `ROUTE###`, contiguous and global across this one file (same shape as `SCR###`/`F###`). `Owner F###` carries the bare feature code that claims the route, or `—` when the route cannot be attributed to a single feature (shared/infra routes). Rare shared routes may list comma-separated multi-owners, e.g. `F001, F003`.

> Ghi chú: Next.js App Router không có file khai báo route tập trung; route suy ra từ cấu trúc `app/` (phân tích tĩnh, không chạy stack). Một Server Action là request `POST` (header `Next-Action`) gửi tới chính route của trang đang gọi nó, nên mỗi cặp (action, trang gọi) là một hàng riêng; cột Path ghi thêm `[Next-Action: <action>]` để phân biệt các action cùng POST tới một trang. `setLocale` được gọi từ ba trang (`/`, `/login` và `/awards-information`) nên có ba hàng. Middleware `proxy` = `proxy.ts` (`config.matcher` = `["/((?!_next/|__nextjs|.*\\..*).*)"]`, `proxy.ts:22-24`, phủ mọi page route; F005 mở rộng từ `["/", "/login", "/awards-information"]`) chạy `updateSession` (`lib/supabase/proxy-session.ts:43`) trước các route khớp matcher: làm mới phiên Supabase; `GET|HEAD /login` với phiên hợp lệ bị chuyển 307 về `/` (`lib/supabase/proxy-session.ts:129-135`); cổng prelaunch (F005, `proxy-session.ts:143-160`): khi site khoá, `GET|HEAD` tới mọi page route (trừ `/login`, `/auth/callback`) của người không phải admin bị chuyển 307 về `/countdown`, và khi site đã mở `GET|HEAD /countdown` bị chuyển 307 về `/`; request `POST` luôn đi tiếp. `/auth/callback` khớp matcher nhưng `updateSession` trả tiếp ngay (`proxy-session.ts:45`).

### File: app/page.tsx (route `/`)

| Method | Path | Code | Owner F### | Handler | Middleware |
|--------|------|------|------------|---------|------------|
| GET | / | ROUTE001 | F002 | `app/page.tsx:7` HomePage | proxy (updateSession; khi site đã mở khách không bị chuyển hướng; khi khoá, người không phải admin → 307 `/countdown`) |
| POST | / [Next-Action: signOut] | ROUTE002 | F003 | `lib/auth/actions.ts:19` signOut (Server Action, gọi từ menu tài khoản: `app/_components/header-behaviour/account-region.tsx:59`) | proxy (updateSession) |
| POST | / [Next-Action: setLocale] | ROUTE003 | F001, F002 | `lib/i18n/actions.ts:8` setLocale (Server Action, gọi từ bộ chọn ngôn ngữ: `app/_components/home/home-content.tsx:40`) | proxy (updateSession) |

### File: app/login/page.tsx (route `/login`)

| Method | Path | Code | Owner F### | Handler | Middleware |
|--------|------|------|------------|---------|------------|
| GET | /login | ROUTE004 | F001 | `app/login/page.tsx:15` LoginPage | proxy (updateSession; có phiên hợp lệ → 307 `/`; được miễn khỏi cổng prelaunch) |
| POST | /login [Next-Action: signInWithGoogle] | ROUTE005 | F001 | `app/login/actions.ts:29` signInWithGoogle (Server Action, truyền vào LoginScreen: `app/login/page.tsx:38`) | proxy (updateSession) |
| POST | /login [Next-Action: setLocale] | ROUTE006 | F001, F002 | `lib/i18n/actions.ts:8` setLocale (Server Action, gọi từ bộ chọn ngôn ngữ: `app/login/page.tsx:39`) | proxy (updateSession) |

### File: app/awards-information/page.tsx (route `/awards-information`)

| Method | Path | Code | Owner F### | Handler | Middleware |
|--------|------|------|------------|---------|------------|
| GET | /awards-information | ROUTE008 | F004 | `app/awards-information/page.tsx:7` AwardsInformationPage | proxy (updateSession; khi site đã mở khách không bị chuyển hướng; khi khoá, người không phải admin → 307 `/countdown`) |
| POST | /awards-information [Next-Action: setLocale] | ROUTE009 | F001, F002, F004 | `lib/i18n/actions.ts:8` setLocale (Server Action, gọi từ bộ chọn ngôn ngữ: `app/awards-information/_components/awards-information-content.tsx:34`) | proxy (updateSession) |

### File: app/auth/callback/route.ts (route `/auth/callback`)

| Method | Path | Code | Owner F### | Handler | Middleware |
|--------|------|------|------------|---------|------------|
| GET | /auth/callback | ROUTE007 | F001 | `app/auth/callback/route.ts:24` GET (Route Handler; luôn trả 302 về `/` hoặc `/login?error=cancelled\|failed`) | proxy (khớp matcher nhưng `updateSession` trả tiếp ngay, `lib/supabase/proxy-session.ts:45`; không làm mới phiên, không cổng) |

### File: app/countdown/page.tsx (route `/countdown`)

| Method | Path | Code | Owner F### | Handler | Middleware |
|--------|------|------|------------|---------|------------|
| GET | /countdown | ROUTE010 | F005 | `app/countdown/page.tsx:8` CountdownPage | proxy (updateSession; cổng prelaunch: khi site khoá hiện trang cho mọi vai trò, khi đã mở hoặc mốc không dùng được → 307 `/`, `lib/prelaunch/prelaunch-gate-decision.ts:51-53`) |

### File: app/sun-kudos/page.tsx (route `/sun-kudos`)

| Method | Path | Code | Owner F### | Handler | Middleware |
|--------|------|------|------------|---------|------------|
| GET | /sun-kudos | ROUTE011 | F006 | `app/sun-kudos/page.tsx:7` SunKudosPage (kèm searchParams `hashtag`, `department`; vùng Spotlight F008, sidebar F009 và hộp thoại Viết Kudo F010 (mở từ thanh gửi kudos) nằm trong cùng route, không có route riêng) | proxy (updateSession; khi site đã mở khách không bị chuyển hướng; khi khoá, người không phải admin → 307 `/countdown`) |
| POST | /sun-kudos [Next-Action: likeKudos] | ROUTE012 | F007 | `lib/kudos/kudos-heart-actions.ts:33` likeKudos (Server Action, gọi từ kho tim: `lib/kudos/kudos-heart-store.tsx:128`; khách → `unauthenticated`, phiên kiểm lại phía máy chủ) | proxy (updateSession) |
| POST | /sun-kudos [Next-Action: unlikeKudos] | ROUTE013 | F007 | `lib/kudos/kudos-heart-actions.ts:41` unlikeKudos (Server Action, gọi từ kho tim: `lib/kudos/kudos-heart-store.tsx:128`) | proxy (updateSession) |
| POST | /sun-kudos [Next-Action: setLocale] | ROUTE014 | F001, F002, F004, F006 | `lib/i18n/actions.ts:8` setLocale (Server Action, gọi từ bộ chọn ngôn ngữ: `app/sun-kudos/_components/sun-kudos-content.tsx`) | proxy (updateSession) |
| POST | /sun-kudos [Next-Action: sendKudos] | ROUTE019 | F010 | `lib/kudos/send-kudos-action.ts:45` sendKudos (Server Action, gọi từ hộp thoại Viết Kudo: `app/_components/write-kudos-behaviour/write-kudos-modal.tsx:45`; kiểm hình dạng và luật đầu vào rồi gọi RPC `create_kudos` bằng client cookie của người dùng; trả `ok` / `invalid` / `unauthenticated` / `noSunner` / `error`, không ném lỗi ra client) | proxy (updateSession) |
| POST | /sun-kudos [Next-Action: searchSunners] | ROUTE020 | F010 | `lib/kudos/send-kudos-action.ts:104` searchSunners (Server Action, gọi từ ô Người nhận và gợi ý `@tên`: `app/_components/write-kudos-behaviour/use-sunner-search.ts:34`; khách hoặc từ khoá rỗng/quá 100 ký tự → `[]`; tối đa 10 kết quả) | proxy (updateSession) |

### File: app/api/kudos/route.ts (route `/api/kudos`)

| Method | Path | Code | Owner F### | Handler | Middleware |
|--------|------|------|------------|---------|------------|
| GET | /api/kudos | ROUTE015 | F006 | `app/api/kudos/route.ts:28` GET (Route Handler; trang kế của All Kudos theo `?cursor=<seq>` kèm `hashtag`, `department` tuỳ chọn; trả `{items, nextCursor}`; 400 `invalid_cursor` / `invalid_filter`, 500 `read_failed`; `Cache-Control: no-store`) | proxy (updateSession; khi site đã mở khách không bị chuyển hướng; khi khoá, người không phải admin → 307 `/countdown`) |

### File: app/api/kudos/images/route.ts (route `/api/kudos/images`)

| Method | Path | Code | Owner F### | Handler | Middleware |
|--------|------|------|------------|---------|------------|
| POST | /api/kudos/images | ROUTE016 | F010 | `app/api/kudos/images/route.ts:35` POST (Route Handler; một ảnh `multipart/form-data` trường `file`; cần phiên; loại tệp theo byte đầu tệp (JPEG, PNG), tối đa 5 MiB; 200 `{path: "/api/kudos/images/<uuid>.<jpg\|png>"}`, 401 `unauthenticated`, 413 `fileTooLarge`, 415 `invalidFileType`, 400 hoặc 500 `uploadFailed`; `Cache-Control: no-store`) | proxy (updateSession; đường không có dấu chấm nên khớp matcher; `POST` không bị cổng prelaunch và không bị chuyển hướng) |

### File: app/api/kudos/images/[file]/route.ts (route `/api/kudos/images/<uuid>.<jpg|png>`)

| Method | Path | Code | Owner F### | Handler | Middleware |
|--------|------|------|------------|---------|------------|
| GET | /api/kudos/images/[file] | ROUTE017 | F010 | `app/api/kudos/images/[file]/route.ts:53` GET (Route Handler; phục vụ ảnh đã gắn vào một kudos cho mọi người, đọc bằng client không cookie (vai `anon`); tên sai dạng, ảnh chưa gắn hoặc byte không khớp đuôi → 404, lỗi Storage khác → 502; `Cache-Control: public, max-age=31536000, immutable`) | không có: matcher của proxy bỏ đường có dấu chấm (`<uuid>.<jpg\|png>`), nên không làm mới phiên và không bị cổng prelaunch |
| DELETE | /api/kudos/images/[file] | ROUTE018 | F010 | `app/api/kudos/images/[file]/route.ts:93` DELETE (Route Handler; chủ ảnh xoá ảnh nháp chưa gắn kudos; cần phiên; 204 đã xoá, 401 khách, 404 tên sai dạng hoặc không xoá được (không tồn tại, của người khác, đã gắn), 502 lỗi Storage; `Cache-Control: no-store`) | không có: như ROUTE017; route tự kiểm phiên bằng `getCurrentUser()` |

## Frontend Routes/Pages

### File: app/page.tsx

| Path | Component | Route Name |
|------|-----------|------------|
| / | HomePage (`app/page.tsx:7`) | home |

### File: app/login/page.tsx

| Path | Component | Route Name |
|------|-----------|------------|
| /login | LoginPage (`app/login/page.tsx:15`) | login |

### File: app/awards-information/page.tsx

| Path | Component | Route Name |
|------|-----------|------------|
| /awards-information | AwardsInformationPage (`app/awards-information/page.tsx:7`) | awards-information |

### File: app/countdown/page.tsx

| Path | Component | Route Name |
|------|-----------|------------|
| /countdown | CountdownPage (`app/countdown/page.tsx:8`) | countdown |

### File: app/sun-kudos/page.tsx

| Path | Component | Route Name |
|------|-----------|------------|
| /sun-kudos | SunKudosPage (`app/sun-kudos/page.tsx:7`) | sun-kudos |

> Ghi chú: các trang bọc trong `RootLayout` (`app/layout.tsx:21`) — layout không phải route riêng nên không có hàng. `/`, `/login`, `/awards-information`, `/countdown` và `/sun-kudos` là các endpoint `GET` đã tính ở ROUTE001, ROUTE004, ROUTE008, ROUTE010 và ROUTE011; bảng này chỉ liệt kê thành phần trang tương ứng. Riêng `/countdown` không dùng `SaaPageShell` và không có header, footer.

## Summary

| Category | Count |
|----------|-------|
| Backend Routes | 20 |
| Frontend Pages | 5 |
| Total | 25 |

> Ghi chú: Total = tổng hai danh mục theo mẫu; 5 trang frontend trùng với ROUTE001, ROUTE004, ROUTE008, ROUTE010 và ROUTE011, nên số endpoint HTTP phân biệt (method + path) là 20.
