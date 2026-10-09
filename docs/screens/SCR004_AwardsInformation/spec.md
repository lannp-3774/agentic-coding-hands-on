---
status: implemented
fcode: F004
authored_by: takumi
created: 2026-10-09
lang: vi
---

# SCR004 — Screen Spec

**Screen**: SCR004: Hệ thống giải (Awards Information)
**Feature**: F004_AwardsInformation
**Type**: composite
**Route**: /awards-information
**Generated**: 2026-10-09

## 1. Overview

**Purpose:** Người xem (khách hoặc người đã đăng nhập) mở màn hình này để đọc kỹ sáu giải thưởng của SAA 2025 — mô tả, số lượng, giá trị — và nhảy nhanh tới giải mình quan tâm bằng menu bên trái.
**Actors:** Khách chưa đăng nhập, Người dùng đã đăng nhập
**Entry Conditions:** Không cần đăng nhập. Người xem bấm liên kết "Awards Information" ở header hoặc footer, nút ABOUT AWARDS hoặc một thẻ giải thưởng ở trang chủ (thẻ mở thẳng tới giải đó), hoặc gõ địa chỉ trực tiếp, kèm hoặc không kèm neo của một giải.
**Exit Conditions:** Người xem chuyển sang trang khác (trang chủ, Sun* Kudos, Tiêu chuẩn chung, hoặc trang do vùng tài khoản dẫn tới), hoặc rời ứng dụng.

## 2. Screen Layout

### Layout Sketch

Trang cuộn dọc gồm bảy vùng: header cố định ở đầu cửa sổ (logo, ba liên kết trong đó "Awards Information" đang chọn, bộ chọn ngôn ngữ, vùng tài khoản); ảnh key visual với logo ROOT FURTHER; phần tiêu đề; vùng giải thưởng gồm menu sáu giải ở bên trái (cố định theo cuộn dưới header ở khổ máy tính, thành thanh tab cuộn ngang ở khổ nhỏ) và sáu khối giải xếp dọc ở bên phải, ảnh xen kẽ trái/phải; khối Sun* Kudos; footer. Ảnh của khối giải nằm trái ở khối 1, 3, 5 và phải ở khối 2, 4, 6.

