---
status: implemented
authored_by: takumi
created: 2026-10-09
lang: vi
---

# Functional Spec — F004_AwardsInformation

**Priority**: P1
**Type**: ui
**Generated**: 2026-10-09

**See also:** [`technical-spec.md`](./technical-spec.md) — endpoints, Source citations, pseudocode,
key entities, and DB writes for a Dev/QA/SA audience.

**Traceability:** F004_AwardsInformation → SCR004_AwardsInformation → US022, US023, US024, US025, US026, US027 (mã US toàn cục, cấp lại từ US001–US006 cục bộ của bản nháp khi promote)

## 1. Overview

**Problem:** Người trong Sun* nhận được liên kết "Awards Information" ở trang chủ nhưng chưa có nơi để đọc kỹ từng giải: giải vinh danh ai, có bao nhiêu giải, giá trị mỗi giải là bao nhiêu. Họ cần một trang công khai, đọc một mạch và nhảy nhanh tới từng giải.
**Solution:** Trang "Hệ thống giải thưởng SAA 2025" gồm tiêu đề, menu bên trái liệt kê sáu giải, sáu khối chi tiết (ảnh, tên, mô tả dài, số lượng, giá trị) và khối giới thiệu Sun* Kudos ở cuối. Bấm một mục menu thì trang cuộn mượt tới giải đó; mục đang xem được tô sáng và đổi theo khi cuộn tay hoặc khi mở trang bằng neo của giải. Chữ giao diện có hai ngôn ngữ VN và EN.
**Scope:** Trang chi tiết các giải thưởng với dữ liệu lấy từ hệ thống (mô tả dài, số lượng và đơn vị, các mức giá trị kèm ghi chú); menu bên trái và trạng thái đang chọn; khối Sun* Kudos cuối trang; trạng thái đang chọn của liên kết "Awards Information" ở header và ở footer (footer dùng kiểu chọn riêng của Figma); mở công khai không cần đăng nhập; đổi ngôn ngữ VN/EN.
**Non-Scope:** Danh sách thẻ giải thưởng ở trang chủ và nội dung ngắn của nó (thuộc F002, giữ nguyên); vùng tài khoản và chuông trong header (thuộc F003); đăng nhập (thuộc F001); trang Sun* Kudos (chỉ có nút dẫn tới, trang chưa xây); trang 404 riêng; dịch mô tả dài của giải và đoạn Kudos sang tiếng Anh; dữ liệu giải thưởng của môi trường thật (chỉ có dữ liệu seed local); nút widget nổi (thiết kế không có, xem D007).

**Actors**

| Actor | Description | Primary goal |
|-------|--------------|---------------|
| Người xem | khách chưa đăng nhập hoặc người dùng đã đăng nhập; cả hai thấy cùng nội dung công khai | hiểu từng giải thưởng của SAA 2025 và nhảy nhanh tới giải mình quan tâm |

## 2. Functional Capabilities

| ID | Capability | What the user can do | User Stories | Requirements | Business Rules | Screens |
|----|------------|------------------------|-----------------|---------------|-------------------|---------|
| CAP-01 | Xem hệ thống giải thưởng | Mở trang công khai, đọc tiêu đề, danh sách sáu giải với đầy đủ mô tả, số lượng, giá trị, và xem khối Sun* Kudos cuối trang để đi tới Sun* Kudos | US022, US023, US026 | FR-001, FR-002, FR-101, FR-102, FR-103, FR-201, FR-202, FR-203, FR-204, FR-205, FR-206, FR-207, FR-208, FR-209, FR-210, FR-211, FR-407, FR-601 | BR-001, BR-002, BR-003, BR-005, BR-006, DEC-001, DEC-002 | SCR004_AwardsInformation |
| CAP-02 | Chuyển nhanh giữa các giải bằng menu | Bấm mục menu để cuộn mượt tới giải, thấy duy nhất mục đang xem được tô sáng, mở trang bằng neo của giải | US024, US025 | FR-401, FR-402, FR-403, FR-404, FR-405, FR-406 | BR-007, BR-008, DEC-003, DEC-004 | N/A — nằm trên màn hình Awards Information, đã tính ở CAP-01 |
| CAP-03 | Đọc trang bằng VN hoặc EN | Đổi chữ giao diện giữa VN và EN; lựa chọn được nhớ cho lần mở sau | US027 | FR-408 | BR-004 | N/A — nằm trên màn hình Awards Information, đã tính ở CAP-01 |

## 3. Open Decisions

Chín quyết định đầu đã chốt ngày 2026-10-09 (clarifications.md) và chỉ ghi lại để tra cứu; D010 đến D012 chốt ở lượt hỏi thứ hai cùng ngày; D013, D014 chốt khi triển khai (2026-10-09) theo kết quả đối chiếu Figma.

