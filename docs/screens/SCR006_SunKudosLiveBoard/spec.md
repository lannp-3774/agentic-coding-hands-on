---
status: implemented
fcode: F006
authored_by: takumi
created: 2026-10-12
lang: vi
---

# SCR006 — Screen Spec

**Screen**: SCR006: Sun* Kudos - Live board
**Feature**: F006_KudosBoardBrowse
**Type**: composite
**Route**: /sun-kudos
**Generated**: 2026-10-12

## 1. Overview

**Purpose:** Khách và Sunner mở màn hình này để xem những lời cảm ơn và ghi nhận trong SAA 2025: kudos nổi bật theo số tim, dòng kudos mới nhất, lọc theo hashtag hoặc phòng ban, chép liên kết một kudos, và đi tiếp sang chi tiết hoặc hồ sơ.
**Actors:** Khách chưa đăng nhập, Sunner đã đăng nhập
**Entry Conditions:** Không cần đăng nhập. Người xem bấm liên kết "Sun* Kudos" ở header hoặc footer, nút hoặc khối Kudos ở trang chủ hoặc Awards Information, hoặc gõ địa chỉ trực tiếp, kèm hoặc không kèm giá trị lọc trên địa chỉ.
**Exit Conditions:** Người xem chuyển sang trang khác (trang chủ, Awards Information, chi tiết kudos, hồ sơ, đăng nhập), hoặc rời ứng dụng.

## 2. Screen Layout

### Layout Sketch

Trang cuộn dọc: header cố định ở đầu; banner key visual; thanh gửi kudos cùng thanh tìm hồ sơ; khối Highlight (tiêu đề, hai nút lọc, carousel năm thẻ với mũi tên và bộ đếm); vùng Spotlight (dành cho feature Spotlight); khối All Kudos là cột chính bên trái, cùng cột phải dành cho sidebar (cuộn độc lập); footer. Hai khối Spotlight và sidebar chỉ có khung giữ chỗ cố định kích thước ở màn hình này; nội dung do feature riêng cắm vào. Thông báo nhỏ khi chép liên kết nổi ở cuối màn hình.