```
┌──────────────────────────────────────────────────────────────┐
│ R1: Header (fixed-top)                                       │
│ [Logo]  About SAA 2025  [Awards Information]  Sun* Kudos     │
│                              [chuông][🇻🇳 VN ▾][tài khoản]     │
├──────────────────────────────────────────────────────────────┤
│ R2: Key visual (ảnh nền) + logo ROOT FURTHER                 │
├──────────────────────────────────────────────────────────────┤
│ R3: Sun* Annual Awards 2025                                  │
│     ─────────────────────────────                            │
│     Hệ thống giải thưởng SAA 2025                            │
├───────────────┬──────────────────────────────────────────────┤
│ R4: Menu      │ R5: Khối giải (lặp x6)                       │
│ (sticky)      │  [ảnh]  Tên giải · mô tả dài                 │
│ > Top Talent  │         Số lượng · Giá trị                   │
│   Top Project │  ────────────────────────────────            │
│   Top Project │  Tên giải · mô tả dài          [ảnh]         │
│   Leader …    │  Số lượng · Giá trị                          │
│   MVP         │  (xen kẽ ảnh trái/phải)                      │
├───────────────┴──────────────────────────────────────────────┤
│ R6: Sun* Kudos (nhãn, tiêu đề, mô tả, logo KUDOS, [Chi tiết])│
├──────────────────────────────────────────────────────────────┤
│ R7: Footer: [Logo] liên kết x4                  Bản quyền    │
└──────────────────────────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components |
|-----------|------|----------|------------|----------------|
| R1 | Header | fixed-top | no | SiteHeader (`app/_components/site/site-header.tsx:11-71`), LanguageSelector, AccountRegion |
| R2 | Key visual | static | no | AwardsInformationHero (`app/_components/awards-information/awards-information-hero.tsx:9-45`) |
| R3 | Tiêu đề trang | static | no | AwardsInformationTitle (`app/_components/awards-information/awards-information-title.tsx:3-22`) |
| R4 | Menu giải thưởng | sticky: cột dưới header (khổ máy tính, từ 1024px); thanh tab dính dưới header 64px (khổ nhỏ) | yes (ngang, chỉ ở khổ nhỏ) | AwardsNav (`app/_components/awards-nav-behaviour/awards-nav.tsx:19-32`), AwardsNavView (`app/_components/awards-information/awards-nav-view.tsx:15-47`) |
| R5 | Các khối giải | static | no | AwardBlock (`app/_components/awards-information/award-block.tsx:54-116`), AwardDetailsLayout (`app/_components/awards-information/award-details-layout.tsx:8-21`) |
| R6 | Sun* Kudos | static | no | KudosSection (`app/_components/home/kudos-section.tsx:6-55`) |
| R7 | Footer | static | no | SiteFooter (`app/_components/site/site-footer.tsx:15-68`) |

## 3. UI Elements

| ID | Element | Type | Required | Default | Visibility | Action | Source | Format | Empty Behavior | Cross-ref |
|----|---------|------|----------|---------|------------|--------|--------|--------|-----------------|-----------|
| E01 | Logo Sun* Annual Awards (header, có chữ thay thế) | image | — | — | Always | Về trang chủ | static | 52x48 | — | N/A |
| E02 | Liên kết "About SAA 2025" (kiểu thường, không đang chọn) | link | — | Normal | Always | Điều hướng — xem § 8 | static | theo ngôn ngữ đang chọn | — | N/A |
| E03 | Liên kết "Awards Information" (đang chọn: chữ vàng, gạch chân, ánh sáng nhẹ) | link | — | Selected | Always | — | static | theo ngôn ngữ đang chọn | — | N/A |
| E04 | Liên kết "Sun* Kudos" | link | — | Normal | Always | Điều hướng — xem § 8 | static | theo ngôn ngữ đang chọn | — | N/A |
| E05 | Bộ chọn ngôn ngữ (cờ, mã ngắn, mũi tên xuống; danh sách VN, EN khi mở) | select | no | VN | Always | Chọn ngôn ngữ | computed | mã ngắn (VN, EN) | — | binding: ngôn ngữ đã lưu |
| E06 | Vùng tài khoản (chỗ giữ cố định; nội dung do feature Menu tài khoản cung cấp: khách thấy nút "Đăng nhập", người đã đăng nhập thấy chuông và nút tài khoản) | region label | — | Skeleton | Always | — | computed | — | skeleton giữ chỗ | N/A |
| E07 | Ảnh key visual (trang trí, không có chữ thay thế) và logo ROOT FURTHER phía trên tiêu đề (logo mang chữ thay thế "Keyvisual Sun* Annual Award 2025"). Key visual hiện là ảnh trang chủ dùng lại (`/home/key-visual.png`) vì Figma chưa có tệp xuất riêng cho khung này | image | — | — | Always | — | static | cao 547px từ `md`, 360px dưới `md`; phủ kín, cắt giữa; lớp gradient tối phía dưới | — | N/A |
| E08 | Chữ nhỏ "Sun* Annual Awards 2025" và đường kẻ mảnh bên dưới | display field | — | — | Always | — | static | chữ trắng cỡ nhỏ; chữ hoa/thường chờ xác nhận (xem Open Decisions của feature) | — | N/A |
| E09 | Tiêu đề chính "Hệ thống giải thưởng SAA 2025" (chữ lớn màu vàng) | display field | — | — | Always | — | static | theo ngôn ngữ đang chọn | — | N/A |
| E10 | Menu giải thưởng (vùng điều hướng chứa sáu mục) | list | — | — | Conditional | Chọn mục — xem E11 | API field | theo thứ tự dữ liệu | thay bằng E19 | binding: `app/awards-information/_components/award-details-loader.tsx:28-35` |
| E11 | Mục menu, lặp sáu lần (biểu tượng + nhãn ngắn; đang chọn: chữ vàng, gạch chân, ánh sáng) | link | — | Mục đầu đang chọn | Conditional | Cuộn tới khối giải và đánh dấu đang chọn | API field | nhãn ngắn ("Signature 2025 Creator", "MVP"), không xuống dòng; mục đang chọn mang `aria-current="location"` | — | binding: `app/_components/awards-information/awards-nav-view.tsx:23-44` |
| E12 | Khối giải thưởng, lặp sáu lần (neo là mã định danh của giải; ảnh xen kẽ trái/phải ở khổ máy tính) | list | — | — | Conditional | — | API field | đường kẻ giữa các khối, không có sau khối cuối | thay bằng E19 | binding: `app/_components/awards-information/award-block.tsx:54-114` |
| E13 | Ảnh giải thưởng (vuông 336x336, viền vàng, bo góc) | image | — | — | Conditional | — | API field | 336x336 | logo SAA khi đường dẫn ảnh không dùng được | binding: `app/_components/awards-information/award-block.tsx:61-74`, `lib/awards/award-detail-mapping.ts:113` |
| E14 | Tên giải (kèm biểu tượng đứng trước) | display field | — | — | Conditional | — | API field | tên riêng, giống nhau ở VN và EN | — | binding: `app/_components/awards-information/award-block.tsx:80-85` |
| E15 | Mô tả dài của giải | display field | — | — | Conditional | — | API field | luôn tiếng Việt | — | binding: `app/_components/awards-information/award-block.tsx:86-89` |
| E16 | Số lượng giải thưởng (biểu tượng, nhãn "Số lượng giải thưởng", số, đơn vị) | display field | — | — | Conditional | — | API field | số ít nhất hai chữ số (01, 02, 03, 10); đơn vị "Cá nhân", "Tập thể" hoặc "Cá nhân hoặc tập thể" | — | binding: `app/_components/awards-information/award-block.tsx:93-106` |
| E17 | Giá trị giải thưởng, lặp theo từng mức (biểu tượng, nhãn "Giá trị giải thưởng", số tiền, ghi chú tuỳ chọn) | display field | — | — | Conditional | — | API field | "7.000.000 VNĐ", ngăn nhóm nghìn bằng dấu chấm; ghi chú như "cho mỗi giải thưởng" | ẩn dòng giá trị khi giải không có mức nào; ẩn ghi chú khi mức không có ghi chú | binding: `app/_components/awards-information/award-block.tsx:41-52` |
| E18 | Chữ "Hoặc" và đường kẻ giữa hai mức giá trị (chỉ Signature 2025 - Creator) | display field | — | — | Conditional | — | static | theo ngôn ngữ đang chọn | — | N/A |
| E19 | Thông báo "Thông tin giải thưởng sẽ sớm được cập nhật." (EN: "Award information will be updated soon.") thay cho menu và khối giải | message | — | Ẩn | Conditional | — | computed | theo ngôn ngữ đang chọn | hidden | N/A |
| E20 | Khối Sun* Kudos (nhãn "Phong trào ghi nhận", tiêu đề "Sun* Kudos", mô tả, logo KUDOS bên phải, ảnh nền) | display field | — | — | Always | — | static | mô tả tiếng Việt | — | N/A |
| E21 | Nút "Chi tiết" của Sun* Kudos (nền vàng, biểu tượng mũi tên lên) | button | — | Enabled | Always | Điều hướng — xem § 8 | static | theo ngôn ngữ đang chọn | — | N/A |
| E22 | Logo footer | image | — | — | Always | Về trang chủ | static | 69x64 | — | N/A |
| E23 | Bốn liên kết footer: About SAA 2025, Awards Information, Sun* Kudos, Tiêu chuẩn chung. "Awards Information" đang chọn theo kiểu riêng của footer (nền nhạt và ánh sáng, không gạch chân, góc vuông; `aria-current="page"`) | link | — | Normal; "Awards Information" Selected | Always | Điều hướng — xem § 8 | static | theo ngôn ngữ đang chọn | — | N/A |
| E24 | Dòng bản quyền "Bản quyền thuộc về Sun* © 2025" | display field | — | — | Always | — | static | theo ngôn ngữ đang chọn | — | N/A |

## 4. User Actions

> **Scope:** within-screen interactions only. Cross-screen navigation belongs in `## 8. Navigation` (which projects `screen-flow.md § Screen Access Paths` — see the D3 note below). Reference region names from `### Layout Regions` (§2, above) when describing where actions occur.

