---
status: draft
fcode: F002
authored_by: takumi
created: 2026-10-08
lang: vi
---

# SCR003 — Screen Spec

**Screen**: SCR003: Homepage SAA
**Feature**: F002_HomepageSaa
**Type**: composite
**Route**: /
**Generated**: 2026-10-08

## 1. Overview

**Purpose:** Người xem (khách hoặc người đã đăng nhập) mở màn hình này để biết SAA 2025 "ROOT FURTHER" khi nào và ở đâu, xem các hạng mục giải thưởng, rồi đi tiếp tới các trang liên quan.
**Actors:** Khách chưa đăng nhập, Người dùng đã đăng nhập
**Entry Conditions:** Không cần đăng nhập. Người xem mở địa chỉ gốc của ứng dụng, hoặc quay về từ các trang khác bằng logo hay "About SAA 2025", hoặc vừa đăng nhập Google thành công (đích sau đăng nhập đổi sang màn hình này).
**Exit Conditions:** Người xem chuyển sang một trang khác (Awards Information, Sun* Kudos, Tiêu chuẩn chung, hoặc trang do vùng tài khoản dẫn tới), hoặc rời ứng dụng.

## 2. Screen Layout

### Layout Sketch

Trang cuộn dọc gồm sáu vùng nối tiếp: header cố định ở đầu cửa sổ (logo bên trái, ba liên kết, bên phải là bộ chọn ngôn ngữ và vùng tài khoản), hero có ảnh nền với tiêu đề, đồng hồ đếm ngược, thông tin sự kiện và hai nút kêu gọi, phần Root Further, mục giải thưởng dạng lưới thẻ, khối Sun* Kudos, và footer. Nút widget là vùng riêng cố định ở góc phải phía dưới, nổi trên mọi vùng khác.