```
┌──────────────────────────────────────────────────────────────┐
│ R1: Header (fixed-top)  [Logo] About · Awards · [Sun* Kudos] │
├──────────────────────────────────────────────────────────────┤
│ R2: Banner key visual: "Hệ thống ghi nhận và cảm ơn"        │
├──────────────────────────────────────────────────────────────┤
│ R3: [✎ Hôm nay, bạn muốn gửi lời cảm ơn…] [🔍 Tìm profile]    │
├──────────────────────────────────────────────────────────────┤
│ R4: Sun* Annual Awards 2025 / HIGHLIGHT KUDOS  [Hashtag ▾]   │
│     [Phòng ban ▾]                                            │
│        ◂  ░thẻ░  [ THẺ GIỮA ]  ░thẻ░  ▸      2/5            │
├──────────────────────────────────────────────────────────────┤
│ R5: Spotlight (vùng của F008 Spotlight)                       │
├────────────────────────────────────┬─────────────────────────┤
│ R6: ALL KUDOS (cột chính)          │ R7: Sidebar (F009,      │
│   thẻ kudos × N …                  │ cuộn độc lập)           │
│   [vùng nạp thêm / thử lại]        │                         │
├────────────────────────────────────┴─────────────────────────┤
│ R8: Footer                                                   │
└──────────────────────────────────────────────────────────────┘
                         (R9: thông báo nhỏ nổi ở cuối màn hình)
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components |
|-----------|------|----------|------------|----------------|
| R1 | Header | fixed-top | no | TBD (draft) |
| R2 | Banner | static | no | TBD (draft) |
| R3 | Thanh gửi kudos và tìm hồ sơ | static | no | TBD (draft) |
| R4 | Highlight (tiêu đề, nút lọc, carousel, bộ đếm) | static | no | TBD (draft) |
| R5 | Spotlight (vùng của F008) | static | no | TBD (draft) |
| R6 | All Kudos (tiêu đề, danh sách thẻ, vùng nạp thêm) | static | yes (theo trang) | TBD (draft) |
| R7 | Sidebar (vùng của F009) | sticky: cột phải ở khổ máy tính | yes (độc lập) | TBD (draft) |
| R8 | Footer | static | no | TBD (draft) |
| R9 | Thông báo nhỏ khi chép liên kết | fixed-bottom | no | TBD (draft) |

## 3. UI Elements

| ID | Element | Type | Required | Default | Visibility | Action | Source | Format | Empty Behavior | Cross-ref |
|----|---------|------|----------|---------|------------|--------|--------|--------|-----------------|-----------|
| E01 | Header và footer dùng lại (logo, ba liên kết, bộ chọn ngôn ngữ, vùng tài khoản) | region label | — | — | Always | Điều hướng — xem § 8 | static | theo ngôn ngữ đang chọn | — | N/A |
| E02 | Liên kết "Sun* Kudos" ở header và footer, đang chọn (header: chữ vàng, gạch chân; footer: nền nhạt, không gạch chân) | link | — | Selected | Always | — | static | theo ngôn ngữ đang chọn | — | N/A |
| E03 | Banner: ảnh nền, tiêu đề "Hệ thống ghi nhận và cảm ơn", logo "SAA 2025 KUDOS" | image | — | — | Always | — | static | chỉ để xem, không bấm được | — | N/A |
| E04 | Thanh gửi kudos (biểu tượng bút bên trái, chữ gợi ý "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?") | button | — | Enabled | Always | Bấm chưa làm gì | static | viên thuốc (pill) | — | N/A |
| E05 | Thanh "Tìm kiếm profile Sunner" (biểu tượng kính lúp) cạnh E04 | button | — | Enabled | Always | Bấm chưa làm gì (vẽ đúng Figma, không handler; D013 đã chốt) | static | viên thuốc (pill) | — | N/A |
| E06 | Tiêu đề khối Highlight: chữ nhỏ "Sun* Annual Awards 2025" và "HIGHLIGHT KUDOS" | display field | — | — | Always | — | static | theo ngôn ngữ đang chọn | — | N/A |
| E07 | Nút lọc "Hashtag" (hiện giá trị đang chọn khi có; mở danh sách giá trị) | select | no | "Hashtag" (chưa lọc) | Always | Chọn hoặc bỏ giá trị lọc | API field | tên hashtag | danh sách chỉ có "Tất cả" | N/A |
| E08 | Nút lọc "Phòng ban" (hiện giá trị đang chọn khi có; mở danh sách giá trị) | select | no | "Phòng ban" (chưa lọc) | Always | Chọn hoặc bỏ giá trị lọc | API field | mã phòng ban (ví dụ CEVC10) | danh sách chỉ có "Tất cả" | N/A |
| E09 | Carousel Highlight: tối đa 5 thẻ, thẻ đang xem ở giữa to và rõ, thẻ liền kề mờ và không bấm được | list | — | Thẻ 1 | Conditional | — | API field | số tim giảm dần, cùng số tim thì mới hơn trước; kể cả kudos 0 tim để đủ 5 thẻ | thay bằng E24 | N/A |
| E10 | Mũi tên trước, mũi tên sau và bộ đếm `n/tổng` | button | — | Trước tắt, bộ đếm 1/n | Conditional | Chuyển thẻ trước hoặc sau | computed | `n/tổng` | — | N/A |
| E11 | Khối người gửi, mũi tên, khối người nhận trên thẻ (ảnh đại diện, tên, phòng ban, 0–3 sao, nhãn Hero) | display field | — | — | Conditional | Bấm ảnh hoặc tên → hồ sơ; rê hoặc lấy tiêu điểm vào sao → giải thích | API field | New, Rising, Super, Legend Hero theo số kudos nhận | không có phòng ban thì ẩn dòng; không có ảnh thì chữ cái đầu | N/A |
| E12 | Giờ gửi của thẻ | display field | — | — | Conditional | — | API field | `HH:mm - MM/DD/YYYY`, giờ Việt Nam | — | N/A |
| E13 | Nhãn tiêu đề kudos phía trên nội dung (kèm biểu tượng bút, ví dụ "IDOL GIỚI TRẺ"; chữ tự do của kudos, không phải hashtag) | link | — | — | Conditional | Bấm thì đặt bộ lọc Hashtag nếu có hashtag trùng chữ; không có thì chỉ là chữ, không bấm được (D014) | API field | chữ gốc | ẩn khi kudos không có tiêu đề | N/A |
| E14 | Nội dung kudos | display field | — | — | Conditional | Bấm → chi tiết kudos | API field | cắt 3 dòng (Highlight), 5 dòng (All Kudos), rồi "..." | — | N/A |
| E15 | Hashtag của thẻ | link | — | — | Conditional | Bấm thì đặt bộ lọc Hashtag | API field | tối đa 5 trên một dòng, dư thì "..." | ẩn khi không có hashtag | N/A |
| E16 | Ảnh đính kèm (chỉ All Kudos) | image | — | — | Conditional | Bấm → mở ảnh gốc ở tab mới (D017) | API field | tối đa 5 hình vuông, căn trái | ẩn khi không có ảnh | N/A |
| E17 | Vùng nút tim của thẻ (nút của F007: tim xám khi chưa thích, đỏ khi đã thích, kèm số tim; vô hiệu cho người gửi; khách bấm thì tới `/login`) | region label | — | Tim xám | Conditional | — | API field | số tim | — | N/A |
| E18 | Nút "Copy Link" | button | — | Enabled | Conditional | Chép địa chỉ chi tiết kudos | computed | — | — | N/A |
| E19 | Nút "Xem chi tiết" (chỉ thẻ Highlight) | link | — | Enabled | Conditional | Mở chi tiết kudos | computed | — | — | N/A |
| E20 | Tiêu đề khối All Kudos: chữ nhỏ "Sun* Annual Awards 2025" và "ALL KUDOS" | display field | — | — | Always | — | static | theo ngôn ngữ đang chọn | — | N/A |
| E21 | Danh sách thẻ All Kudos, mới nhất trước, tự nạp thêm khi cuộn gần cuối | list | — | — | Conditional | Cuộn nạp thêm | API field | 10 thẻ mỗi lần | thay bằng E24 | N/A |
| E22 | Vùng cuối danh sách: khung chờ khi đang nạp, hoặc dòng lỗi kèm nút "Thử lại" | message | — | Ẩn | Conditional | Bấm "Thử lại" nạp lại | computed | — | hidden | N/A |
| E23 | Vùng Spotlight (F008) và sidebar (F009): khung do F006 giữ, nội dung và hành vi do hai feature đó sở hữu (xem functional-spec của F008, F009) | region label | — | — | Always | — | static | — | — | N/A |
| E24 | Thông báo rỗng "Hiện tại chưa có Kudos nào." (thay cho carousel hoặc cho danh sách) | message | — | Ẩn | Conditional | — | static | theo ngôn ngữ đang chọn | — | N/A |
| E25 | Thông báo nhỏ khi chép liên kết ("Link copied — ready to share!" hoặc dòng lỗi), tự tắt sau 3 giây | message | — | Ẩn | Conditional | — | static | thành công giữ nguyên chữ Figma ở cả hai ngôn ngữ | hidden | N/A |

## 4. User Actions

> **Scope:** within-screen interactions only. Cross-screen navigation belongs in `## 8. Navigation` (which projects `screen-flow.md § Screen Access Paths` — see the D3 note below). Reference region names from `### Layout Regions` (§2, above) when describing where actions occur.