### Available Actions

| Action | Element | Trigger | Condition | Result on this screen | Source |
|--------|---------|---------|-----------|------------------------|--------|
| Bấm một mục menu | E11 | click, hoặc Enter khi đang lấy tiêu điểm | có dữ liệu giải | trang cuộn mượt tới khối giải tương ứng ở R5 (khối dừng dưới header cố định, không bị che); mục vừa bấm đang chọn, mục trước tắt; nếu thiết bị bật giảm chuyển động thì nhảy tức thì | `app/_components/awards-nav-behaviour/use-awards-nav-active-slug.ts:73-88` |
| Cuộn tay trang | E11, E12 | cuộn chuột, bàn phím hoặc chạm | có dữ liệu giải | mục đang chọn ở R4 đi theo khối giải đang ở trong tầm nhìn, luôn đúng một mục; cuộn hết trang thì mục cuối đang chọn | `app/_components/awards-nav-behaviour/use-awards-nav-active-slug.ts:103-122`, `lib/ui/section-scroll-spy.ts:18-26` |
| Làm nổi mục menu | E11 | hover hoặc focus | — | mục được làm nổi (nền sáng nhẹ) | `app/_components/awards-information/awards-nav-view.tsx:4-9` |
| Làm nổi liên kết hoặc nút | E02, E04, E21, E23 | hover hoặc focus | — | nền sáng lên (liên kết) hoặc nút nâng nhẹ và phát sáng (E21) | `app/_components/site/site-header.tsx:5-9`, `app/_components/site/site-footer.tsx:5-12` |
| Chọn ngôn ngữ | E05 | click, Enter hoặc Space để mở; click mục để chọn; Esc hoặc click ra ngoài để đóng | — | chữ giao diện đổi sang ngôn ngữ đã chọn và được nhớ; E14, E15, E20 (mô tả) giữ tiếng Việt | `app/awards-information/_components/awards-information-content.tsx:34`, `lib/i18n/actions.ts:8-17` |

