---
status: removed
removed: 2026-10-08
removed_by: F001 update, plan 261008-1014-homepage-saa (route /todo deleted)
fcode: F001
authored_by: takumi
created: 2026-10-07
lang: vi
---

# SCR002 — Screen Spec

**Screen**: SCR002: Todo
**Feature**: login-with-google
**Type**: atomic
**Route**: /todo
**Generated**: 2026-10-07

## 1. Overview

**Purpose:** Người dùng đã đăng nhập vào trang chính tối thiểu này để thấy mình đang dùng tài khoản nào và để đăng xuất; đây là điểm đến sau khi đăng nhập Google thành công.
**Actors:** Người dùng đã đăng nhập
**Entry Conditions:** Có phiên đăng nhập hợp lệ; người dùng vừa đăng nhập Google thành công, hoặc mở màn hình Login khi đã đăng nhập.
**Exit Conditions:** Người dùng bấm Đăng xuất và quay về màn hình Login; hoặc phiên không còn hợp lệ nên bị đưa về màn hình Login.

## 2. Screen Layout

### Layout Sketch

Trang đơn giản chỉ có một vùng nội dung: email của người đang đăng nhập và nút Đăng xuất bên dưới. Header, footer và bố cục chi tiết chưa được thiết kế.

```
┌──────────────────────────────────────────────┐
│ R1: Nội dung chính (static)                  │
│   {email người dùng}                         │
│   [ Đăng xuất ]                              │
└──────────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components |
|-----------|------|----------|------------|----------------|
| R1 | Nội dung chính | static | no | TBD (draft) |

## 3. UI Elements

| ID | Element | Type | Required | Default | Visibility | Action | Source | Format | Empty Behavior | Cross-ref |
|----|---------|------|----------|---------|------------|--------|--------|--------|-----------------|-----------|
| E01 | Email người dùng | display field | — | — | Always | — | API field | raw | hidden | N/A |
| E02 | Nút Đăng xuất | button | — | Enabled | Always | Đăng xuất | static | — | — | N/A |

## 4. User Actions

> **Scope:** within-screen interactions only. Cross-screen navigation belongs in `## 8. Navigation`.

### Available Actions

| Action | Element | Trigger | Condition | Result on this screen | Source |
|--------|---------|---------|-----------|------------------------|--------|
| Đăng xuất | E02 | click | — | yêu cầu đăng xuất được gửi đi; phiên kết thúc | TBD (draft) |

### Happy Path

1. Người dùng thấy email của mình (E01) và nút Đăng xuất (E02) trong R1.
2. Người dùng bấm Đăng xuất.
3. Yêu cầu đăng xuất được gửi đi và phiên kết thúc; kết quả hiển thị tiếp theo thuộc `## 8. Navigation`.

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|----------------|-----------|------------------------|--------|
| Mở màn hình | phiên không hợp lệ hoặc đã hết hạn | không hiện E01 và E02; người dùng bị đưa đi nơi khác | TBD (draft) |

## 5. UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| loading | kiểm tra phiên khi mở màn hình | chưa hiện nội dung cho tới khi biết người dùng là ai | none | TBD (draft) |
| empty | — | không áp dụng: màn hình không hiển thị danh sách dữ liệu | — | TBD (draft) |
| error | phiên không hợp lệ hoặc hết hạn | không hiện nội dung, chuyển về màn hình Login | none | TBD (draft) |
| saving | bấm Đăng xuất, đang gửi yêu cầu | [EXPECTED] nút Đăng xuất bị vô hiệu cho tới khi chuyển trang | none | TBD (draft) |
| success | đăng xuất xong | rời màn hình này (xem `## 8. Navigation`) | none | TBD (draft) |

## 6. Validation & Feedback

N/A — màn hình không có ô nhập liệu và không có luật kiểm tra hay thông báo gửi lên.

## 7. Conditional UI

N/A — no conditional UI detected.

## 8. Navigation

> `## 8. Navigation` là hình chiếu theo từng màn hình của `screen-flow.md § Screen Access Paths`; không phải nguồn sự thật thứ hai. `screen-flow.md` chưa tồn tại, nên các hàng dưới đây lấy từ `clarifications.md` và phải được đối chiếu khi promote.

### Entry Points

| From | Trigger there | Condition | Source |
|------|----------------|-----------|--------|
| SCR001 | đăng nhập Google thành công | có phiên vừa lập | TBD (draft) |
| SCR001 | mở màn hình Login khi đã đăng nhập | có phiên hợp lệ | TBD (draft) |
| external | mở địa chỉ trang chính trực tiếp | có phiên hợp lệ | TBD (draft) |

### Exits

| Action | Element | Condition | Destination | Result | Source |
|--------|---------|-----------|-------------|--------|--------|
| Đăng xuất | E02 | — | SCR001 | redirect | TBD (draft) |
| Mở màn hình khi chưa đăng nhập | — | không có phiên hợp lệ | SCR001 | redirect | TBD (draft) |

## 9. Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | [EXPECTED] | nút Đăng xuất có tên truy cập rõ ràng: "Đăng xuất" (vi) / "Log out" (en) theo D002 |
| Keyboard navigation | [EXPECTED] | nút Đăng xuất tới được bằng Tab và kích hoạt bằng Enter hoặc Space |
| Focus management | [EXPECTED] | không có hộp thoại hay vùng cần giữ focus |
| Screen reader compatibility | [EXPECTED] | email được đọc như văn bản thường trong vùng nội dung chính |
| Error announcement | [EXPECTED] | không có thông báo lỗi trên màn hình này |

## 10. Responsive Behavior

N/A — no responsive behavior found in source.