```
┌────────────────────────────────────────────────────────────┐
│ R1: Header (fixed-top)                                     │
│ [Logo]  About SAA 2025  Awards Information  Sun* Kudos     │
│                         [chuông][🇻🇳 VN ▾][tài khoản]       │
├────────────────────────────────────────────────────────────┤
│ R2: Hero (ảnh nền + lớp phủ tối)                           │
│   ROOT FURTHER                                             │
│   Coming soon        [DAYS] [HOURS] [MINUTES]              │
│   Thời gian · Địa điểm · Tường thuật                       │
│   [ABOUT AWARDS]  [ABOUT KUDOS]                            │
├────────────────────────────────────────────────────────────┤
│ R3: Root Further (chữ nền, đoạn mô tả, câu trích)          │
├────────────────────────────────────────────────────────────┤
│ R4: Mục giải thưởng — tiêu đề + lưới 3 cột x 2 hàng        │
│   [Top Talent] [Top Project] [Top Project Leader]          │
│   [Best Manager] [Signature 2025 - Creator] [MVP]          │
├────────────────────────────────────────────────────────────┤
│ R5: Sun* Kudos (nhãn, tiêu đề, mô tả, ảnh, [Chi tiết])     │
├────────────────────────────────────────────────────────────┤
│ R6: Footer: [Logo] liên kết x4        Bản quyền            │
└────────────────────────────────────────────────────────────┘
                                         ┌──────────────────┐
                                         │ R7: Widget (nổi, │
                                         │ fixed bottom-right)│
                                         └──────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components |
|-----------|------|----------|------------|----------------|
| R1 | Header | fixed-top | no | TBD (draft) |
| R2 | Hero | static | no | TBD (draft) |
| R3 | Root Further | static | no | TBD (draft) |
| R4 | Mục giải thưởng | static | no | TBD (draft) |
| R5 | Sun* Kudos | static | no | TBD (draft) |
| R6 | Footer | static | no | TBD (draft) |
| R7 | Nút widget | fixed-bottom-right | no | TBD (draft) |

## 3. UI Elements

| ID | Element | Type | Required | Default | Visibility | Action | Source | Format | Empty Behavior | Cross-ref |
|----|---------|------|----------|---------|------------|--------|--------|--------|-----------------|-----------|
| E01 | Logo Sun* Annual Awards (header, có chữ thay thế) | image | — | — | Always | Về trang chủ, cuộn lên đầu | static | 64x60 | — | N/A |
| E02 | Liên kết "About SAA 2025" (đang chọn: chữ vàng, gạch chân) | link | — | Selected | Always | Cuộn lên đầu trang | static | theo ngôn ngữ đang chọn | — | N/A |
| E03 | Liên kết "Awards Information" | link | — | Normal | Always | Điều hướng — xem § 8 | static | theo ngôn ngữ đang chọn | — | N/A |
| E04 | Liên kết "Sun* Kudos" | link | — | Normal | Always | Điều hướng — xem § 8 | static | theo ngôn ngữ đang chọn | — | N/A |
| E05 | Bộ chọn ngôn ngữ (cờ, mã ngắn, mũi tên xuống) | select | no | VN | Always | Mở danh sách ngôn ngữ | computed | mã ngắn (VN, EN) | — | binding: ngôn ngữ đã lưu |
| E06 | Danh sách ngôn ngữ (VN, EN) | list | — | — | Conditional | Chọn ngôn ngữ | static | cờ + mã ngắn | — | N/A |
| E07 | Vùng tài khoản (chỗ giữ cố định; nội dung do feature Menu tài khoản cung cấp: khách thấy nút "Đăng nhập" / "Login" tới `/login` và không có chuông; người đã đăng nhập thấy chuông và nút tài khoản) | region label | — | Skeleton | Always | — | computed | — | skeleton giữ chỗ | N/A |
| E08 | Ảnh nền hero (key visual + lớp phủ tối) | image | — | — | Always | — | static | cover | — | N/A |
| E09 | Tiêu đề "ROOT FURTHER" | display field | — | — | Always | — | static | raw | — | N/A |
| E10 | Nhãn "Coming soon" | display field | — | Ẩn | Conditional | — | computed | theo ngôn ngữ đang chọn | hidden | N/A |
| E11 | Ba ô đếm ngược DAYS / HOURS / MINUTES (mỗi ô hai chữ số + nhãn đơn vị) | display field | — | `--` | Always | — | computed | 2 chữ số, thêm số 0 đứng trước (ô ngày có thể 3 chữ số) | `--` trước khi tính, `00` khi hết hạn | binding: mốc đếm ngược |
| E12 | Thông tin sự kiện: "Thời gian: 26/12/2025", "Địa điểm: Âu Cơ Art Center", "Tường thuật trực tiếp qua sóng Livestream" | display field | — | — | Always | — | static | nhãn theo ngôn ngữ, giá trị giữ nguyên | — | N/A |
| E13 | Nút "ABOUT AWARDS" (nền vàng) | button | — | Enabled | Always | Điều hướng — xem § 8 | static | — | — | N/A |
| E14 | Nút "ABOUT KUDOS" (viền) | button | — | Enabled | Always | Điều hướng — xem § 8 | static | — | — | N/A |
| E15 | Nội dung Root Further (chữ nền "ROOT FURTHER", các đoạn mô tả, câu trích "A tree with deep roots fears no storm") | display field | — | — | Always | — | static | tiếng Việt, nhiều đoạn | — | N/A |
| E16 | Tiêu đề mục giải thưởng ("Sun* annual awards 2025", "Hệ thống giải thưởng"; không có dòng mô tả phụ — đã chốt 2026-10-08, theo thiết kế Figma) | display field | — | — | Always | — | static | theo ngôn ngữ đang chọn | — | N/A |
| E17 | Thẻ giải thưởng, lặp cho từng hạng mục (ảnh vuông, tiêu đề, mô tả, liên kết "Chi tiết") | list | — | — | Conditional | Điều hướng kèm neo — xem § 8; hover nâng thẻ | API field | tiêu đề theo ngôn ngữ, mô tả tối đa 2 dòng + dấu ba chấm | thông báo rỗng (E18) | TBD (draft) |
| E18 | Thông báo của mục giải thưởng khi rỗng hoặc lỗi ("Thông tin giải thưởng sẽ sớm được cập nhật." / EN "Award information will be updated soon."; tiêu đề E16 vẫn hiện) | message | — | — | Conditional | — | computed | theo ngôn ngữ đang chọn | hidden | N/A |
| E19 | Khối Sun* Kudos (nhãn "Phong trào ghi nhận", tiêu đề "Sun* Kudos", mô tả, ảnh minh họa) | display field | — | — | Always | — | static | mô tả tiếng Việt | — | N/A |
| E20 | Nút "Chi tiết" của Sun* Kudos | button | — | Enabled | Always | Điều hướng — xem § 8 | static | theo ngôn ngữ đang chọn | — | N/A |
| E21 | Nút widget (viên thuốc vàng: bút chì, "/", biểu tượng SAA; có nhãn truy cập) | button | — | Enabled | Always | — | static | 105x64 | — | N/A |
| E22 | Logo footer | image | — | — | Always | Về trang chủ, cuộn lên đầu | static | 69x64 | — | N/A |
| E23 | Bốn liên kết footer: About SAA 2025, Awards Information, Sun* Kudos, Tiêu chuẩn chung | link | — | Normal | Always | "About SAA 2025" cuộn lên đầu; ba liên kết còn lại — xem § 8 | static | theo ngôn ngữ đang chọn | — | N/A |
| E24 | Dòng bản quyền "Bản quyền thuộc về Sun* © 2025" | display field | — | — | Always | — | static | theo ngôn ngữ đang chọn | — | N/A |

## 4. User Actions

> **Scope:** within-screen interactions only. Cross-screen navigation belongs in `## 8. Navigation`.

