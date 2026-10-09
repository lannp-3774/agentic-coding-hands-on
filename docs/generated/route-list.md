# Route List

**Project**: SAA 2025 (my-app)
**Generated**: 2026-10-08

## Backend Routes

> **Completeness Contract:** emit exactly ONE row per leaf route (HTTP method + concrete path). Expand framework resource macros (Rails `resources :x` → 7 RESTful rows). FORBIDDEN: resource-summary tables (`| Resource | Actions |`), approximation markers (`~N`, `(+nhiều)`, `see routes.rb`, `etc.`), wildcard paths (`/x/*`). Scout counts are estimates, not authority.

> **Code Column Contract:** `Code` is mandatory going forward — `ROUTE###`, contiguous and global across this one file (same shape as `SCR###`/`F###`). `Owner F###` carries the bare feature code that claims the route, or `—` when the route cannot be attributed to a single feature (shared/infra routes). Rare shared routes may list comma-separated multi-owners, e.g. `F001, F003`.

> Ghi chú: Next.js App Router không có file khai báo route tập trung; route suy ra từ cấu trúc `app/` (phân tích tĩnh, không chạy stack). Một Server Action là request `POST` (header `Next-Action`) gửi tới chính route của trang đang gọi nó, nên mỗi cặp (action, trang gọi) là một hàng riêng; cột Path ghi thêm `[Next-Action: <action>]` để phân biệt các action cùng POST tới một trang. `setLocale` được gọi từ ba trang (`/`, `/login` và `/awards-information`) nên có ba hàng. Middleware `proxy` = `proxy.ts` (`config.matcher` = `["/", "/login", "/awards-information"]`, `proxy.ts:18-20`) chạy `updateSession` (`lib/supabase/proxy-session.ts:30`) trước các route khớp matcher: làm mới phiên Supabase; chỉ `GET|HEAD /login` với phiên hợp lệ bị chuyển 307 về `/` (`lib/supabase/proxy-session.ts:99-105`), request `POST` luôn đi tiếp.

### File: app/page.tsx (route `/`)

| Method | Path | Code | Owner F### | Handler | Middleware |
|--------|------|------|------------|---------|------------|
| GET | / | ROUTE001 | F002 | `app/page.tsx:7` HomePage | proxy (updateSession; khách không bị chuyển hướng) |
| POST | / [Next-Action: signOut] | ROUTE002 | F003 | `lib/auth/actions.ts:19` signOut (Server Action, gọi từ menu tài khoản: `app/_components/header-behaviour/account-region.tsx:59`) | proxy (updateSession) |
| POST | / [Next-Action: setLocale] | ROUTE003 | F001, F002 | `lib/i18n/actions.ts:8` setLocale (Server Action, gọi từ bộ chọn ngôn ngữ: `app/_components/home/home-content.tsx:40`) | proxy (updateSession) |

### File: app/login/page.tsx (route `/login`)

| Method | Path | Code | Owner F### | Handler | Middleware |
|--------|------|------|------------|---------|------------|
| GET | /login | ROUTE004 | F001 | `app/login/page.tsx:15` LoginPage | proxy (updateSession; có phiên hợp lệ → 307 `/`) |
| POST | /login [Next-Action: signInWithGoogle] | ROUTE005 | F001 | `app/login/actions.ts:29` signInWithGoogle (Server Action, truyền vào LoginScreen: `app/login/page.tsx:38`) | proxy (updateSession) |
| POST | /login [Next-Action: setLocale] | ROUTE006 | F001, F002 | `lib/i18n/actions.ts:8` setLocale (Server Action, gọi từ bộ chọn ngôn ngữ: `app/login/page.tsx:39`) | proxy (updateSession) |

### File: app/awards-information/page.tsx (route `/awards-information`)

| Method | Path | Code | Owner F### | Handler | Middleware |
|--------|------|------|------------|---------|------------|
| GET | /awards-information | ROUTE008 | F004 | `app/awards-information/page.tsx:7` AwardsInformationPage | proxy (updateSession; khách không bị chuyển hướng) |
| POST | /awards-information [Next-Action: setLocale] | ROUTE009 | F001, F002, F004 | `lib/i18n/actions.ts:8` setLocale (Server Action, gọi từ bộ chọn ngôn ngữ: `app/awards-information/_components/awards-information-content.tsx:34`) | proxy (updateSession) |

### File: app/auth/callback/route.ts (route `/auth/callback`)

| Method | Path | Code | Owner F### | Handler | Middleware |
|--------|------|------|------------|---------|------------|
| GET | /auth/callback | ROUTE007 | F001 | `app/auth/callback/route.ts:24` GET (Route Handler; luôn trả 302 về `/` hoặc `/login?error=cancelled\|failed`) | — (ngoài matcher của proxy) |

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

> Ghi chú: cả ba trang bọc trong `RootLayout` (`app/layout.tsx:21`) — layout không phải route riêng nên không có hàng. `/`, `/login` và `/awards-information` là các endpoint `GET` đã tính ở ROUTE001, ROUTE004 và ROUTE008; bảng này chỉ liệt kê thành phần trang tương ứng.

## Summary

| Category | Count |
|----------|-------|
| Backend Routes | 9 |
| Frontend Pages | 3 |
| Total | 12 |

> Ghi chú: Total = tổng hai danh mục theo mẫu; 3 trang frontend trùng với ROUTE001, ROUTE004 và ROUTE008, nên số endpoint HTTP phân biệt (method + path) là 9.