| D### | Decision | Default proposal | Rationale | Blocks work |
|------|----------|-------------------|-----------|--------------|
| D001 | Địa chỉ của trang là gì (test case ghi `/he-thong-giai`, còn header, footer, nút ở trang chủ và thẻ giải thưởng đã trỏ `/awards-information`)? | **Đã chốt:** `/awards-information`; neo của từng giải là mã định danh của giải (`#top-talent` …); test case đọc theo địa chỉ này | Đổi các liên kết đã có thì tốn công hơn đổi test case | no |
| D002 | Ai được xem trang (test case ID-1 yêu cầu khách bị chuyển tới đăng nhập, nhưng trang chủ dẫn tới đây là công khai)? | **Đã chốt:** công khai như trang chủ; khách thấy nút đăng nhập ở header; ID-1 đổi thành "khách thấy trang"; không ai bị chuyển hướng | Trang chủ công khai mà liên kết sang trang đòi đăng nhập sẽ vỡ luồng | no |
| D003 | Dữ liệu chi tiết giải (mô tả dài, số lượng, đơn vị, mức giá trị, Signature có hai mức) lưu ở đâu? | **Đã chốt:** mở rộng dữ liệu giải thưởng hiện có và thêm một bảng mức giá trị đọc công khai, nạp seed theo chữ Figma; phần dữ liệu trang chủ đang đọc giữ nguyên | Dữ liệu có cấu trúc, không viết cứng trong giao diện | no |
| D004 | Trạng thái đang chọn của menu hoạt động thế nào? | **Đã chốt:** bấm thì cuộn mượt và đánh dấu; cuộn tay thì mục đang chọn đi theo; mở bằng `#<giải>` thì đánh dấu giải đó; menu cố định theo cuộn ở khổ máy tính, thành thanh tab cuộn ngang ở khổ nhỏ | Khớp test case ID-9, ID-11 và nhu cầu đọc dài | no |
| D005 | Chữ trong Figma khác chữ trong spec thì lấy bên nào? | **Đã chốt:** lấy Figma — Top Talent "10 Cá nhân" (spec ghi "10 Đơn vị"); Signature có hai khối "5.000.000 VNĐ cho giải cá nhân", "Hoặc", "8.000.000 VNĐ cho giải tập thể" với đơn vị "Cá nhân hoặc tập thể"; Best Manager và MVP không có dòng ghi chú; nhãn menu dạng ngắn ("Signature 2025 Creator", "MVP"); ảnh xen kẽ trái/phải | Cùng tiền lệ đã dùng ở trang chủ | no |
| D006 | Phạm vi dịch sang EN? | **Đã chốt:** chỉ dịch chữ giao diện (tiêu đề, nhãn "Số lượng giải thưởng" và "Giá trị giải thưởng", ghi chú, đơn vị, "Hoặc", nhãn Kudos, thông báo rỗng); mô tả dài của giải và đoạn Kudos giữ tiếng Việt; tên giải là tên riêng nên giữ nguyên | Chưa có bản tiếng Anh chính thức của nội dung dài | no |
| D007 | Nút "Chi tiết" ở khối Kudos và nút widget? | **Đã chốt:** "Chi tiết" dẫn tới trang Sun* Kudos (chưa xây nên hiện trang không tìm thấy mặc định, không làm trang 404 riêng — ID-14 chỉ cần trang lỗi mặc định); nút widget chỉ thêm nếu thiết kế có, hiện chưa thấy nên mặc định không có | Cùng cách xử lý với trang chủ | no |
| D008 | Neo không khớp giải nào, ví dụ `#does-not-exist`? | **Đã chốt:** không lỗi, trang ở đầu, mục đầu (Top Talent) đang chọn | Test case ID-13 | no |
| D009 | Không có dữ liệu giải hoặc không đọc được? | **Đã chốt:** giữ tiêu đề trang, hiện thông báo ngắn "Thông tin giải thưởng sẽ sớm được cập nhật." (EN: "Award information will be updated soon."), lỗi ghi ở máy chủ, các phần khác vẫn hiện | Cùng thông báo đã dùng ở trang chủ | no |
| D010 | Chữ nhỏ trên tiêu đề viết "Sun* Annual Awards 2025" (Figma) hay "Sun* annual awards 2025" (spec, test case ID-4 và mục giải thưởng ở trang chủ)? | **Đã chốt:** theo Figma "Sun* Annual Awards 2025"; test ID-4 sửa theo | Quy ước đã chốt: Figma thắng spec; chữ hoa chữ thường khác nhau giữa hai khung Figma nên cần người sở hữu thiết kế xác nhận | no |
| D011 | Nhãn ngắn của menu (hai nhãn khác tên giải) lấy từ đâu? | **Đã chốt:** cột `nav_label` của `awards` (một nhãn dùng cho cả VN và EN) | Tránh viết cứng tên giải trong giao diện; hai nhãn không suy ra được từ tên giải | no |
| D012 | Chữ EN cho đơn vị, ghi chú, nhãn và tiêu đề? | **Đã chốt:** Đơn vị: Individual / Team / Individual or team; ghi chú: per award / for the individual award / for the team award; "Hoặc": Or; "Số lượng giải thưởng": Number of awards; "Giá trị giải thưởng": Prize value; tiêu đề lớn: SAA 2025 Awards System | Chưa có bản tiếng Anh chính thức, dùng bản dịch dùng được như tiền lệ trang chủ | no |
| D013 | Dấu cách đôi trong mô tả Signature và MVP có phải chỗ xuống đoạn không? | **Đã chốt:** là chỗ xuống đoạn; khung Figma hiện một dòng trống ở đó, nên dữ liệu seed lưu hai ký tự xuống dòng và mô tả hiển thị với `white-space: pre-line` (Signature và MVP có hai đoạn) | Đối chiếu lại Figma khi triển khai thấy dòng trống thay vì liền một đoạn | no |
| D014 | Ảnh của khối giải và trạng thái đang chọn ở footer? | **Đã chốt:** dùng lại ảnh vuông 336x336 của thẻ giải thưởng ở trang chủ; footer đánh dấu "Awards Information" theo kiểu chọn của Figma (instance 186:1496: nền vàng 10%, chữ trắng có ánh sáng, không gạch chân, góc vuông), khác kiểu của header; footer ở trang chủ giữ như cũ | Ảnh trang chủ đã ghép sẵn nền và tên giải; khung Figma cho thấy kiểu chọn ở footer | no |