### Happy Path

1. Người xem mở trang và thấy R1 với "Awards Information" đang chọn, R2, tiêu đề ở R3, menu sáu mục ở R4 (mục đầu "Top Talent" đang chọn) và khối giải đầu tiên ở R5.
2. Người xem bấm "Best Manager" ở R4 — trang cuộn mượt tới khối "Best Manager" ở R5, mục "Best Manager" sáng lên và "Top Talent" tắt.
3. Người xem cuộn tay lên xuống — mục đang chọn ở R4 đổi theo khối đang ở trong tầm nhìn.
4. Người xem đọc số lượng và giá trị; ở khối Signature thấy hai mức giá trị ngăn bằng chữ "Hoặc".
5. Người xem cuộn xuống R6 đọc khối Sun* Kudos.
6. Khi cần, người xem chọn EN ở bộ chọn ngôn ngữ để đổi chữ giao diện sang tiếng Anh.

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|----------------|-----------|------------------------|--------|
| Bước 1 | mở trang kèm neo là mã của một giải hợp lệ | trang ở đúng khối giải đó; mục tương ứng đang chọn thay cho "Top Talent" | `app/_components/awards-nav-behaviour/use-awards-nav-active-slug.ts:95-101` |
| Bước 1 | mở trang kèm neo không khớp giải nào | không có lỗi; trang ở đầu; "Top Talent" đang chọn | `lib/ui/section-scroll-spy.ts:34-44` |
| Bước 1 | dữ liệu giải rỗng hoặc không đọc được | E10 và E12 được thay bằng E19; E08, E09, E20 và footer vẫn hiện | `app/awards-information/_components/award-details-loader.tsx:17-26` |
| Bước 2 | thiết bị bật giảm chuyển động | trang nhảy tức thì tới khối, không cuộn mượt | `app/_components/awards-nav-behaviour/use-awards-nav-active-slug.ts:79` |
| Bước 3 | người xem vừa bấm menu, trang còn đang cuộn | mục vừa bấm giữ trạng thái đang chọn, các mục ở giữa không nhấp nháy | `app/_components/awards-nav-behaviour/use-awards-nav-active-slug.ts:8-34` |
| Bước 3 | cuộn tới cuối trang | mục cuối (MVP) đang chọn dù khối của nó chưa lên tới vị trí chuẩn | `lib/ui/section-scroll-spy.ts:20` |
| Bước 4 | giải không có mức giá trị, hoặc mức không có ghi chú | khối vẫn hiện; không có dòng giá trị, hoặc không có dòng ghi chú (Best Manager, MVP) | `app/_components/awards-information/award-block.tsx:21-24` |
| Bước 6 | ngôn ngữ đã lưu không phải VN hoặc EN | hiện tiếng Việt, bộ chọn ghi "VN" | `lib/i18n/get-locale.ts` |