### Available Actions

| Action | Element | Trigger | Condition | Result on this screen | Source |
|--------|---------|---------|-----------|------------------------|--------|
| Mở danh sách ngôn ngữ | E05 | click, Enter hoặc Space | — | E06 hiện ra; bộ chọn sáng lên khi rê chuột | TBD (draft) |
| Đóng danh sách ngôn ngữ | E05, E06 | click lại E05, click ra ngoài, hoặc Esc | danh sách đang mở | E06 đóng | TBD (draft) |
| Chọn ngôn ngữ | E06 | click | danh sách đang mở | chữ giao diện đổi sang ngôn ngữ đã chọn, E06 đóng, lựa chọn được nhớ; E15, E17 (mô tả), E19 giữ tiếng Việt | TBD (draft) |
| Cuộn lên đầu trang | E01, E02, E22, E23 (About SAA 2025) | click | đang ở trang chủ | trang cuộn lên đầu, địa chỉ không đổi | TBD (draft) |
| Làm nổi liên kết hoặc nút | E03, E04, E13, E14, E20 | hover hoặc focus | — | nền sáng lên (liên kết) hoặc đổi kiểu (nút); E13 và E14 đổi giống nhau | TBD (draft) |
| Làm nổi thẻ giải thưởng | E17 | hover | — | thẻ nâng nhẹ, viền và ánh sáng nổi bật hơn | TBD (draft) |

### Happy Path

1. Người xem thấy R1 với logo bên trái, ba liên kết (About SAA 2025 đang chọn) và bộ chọn "VN" bên phải; R2 với "ROOT FURTHER", đồng hồ đếm ngược, thông tin sự kiện và hai nút.
2. Đồng hồ hiện số ngày, giờ, phút còn lại; mỗi phút các số tự cập nhật, người xem không phải tải lại.
3. Người xem cuộn xuống đọc R3, rồi tới R4 xem sáu thẻ giải thưởng; rê chuột vào thẻ thì thẻ nâng nhẹ.
4. Người xem cuộn tiếp tới R5 (Sun* Kudos) và R6 (footer); nút widget ở R7 luôn ở góc phải phía dưới.
5. Khi cần, người xem bấm logo hoặc "About SAA 2025" để cuộn lên đầu, hoặc chọn EN ở bộ chọn để đổi chữ giao diện.

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|----------------|-----------|------------------------|--------|
| Bước 2 | mốc đếm ngược chưa tới | E11 hiện thời gian còn lại, E10 hiện | TBD (draft) |
| Bước 2 | đã tới hoặc qua mốc, hoặc cấu hình mốc thiếu/sai | E11 hiện `00 00 00`, E10 ẩn | TBD (draft) |
| Bước 3 | không có hạng mục hoặc không đọc được dữ liệu | E17 được thay bằng E18 | TBD (draft) |
| Bước 5 | ngôn ngữ đã lưu không phải VN hoặc EN | hiện tiếng Việt, bộ chọn ghi "VN" | TBD (draft) |
| Bước 5 | bấm "About SAA 2025" khi đã ở đầu trang | không có thay đổi nhìn thấy | TBD (draft) |

### Interaction Notes

- **Số phút đổi đúng lúc một phút trôi qua; quay lại tab nền thì số đúng ngay** — source: TBD (draft)
- **Bấm nút widget hiện chưa có phản hồi vì chưa có menu** — source: TBD (draft)
- **Bấm liên kết tới trang chưa xây thì thấy trang không tìm thấy của trình duyệt** — source: TBD (draft)

