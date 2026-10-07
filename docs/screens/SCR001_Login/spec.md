---
status: draft
fcode: F001
authored_by: takumi
created: 2026-10-07
lang: vi
---

# SCR001 — Screen Spec

**Screen**: SCR001: Login
**Feature**: login-with-google
**Type**: atomic
**Route**: /login
**Generated**: 2026-10-07

## 1. Overview

**Purpose:** Khách chưa đăng nhập vào màn hình này để đăng nhập ứng dụng SAA 2025 bằng tài khoản Google và chọn ngôn ngữ hiển thị (VN hoặc EN).
**Actors:** Khách chưa đăng nhập
**Entry Conditions:** Chưa có phiên đăng nhập hợp lệ; người dùng mở ứng dụng, được chuyển từ màn hình Todo khi chưa đăng nhập, hoặc quay về sau khi đăng nhập Google bị hủy hay thất bại.
**Exit Conditions:** Trình duyệt chuyển sang Google để xác thực; hoặc người dùng đã có phiên và được đưa sang màn hình Todo.

## 2. Screen Layout

### Layout Sketch

Ba vùng: header cố định ở đầu cửa sổ (logo bên trái, bộ chọn ngôn ngữ bên phải), vùng hero chiếm khoảng giữa header và footer với ảnh sóng màu làm nền và khối giới thiệu cùng nút đăng nhập ở phía trái, footer cố định ở cuối cửa sổ. Cả ba giữ bố trí ở mọi kích thước cửa sổ.

```
┌──────────────────────────────────────────────┐
│ R1: Header (fixed-top)                       │
│ [Logo]                           [🇻🇳 VN ▾] │
├──────────────────────────────────────────────┤
│ R2: Hero (nền key visual sóng màu)           │
│  ROOT FURTHER                                │
│  Bắt đầu hành trình của bạn cùng SAA 2025.   │
│  Đăng nhập để khám phá!                      │
│  [ G  LOGIN With Google ]                    │
│  Đăng nhập không thành công... (khi có lỗi)  │
├──────────────────────────────────────────────┤
│ R3: Footer (fixed-bottom)                    │
│        Bản quyền thuộc về Sun* © 2025        │
└──────────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components |
|-----------|------|----------|------------|----------------|
| R1 | Header | fixed-top | no | TBD (draft) |
| R2 | Hero | static | TBD (draft) | TBD (draft) |
| R3 | Footer | fixed-bottom | no | TBD (draft) |

## 3. UI Elements

| ID | Element | Type | Required | Default | Visibility | Action | Source | Format | Empty Behavior | Cross-ref |
|----|---------|------|----------|---------|------------|--------|--------|--------|-----------------|-----------|
| E01 | Logo Sun* Annual Awards 2025 | image | — | — | Always | — | static | — | — | N/A |
| E02 | Bộ chọn ngôn ngữ (cờ Việt Nam, "VN", mũi tên xuống) | select | no | VN | Always | Mở danh sách ngôn ngữ | computed | mã ngắn (VN, EN) | — | binding: ngôn ngữ đã lưu |
| E03 | Danh sách ngôn ngữ (VN, EN) | list | — | — | Conditional | Chọn ngôn ngữ | static | cờ + mã ngắn | — | N/A |
| E04 | Ảnh nền hero (key visual sóng màu) | image | — | — | Always | — | static | — | — | N/A |
| E05 | Tiêu đề "ROOT FURTHER" | display field | — | — | Always | — | static | raw | — | N/A |
| E06 | Mô tả "Bắt đầu hành trình của bạn cùng SAA 2025." | display field | — | — | Always | — | static | theo ngôn ngữ đang chọn | — | N/A |
| E07 | Mô tả "Đăng nhập để khám phá!" | display field | — | — | Always | — | static | theo ngôn ngữ đang chọn | — | N/A |
| E08 | Nút "LOGIN With Google" (biểu tượng Google + chữ đậm) | button | — | Enabled | Always | Bắt đầu đăng nhập Google | static | — | — | N/A |
| E09 | Biểu tượng đang tải trong nút | image | — | — | Conditional | — | computed | — | hidden | N/A |
| E10 | Thông báo lỗi đăng nhập | message | — | — | Conditional | — | route param | theo ngôn ngữ đang chọn | hidden | N/A |
| E11 | Chữ footer "Bản quyền thuộc về Sun* © 2025" | display field | — | — | Always | — | static | theo ngôn ngữ đang chọn | — | N/A |

## 4. User Actions

> **Scope:** within-screen interactions only. Cross-screen navigation belongs in `## 8. Navigation`.