## 4. Requirements

### Foundation (0xx)

- **FR-001** Thông tin chi tiết của từng giải (mô tả dài, số lượng, đơn vị, các mức giá trị kèm ghi chú, nhãn ngắn của menu) nằm trong dữ liệu của hệ thống, có sẵn sáu giải ở môi trường phát triển theo đúng chữ Figma.
- **FR-002** Mã định danh của mỗi giải làm neo của trang: mở trang kèm `#<mã giải>` đưa người xem tới đúng giải; các liên kết từ trang chủ đã dùng neo này và không phải sửa.

### Navigation (1xx)

- **FR-101** Mở `/awards-information` thì thấy trang, không cần đăng nhập; tới được từ header, footer, nút ABOUT AWARDS và thẻ giải thưởng ở trang chủ, hoặc gõ địa chỉ trực tiếp.
- **FR-102** Ở header, "Awards Information" ở trạng thái đang chọn (chữ vàng, gạch chân, trình đọc màn hình biết đây là trang hiện tại); "About SAA 2025" không còn ở trạng thái đang chọn.
- **FR-103** Footer đánh dấu "Awards Information" là mục đang chọn theo kiểu riêng của footer trong Figma — nền nhạt, chữ có ánh sáng, không gạch chân (xem D014); các liên kết còn lại giữ như ở trang chủ, và footer ở trang chủ không đánh dấu liên kết nào.

### Awards Information (2xx)

- **FR-201** Phần tiêu đề có chữ nhỏ "Sun* Annual Awards 2025" (xem D010), đường kẻ mảnh và chữ lớn màu vàng "Hệ thống giải thưởng SAA 2025".
- **FR-202** Menu bên trái liệt kê đúng sáu mục theo thứ tự Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 Creator, MVP, mỗi mục có biểu tượng đứng trước nhãn; mặc định mục đầu đang chọn.
- **FR-203** Mỗi giải là một khối gồm ảnh vuông 336x336 viền vàng, tên giải, mô tả dài, dòng "Số lượng giải thưởng" kèm số và đơn vị, dòng "Giá trị giải thưởng" kèm số tiền VNĐ; chữ đúng như Figma.
- **FR-204** Số lượng hiện ít nhất hai chữ số (01, 02, 03, 10); đơn vị là "Cá nhân", "Tập thể" hoặc "Cá nhân hoặc tập thể" (Top Talent là "10 Cá nhân").
- **FR-205** Signature 2025 - Creator có hai mức giá trị: "5.000.000 VNĐ cho giải cá nhân" và "8.000.000 VNĐ cho giải tập thể", ngăn cách bằng chữ "Hoặc" và một đường kẻ.
- **FR-206** Top Talent, Top Project, Top Project Leader có ghi chú "cho mỗi giải thưởng" dưới số tiền; Best Manager và MVP chỉ hiện số tiền, không có dòng ghi chú.
- **FR-207** Ở khổ máy tính, ảnh nằm bên trái ở khối thứ 1, 3, 5 và bên phải ở khối thứ 2, 4, 6; giữa các khối có đường kẻ, riêng khối cuối không có; ở khổ nhỏ ảnh xếp trên nội dung.
- **FR-208** Cuối trang có khối Sun* Kudos gồm nhãn "Phong trào ghi nhận", tiêu đề "Sun* Kudos", đoạn mô tả, ảnh logo KUDOS và nút "Chi tiết".
- **FR-209** Không có giải nào hoặc không đọc được dữ liệu thì tiêu đề trang vẫn hiện, menu và khối giải được thay bằng một thông báo ngắn; khối Kudos và footer vẫn hiện; lỗi được ghi ở máy chủ.
- **FR-210** Giải có dữ liệu hỏng (thiếu cột hoặc sai kiểu) bị bỏ qua và ghi nhận ở máy chủ; các giải còn lại vẫn hiện, cả menu lẫn khối.
- **FR-211** Trong lúc dữ liệu giải đang tải, vùng menu và khối giải hiện khung chờ không có chữ; tiêu đề và các phần khác không phải chờ.