### Available Actions

| Action | Element | Trigger | Condition | Result on this screen | Source |
|--------|---------|---------|-----------|------------------------|--------|
| Mở danh sách lọc | E07, E08 | click, hoặc Enter hoặc Space khi có tiêu điểm | — | danh sách giá trị mở dưới nút; mở một danh sách thì đóng danh sách kia; Esc hoặc bấm ra ngoài thì đóng | TBD (draft) |
| Chọn giá trị lọc | E07, E08 | click một mục, hoặc Enter | — | cả Highlight (R4) về thẻ 1 và All Kudos (R6) nạp lại theo bộ lọc mới; nút hiện giá trị đã chọn; bộ lọc còn lại giữ nguyên; địa chỉ trang đổi theo | TBD (draft) |
| Bỏ lọc | E07, E08 | click mục "Tất cả" | đang có giá trị lọc | phần lọc đó bị bỏ; Highlight về thẻ 1, All Kudos nạp lại | TBD (draft) |
| Lọc theo hashtag trên thẻ | E15, E13 | click | hashtag khác giá trị đang lọc (E13 chỉ khi có hashtag trùng chữ) | đặt bộ lọc Hashtag, giữ Phòng ban; như "Chọn giá trị lọc" | TBD (draft) |
| Chuyển thẻ Highlight | E10 | click mũi tên trước hoặc sau | mũi tên đang bật | thẻ giữa đổi, bộ đếm đổi; mũi tên trước tắt ở thẻ 1, mũi tên sau tắt ở thẻ cuối | TBD (draft) |
| Cuộn nạp thêm | E21 | cuộn gần cuối danh sách | còn kudos cũ hơn và không đang nạp | 10 thẻ cũ hơn nối xuống dưới, không lặp thẻ; hết kudos thì dừng im lặng | TBD (draft) |
| Thử lại nạp thêm | E22 | click "Thử lại" | lần nạp trước lỗi | nạp lại trang đang lỗi; các thẻ đã có giữ nguyên | TBD (draft) |
| Chép liên kết | E18 | click | — | địa chỉ tuyệt đối của chi tiết kudos vào clipboard; hiện E25 | TBD (draft) |
| Rê vào sao | E11 | hover hoặc focus | người có 1–3 sao | hiện lời giải thích đúng mức sao (xem § 6); 0 sao không có | TBD (draft) |
| Bấm thanh gửi kudos hoặc thanh tìm hồ sơ | E04, E05 | click | — | chưa làm gì: không mở hộp thoại, không chuyển trang | TBD (draft) |

