# Screen Flow

**Project**: my-app (SAA 2025 — Sun* Annual Awards 2025)
**Generated**: 2026-10-08
**Analysis Scope**: Điều hướng giữa `/login` (SCR001_Login) và `/` (SCR003_Homepage), đường quay về OAuth `/auth/callback`, chuyển hướng của `proxy.ts`, Server Action `signInWithGoogle` / `signOut` / `setLocale`. SCR002_Todo đã gỡ (2026-10-08), không có cạnh điều hướng.

**Code Format**: All SCR codes MUST follow `SCR###_NameSlug` format (e.g., SCR001_LoginForm, SCR002_Dashboard) | `SCR###/REG###` for region-scoped transitions

## Navigation Map

```mermaid
graph TD
    A["Truy cập trực tiếp / liên kết ngoài"] -->|"GET /"| H["SCR003_Homepage"]
    A -->|"GET /login"| L["SCR001_Login"]
    L -->|"proxy 307 nếu đã có phiên"| H
    H -->|"nút Login của khách (REG001_AccountRegion)"| L
    H -->|"Đăng xuất (REG001_AccountRegion) signOut"| L
    L -->|"bấm nút Google: signInWithGoogle"| G["Google OAuth + Supabase Auth (ngoài app)"]
    G -->|"redirect kèm code hoặc error"| C["/auth/callback (route handler, không có view)"]
    C -->|"302 / khi đổi code thành công"| H
    C -->|"302 /login?error=cancelled hoặc failed"| L
    H -.->|"liên kết, chưa có page"| U["/awards-information, /sun-kudos, /standards, /profile, /admin"]
```

> Ghi chú: các đích `/awards-information`, `/sun-kudos`, `/standards`, `/profile`, `/admin` được liên kết trong giao diện nhưng không có page trong code, nên không phải SCR. SCR002_Todo (đã gỡ) không xuất hiện trên bản đồ.

## Feature Entry Points

<!-- Feature Entry Points: run /tkm:rebuild-spec --feature-specs to populate -->

---

## Screen Access Paths

| From Screen | To Screen | Action/Trigger | Conditions | Region |
|-------------|-----------|----------------|------------|--------|
| START (truy cập trực tiếp / liên kết ngoài) | SCR003_Homepage | Tải trang `GET /` (ROUTE001) | Không cần phiên; khách không bị chuyển hướng (`lib/supabase/proxy-session.ts:99-104`) | |
| START (truy cập trực tiếp / liên kết ngoài) | SCR001_Login | Tải trang `GET /login` (ROUTE004) | Khách: hiển thị màn hình đăng nhập | |
| START (truy cập trực tiếp / liên kết ngoài) | SCR003_Homepage | `GET /login` bị `proxy` chuyển 307 về `/` | Phiên hợp lệ (`getClaims` có claims); chỉ GET/HEAD (`proxy-session.ts:99-102`) | |
| SCR003_Homepage | SCR001_Login | Bấm nút "Login" (`GuestLoginLink`, `app/_components/site/account-slot-parts.tsx:14-22`) | Khách (không có người dùng, `account-region.tsx:53`) | SCR003_Homepage/REG001_AccountRegion |
| SCR003_Homepage | SCR001_Login | Chọn "Đăng xuất" trong menu tài khoản → `signOut` (ROUTE002) rồi `redirect("/login")` (`lib/auth/actions.ts:19-33`) | Đã đăng nhập; luôn về `/login` kể cả khi revoke lỗi | SCR003_Homepage/REG001_AccountRegion |
| SCR001_Login | Google OAuth (ngoài app) | Bấm nút Google → `signInWithGoogle` (ROUTE005) → `redirect(authorizeUrl)` (`app/login/actions.ts:60`) | Dựng được origin từ header và `signInWithOAuth` không lỗi; nếu không, ở lại SCR001 với lỗi inline | |
| Google OAuth (ngoài app) | SCR003_Homepage | Supabase redirect về `/auth/callback?code=…` (ROUTE007) → đổi code lấy phiên → 302 `/` (`app/auth/callback/route.ts:24-30,47-48`) | Có `code`, không có `error`, `exchangeCodeForSession` thành công | |
| Google OAuth (ngoài app) | SCR001_Login | `/auth/callback?error=access_denied` hoặc không có `code` → 302 `/login?error=cancelled` (`route.ts:36-41`) | Người dùng huỷ ở Google | |
| Google OAuth (ngoài app) | SCR001_Login | `/auth/callback` lỗi khác hoặc đổi code lỗi/ném lỗi → 302 `/login?error=failed` (`route.ts:37,50-59`) | Lỗi nhà cung cấp, Supabase không tới được, thiếu biến môi trường | |
| SCR001_Login | SCR001_Login | Chọn ngôn ngữ → `setLocale` (ROUTE006) ghi cookie `NEXT_LOCALE`, giao diện làm mới tại chỗ | Giá trị phải thuộc danh sách cho phép (`lib/i18n/actions.ts:10`) | |
| SCR003_Homepage | SCR003_Homepage | Chọn ngôn ngữ → `setLocale` (ROUTE003); hoặc bấm logo / "About SAA 2025" → cuộn lên đầu (`same-page-scroll-top.tsx:17-31`) | Bấm chuột trái thường, không phím bổ trợ | |
| SCR003_Homepage | (chưa có page) `/awards-information#<slug>` | Bấm thẻ giải thưởng hoặc "Details" | Có dữ liệu giải thưởng; đích chưa xây | SCR003_Homepage/REG002_AwardsGrid |
| SCR003_Homepage | (chưa có page) `/awards-information`, `/sun-kudos`, `/standards` | Bấm liên kết ở header, hero, khối Kudos, footer | Đích chưa xây, không có SCR | |
| SCR003_Homepage | (chưa có page) `/profile` | Chọn "Profile" trong menu tài khoản | Đã đăng nhập; đích chưa xây | SCR003_Homepage/REG001_AccountRegion |
| SCR003_Homepage | (chưa có page) `/admin` | Chọn "Admin" trong menu tài khoản | Chỉ khi `profiles.role = 'admin'` (`account-region.tsx:71`); đích chưa xây, hiện mục chỉ là giao diện, trang `/admin` khi xây phải tự kiểm tra lại vai trò ở server | SCR003_Homepage/REG001_AccountRegion |