### Interaction (4xx)

- **FR-401** Bấm một mục menu thì trang cuộn mượt tới khối giải đó (khối dừng ở vị trí không bị header cố định che) và chỉ mục đó được đánh dấu đang chọn (chữ vàng, gạch chân, ánh sáng nhẹ); mục trước mất đánh dấu.
- **FR-402** Khi cuộn tay, mục đang chọn đi theo khối giải đang ở trong tầm nhìn; tại mọi thời điểm chỉ có đúng một mục được chọn.
- **FR-403** Mở trang kèm `#<mã giải>` hợp lệ thì trang cuộn tới giải đó và đánh dấu mục tương ứng.
- **FR-404** Mở trang kèm neo không khớp giải nào thì không lỗi, trang ở đầu và mục đầu tiên đang chọn.
- **FR-405** Khi người xem bật giảm chuyển động trên thiết bị, bấm menu cuộn tức thì thay vì cuộn mượt.
- **FR-406** Rê chuột hoặc lấy tiêu điểm vào một mục menu thì mục đó được làm nổi.
- **FR-407** Nút "Chi tiết" ở khối Sun* Kudos dẫn tới trang Sun* Kudos.
- **FR-408** Bộ chọn ngôn ngữ mặc định "VN", chỉ có VN và EN; chọn EN thì chữ giao diện của trang đổi sang tiếng Anh, lựa chọn được nhớ; tên giải, mô tả dài và đoạn Kudos vẫn tiếng Việt.

### Security (6xx)

- **FR-601** Trang và dữ liệu giải thưởng mở công khai: khách và người đã đăng nhập thấy cùng nội dung, chỉ đọc không sửa được, và không ai bị chuyển hướng khỏi trang.

## 5. Business Rules

- Trang Awards Information không yêu cầu đăng nhập; đã đăng nhập hay chưa đều thấy cùng nội dung chung và không bị chuyển hướng (BR-001)
- Mỗi trang chỉ đánh dấu đang chọn đúng một liên kết điều hướng, là liên kết trỏ về chính trang đó (BR-002)
- Liên kết tới trang chưa xây dùng địa chỉ dự kiến; trang chưa xây hiện trang không tìm thấy mặc định là chấp nhận được (BR-003)
- Ngôn ngữ chỉ là VN hoặc EN (mặc định VN); EN chỉ dịch chữ giao diện, mô tả dài và đoạn Kudos giữ tiếng Việt cho tới khi có bản tiếng Anh chính thức (BR-004)
- Tên, nhãn menu, mô tả, số lượng và mức giá trị của giải lấy từ dữ liệu, theo thứ tự tăng dần, không viết cứng trong giao diện (BR-005)
- Số lượng hiện ít nhất hai chữ số; số tiền ngăn nhóm nghìn bằng dấu chấm và kèm "VNĐ"; dòng ghi chú chỉ hiện khi mức giá trị có ghi chú (BR-006)
- Tại mọi thời điểm chỉ có đúng một mục menu đang chọn; mặc định là mục đầu tiên (BR-007)
- Neo của trang là mã định danh của giải; neo không khớp giải nào thì bị bỏ qua, không lỗi (BR-008)
- Phần giải thưởng: có giải hợp lệ thì hiện menu và các khối; không có giải hoặc không đọc được thì giữ tiêu đề trang và hiện một thông báo chung thay cho menu và khối (DEC-001)
- Mỗi giải hiện một khối giá trị cho mỗi mức; có từ hai mức trở lên thì giữa các mức có chữ "Hoặc" và đường kẻ; giải không có mức nào thì khối vẫn hiện, chỉ không có dòng giá trị (DEC-002)
- Bấm menu: cuộn mượt, hoặc cuộn tức thì khi người xem bật giảm chuyển động; cuộn xong mục vừa bấm là mục đang chọn (DEC-003)
- Mục đang chọn do một trong ba nguồn quyết định: vừa bấm menu, khối giải đang ở tầm nhìn khi cuộn tay, hoặc neo trên địa chỉ; neo lạ và chưa cuộn lần nào thì là mục đầu tiên (DEC-004)