### Happy Path

1. Người xem mở trang và thấy header với "Sun* Kudos" đang chọn (R1), banner (R2), thanh gửi kudos (R3) và khối Highlight (R4) với thẻ 1 ở giữa, bộ đếm `1/5`.
2. Người xem bấm mũi tên sau ở R4 — thẻ 2 vào giữa, bộ đếm `2/5`, mũi tên trước bật.
3. Người xem mở danh sách "Phòng ban" ở R4 và chọn một phòng ban — carousel về thẻ 1 chỉ còn kudos gửi tới người của phòng ban đó, All Kudos ở R6 nạp lại theo cùng bộ lọc.
4. Người xem bấm một hashtag trên thẻ ở R6 — nút "Hashtag" hiện hashtag đó, danh sách thu hẹp thêm, phòng ban vẫn giữ.
5. Người xem cuộn xuống R6 — kudos cũ hơn tự nối thêm xuống dưới khi gần cuối.
6. Người xem bấm "Copy Link" ở một thẻ — thấy thông báo nhỏ ở R9 "Link copied — ready to share!".
7. Người xem chọn "Tất cả" ở hai nút lọc — bộ lọc bỏ hết, trang trở lại như ban đầu.

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|----------------|-----------|------------------------|--------|
| Bước 1 (tải Highlight) | không có kudos phù hợp, hoặc không đọc được dữ liệu | E24 thay cho carousel; phần còn lại vẫn hiện | TBD (draft) |
| Bước 1 (tải All Kudos) | không có kudos phù hợp, hoặc không đọc được dữ liệu | E24 thay cho danh sách | TBD (draft) |
| Bước 2 | chỉ có một thẻ | cả hai mũi tên tắt, bộ đếm `1/1` | TBD (draft) |
| Bước 3 | giá trị lọc trên địa chỉ sai định dạng | bị bỏ qua, trang hiện như chưa lọc | TBD (draft) |
| Bước 5 | nạp thêm lỗi | các thẻ đã có giữ nguyên; E22 hiện dòng lỗi và "Thử lại" | TBD (draft) |
| Bước 6 | trình duyệt không có clipboard hiện đại | dùng cách dự phòng; cả hai thất bại thì E25 hiện dòng lỗi | TBD (draft) |