### Interaction Notes

- **Mục đang chọn luôn là đúng một mục, kể cả khi đang cuộn do vừa bấm menu** — source: `app/_components/awards-nav-behaviour/use-awards-nav-active-slug.ts:57-59`
- **Bấm "Chi tiết" của Sun* Kudos khi trang Sun* Kudos chưa xây thì thấy trang không tìm thấy mặc định** — source: `app/_components/home/kudos-section.tsx:37`
- **Mở trang bằng neo của giải thì trang ở đúng giải đó ngay từ đầu** — source: `app/_components/awards-nav-behaviour/use-awards-nav-active-slug.ts:132-136`

## 5. UI States

> **Required rows:** loading + ≥1 error (per async call) + ≥1 empty (per data-displaying region) + saving/submitting + success/redirect. Write `N/A — no async ops` only if screen has zero API calls.

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| loading (vùng giải thưởng) | dữ liệu giải đang đọc | khung chờ không chữ thay cho R4 và R5; R1, R2, R3, R6, R7 hiện bình thường | none | `app/awards-information/_components/awards-information-content.tsx:41-43`, `app/_components/awards-information/award-details-states.tsx:11-27` |
| loading (vùng tài khoản) | đang xác định trạng thái đăng nhập | skeleton cùng kích thước, chưa hiện nút "Đăng nhập", header không dịch chuyển | none | `app/_components/header-behaviour/account-region.tsx:38-40` |
| empty | không có giải nào | E08, E09 giữ nguyên; E19 "Thông tin giải thưởng sẽ sớm được cập nhật." thay cho R4 và R5 | none | `app/awards-information/_components/award-details-loader.tsx:17-26` |
| error | không đọc được dữ liệu giải | cùng E19 như khi rỗng; các vùng khác bình thường; lỗi chỉ ghi ở máy chủ | tải lại trang | `lib/awards/get-award-details.ts:34-50` |
| nav-default | mở trang không neo hoặc neo lạ, chưa tương tác | E11 đầu tiên ("Top Talent") đang chọn | bấm mục menu | `app/_components/awards-nav-behaviour/use-awards-nav-active-slug.ts:57-59` |
| nav-active | bấm mục, cuộn tay hoặc mở bằng neo hợp lệ | đúng một E11 đang chọn (chữ vàng, gạch chân, ánh sáng); các mục khác kiểu thường | bấm mục khác | `app/_components/awards-information/awards-nav-view.tsx:23-44` |
| saving | chọn ngôn ngữ, đang áp dụng | danh sách ngôn ngữ đóng, giao diện chuẩn bị làm mới | none | `app/_components/site/language-selector.tsx:50-57` |
| success | đổi ngôn ngữ xong | chữ giao diện đổi sang ngôn ngữ mới | mở lại danh sách | `lib/i18n/actions.ts:8-17` |

## 6. Validation & Feedback