### Available Actions

| Action | Element | Trigger | Condition | Result on this screen | Source |
|--------|---------|---------|-----------|------------------------|--------|
| Mở danh sách ngôn ngữ | E02 | click | — | E03 hiện ra; bộ chọn sáng lên và con trỏ thành bàn tay khi rê chuột | TBD (draft) |
| Chọn ngôn ngữ | E03 | click | danh sách đang mở | chữ trên toàn màn hình đổi sang ngôn ngữ đã chọn, E03 đóng, lựa chọn được nhớ | TBD (draft) |
| Bắt đầu đăng nhập Google | E08 | click | nút không đang chờ | E08 bị vô hiệu và hiện E09; E10 (nếu đang hiện) biến mất | TBD (draft) |

### Happy Path

1. Người dùng thấy R1 với logo bên trái và "VN" bên phải, R2 với tiêu đề, hai dòng mô tả và nút "LOGIN With Google", R3 với chữ bản quyền.
2. Người dùng bấm "LOGIN With Google" trong R2.
3. Nút bị vô hiệu và hiện biểu tượng đang tải; màn hình giữ nguyên cho tới khi trình duyệt rời trang để sang bước xác thực của Google.

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|----------------|-----------|------------------------|--------|
| Bước 2 | người dùng bấm nút khi nút đang chờ | không có gì xảy ra vì nút đã bị vô hiệu | TBD (draft) |
| Mở màn hình | địa chỉ có mã lỗi hợp lệ (hủy hoặc thất bại) | E10 hiện ngay dưới nút, nút dùng lại được | TBD (draft) |
| Mở màn hình | địa chỉ có mã lỗi lạ | bỏ qua, không hiện E10 | TBD (draft) |
| Bước 1 | ngôn ngữ đã lưu không phải VN hoặc EN | hiện tiếng Việt, bộ chọn ghi "VN" | TBD (draft) |

## 5. UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| idle | mở màn hình lần đầu | nút Enabled, E10 ẩn, bộ chọn ghi "VN" | bấm nút, mở danh sách ngôn ngữ | TBD (draft) |
| loading | bấm nút Google, đang chờ | E08 bị vô hiệu và đánh dấu đang bận, E09 hiện | none | TBD (draft) |
| empty | — | không áp dụng: màn hình không hiển thị danh sách hay dữ liệu động | — | TBD (draft) |
| error | hủy, thất bại, hoặc không khởi động được đăng nhập | E10 hiện dưới nút, E08 Enabled lại | bấm nút thử lại | TBD (draft) |
| saving | chọn ngôn ngữ | E03 đóng, chữ trên màn hình đổi sang ngôn ngữ mới | none | TBD (draft) |
| success | xác thực Google thành công | rời màn hình này (xem `## 8. Navigation`) | none | TBD (draft) |
| restored | người dùng bấm Quay lại từ trang Google, trình duyệt khôi phục màn hình ở trạng thái đang chờ | trang được tải lại, về trạng thái idle | bấm nút | TBD (draft) |

## 6. Validation & Feedback

| Element | Rule | Feedback | Trigger |
|---------|------|----------|---------|
| E10 | Hủy hoặc thất bại xác thực Google | "Đăng nhập không thành công. Vui lòng thử lại." (EN: "Login failed. Please try again.") | server response |
| E10 | Không khởi động được đăng nhập khi bấm nút | cùng thông báo trên | server response |
| E10 | Bấm nút lần nữa | thông báo biến mất lúc bắt đầu lần thử mới | submit |