### Interaction Notes

- **Đổi bộ lọc thì nội dung cũ vẫn hiện, mờ nhẹ, cho tới khi nội dung mới sẵn sàng** — source: TBD (draft)
- **Thẻ hai bên của carousel chỉ để nhìn: không bấm, không nhận tiêu điểm bàn phím** — source: TBD (draft)
- **Bấm cả thẻ (vùng nội dung) mở chi tiết kudos, còn ảnh đại diện, tên, hashtag, Copy Link và ảnh đính kèm có hành vi riêng của chúng** — source: TBD (draft)
- **Thứ tự carousel chỉ tính lúc tải: thả hoặc rút tim đổi số tim trên thẻ nhưng không xếp lại carousel cho tới khi tải lại hoặc đổi bộ lọc (D019)** — source: TBD (draft)

## 5. UI States

> **Required rows:** loading + ≥1 error (per async call) + ≥1 empty (per data-displaying region) + saving/submitting + success/redirect. Write `N/A — no async ops` only if screen has zero API calls.

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| loading (Highlight) | đang đọc kudos nổi bật | khung chờ cùng kích thước carousel, không chữ | none | TBD (draft) |
| loading (nút lọc) | đang đọc danh sách hashtag và phòng ban | hai khung nút cùng kích thước, không chữ | none | TBD (draft) |
| loading (All Kudos, lần đầu) | đang đọc trang đầu | vài thẻ khung không chữ | none | TBD (draft) |
| loading (nạp thêm) | đang nạp trang kế | khung chờ dưới danh sách | cuộn tiếp | TBD (draft) |
| filtering | vừa đổi bộ lọc, nội dung mới chưa về | nội dung cũ mờ nhẹ | đổi bộ lọc tiếp | TBD (draft) |
| empty (Highlight) | không có kudos phù hợp | "Hiện tại chưa có Kudos nào." thay cho carousel | đổi hoặc bỏ lọc | TBD (draft) |
| empty (All Kudos) | không có kudos phù hợp | "Hiện tại chưa có Kudos nào." thay cho danh sách | đổi hoặc bỏ lọc | TBD (draft) |
| error (đọc lần đầu) | không đọc được dữ liệu | như empty ở phần bị lỗi; phần khác vẫn hiện | tải lại trang | TBD (draft) |
| error (nạp thêm) | nạp trang kế lỗi | thẻ đã có giữ nguyên; dòng lỗi kèm nút "Thử lại" dưới danh sách | "Thử lại" | TBD (draft) |
| saving | N/A — màn hình không ghi dữ liệu | — | — | TBD (draft) |
| success (chép liên kết) | chép thành công | thông báo nhỏ "Link copied — ready to share!" ở R9, tự tắt sau 3 giây | tắt thông báo hoặc chờ | TBD (draft) |
| error (chép liên kết) | cả hai cách chép đều thất bại | thông báo nhỏ lỗi ở R9, tự tắt sau 3 giây | — | TBD (draft) |
| end of list | hết kudos cũ hơn | danh sách dừng, không báo gì | — | TBD (draft) |

## 6. Validation & Feedback