> Region column: fill with `SCR###/REG###` for region-scoped transitions; leave blank for whole-screen transitions.

## Screen Transitions

### SCR001_Login (Login)

**Entry Points**:
- Truy cập trực tiếp `/login` hoặc liên kết ngoài (khách)
- Từ SCR003_Homepage: nút "Login" của khách (REG001_AccountRegion)
- Từ SCR003_Homepage: Đăng xuất (`signOut` luôn `redirect("/login")`)
- Từ `/auth/callback`: 302 `/login?error=cancelled` hoặc `/login?error=failed`

**Exit Points**:
- Sang Google OAuth: bấm nút Google (`signInWithGoogle`, ROUTE005)
- Sang SCR003_Homepage: đăng nhập thành công (qua `/auth/callback`), hoặc `proxy` chuyển 307 khi đã có phiên

**Decision Points**:
- Mở `/login`: nếu phiên hợp lệ và method là GET/HEAD → 307 `/` (SCR003_Homepage), nếu không → hiển thị SCR001_Login
- `?error`: nếu giá trị là `cancelled` hoặc `failed` → hiện thông báo lỗi inline, giá trị khác → bỏ qua (không phản chiếu nội dung query ra trang, `app/login/page.tsx:9-11,29-30`)
- `signInWithGoogle`: nếu có origin hợp lệ và Supabase trả `data.url` → redirect sang Google, nếu không → `{ error: "failed" }`, nút bật lại và hiện lỗi

---

### SCR002_Todo (Todo)

> Đã gỡ (removed 2026-10-08). Không có Entry Points, Exit Points hay Decision Points; mục này chỉ giữ để mọi mã SCR đều có chỗ trong luồng. Đích sau đăng nhập hiện là SCR003_Homepage.

---

### SCR003_Homepage (Homepage)

**Entry Points**:
- Truy cập trực tiếp `/` hoặc liên kết ngoài (công khai)
- Từ SCR001_Login: đăng nhập thành công qua `/auth/callback` (302 `/`)
- Từ SCR001_Login: `proxy` chuyển 307 khi người đã đăng nhập mở `/login`

**Exit Points**:
- Sang SCR001_Login: nút "Login" của khách (REG001_AccountRegion); Đăng xuất (REG001_AccountRegion)
- Sang các đích chưa có page: `/awards-information`, `/sun-kudos`, `/standards`, `/profile`, `/admin` (không thuộc SCR nào)

**Decision Points**:
- Vùng tài khoản (REG001_AccountRegion): không có người dùng → nút "Login"; có người dùng → menu tài khoản; role đọc đúng bằng `"admin"` → thêm mục Admin (`account-region.tsx:53-72`)
- Chuông thông báo (REG001_AccountRegion): chỉ hiện khi đã đăng nhập (`account-region.tsx:44-47`)
- Lưới giải thưởng (REG002_AwardsGrid): có dữ liệu → hiện thẻ; rỗng hoặc truy vấn lỗi → hiện thông báo rỗng (`awards-grid.tsx:21-23`)
- Đồng hồ đếm ngược: `SAA_COUNTDOWN_TARGET` hợp lệ → đếm tiếp; thiếu hoặc sai định dạng → hiển thị mốc 00 và ẩn "Coming soon" (`lib/countdown/parse-countdown-target.ts:26-41`)