## 5. UI States

> **Required rows:** loading + ≥1 error (per async call) + ≥1 empty (per data-displaying region) + saving/submitting + success/redirect.

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| loading (đồng hồ) | trang vừa tải, chưa tính xong | ba ô hiện `--`, E10 ẩn | none | TBD (draft) |
| loading (mục giải thưởng) | dữ liệu giải thưởng đang đọc | lưới skeleton thay cho thẻ | none | TBD (draft) |
| loading (vùng tài khoản) | đang xác định trạng thái đăng nhập | skeleton cùng kích thước, chưa hiện nút "Đăng nhập", header không dịch chuyển | none | TBD (draft) |
| empty | dữ liệu giải thưởng không có hạng mục | E16 giữ nguyên; E18 "Thông tin giải thưởng sẽ sớm được cập nhật." thay cho lưới | none | TBD (draft) |
| error | không đọc được dữ liệu giải thưởng | E16 giữ nguyên; E18 cùng thông báo như khi rỗng ("Thông tin giải thưởng sẽ sớm được cập nhật.") thay cho lưới; các vùng khác bình thường; lỗi chỉ ghi ở máy chủ | tải lại trang | TBD (draft) |
| countdown-running | mốc hợp lệ, chưa tới | E11 hiện số còn lại, E10 hiện | none | TBD (draft) |
| countdown-ended | đã tới hoặc qua mốc, hoặc mốc thiếu/sai | E11 hiện `00 00 00`, E10 ẩn | none | TBD (draft) |
| saving | chọn ngôn ngữ, đang áp dụng | E06 đóng, giao diện chuẩn bị làm mới | none | TBD (draft) |
| success | đổi ngôn ngữ xong | chữ giao diện đổi sang ngôn ngữ mới | mở lại danh sách | TBD (draft) |

## 6. Validation & Feedback

| Element | Rule | Feedback | Trigger |
|---------|------|----------|---------|
| E11 | Mốc đếm ngược thiếu hoặc sai định dạng | hiện `00 00 00` và ẩn E10; không có thông báo lỗi cho người xem | server response |
| E18 | Không đọc được dữ liệu giải thưởng | "Thông tin giải thưởng sẽ sớm được cập nhật." (EN: "Award information will be updated soon."), cùng thông báo với trường hợp rỗng | server response |
| E18 | Không có hạng mục giải thưởng nào | "Thông tin giải thưởng sẽ sớm được cập nhật." (EN: "Award information will be updated soon.") | server response |

## 7. Conditional UI

| Condition | Type | Element(s) | Visible when | Hidden when | Notes |
|-----------|------|------------|--------------|-------------|-------|
| Nhãn "Coming soon" chỉ hiện khi sự kiện chưa bắt đầu | configuration | E10 | mốc đếm ngược hợp lệ và chưa tới | đã tới hoặc qua mốc, mốc thiếu/sai, hoặc trước khi tính xong | mốc lấy từ cấu hình môi trường |
| Vùng tài khoản hiển thị theo trạng thái đăng nhập | auth | E07 | luôn có chỗ (kể cả lúc đang đọc phiên); khách: nút "Đăng nhập" / "Login", không chuông; đã đăng nhập: chuông và nút tài khoản; nội dung do feature Menu tài khoản quyết định | — | khách hay đã đăng nhập đều thấy nội dung chung còn lại |
| Lưới thẻ giải thưởng chỉ hiện khi có dữ liệu | configuration | E17, E18 | E17: có ≥ 1 hạng mục; E18: rỗng hoặc lỗi | E17: rỗng hoặc lỗi; E18: có hạng mục | dữ liệu từ bảng giải thưởng |
| Số cột lưới theo kích thước màn hình | responsive | E17 | 3 cột ở máy tính | 2 cột ở máy tính bảng và điện thoại | ID-15, ID-16 thắng mô tả 1 cột ở khổ nhỏ |
| Danh sách ngôn ngữ chỉ hiện khi bộ chọn đang mở | configuration | E06 | người xem bấm E05 | bấm lại, bấm ngoài, Esc, hoặc đã chọn | trạng thái do người xem điều khiển |

## 8. Navigation