| Element | Rule | Feedback | Trigger |
|---------|------|----------|---------|
| E07, E08 | Giá trị lọc trên địa chỉ phải đúng định dạng; sai thì bị bỏ qua | không báo gì, trang hiện như chưa lọc | server response |
| E07, E08 | Giá trị đúng định dạng nhưng không có trong danh sách cho kết quả rỗng | "Hiện tại chưa có Kudos nào." | server response |
| E11 | Rê hoặc lấy tiêu điểm vào 1 sao | "Sunner đã nhận được 10 Kudos và bắt đầu lan tỏa năng lượng ấm áp đến mọi người xung quanh." | change |
| E11 | Rê hoặc lấy tiêu điểm vào 2 sao | "Sunner đã nhận được 20 Kudos và chứng minh sức ảnh hưởng của mình qua những hành động lan tỏa tích cực mỗi ngày." | change |
| E11 | Rê hoặc lấy tiêu điểm vào 3 sao | "Sunner đã nhận được 50 Kudos và trở thành hình mẫu của sự công nhận, sẻ chia và lan tỏa tinh thần Sun*." | change |
| E18 | Chép địa chỉ thành công | "Link copied — ready to share!" | submit |
| E18 | Không chép được bằng cả hai cách | "Không sao chép được liên kết" (EN: "Could not copy the link") — chữ tạm (D020 đã chốt, chờ người sở hữu nội dung) | submit |
| E22 | Nạp thêm lỗi | "Không tải thêm được Kudos." (EN: "Could not load more Kudos.") và nút "Thử lại" (EN: "Try again") — chữ tạm (D020 đã chốt, chờ người sở hữu nội dung) | server response |

## 7. Conditional UI

| Condition | Type | Element(s) | Visible when | Hidden when | Notes |
|-----------|------|------------|--------------|-------------|-------|
| Người xem là khách hoặc Sunner đã đăng nhập | auth | E11, E14, E19 | cả hai thấy cùng nội dung; khác nhau ở đích liên kết (§ 8) | — | không phần tử nào bị ẩn theo phiên; ẩn bằng giao diện không thay cho kiểm tra phiên ở trang đích |
| Có kudos phù hợp bộ lọc | configuration | E09, E10, E21 | có ít nhất một kudos phù hợp | không có kudos phù hợp hoặc không đọc được dữ liệu (thay bằng E24) | điều kiện theo dữ liệu, không theo cấu hình |
| Thẻ nằm trong carousel Highlight | configuration | E19 | trong carousel Highlight | trong danh sách All Kudos | All Kudos không có "Xem chi tiết" |
| Thẻ nằm trong danh sách All Kudos và kudos có ảnh | configuration | E16 | trong All Kudos và kudos có ảnh | trong Highlight hoặc kudos không có ảnh | Highlight không có ảnh đính kèm |
| Người có 1–3 sao | configuration | tooltip của E11 | người có 1, 2 hoặc 3 sao | người có 0 sao (New Hero) | sao và nhãn theo số kudos nhận: 0–9 New (0 sao), 10–19 Rising (1), 20–49 Super (2), từ 50 Legend (3) |
| Kudos có nhãn tiêu đề | configuration | E13 | kudos có nhãn tiêu đề | kudos không có tiêu đề | bấm lọc chỉ khi có hashtag trùng chữ (D014 đã chốt); không trùng thì nhãn là chữ thường |
| Ngôn ngữ EN | configuration | E02, E06, E07, E08, E10, E20, E22, E24 | người xem chọn EN | người xem chọn VN | chỉ nhãn giao diện đổi; nội dung kudos, tên, hashtag, phòng ban giữ nguyên |
| Khổ màn hình dưới khổ máy tính | responsive | R7, E09 | R7 nằm dưới R6 trong một cột; E09 chỉ hiện thẻ đang xem | khổ máy tính: R7 là cột phải, E09 hiện thẻ bên mờ | không phần nào bị ẩn (D022 đã chốt); xem § 10 |

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
| SCR003_Homepage | liên kết "Sun* Kudos" ở header hoặc footer; nút hoặc khối Sun* Kudos ở nội dung trang chủ | — | TBD (draft) |
| SCR004_AwardsInformation | liên kết "Sun* Kudos" ở header hoặc footer; nút "Chi tiết" của khối Sun* Kudos cuối trang | — | TBD (draft) |
| external | gõ địa chỉ trực tiếp, kèm hoặc không kèm giá trị lọc | — | TBD (draft) |