## 6. Screens

| Screen Name | SCR### | What User Sees | What User Can Do |
|-------------|--------|-----------------|-------------------|
| Awards Information (Hệ thống giải) | SCR004_AwardsInformation | header cố định (logo, ba liên kết với "Awards Information" đang chọn, bộ chọn ngôn ngữ, vùng tài khoản); ảnh key visual; tiêu đề trang; menu sáu giải bên trái; sáu khối giải (ảnh, tên, mô tả dài, số lượng, giá trị) hoặc khung chờ hoặc thông báo thay cho phần này; khối Sun* Kudos; footer | bấm mục menu để cuộn tới giải; cuộn tay và xem mục đang chọn đổi theo; bấm "Chi tiết" của Kudos; đổi ngôn ngữ VN/EN; dùng header và footer để đi tới các trang khác |

### User Journey

1. Người xem mở Awards Information từ header, footer, nút ABOUT AWARDS hoặc thẻ một giải ở trang chủ; không cần đăng nhập.
2. Người xem thấy tiêu đề "Hệ thống giải thưởng SAA 2025", menu sáu giải bên trái và khối giải đầu tiên (hoặc khối của giải họ đã bấm ở trang chủ).
3. Người xem bấm một mục menu — trang cuộn mượt tới giải đó và mục đó sáng lên, mục trước tắt.
4. Người xem cuộn tay xuống đọc các giải kế tiếp — mục đang chọn đi theo khối đang xem.
5. Người xem đọc số lượng và giá trị của giải; với Signature thấy hai mức giá trị ngăn bằng chữ "Hoặc".
6. Người xem cuộn tới khối Sun* Kudos và bấm "Chi tiết" để sang trang Sun* Kudos.
7. Khi cần, người xem chọn EN ở bộ chọn ngôn ngữ — chữ giao diện đổi sang tiếng Anh, mô tả dài vẫn tiếng Việt.

## 7. User Stories

### US022 — Mở trang Hệ thống giải

**Actor:** Người xem
**Goal:** Vào được trang Awards Information từ liên kết có sẵn hoặc bằng địa chỉ trực tiếp, dù đã đăng nhập hay chưa.
**Business value:** Liên kết "Awards Information" ở trang chủ có đích thật, người xem biết chi tiết giải mà không phải đăng nhập.

**Acceptance Criteria:**
- [ ] Khách chưa đăng nhập mở trang thấy đủ nội dung, không bị chuyển sang màn hình đăng nhập.
- [ ] Người đã đăng nhập thấy cùng nội dung; vùng tài khoản ở header hiện theo trạng thái của họ.
- [ ] "Awards Information" ở header đang chọn, "About SAA 2025" không còn đang chọn.
- [ ] "Awards Information" ở footer cũng đang chọn, theo kiểu riêng của footer (nền nhạt, ánh sáng, không gạch chân); trang chủ không có liên kết nào ở footer đang chọn.
- [ ] Bấm thẻ một giải ở trang chủ mở trang này và cuộn tới đúng giải.

### US023 — Xem chi tiết sáu giải thưởng

**Actor:** Người xem
**Goal:** Đọc tên, mô tả, số lượng và giá trị của từng giải trong sáu giải.
**Business value:** Người xem hiểu giải nào vinh danh ai và giá trị bao nhiêu, đúng thông tin chính thức của ban tổ chức.

**Acceptance Criteria:**
- [ ] Sáu khối theo thứ tự Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 - Creator, MVP, mỗi khối có ảnh, tên, mô tả dài, số lượng và đơn vị, giá trị.
- [ ] Top Talent hiện "10 Cá nhân" và "7.000.000 VNĐ cho mỗi giải thưởng".
- [ ] Signature hiện hai mức "5.000.000 VNĐ cho giải cá nhân" và "8.000.000 VNĐ cho giải tập thể" ngăn bằng "Hoặc".
- [ ] Best Manager và MVP không có dòng ghi chú dưới số tiền.
- [ ] Không có giải hoặc không đọc được dữ liệu thì thấy thông báo thay cho menu và khối, tiêu đề trang vẫn còn.

### US024 — Nhảy tới một giải bằng menu

