---
status: implemented
fcode: F005
authored_by: takumi
created: 2026-10-09
lang: vi
---

# SCR005 — Screen Spec

**Screen**: SCR005: Countdown Prelaunch (Đếm ngược prelaunch)
**Feature**: F005_CountdownPrelaunch
**Type**: atomic
**Route**: /countdown
**Generated**: 2026-10-09

## 1. Overview

**Purpose:** Người xem (khách, người dùng thường, hoặc admin khi chưa đi đâu khác) gặp màn hình này khi site chưa mở, để biết còn bao nhiêu ngày, giờ, phút nữa tới giờ mở.
**Actors:** Khách chưa đăng nhập, Người dùng thường đã đăng nhập, Admin
**Entry Conditions:** Site đang khoá (mốc mở site còn ở tương lai). Người xem vào thẳng địa chỉ này, hoặc mở bất kỳ địa chỉ nào khác của site mà không phải admin và bị đưa về đây. Không cần đăng nhập.
**Exit Conditions:** Đồng hồ chạm 00 00 00 và trình duyệt tự sang trang chủ; hoặc người xem tự rời đi (đóng tab, mở trang đăng nhập bằng địa chỉ trực tiếp).

## 2. Screen Layout

### Layout Sketch

Một màn hình cố định, không cuộn: nền toàn màn hình (ảnh họa tiết nhiều màu trên nền tối, phủ lớp tối bán trong suốt để chữ trắng đủ tương phản), ở giữa là tiêu đề căn giữa và hàng ba khối số ngày, giờ, phút, mỗi khối gồm hai ô chữ số kiểu LED và nhãn chữ hoa trắng bên dưới. Không có header, footer, bộ chọn ngôn ngữ, nút hay liên kết nào. Đúng một `<h1>` (tiêu đề) trong một `<main>` (`app/_components/countdown-prelaunch/countdown-prelaunch-view.tsx:21,41-43`). Mỗi ô LED là một ký tự của giá trị (hai ô cho 00–99, thêm ô khi ngày trên 99; trước khi sẵn sàng là `--`, tức hai ô), chữ `font-mono` thay phông "Digital Numbers" của thiết kế (`app/_components/countdown-prelaunch/countdown-prelaunch-unit.tsx:8-9,22`). Ảnh nền là `public/countdown/bg-image.png`.

```
┌──────────────────────────────────────────────────────────────┐
│ R1: Nền toàn màn hình + lớp phủ tối (static, phủ cả cửa sổ)  │
│                                                              │
│              R2: Nội dung đếm ngược (căn giữa)               │
│              Sự kiện sẽ bắt đầu sau                          │
│                                                              │
│              ┌──┬──┐   ┌──┬──┐   ┌──┬──┐                     │
│              │0 │1 │   │0 │2 │   │0 │3 │                     │
│              └──┴──┘   └──┴──┘   └──┴──┘                     │
│                DAYS      HOURS     MINUTES                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components |
|-----------|------|----------|------------|----------------|
| R1 | Nền và lớp phủ | static (phủ toàn cửa sổ, `cover`, không lặp) | no | `<Image>` nền (`app/_components/countdown-prelaunch/countdown-prelaunch-view.tsx:25-32`) và lớp phủ gradient tối (`:34-37`) |
| R2 | Nội dung đếm ngược | static (căn giữa) | no | tiêu đề `<h1>` (`app/_components/countdown-prelaunch/countdown-prelaunch-view.tsx:41-43`), ba `CountdownPrelaunchUnit` (`app/_components/countdown-prelaunch/countdown-prelaunch-unit.tsx:30-50`) |

## 3. UI Elements

| ID | Element | Type | Required | Default | Visibility | Action | Source | Format | Empty Behavior | Cross-ref |
|----|---------|------|----------|---------|------------|--------|--------|--------|-----------------|-----------|
| E01 | Ảnh nền kèm lớp phủ tối | image | — | Hiện | Always | — | static | cover, không lặp; tệp `public/countdown/bg-image.png`, `alt=""`, lớp phủ `aria-hidden` | — | `app/_components/countdown-prelaunch/countdown-prelaunch-view.tsx:25-37` |
| E02 | Tiêu đề "Sự kiện sẽ bắt đầu sau" / "Event starts in" | message | — | Theo ngôn ngữ đã lưu (mặc định VN) | Always | — | static | căn giữa, chữ trắng, đậm; `<h1>` duy nhất | — | `app/_components/countdown-prelaunch/countdown-prelaunch-view.tsx:41-43`; chữ: `lib/i18n/dictionary.ts:57-59,73-75` |
| E03 | Số ngày | display field | — | `--` trước khi sẵn sàng | Always | — | computed | ít nhất 2 chữ số, đệm 0; nhiều chữ số hơn khi trên 99 ngày; mỗi ký tự một ô LED; nhóm có `role="group"` và `aria-label="NN DAYS"` | `00` | `app/_components/countdown-prelaunch/countdown-prelaunch-unit.tsx:33-43` `lib/countdown/use-countdown.ts:21-27` |
| E04 | Nhãn DAYS | region label | — | DAYS | Always | — | static | chữ hoa, trắng; giống nhau ở VN và EN | — | N/A |
| E05 | Số giờ | display field | — | `--` trước khi sẵn sàng | Always | — | computed | 2 chữ số, 00–23; nhóm `aria-label="NN HOURS"` | `00` | `app/_components/countdown-prelaunch/countdown-prelaunch-unit.tsx:33-43` |
| E06 | Nhãn HOURS | region label | — | HOURS | Always | — | static | chữ hoa, trắng; giống nhau ở VN và EN | — | N/A |
| E07 | Số phút | display field | — | `--` trước khi sẵn sàng | Always | — | computed | 2 chữ số, 00–59; nhóm `aria-label="NN MINUTES"` | `00` | `app/_components/countdown-prelaunch/countdown-prelaunch-unit.tsx:33-43` |
| E08 | Nhãn MINUTES | region label | — | MINUTES | Always | — | static | chữ hoa, trắng; giống nhau ở VN và EN | — | N/A |

<!-- Mỗi số (E03, E05, E07) là một dãy ô LED, mỗi ô một ký tự; phông "Digital Numbers" của thiết kế không có trong kho nên dùng `font-mono` thay thế theo tiền lệ trang chủ (`app/_components/countdown-prelaunch/countdown-prelaunch-unit.tsx:22`). Nhãn DAYS/HOURS/MINUTES lấy từ `dictionary.home.countdown` (`lib/i18n/home-copy.ts:63,88`) nên giống nhau ở VN và EN; ghi một dòng cho mỗi nhóm số để giữ bảng dưới giới hạn 25 dòng. -->

## 4. User Actions

> **Scope:** within-screen interactions only. Cross-screen navigation belongs in `## 8. Navigation` (which projects `screen-flow.md § Screen Access Paths`). Reference region names from `### Layout Regions` (§2, above) when describing where actions occur.