| Element | Rule | Feedback | Trigger |
|---------|------|----------|---------|
| E19 | Không có giải nào hoặc không đọc được dữ liệu giải | "Thông tin giải thưởng sẽ sớm được cập nhật." (EN: "Award information will be updated soon.") | server response |
| E11 | Neo trên địa chỉ phải là mã của một giải có thật | không có thông báo; neo lạ bị bỏ qua, trang ở đầu và mục đầu đang chọn | server response |
| E12 | Giải có dữ liệu hỏng (thiếu thông tin bắt buộc) bị bỏ | không có thông báo cho người xem; giải đó biến mất khỏi cả menu và danh sách khối | server response |

## 7. Conditional UI

| Condition | Type | Element(s) | Visible when | Hidden when | Notes |
|-----------|------|------------|--------------|-------------|-------|
| Menu và khối giải chỉ hiện khi có dữ liệu giải | configuration | E10, E11, E12, E13, E14, E15, E16, E17 | có ≥ 1 giải hợp lệ | không có giải hoặc không đọc được dữ liệu | thay bằng E19; dữ liệu từ hệ thống |
| Thông báo rỗng/lỗi | configuration | E19 | không có giải hoặc không đọc được | có ≥ 1 giải hợp lệ | cùng thông báo cho rỗng và lỗi |
| Liên kết của chính trang này ở trạng thái đang chọn | configuration | E03, E23 | luôn, trên màn hình này | — | "About SAA 2025" (E02) ở kiểu thường; ở footer "Awards Information" đang chọn theo kiểu riêng của footer (E23), khác kiểu gạch chân của header |
| Chữ "Hoặc" và đường kẻ giữa các mức giá trị | configuration | E18 | giải có từ hai mức giá trị trở lên (Signature 2025 - Creator) | giải có một mức hoặc không có mức | quyết định theo dữ liệu, không viết cứng theo tên giải |
| Dòng ghi chú dưới số tiền | configuration | E17 | mức có ghi chú | mức không có ghi chú (Best Manager, MVP) | theo dữ liệu |
| Vùng tài khoản hiển thị theo trạng thái đăng nhập | auth | E06 | luôn có chỗ; khách: nút "Đăng nhập", không chuông; đã đăng nhập: chuông và nút tài khoản; nội dung do feature Menu tài khoản quyết định | — | khách hay đã đăng nhập đều thấy nội dung chung còn lại |
| Hình thức của menu giải thưởng | responsive | E10, E11 | cố định theo cuộn bên trái ở khổ máy tính (từ 1024px, rộng 178px) | thành thanh tab cuộn ngang, dính dưới header 64px, nền tối mờ, ở khổ nhỏ | cùng sáu mục và cùng trạng thái đang chọn; mục đang chọn được cuộn vào tầm nhìn của thanh tab |
| Phía đặt ảnh của khối giải | responsive | E13 | ảnh trái ở khối 1, 3, 5 và phải ở khối 2, 4, 6 (khổ máy tính) | ảnh xếp trên nội dung ở khổ nhỏ | theo thứ tự khối |

## 8. Navigation

> **D3 — the DRY statement that MUST appear verbatim in the template and the contract:**
>
> `## 8. Navigation` is the **per-screen projection** of `screen-flow.md § Screen Access Paths`.
> It is not a second source of truth. Every row here MUST be derivable from a path in
> `screen-flow.md`; every path in `screen-flow.md` touching this SCR### MUST appear here.
> Two-way consistency is a reviewer rule (`screen.nav_flow_skew`), not a Python check.
> `## 4. User Actions § Happy Path` narrative keeps its v27 scope rule unchanged: **prose still
> must not narrate cross-screen navigation**; only the § Exits *table* may name destinations.

`screen-flow.md` đã có màn hình này (mục SCR004_AwardsInformation, Screen Access Paths); các đích chưa xây (`/sun-kudos`, `/standards`) không có mã SCR nên ghi theo route. Điều hướng của vùng tài khoản thuộc feature Menu tài khoản, không liệt kê ở đây.

### Entry Points