**Actor:** Người xem
**Goal:** Bấm tên một giải ở menu bên trái để tới thẳng khối của giải đó.
**Business value:** Người xem không phải cuộn dài để tìm giải mình quan tâm.

**Acceptance Criteria:**
- [ ] Bấm từng mục thì trang cuộn tới đúng khối giải tương ứng.
- [ ] Sau mỗi lần bấm chỉ mục vừa bấm có chữ vàng và gạch chân, mục trước đó mất đánh dấu.
- [ ] Rê chuột vào một mục thì mục đó được làm nổi.
- [ ] Người xem bật giảm chuyển động thì trang nhảy tức thì tới khối giải.

### US025 — Thấy mục đang xem được tô sáng

**Actor:** Người xem
**Goal:** Biết mình đang đọc giải nào dù cuộn tay hay mở trang bằng neo.
**Business value:** Người xem không lạc vị trí trong trang dài và các liên kết từ trang chủ tới đúng giải.

**Acceptance Criteria:**
- [ ] Cuộn tay qua từng khối thì mục đang chọn đổi theo khối đang ở trong tầm nhìn, luôn đúng một mục.
- [ ] Mở trang kèm neo của một giải hợp lệ thì trang ở đúng giải đó và mục tương ứng đang chọn.
- [ ] Mở trang kèm neo không khớp giải nào thì không có lỗi, trang ở đầu và mục đầu tiên đang chọn.

### US026 — Đi tới Sun* Kudos từ cuối trang

**Actor:** Người xem
**Goal:** Đọc phần giới thiệu Sun* Kudos ở cuối trang và bấm "Chi tiết" để tìm hiểu thêm.
**Business value:** Người xem biết hoạt động ghi nhận đồng nghiệp là một phần của quá trình chọn người đạt giải.

**Acceptance Criteria:**
- [ ] Khối Kudos hiện nhãn "Phong trào ghi nhận", tiêu đề "Sun* Kudos", đoạn mô tả và nút "Chi tiết".
- [ ] Bấm "Chi tiết" chuyển tới trang Sun* Kudos; trang đó chưa xây thì người xem thấy trang không tìm thấy mặc định.

### US027 — Đọc trang bằng VN hoặc EN

**Actor:** Người xem
**Goal:** Đổi chữ giao diện của trang sang tiếng Anh hoặc về tiếng Việt.
**Business value:** Người xem không đọc được tiếng Việt vẫn hiểu các nhãn và giá trị chính của giải.

**Acceptance Criteria:**
- [ ] Mặc định "VN"; chọn EN thì tiêu đề, nhãn số lượng và giá trị, ghi chú, đơn vị, "Hoặc", nhãn Kudos đổi sang tiếng Anh.
- [ ] Tên giải, mô tả dài và đoạn Kudos vẫn tiếng Việt.
- [ ] Tải lại trang thì lựa chọn ngôn ngữ vẫn được nhớ.

## 8. Scenarios

### US022 — Happy Path

**Given** khách chưa đăng nhập đang ở trang chủ, **When** bấm "Awards Information" ở header, **Then** trang Awards Information hiện đủ nội dung, không có màn hình đăng nhập chen vào, và liên kết đó ở header đang chọn.

### US022 — Error: Trang bị truy cập bằng địa chỉ sai

**Given** người xem gõ địa chỉ cũ `/he-thong-giai`, **When** trang tải, **Then** thấy trang không tìm thấy mặc định vì địa chỉ này không tồn tại.

### US023 — Happy Path

**Given** người xem ở trang Awards Information với dữ liệu seed, **When** cuộn qua sáu khối, **Then** thấy đủ tên, mô tả, số lượng và giá trị như Figma, Signature có hai mức giá trị.

### US023 — Error: Không đọc được dữ liệu giải

**Given** dữ liệu giải thưởng rỗng hoặc không đọc được, **When** người xem mở trang, **Then** tiêu đề trang vẫn hiện, menu và khối giải được thay bằng "Thông tin giải thưởng sẽ sớm được cập nhật.", khối Kudos và footer vẫn hiện.

### US024 — Happy Path

**Given** người xem ở đầu trang, **When** bấm "Top Talent" rồi bấm "MVP", **Then** mỗi lần trang cuộn tới đúng khối, chỉ mục vừa bấm đang chọn và mục trước tắt.

### US024 — Error: Người xem bật giảm chuyển động

**Given** thiết bị bật giảm chuyển động, **When** bấm một mục menu, **Then** trang nhảy tức thì tới khối giải, không có hoạt ảnh cuộn, mục vừa bấm đang chọn.

### US025 — Happy Path

**Given** người xem ở đầu trang, **When** cuộn tay xuống khối thứ ba rồi thứ tư, **Then** mục menu đang chọn đổi từ "Top Project Leader" sang "Best Manager", luôn đúng một mục.