### Available Actions

N/A — no elements carry a discrete user-triggered action.

### Happy Path

1. Người xem mở màn hình: thấy nền ở R1, tiêu đề ở R2 và ba khối còn hiện `--`.
2. Khi trang sẵn sàng, ba khối hiện số ngày, giờ, phút còn lại.
3. Đến mỗi lần đổi phút, số trong ba khối tự cập nhật; người xem không phải làm gì.
4. Khi cả ba khối hiện `00`, màn hình đã hoàn thành việc của nó (người xem tự được đưa đi, xem `## 8. Navigation`).

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|----------------|-----------|------------------------|--------|
| Bước 2 | mốc không dùng được hoặc đã qua khi trang sẵn sàng | ba khối hiện `00` ngay thay vì số còn lại | `lib/countdown/countdown-math.ts:15-18` `lib/countdown/use-prelaunch-countdown.ts:38-40` |
| Bước 3 | còn trên 99 ngày | khối ngày hiện đủ chữ số, nhiều hơn hai | `lib/countdown/countdown-math.ts:21-28` `app/_components/countdown-prelaunch/countdown-prelaunch-unit.tsx:40-42` |

### Interaction Notes

- **Quay lại tab sau khi để ở nền — số hiện ngay giá trị đúng, không chờ tới lần đổi phút kế** — source: `lib/countdown/use-countdown.ts:80-89`
- **Đồng hồ máy người xem nhanh hay chậm vẫn không làm số sai — số đếm theo giờ của máy chủ lúc trang được dựng, và trang chỉ tự sang trang chủ khi giờ máy chủ chạm mốc** — source: `lib/countdown/use-prelaunch-countdown.ts:32-37,58-61`

## 5. UI States

> **Required rows:** loading + ≥1 error (per async call) + ≥1 empty (per data-displaying region) + saving/submitting + success/redirect. Màn hình không gọi API từ trình duyệt và không có thao tác ghi nên không có hàng saving; việc đọc mốc diễn ra ở máy chủ trước khi trang hiện.

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| loading | trang chưa sẵn sàng ở trình duyệt | ba khối hiện `--`, nền và tiêu đề đã hiện | none | `lib/countdown/use-countdown.ts:21-27,53` |
| running | đã sẵn sàng, còn thời gian | số ngày, giờ, phút còn lại, cập nhật mỗi khi đổi phút | none | `lib/countdown/use-countdown.ts:54` |
| empty | không có mốc hợp lệ (thiếu, trống, hỏng) | ba khối hiện `00`; người xem được đưa sang trang chủ | none | `lib/countdown/use-prelaunch-countdown.ts:40-48` |
| error | không đọc được mốc | giống `empty`: `00` rồi sang trang chủ; không có thông báo lỗi nào cho người xem | none | `lib/prelaunch/read-prelaunch-ends-at.ts:32-66` |
| success | đồng hồ chạm 0 | ba khối hiện `00`; người xem được đưa sang trang chủ | none | `lib/countdown/use-prelaunch-countdown.ts:40-48` |