> **D3 — the DRY statement that MUST appear verbatim in the template and the contract:**
>
> `## 8. Navigation` is the **per-screen projection** of `screen-flow.md § Screen Access Paths`.
> It is not a second source of truth. Every row here MUST be derivable from a path in
> `screen-flow.md`; every path in `screen-flow.md` touching this SCR### MUST appear here.
> Two-way consistency is a reviewer rule (`screen.nav_flow_skew`), not a Python check.
> `## 4. User Actions § Happy Path` narrative keeps its v27 scope rule unchanged: **prose still
> must not narrate cross-screen navigation**; only the § Exits *table* may name destinations.

`screen-flow.md` chưa có; các đích của màn hình khác đều ghi `TBD (draft)` tới khi được phản ánh ở đó. Điều hướng của vùng tài khoản (nút "Đăng nhập" của khách, Hồ sơ, Trang quản trị, Đăng xuất) thuộc feature Menu tài khoản, không liệt kê ở đây.

### Entry Points

| From | Trigger there | Condition | Source |
|------|----------------|-----------|--------|
| external | mở địa chỉ gốc của ứng dụng | — | TBD (draft) |
| SCR001_Login | đăng nhập Google thành công (cập nhật F001: đích đổi từ `/todo` sang `/`) | có phiên hợp lệ | TBD (draft) |
| SCR001_Login | mở màn hình Login khi đã đăng nhập (cập nhật F001) | có phiên hợp lệ | TBD (draft) |
| TBD (draft): các trang Awards Information, Sun* Kudos, Tiêu chuẩn chung | logo hoặc "About SAA 2025" | trang đó đã được xây | TBD (draft) |

### Exits

| Action | Element | Condition | Destination | Result | Source |
|--------|---------|-----------|-------------|--------|--------|
| Mở trang giải thưởng | E03, E13, E23 (Awards Information) | — | TBD (draft): màn hình Awards Information (route dự kiến `/awards-information`, chưa xây) | redirect | TBD (draft) |
| Mở hạng mục giải thưởng | E17 (ảnh, tiêu đề, "Chi tiết") | — | TBD (draft): màn hình Awards Information kèm neo là mã định danh hạng mục | redirect; thiếu mã thì không kèm neo | TBD (draft) |
| Mở trang Sun* Kudos | E04, E14, E20, E23 (Sun* Kudos) | — | TBD (draft): màn hình Sun* Kudos (route dự kiến `/sun-kudos`, chưa xây) | redirect | TBD (draft) |
| Mở trang Tiêu chuẩn chung | E23 | — | TBD (draft): màn hình Tiêu chuẩn chung (route dự kiến `/standards`, chưa xây) | redirect | TBD (draft) |
| Về đầu trang | E01, E02, E22, E23 (About SAA 2025) | đang ở trang chủ | (stays on screen) | cuộn lên đầu | TBD (draft) |

## 9. Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | [EXPECTED] | logo có chữ thay thế; nút chỉ có biểu tượng (chuông, tài khoản, widget) có nhãn truy cập; bộ chọn ngôn ngữ khai báo đang mở/đóng; liên kết đang chọn đánh dấu trang hiện tại |
| Keyboard navigation | [EXPECTED] | Tab đi theo thứ tự header, hero, nội dung, footer; Enter hoặc Space mở danh sách ngôn ngữ, Esc đóng; thẻ giải thưởng và nút có viền focus rõ |
| Focus management | [EXPECTED] | đóng danh sách ngôn ngữ thì focus về nút bộ chọn; header cố định không che phần tử đang focus |
| Screen reader compatibility | [EXPECTED] | có vùng header, main, footer; đồng hồ đọc được dạng "còn N ngày, N giờ, N phút" và không đọc lại mỗi phút |
| Error announcement | [EXPECTED] | thông báo rỗng/lỗi của mục giải thưởng được đọc ra khi xuất hiện (tiêu đề mục vẫn là tiêu đề đọc được) |

## 10. Responsive Behavior

| Breakpoint | Region / Element | Behavior | Source |
|------------|-------------------|----------|--------|
| desktop | R4 / E17 | lưới 3 cột | TBD (draft) |
| tablet | R4 / E17 | lưới 2 cột | TBD (draft) |
| mobile | R4 / E17 | lưới 2 cột | TBD (draft) |
| tablet, mobile | R2 / E12 | các dòng thông tin sự kiện xuống hàng để không tràn | TBD (draft) |
| tablet, mobile | R2, R3, R5 | các phần co lại hoặc xếp chồng để giữ chữ đọc được | TBD (draft) |
| tablet, mobile | R1 | header giữ cố định ở đầu cửa sổ | TBD (draft) |