### US025 — Error: Neo không khớp giải nào

**Given** địa chỉ là `/awards-information#does-not-exist`, **When** trang tải, **Then** không có lỗi, trang ở đầu và "Top Talent" đang chọn.

### US026 — Happy Path

**Given** người xem cuộn tới cuối trang, **When** bấm "Chi tiết" ở khối Sun* Kudos, **Then** trình duyệt chuyển tới trang Sun* Kudos.

### US026 — Error: Trang Sun* Kudos chưa xây

**Given** trang Sun* Kudos chưa có, **When** bấm "Chi tiết", **Then** người xem thấy trang không tìm thấy mặc định, trang Awards Information không bị lỗi.

### US027 — Happy Path

**Given** ngôn ngữ đang là VN, **When** chọn EN ở bộ chọn ngôn ngữ, **Then** chữ giao diện (tiêu đề, nhãn, ghi chú, đơn vị, "Or") đổi sang tiếng Anh còn mô tả dài vẫn tiếng Việt.

### US027 — Error: Giá trị ngôn ngữ lạ

**Given** cookie ngôn ngữ mang giá trị không phải VN hay EN, **When** mở trang, **Then** trang hiện tiếng Việt và bộ chọn ghi "VN".

## 9. Edge Cases

| Scenario | What Happens | User-Facing Message |
|----------|--------------|----------------------|
| Neo trên địa chỉ không khớp giải nào | Trang ở đầu, mục đầu tiên đang chọn, không lỗi | None — silent handling |
| Dữ liệu giải rỗng hoặc truy vấn lỗi | Giữ tiêu đề, thay menu và khối bằng thông báo, ghi lỗi ở máy chủ, khối Kudos và footer vẫn hiện | "Thông tin giải thưởng sẽ sớm được cập nhật." |
| Một giải có dữ liệu hỏng | Giải đó bị bỏ qua cả ở menu lẫn khối, các giải còn lại vẫn hiện | None — silent handling |
| Một giải không có mức giá trị nào | Khối vẫn hiện tên, mô tả, số lượng; không có dòng "Giá trị giải thưởng" | None — silent handling |
| Vừa bấm menu, trang còn đang cuộn qua các khối ở giữa | Chỉ mục vừa bấm được đánh dấu, các mục đi qua không nhấp nháy | None — silent handling |
| Thiết bị bật giảm chuyển động | Bấm menu nhảy tức thì, không cuộn mượt | None — silent handling |
| Bấm "Chi tiết" của Kudos khi trang Sun* Kudos chưa xây | Hiện trang không tìm thấy mặc định của hệ thống | Trang không tìm thấy mặc định |
| Khổ màn hình nhỏ | Menu thành thanh tab cuộn ngang, ảnh xếp trên nội dung của mỗi khối | None — silent handling |
| Ngôn ngữ EN | Chữ giao diện tiếng Anh; mô tả dài, đoạn Kudos và tên giải vẫn như bản tiếng Việt | None — silent handling |
| Khách chưa đăng nhập mở trang | Thấy đủ nội dung, không bị chuyển hướng; vùng tài khoản hiện nút đăng nhập | None — silent handling |

## 10. Edge Behaviours to Verify

- **FR-101** → Khách và người đã đăng nhập đều mở được trang, không bị chuyển sang màn hình đăng nhập
- **FR-102** → "Awards Information" ở header chữ vàng và gạch chân; "About SAA 2025" chữ trắng
- **FR-202** → Menu có đúng sáu mục theo thứ tự đã nêu, nhãn ngắn "Signature 2025 Creator" và "MVP"
- **FR-203** → Sáu khối đủ ảnh, tên, mô tả, số lượng, giá trị, đúng chữ Figma
- **FR-204** → Top Talent hiện "10 Cá nhân"; số lượng các giải còn lại hiện hai chữ số
- **FR-205** → Signature hiện hai mức với chữ "Hoặc" ở giữa
- **FR-206** → Best Manager và MVP không có dòng ghi chú; ba giải đầu có "cho mỗi giải thưởng"
- **FR-207** → Ảnh nằm trái ở khối 1, 3, 5 và phải ở khối 2, 4, 6 trên máy tính; khối cuối không có đường kẻ phía dưới
- **FR-208** → Khối Kudos hiện nhãn, tiêu đề, mô tả và nút "Chi tiết"
- **FR-209** → Dữ liệu rỗng hoặc lỗi vẫn hiện tiêu đề, thông báo, khối Kudos và footer
- **FR-401** → Bấm từng mục menu cuộn đúng khối, khối không bị header che, chỉ mục vừa bấm sáng
- **FR-402** → Cuộn tay thì mục đang chọn đi theo khối đang xem, luôn đúng một mục
- **FR-403** → Mở kèm neo hợp lệ (ví dụ từ thẻ ở trang chủ) tới đúng giải và đánh dấu đúng mục
- **FR-404** → Neo lạ không gây lỗi, trang ở đầu, mục đầu tiên đang chọn
- **FR-405** → Bật giảm chuyển động thì bấm menu cuộn tức thì
- **FR-407** → "Chi tiết" của Kudos dẫn tới trang Sun* Kudos
- **FR-408** → Chọn EN đổi chữ giao diện; mô tả dài và đoạn Kudos giữ tiếng Việt; tải lại vẫn nhớ
- **FR-601** → Khách không thể sửa dữ liệu giải thưởng; không ai bị chuyển hướng khỏi trang