## 6. Validation & Feedback

N/A — no validation rules or submit-side error feedback detected. Màn hình không có ô nhập; mọi giá trị chỉ để đọc.

## 7. Conditional UI

N/A — no conditional UI detected.

## 8. Navigation

> **D3 — the DRY statement that MUST appear verbatim in the template and the contract:**
>
> `## 8. Navigation` is the **per-screen projection** of `screen-flow.md § Screen Access Paths`.
> It is not a second source of truth. Every row here MUST be derivable from a path in
> `screen-flow.md`; every path in `screen-flow.md` touching this SCR### MUST appear here.
> Two-way consistency is a reviewer rule (`screen.nav_flow_skew`), not a Python check.
> `## 4. User Actions § Happy Path` narrative keeps its v27 scope rule unchanged: **prose still
> must not narrate cross-screen navigation**; only the § Exits *table* may name destinations.

### Entry Points

| From | Trigger there | Condition | Source |
|------|----------------|-----------|--------|
| external | gõ hoặc theo một liên kết tới `/countdown` | site đang khoá | `app/countdown/page.tsx:8-14` `lib/prelaunch/prelaunch-gate-decision.ts:51-53` |
| bất kỳ trang nào của site | mở địa chỉ trang đó và bị đưa về đây | site đang khoá và người xem không phải admin | `lib/supabase/proxy-session.ts:157-159` |

### Exits

| Action | Element | Condition | Destination | Result | Source |
|--------|---------|-----------|-------------|--------|--------|
| Đồng hồ chạm 00 00 00 | E03, E05, E07 | người xem còn ở màn hình lúc tới mốc | SCR003_Homepage | redirect thay chỗ trong lịch sử (Back không quay lại) | `lib/countdown/use-prelaunch-countdown.ts:44-48` |
| Mở màn hình sau mốc | — | site đã mở hoặc mốc không dùng được | SCR003_Homepage | redirect (307 từ proxy) | `lib/prelaunch/prelaunch-gate-decision.ts:51-53` |

<!-- Hai đường ra tới SCR003_Homepage và hai đường vào đã được ghi trong screen-flow.md (D3: rà lại hai chiều khi đổi một trong hai). -->

## 9. Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | [EXPECTED] | mỗi khối là `role="group"` với `aria-label` "NN DAYS" / "NN HOURS" / "NN MINUTES" (`app/_components/countdown-prelaunch/countdown-prelaunch-unit.tsx:33-35`); các ô chữ số `aria-hidden` nên trình đọc màn hình đọc nhãn của nhóm; ảnh nền (`alt=""`) và lớp phủ (`aria-hidden`) chỉ để trang trí (`app/_components/countdown-prelaunch/countdown-prelaunch-view.tsx:27,35`) |
| Keyboard navigation | [EXPECTED] | không có phần tử nhận tiêu điểm vì màn hình không có điều khiển nào |
| Focus management | [EXPECTED] | không cần quản lý tiêu điểm; không có hộp thoại hay nội dung bật lên |
| Screen reader compatibility | [EXPECTED] | đúng một `<h1>` là tiêu đề của trang, nằm trong `<main>`; số đọc qua `aria-label` của nhóm, không có vùng `aria-live` nên không thông báo lại mỗi lần đổi phút |
| Error announcement | [EXPECTED] | không có thông báo lỗi nào cần đọc, vì mốc hỏng chỉ đưa người xem sang trang chủ |

## 10. Responsive Behavior

Ba cỡ theo ngưỡng mặc định của Tailwind (`md` 768 px, `lg` 1024 px); bố cục vẫn là một cột căn giữa, không cuộn.

| Breakpoint | Region / Element | Behavior | Source |
|------------|-------------------|----------|--------|
| mobile | R2 / E03-E08 | ô LED 36×56 px, chữ số 34 px, nhãn 16 px, tiêu đề 20 px; ba khối có thể xuống dòng | `app/_components/countdown-prelaunch/countdown-prelaunch-unit.tsx:13,22,45` `app/_components/countdown-prelaunch/countdown-prelaunch-view.tsx:41,45` |
| md (≥ 768 px) | R2 / E03-E08 | ô 56×90 px, chữ số 54 px, nhãn 28 px, tiêu đề 30 px | `app/_components/countdown-prelaunch/countdown-prelaunch-unit.tsx:13,22,45` `app/_components/countdown-prelaunch/countdown-prelaunch-view.tsx:41,45` |
| lg (≥ 1024 px) | R2 / E03-E08 | ô 77×123 px, chữ số 73,7 px, nhãn 36 px, tiêu đề 36 px; khối nội dung lệch lên (đệm dưới 185 px) theo vị trí trong thiết kế | `app/_components/countdown-prelaunch/countdown-prelaunch-unit.tsx:13,22,45` `app/_components/countdown-prelaunch/countdown-prelaunch-view.tsx:39,41,45` |