---

## Region Transitions

> Region transitions are typically client-state (no URL change); document only transitions that change user-visible state within the region or cross region boundary.

| From Region | To Target | Action/Trigger | Client-State Only |
|-------------|-----------|----------------|-------------------|
| SCR003_Homepage/REG001_AccountRegion (AccountRegion) | SCR001_Login (toàn màn hình) | Bấm nút "Login" khi là khách | No (URL đổi sang `/login`) |
| SCR003_Homepage/REG001_AccountRegion (AccountRegion) | SCR001_Login (toàn màn hình) | Đăng xuất: `signOut` rồi `redirect("/login")` | No (Server Action + URL đổi) |
| SCR003_Homepage/REG001_AccountRegion (AccountRegion) | Menu tài khoản mở/đóng | Bấm nút tài khoản; đóng bằng Esc, bấm ra ngoài, hoặc rời focus (`lib/ui/use-menu-disclosure.ts`) | Yes |
| SCR003_Homepage/REG001_AccountRegion (AccountRegion) | (chưa có page) `/profile`, `/admin` | Chọn mục Profile / Admin | No (URL đổi, đích chưa xây) |
| SCR003_Homepage/REG002_AwardsGrid (AwardsGrid) | (chưa có page) `/awards-information#<slug>` | Bấm thẻ hoặc "Details" của giải thưởng | No (URL đổi, đích chưa xây) |
| SCR003_Homepage/REG002_AwardsGrid (AwardsGrid) | REG002_AwardsGrid chính nó | `Suspense` chuyển từ khung chờ sang lưới thật hoặc thông báo rỗng | Yes |

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as Nguoi dung
    participant P as proxy.ts
    participant L as SCR001_Login
    participant A as signInWithGoogle
    participant G as Google va Supabase Auth
    participant C as auth callback
    participant H as SCR003_Homepage
    U->>P: GET /login
    P-->>L: khach, cho di tiep
    P-->>H: da co phien, 307 ve /
    U->>L: bam nut Google
    L->>A: Server Action
    A->>G: signInWithOAuth, tao cookie PKCE
    G-->>U: redirect sang Google
    U->>G: dang nhap hoac huy
    G-->>C: GET auth callback voi code hoac error
    C->>G: exchangeCodeForSession
    C-->>H: 302 / khi thanh cong
    C-->>L: 302 /login error cancelled hoac failed
    U->>H: Dang xuat trong menu tai khoan
    H->>L: signOut roi redirect /login
```

| Screen | Authentication Required | Authorization Level |
|--------|------------------------|-------------------|
| SCR001_Login | Không (người đã đăng nhập bị chuyển 307 về `/`) | Public (khách) |
| SCR003_Homepage | Không | Public; vùng REG001_AccountRegion đổi theo phiên: khách → "Login", user → menu Profile, admin → thêm mục Admin (chỉ là giao diện) |

> Ghi chú: không có route nào bị chặn đối với khách; `proxy.ts` chỉ chuyển hướng `GET|HEAD /login` khi đã có phiên (xem GUARD-001). Quyền chi tiết nằm ở `permissions.md`.

---

## Error Handling Flows

| Screen | Error | Handling | Scope |
|--------|-------|----------|-------|
| SCR001_Login | `signInWithGoogle` lỗi (thiếu origin, `signInWithOAuth` lỗi hoặc ném lỗi) | Trả `{ error: "failed" }`, nút bật lại, hiện thông báo lỗi inline (`app/login/actions.ts:34-57`, `google-button.tsx:50-57`) | screen |
| SCR001_Login | Người dùng huỷ ở Google (`access_denied`, hoặc callback không có `code`) | Callback 302 `/login?error=cancelled`, trang hiện thông báo lỗi (`route.ts:36-41`) | screen |
| SCR001_Login | Lỗi nhà cung cấp hoặc đổi code lỗi / ném lỗi | Callback 302 `/login?error=failed`, trang hiện thông báo lỗi; không bao giờ trả 500 (`route.ts:50-59`) | screen |
| SCR001_Login | `?error` có giá trị lạ | Bỏ qua, không hiện lỗi và không phản chiếu query (`page.tsx:9-11`) | screen |
| SCR001_Login | Chuyển ngôn ngữ thất bại | Giữ ngôn ngữ hiện tại, chỉ ghi log (`language-selector.tsx:52-57`) | screen |
| SCR003_Homepage | Đọc phiên lỗi (claims lỗi / ném lỗi) | Coi là khách, hiện nút "Login", ghi log (`lib/supabase/current-user.ts:39-41,53-56`) | region:REG001_AccountRegion |
| SCR003_Homepage | Tra cứu `profiles.role` lỗi / không có dòng / giá trị lạ | Quy về `"user"`, không hiện mục Admin (`current-user.ts:68-82`) | region:REG001_AccountRegion |
| SCR003_Homepage | Truy vấn `awards` lỗi hoặc dòng sai kiểu | Trả danh sách rỗng và hiện thông báo rỗng; dòng sai kiểu bị bỏ và ghi log (`lib/awards/get-awards.ts:28-43`) | region:REG002_AwardsGrid |
| SCR003_Homepage | `SAA_COUNTDOWN_TARGET` thiếu hoặc sai định dạng | Đếm ngược hiển thị 00, ẩn "Coming soon", ghi log một lần (`parse-countdown-target.ts:26-41`) | screen |
| SCR001_Login, SCR003_Homepage | `proxy` kiểm tra phiên lỗi (thiếu biến môi trường Supabase, mạng lỗi) | Coi là khách, request đi tiếp, ghi log (`lib/supabase/proxy-session.ts:83-96`) | screen |

> Scope values: `screen` (affects entire screen) | `region:REG###` (error contained within the named region).