### Exits

| Action | Element | Condition | Destination | Result | Source |
|--------|---------|-----------|-------------|--------|--------|
| Bấm liên kết điều hướng ở header hoặc footer | E01 | — | SCR003_Homepage, SCR004_AwardsInformation (các liên kết còn lại như hiện có) | redirect | TBD (draft) |
| Bấm "Xem chi tiết" hoặc nội dung thẻ | E19, E14 | Sunner đã đăng nhập | chi tiết kudos (TBD (draft); trang chưa xây, hiện 404 mặc định) | redirect | TBD (draft) |
| Bấm ảnh đại diện hoặc tên người gửi, người nhận | E11 | Sunner đã đăng nhập | hồ sơ Sunner (TBD (draft); trang chưa xây, hiện 404 mặc định) | redirect | TBD (draft) |
| Bấm một trong các liên kết ở hai dòng trên | E19, E14, E11 | khách chưa đăng nhập (đăng nhập xong về SCR003_Homepage, không quay lại trang này; D016) | SCR001_Login | redirect | TBD (draft) |
| Bấm một ảnh đính kèm | E16 | — | ảnh gốc (tab mới) | new tab | TBD (draft) |
| Bấm bộ lọc, mũi tên, Copy Link, Thử lại | E07, E08, E10, E18, E22 | — | (stays on screen) | địa chỉ trang đổi khi lọc | TBD (draft) |
| Site bị khoá trước giờ mở (người không phải admin) | — | trước giờ mở | SCR005_CountdownPrelaunch | redirect | TBD (draft) |

## 9. Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | [EXPECTED] | carousel `region` với `aria-roledescription="carousel"`, mỗi thẻ `group` "n trên tổng"; danh sách lọc `listbox`, nút lọc `aria-haspopup` và `aria-expanded`; thông báo nhỏ `role="status"`; mũi tên và Copy Link có nhãn đọc được; ảnh đại diện có chữ thay thế là tên người |
| Keyboard navigation | [EXPECTED] | mọi nút, liên kết, chip hashtag, mục danh sách lọc tới được bằng Tab; mở danh sách bằng Enter hoặc Space, đóng bằng Esc; thẻ hai bên của carousel không nhận tiêu điểm |
| Focus management | [EXPECTED] | đóng danh sách lọc trả tiêu điểm về nút lọc; đổi bộ lọc không làm mất vị trí cuộn; nút "Thử lại" nhận tiêu điểm khi nạp thêm lỗi |
| Screen reader compatibility | [EXPECTED] | liên kết kéo giãn của thẻ không lồng liên kết trong liên kết; bộ đếm `n/tổng` và dòng lỗi nạp thêm đọc được qua vùng `aria-live` lịch sự |
| Error announcement | [EXPECTED] | thông báo chép liên kết và dòng lỗi nạp thêm được đọc ra (`role="status"` hoặc `aria-live="polite"`) |

## 10. Responsive Behavior

Figma của khung này chỉ có khổ máy tính; quy tắc cho khổ nhỏ hơn đã chốt ở D022 và chưa có thiết kế riêng:

- Dưới khổ máy tính trang xếp một cột: R7 (sidebar) nằm dưới R6 (All Kudos).
- Carousel R4 chỉ hiện thẻ đang xem (thẻ liền kề ẩn); mũi tên và bộ đếm giữ nguyên.
- Không phần nào bị ẩn.