## 11. Risks & Known Issues

| ID | Type | Description | Impact | Status |
|----|------|--------------|--------|--------|
| RISK-01 | risk | Test case ID-0, ID-1, ID-2 dùng địa chỉ `/he-thong-giai` và ID-1 mong khách bị chuyển tới đăng nhập, trái với quyết định D001 và D002; ID-6 còn ghi Top Talent "10 Đơn vị", khác Figma | QA chạy theo test case gốc sẽ báo lỗi giả hoặc xác nhận nhầm hành vi | [EXPECTED] test case được sửa theo D001, D002, D005 |
| RISK-02 | risk | Trạng thái "đang chọn" của header hiện luôn gắn cứng cho "About SAA 2025" ở trang chủ; feature này làm nó đổi theo từng trang | Trang chủ có thể lệch hành vi nếu mặc định không giữ nguyên; tài liệu F002 mô tả "luôn đang chọn" sẽ cũ | [RESOLVED] header mặc định chọn "About SAA 2025" khi không truyền trang hiện tại nên trang chủ giữ hành vi cũ; tài liệu F002 đã cập nhật (2026-10-09) |
| RISK-03 | risk | Bảng giải thưởng được mở rộng thêm cột và có bảng mức giá trị mới trong khi trang chủ và bộ test schema đang đọc bảng này | Thêm cột sai cách (đổi cột cũ, đổi quyền) làm vỡ trang chủ hoặc test quyền đọc/ghi | [EXPECTED] chỉ thêm, không đổi cột cũ; trang chủ chọn cột tường minh nên không đổi |
| RISK-04 | risk | Chữ EN của nhãn, đơn vị, ghi chú là bản dịch tạm, chưa phải bản chính thức (D012) | Người xem tiếng Anh thấy chữ chưa chuẩn; có thể phải đổi lại sau | đang chờ xác nhận (D012) |
| RISK-05 | risk | Trang Sun* Kudos chưa xây nên "Chi tiết" ở khối Kudos dẫn tới trang không tìm thấy; test case ID-12 mong "mở trang Sun* Kudos" và ID-14 mong "trang 404 thân thiện" | ID-12 chưa thể đạt, ID-14 chỉ đạt ở mức trang lỗi mặc định | [EXPECTED] chấp nhận cho tới khi trang Sun* Kudos được xây (D007) |
| RISK-06 | risk | Khối giải cuối (MVP) nằm gần cuối trang nên có thể không bao giờ lên tới vị trí chuẩn khi cuộn tay | Mục MVP có thể không sáng khi cuộn tới cuối trang nếu không xử lý riêng | [EXPECTED] mục cuối được chọn khi đã cuộn tới cuối trang (DEC-004) |

## 12. Dependencies

| Dependency | Type | Why this feature needs it | Evidence |
|------------|------|-----------------------------|----------|
| F002_HomepageSaa | feature | Dùng lại vỏ trang, header, footer, khối Sun* Kudos; trang chủ trỏ vào đây bằng liên kết kèm neo của từng giải, và dữ liệu giải thưởng cơ bản của F002 được mở rộng | FR-001, FR-002, FR-101, FR-208 |
| F003_AccountMenuAdminRole | feature | Vùng tài khoản và chuông trong header là của F003, trang này chỉ giữ chỗ cho vùng đó | FR-101 |
| F001_LoginWithGoogle | feature | Quy tắc làm mới phiên ở mọi lần mở trang thuộc F001; trang này chỉ thêm địa chỉ của mình vào phạm vi đó và không bắt đăng nhập | FR-601 |
| Dữ liệu chi tiết giải thưởng | data | Mô tả dài, số lượng, đơn vị, mức giá trị, nhãn menu của sáu giải; chỉ có dữ liệu seed local | FR-001, BR-005 |
| Cơ sở dữ liệu Supabase local | infrastructure | Nơi lưu dữ liệu giải và áp quyền đọc công khai | FR-001, FR-601 |

## 13. Configuration

N/A — no user-facing configuration constants for this feature.