---

## Circular Dependencies Check

- [x] Không có vòng chuyển hướng tự động vô hạn: khách ở `/` không bị chuyển; `/login` chỉ chuyển về `/` khi đã có phiên; `signOut` luôn kết thúc ở `/login` và khách ở `/login` không bị chuyển tiếp
- [x] All screens have valid entry/exit points (SCR002_Todo đã gỡ, không tính)
- [x] All navigation paths terminate

> Ghi chú: SCR001_Login và SCR003_Homepage tạo một vòng điều hướng do người dùng chủ động (đăng nhập → trang chủ → đăng xuất → đăng nhập); mỗi bước đều cần một hành động hoặc đổi trạng thái phiên, không phải phụ thuộc vòng.

---

## Guard Logic

Route guards intercept navigation to enforce conditions beyond authentication — loading required data, checking permissions, or applying business rules. Document each guard found on any route.

### GUARD-001 — LoggedInRedirect on /login
**trigger:** `middleware` (Next.js 16 `proxy.ts`, trước khi route khớp `config.matcher = ["/", "/login"]` render)
**source:** `proxy.ts:9` → `lib/supabase/proxy-session.ts:99-105`
**logic:**
```pseudo
refresh Supabase session cookies (getClaims)
if (method is not GET and not HEAD) → continue
if (hasVerifiedClaims and path == /login) → redirect 307 /
else → continue (guest on / and /login is never redirected)
```
**failure path:** lỗi `getClaims` hoặc ném lỗi (kể cả thiếu biến môi trường) → coi là khách, request đi tiếp, không có 500; không có route nào bị chặn đối với khách

---

## Deep-Link State Restoration

Document screens where URL parameters or path segments reconstruct non-trivial UI state on direct visit (bookmarked URL, shared link, browser refresh). This is distinct from simple routing — it means the app reads URL params and rehydrates view state from them.

### SCR001_Login
**URL pattern:** `/login?error={cancelled|failed}`
**State restored:**

| Param | Restores | Default if missing |
|-------|----------|--------------------|
| error | Thông báo lỗi đăng nhập inline (`showInitialError` → `useActionState` khởi tạo `{ error: "failed" }`, `app/login/page.tsx:29-30`, `google-button.tsx:19-21`) | Không hiện lỗi |

**Failure mode:** giá trị `error` ngoài `cancelled` / `failed` bị bỏ qua, không hiện lỗi và không phản chiếu nội dung query ra trang

---

## Unsaved-Changes Protection

Document screens and forms that warn the user before discarding unsaved input — via browser `beforeunload`, route-leave guards, or modal close intercepts.

N/A — no unsaved-changes guards detected.

---

## Extraction Signatures

Framework-agnostic identifier patterns for locating the above constructs.

### Guard Logic
Function/method definitions tied to a route: `beforeEnter|canActivate|middleware|loader|before_action|authenticate|authorize` — check if called from a router config or route registration.

### Deep-Link State Restoration
URL param reads at component mount synced to state: `useSearchParams|useQuery|router\.query|URLSearchParams|params\[|$route\.query` — look for these at top of component with corresponding `setState` or reactive assignment.

### Unsaved-Changes Protection
`beforeunload|onbeforeunload|usePrompt|useBeforeUnload|leaveGuard|isDirty|formState\.isDirty|data-turbo-confirm` — presence confirms protection; absence is a potential gap to flag.