| From | Trigger there | Condition | Source |
|------|----------------|-----------|--------|
| SCR003_Homepage | bấm "Awards Information" ở header hoặc footer, hoặc nút "ABOUT AWARDS" ở hero | — | `app/_components/site/site-header.tsx:48-54`, `app/_components/site/site-footer.tsx:45-51` |
| SCR003_Homepage/REG002_AwardsGrid | bấm ảnh, tên hoặc "Chi tiết" của một thẻ giải thưởng (mở kèm neo của giải đó) | thẻ có mã định danh | `lib/awards/award-card-mapping.ts:60` |
| external | gõ địa chỉ trực tiếp, kèm hoặc không kèm neo của một giải | — | `app/awards-information/page.tsx:7-15` |

### Exits

| Action | Element | Condition | Destination | Result | Source |
|--------|---------|-----------|-------------|--------|--------|
| Về trang chủ | E01, E22 | — | SCR003_Homepage | redirect | `app/_components/site/site-header.tsx:26`, `app/_components/site/site-footer.tsx:24` |
| Mở "About SAA 2025" | E02, E23 | — | SCR003_Homepage | redirect | `app/_components/site/site-header.tsx:40-46`, `app/_components/site/site-footer.tsx:37-43` |
| Mở trang Sun* Kudos | E04, E21, E23 (Sun* Kudos) | — | (chưa có page) route `/sun-kudos`, trả 404 mặc định | redirect | `app/_components/home/kudos-section.tsx:37`, `app/_components/site/site-header.tsx:56` |
| Mở trang Tiêu chuẩn chung | E23 | — | (chưa có page) route `/standards`, trả 404 mặc định | redirect | `app/_components/site/site-footer.tsx:57` |
| Chuyển giữa các giải | E11 | có dữ liệu giải | (stays on screen) | cuộn tới khối giải | `app/_components/awards-nav-behaviour/use-awards-nav-active-slug.ts:73-88` |

## 9. Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | [EXPECTED] | liên kết "Awards Information" ở header đánh dấu là trang hiện tại; menu giải thưởng là vùng điều hướng có nhãn, mục đang chọn được đánh dấu cho trình đọc màn hình; mỗi khối giải là `<section>` chứa tiêu đề cấp 2 là tên giải; ảnh key visual có chữ thay thế, ảnh giải thưởng là ảnh minh họa |
| Keyboard navigation | [EXPECTED] | Tab đi theo thứ tự header, menu giải thưởng, nội dung, Kudos, footer; Enter kích hoạt mục menu; mục menu và nút có viền focus rõ |
| Focus management | [EXPECTED] | bấm mục menu thì focus ở lại mục đó (trang cuộn, focus không nhảy); header cố định không che khối giải được cuộn tới |
| Screen reader compatibility | [EXPECTED] | có vùng header, main, footer; tiêu đề trang là tiêu đề chính, tên mỗi giải là tiêu đề cấp dưới; số lượng và giá trị đọc được cùng nhãn |
| Error announcement | [EXPECTED] | thông báo rỗng/lỗi của vùng giải thưởng được đọc ra khi xuất hiện; neo lạ không phát thông báo nào |

## 10. Responsive Behavior

| Breakpoint | Region / Element | Behavior | Source |
|------------|-------------------|----------|--------|
| desktop | R4 / E10 | menu cố định theo cuộn ở bên trái, dưới header | `app/_components/awards-information/awards-nav-view.tsx:18-22` |
| tablet, mobile | R4 / E10 | menu thành thanh tab cuộn ngang | `app/_components/awards-information/awards-nav-view.tsx:18-22`, `app/_components/awards-information/award-details-layout.tsx:12` |
| desktop | R5 / E13 | ảnh xen kẽ trái/phải theo thứ tự khối | `app/_components/awards-information/award-block.tsx:60` |
| tablet, mobile | R5 / E13 | ảnh xếp trên nội dung của mỗi khối | `app/_components/awards-information/award-block.tsx:60` |
| tablet, mobile | R2 | key visual co theo chiều ngang, phủ kín và cắt giữa | `app/_components/awards-information/awards-information-hero.tsx:9-45` |
| tablet, mobile | R1 | header giữ cố định ở đầu cửa sổ; ba liên kết điều hướng ẩn dưới khổ 1024 điểm ảnh như ở trang chủ, footer vẫn đủ bốn liên kết | `app/_components/site/site-header.tsx:38`, `app/_components/site/site-footer.tsx:35` |