## 7. Conditional UI

| Condition | Type | Element(s) | Visible when | Hidden when | Notes |
|-----------|------|------------|--------------|-------------|-------|
| Danh sách ngôn ngữ mở sau khi bấm bộ chọn | ui-state | E03 | người dùng vừa bấm E02 | mặc định, và sau khi chọn một mục | trạng thái giao diện tạm thời, không phải cấu hình |
| Biểu tượng tải hiện khi đang chờ xác thực | ui-state | E09 | nút Google đang chờ | mặc định và khi quay lại trạng thái idle | đi cùng E08 bị vô hiệu |
| Thông báo lỗi hiện khi địa chỉ mang mã lỗi hợp lệ | ui-state | E10 | địa chỉ có mã hủy hoặc thất bại | không có mã lỗi, mã lạ, hoặc đã bắt đầu lần thử mới | thông báo theo ngôn ngữ đang chọn |

## 8. Navigation

> `## 8. Navigation` là hình chiếu theo từng màn hình của `screen-flow.md § Screen Access Paths`; không phải nguồn sự thật thứ hai. `screen-flow.md` chưa tồn tại, nên các hàng dưới đây lấy từ `clarifications.md` và phải được đối chiếu khi promote.

### Entry Points

| From | Trigger there | Condition | Source |
|------|----------------|-----------|--------|
| external | mở ứng dụng hoặc địa chỉ đăng nhập trực tiếp | chưa có phiên | TBD (draft) |
| SCR002 | bấm Đăng xuất | phiên bị hủy | TBD (draft) |
| SCR002 | mở trang khi chưa có phiên hoặc phiên hết hạn | không có phiên hợp lệ | TBD (draft) |
| external (Google) | quay về sau khi hủy hoặc thất bại | kèm mã lỗi `cancelled` hoặc `failed` | TBD (draft) |

### Exits

| Action | Element | Condition | Destination | Result | Source |
|--------|---------|-----------|-------------|--------|--------|
| Bắt đầu đăng nhập Google | E08 | khởi động thành công | external (Google) | redirect cùng tab | TBD (draft) |
| Hoàn tất đăng nhập | E08 | Google xác thực thành công | SCR002 | redirect | TBD (draft) |
| Mở màn hình khi đã đăng nhập | — | có phiên hợp lệ | SCR002 | redirect | TBD (draft) |
| Chọn ngôn ngữ | E03 | — | (stays on screen) | làm mới giao diện | TBD (draft) |

## 9. Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | [EXPECTED] | nút Google có tên truy cập "LOGIN With Google"; khi chờ thì đánh dấu đang bận (`aria-busy="true"`); logo có văn bản thay thế "Sun* Annual Awards 2025" |
| Keyboard navigation | [EXPECTED] | Tab đi từ bộ chọn ngôn ngữ tới nút Google; Enter hoặc Space mở danh sách và kích hoạt nút |
| Focus management | [EXPECTED] | đóng danh sách ngôn ngữ thì trả focus về bộ chọn |
| Screen reader compatibility | [EXPECTED] | vùng header, nội dung chính và footer dùng landmark tương ứng |
| Error announcement | [EXPECTED] | thông báo lỗi E10 dùng `role="alert"` để được đọc ngay khi xuất hiện |

## 10. Responsive Behavior

| Breakpoint | Region / Element | Behavior | Source |
|------------|-------------------|----------|--------|
| mọi kích thước cửa sổ | R1 (E01, E02) | logo giữ bên trái, bộ chọn ngôn ngữ giữ bên phải | TBD (draft) |
| mọi kích thước cửa sổ | R3 (E11) | footer cố định ở cuối cửa sổ, luôn thấy khi cuộn | TBD (draft) |
