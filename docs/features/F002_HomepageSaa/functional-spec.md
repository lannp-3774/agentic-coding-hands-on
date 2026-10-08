---
authored_by: rebuild-spec
---
<!-- layout-exempt: rebuild-spec owns all docs/system|features|generated|flows paths — all references here are output targets or internal definitions -->
<!-- Contract: references/feature-spec-researcher-contract.md -->

# Functional Spec — F002_HomepageSaa

**Priority**: P0
**Type**: ui
**Generated**: 2026-10-08

**See also:** [`technical-spec.md`](./technical-spec.md) — endpoints, Source citations, pseudocode,
key entities, and DB writes for a Dev/QA/SA audience.

**Traceability:** F002_HomepageSaa → SCR003_Homepage, SCR003_Homepage/REG002_AwardsGrid → US008, US009, US010, US011, US016, US017, US018, US019 → BL001_SupabaseServerClient → ROUTE001, ROUTE003, ROUTE006

## 1. Overview

**Problem:** Người trong Sun* cần một nơi công khai để biết SAA 2025 diễn ra khi nào, ở đâu, có những hạng mục giải thưởng nào và nên đi tiếp tới trang nào; địa chỉ gốc của ứng dụng phải là cửa vào đó, không bắt đăng nhập.
**Solution:** Một trang chủ công khai theo chủ đề "ROOT FURTHER": đồng hồ đếm ngược tới sự kiện, thông tin thời gian và địa điểm, phần giới thiệu Root Further, lưới hạng mục giải thưởng, khối Sun* Kudos, cùng header và footer để đi tới các trang liên quan. Chữ giao diện có hai ngôn ngữ VN và EN.
**Scope:** Vỏ trang và bố cục header (logo, ba liên kết, bộ chọn ngôn ngữ, chỗ dành cho vùng tài khoản); hero với đồng hồ đếm ngược và thông tin sự kiện; nội dung Root Further; lưới thẻ giải thưởng lấy từ dữ liệu; khối Sun* Kudos; nút widget; footer; liên kết tới các trang dự kiến.
**Non-Scope:** Nội dung bên trong vùng tài khoản và chuông thông báo (nút đăng nhập, menu Hồ sơ, Đăng xuất, Trang quản trị, vai trò) thuộc feature Menu tài khoản; panel thông báo và dấu chưa đọc; menu của nút widget; việc xây các trang Awards Information, Sun* Kudos, Tiêu chuẩn chung, Hồ sơ, Quản trị; đổi đích sau đăng nhập về trang chủ (thuộc F001); dịch phần nội dung dài sang tiếng Anh; dòng mô tả phụ dưới tiêu đề mục giải thưởng (Đã gỡ 2026-10-08, thiết kế không có).

**Actors**

| Actor | Description | Primary goal |
|-------|--------------|---------------|
| Người xem trang chủ | khách chưa đăng nhập hoặc người dùng đã đăng nhập; cả hai thấy cùng nội dung công khai | nắm thông tin SAA 2025 và đi tiếp tới trang liên quan |

## 2. Functional Capabilities

| ID | Capability | What the user can do | User Stories | Requirements | Business Rules | Screens |
|----|------------|------------------------|-----------------|---------------|-------------------|---------|
| CAP-01 | Xem trang chủ và đi tới các trang liên quan | Xem hero, nội dung Root Further, khối Sun* Kudos, nút widget; dùng header, nút kêu gọi và footer để đi tới Awards Information, Sun* Kudos, Tiêu chuẩn chung hoặc cuộn về đầu trang | US008, US009, US010, US016 | FR-101, FR-102, FR-103, FR-104, FR-105, FR-201, FR-205, FR-206, FR-207, FR-208, FR-601 | BR-004, BR-007, DEC-002 | SCR003_Homepage |
| CAP-02 | Theo dõi đồng hồ đếm ngược tới sự kiện | Xem số ngày, giờ, phút còn lại cập nhật theo phút, cùng thời gian, địa điểm và dòng tường thuật của sự kiện | US018 | FR-002, FR-202, FR-203, FR-204 | BR-001, BR-002, DEC-001 | N/A — nằm trên màn hình Homepage, đã tính ở CAP-01 |
| CAP-03 | Khám phá các hạng mục giải thưởng | Xem lưới thẻ giải thưởng, bấm thẻ để mở trang thông tin giải thưởng đúng hạng mục | US011, US019 | FR-001, FR-301, FR-302, FR-303, FR-304, FR-305, FR-306, FR-307, FR-308, FR-309 | BR-003, BR-005, DEC-003 | SCR003_Homepage/REG002_AwardsGrid |
| CAP-04 | Đọc trang chủ bằng VN hoặc EN | Đổi chữ giao diện trang chủ giữa VN và EN; lựa chọn được nhớ cho lần mở sau | US017 | FR-401, FR-402, FR-403 | BR-006 | N/A — nằm trên màn hình Homepage, đã tính ở CAP-01 |

## 3. Open Decisions

| D### | Decision | Default proposal | Rationale | Blocks work |
|------|----------|-------------------|-----------|--------------|
| D001 | Thông tin sự kiện lấy theo thiết kế hay theo test case (hai bên mâu thuẫn)? | **Đã chốt (2026-10-08):** theo thiết kế Figma: "Thời gian: 26/12/2025", "Địa điểm: Âu Cơ Art Center", "Tường thuật trực tiếp qua sóng Livestream"; kỳ vọng của test case ID-14 sửa theo | Thiết kế là nguồn chính xác về hình ảnh và nội dung | no |
| D002 | Chữ tiếng Anh của phần giao diện trang chủ là gì? | **Đã chốt (2026-10-08):** EN chỉ dịch chữ giao diện (liên kết, nút, nhãn, tiêu đề mục, đơn vị đếm ngược, nhãn sự kiện, bản quyền, nhãn nút widget); giá trị ngày, địa điểm, câu livestream và nội dung dài giữ tiếng Việt. Chữ EN hiện có: "Time:", "Venue:", "Awards System", "Details", "General Standards", "Recognition movement", "Quick actions", giữ DAYS/HOURS/MINUTES; bản quyền dùng lại câu EN của màn hình Login | Chưa có bản tiếng Anh chính thức cho từng nhãn; từ điển hiện tại là bản dùng được | no |
| D003 | Năm hiển thị ở dòng thời gian sự kiện (2025 theo thiết kế) khác năm của mốc đếm ngược (2026) — giữ như vậy hay sửa? | **Đã chốt (2026-10-08):** giữ nguyên chữ theo thiết kế (26/12/2025) trong khi mốc đếm ngược là năm 2026 (người dùng chọn); ghi nhận ở § 11 (RISK-01) | Người dùng đã chốt giữ chữ Figma; người xem có thể thấy ngày hiển thị và đồng hồ lệch một năm | no |
| D004 | Vùng tài khoản trong header hiện gì với khách chưa đăng nhập? | **Đã chốt (2026-10-08):** thuộc F003_AccountMenuAdminRole: khách thấy nút chữ "Đăng nhập" (EN: "Login") đặt đúng chỗ nút tài khoản, không có chuông; trang chủ chỉ giữ chỗ cố định cho vùng này và không hiện nút "Đăng nhập" trong lúc phiên còn đang được đọc | Test case chỉ mô tả người đã đăng nhập; giữ chỗ cố định tránh nhấp nháy | no |
| D005 | Thông báo hiện trong mục giải thưởng khi không có hạng mục nào hoặc không đọc được dữ liệu? | **Đã chốt (2026-10-08):** giữ tiêu đề "Hệ thống giải thưởng" và hiện một thông báo ngắn thay cho lưới, dùng chung cho cả trường hợp rỗng và lỗi đọc: VN "Thông tin giải thưởng sẽ sớm được cập nhật.", EN "Award information will be updated soon."; lỗi đọc được ghi ở máy chủ; phần còn lại của trang vẫn hiện | Thiết kế và test case không nêu trạng thái rỗng hay lỗi của mục này | no |
| D006 | Môi trường thật có cần 6 hạng mục giải thưởng ngay không, và nạp bằng cách nào? | **Đã chốt (2026-10-08):** dữ liệu 6 hạng mục chỉ là dữ liệu seed local; dữ liệu môi trường thật nằm ngoài phạm vi feature này (cần quyết định riêng trước khi triển khai thật) | Dữ liệu mẫu chỉ chạy khi dựng lại cơ sở dữ liệu local, không tự lên môi trường thật | no |
| D007 | Ở khổ màn hình hẹp (dưới 1024 điểm ảnh), ba liên kết điều hướng của header đang bị ẩn — có cần menu thay thế không? | Giữ nguyên như hiện tại: logo, bộ chọn ngôn ngữ và vùng tài khoản vẫn hiện, footer vẫn đủ bốn liên kết; chưa làm menu thay thế | Thiết kế và test case không nêu bố cục header ở khổ hẹp; footer và nút kêu gọi ở hero vẫn dẫn tới các trang chính | no |

## 4. Requirements

### Foundation (0xx)

- **FR-001** Danh sách hạng mục giải thưởng nằm trong dữ liệu của hệ thống (mã định danh, tiêu đề VN và EN, mô tả VN, ảnh, thứ tự), có sẵn 6 hạng mục ban đầu ở môi trường phát triển.
- **FR-002** Mốc bắt đầu sự kiện được cấu hình ngoài mã nguồn, ở dạng thời điểm ISO-8601 kèm múi giờ.

### Navigation (1xx)

- **FR-101** Mở địa chỉ gốc của ứng dụng thì thấy trang chủ SAA, không cần đăng nhập; việc đưa trang chủ vào phạm vi làm mới phiên là điều kiện tiên quyết do F001 sở hữu.
- **FR-102** Header cố định ở đầu cửa sổ: logo bên trái, ba liên kết ở giữa (chỉ hiện từ khổ 1024 điểm ảnh trở lên), bên phải là bộ chọn ngôn ngữ và vùng tài khoản; vùng tài khoản luôn giữ chỗ cố định để header không dịch chuyển.
- **FR-103** Bấm logo ở header hoặc footer thì về trang chủ và, nếu đang ở trang chủ, cuộn lên đầu.
- **FR-104** "About SAA 2025" ở header luôn ở trạng thái đang chọn (chữ vàng, gạch chân) và bấm thì cuộn lên đầu; "Awards Information" và "Sun* Kudos" sáng nền khi rê chuột và dẫn tới trang tương ứng.
- **FR-105** Footer gồm logo, bốn liên kết (About SAA 2025, Awards Information, Sun* Kudos, Tiêu chuẩn chung) và dòng bản quyền; liên kết About SAA 2025 cuộn lên đầu trang.

### Homepage (2xx)

- **FR-201** Hero có ảnh nền key visual với lớp phủ tối và tiêu đề lớn "ROOT FURTHER" (trình đọc màn hình đọc được chữ tiêu đề).
- **FR-202** Ba ô DAYS, HOURS, MINUTES luôn hiện ít nhất hai chữ số, tự cập nhật theo phút mà không cần tải lại trang.
- **FR-203** Khi đã tới hoặc qua mốc, hoặc cấu hình mốc thiếu/sai, đồng hồ hiện 00 00 00 và ẩn nhãn "Coming soon"; trước khi trang sẵn sàng ba ô hiện "--"; trang không lỗi.
- **FR-204** Khối thông tin sự kiện hiện "Thời gian: 26/12/2025", "Địa điểm: Âu Cơ Art Center" và "Tường thuật trực tiếp qua sóng Livestream", chỉ để xem.
- **FR-205** Hai nút ABOUT AWARDS (nền vàng) và ABOUT KUDOS (viền) dẫn tới trang Awards Information và Sun* Kudos; cả hai đổi kiểu giống nhau khi rê chuột hoặc lấy tiêu điểm.
- **FR-206** Phần Root Further gồm chữ nền "ROOT FURTHER", năm đoạn mô tả chủ đề và câu trích "A tree with deep roots fears no storm" nằm sau đoạn thứ ba; chỉ để xem.
- **FR-207** Khối Sun* Kudos gồm nhãn "Phong trào ghi nhận", tiêu đề "Sun* Kudos", đoạn mô tả, ảnh minh họa và nút "Chi tiết" dẫn tới trang Sun* Kudos.
- **FR-208** Nút widget dạng viên thuốc màu vàng cố định ở góc phải phía dưới, có nhãn truy cập ("Hành động nhanh" / "Quick actions"); chỉ để nhìn, chưa mở menu.

### Awards (3xx)

- **FR-301** Mục giải thưởng có tiêu đề gồm chữ nhỏ "Sun* annual awards 2025" và chữ lớn "Hệ thống giải thưởng". Phần dòng mô tả phụ dưới tiêu đề: Đã gỡ (2026-10-08), thiết kế Figma không có dòng này.
- **FR-302** Các thẻ xếp lưới 3 cột từ khổ 1024 điểm ảnh, 2 cột ở khổ nhỏ hơn; mỗi thẻ có ảnh, tiêu đề, mô tả tối đa 2 dòng (quá dài thì cắt bằng dấu ba chấm) và liên kết "Chi tiết".
- **FR-303** Thẻ hiện đúng thứ tự trong dữ liệu; tiêu đề thẻ theo ngôn ngữ đang chọn, mô tả luôn tiếng Việt.
- **FR-304** Bấm ảnh, tiêu đề hoặc "Chi tiết" của thẻ thì mở trang Awards Information, tự cuộn tới đúng hạng mục; thẻ thiếu mã định danh thì mở trang đó mà không cuộn.
- **FR-305** Rê chuột vào thẻ thì thẻ nâng nhẹ, viền và ánh sáng nổi bật hơn.
- **FR-306** Không có hạng mục nào hoặc không đọc được dữ liệu thì mục giải thưởng vẫn giữ tiêu đề và hiện thông báo ngắn thay cho lưới (VN "Thông tin giải thưởng sẽ sớm được cập nhật.", EN "Award information will be updated soon."); lỗi được ghi ở máy chủ.
- **FR-307** Hạng mục có dữ liệu hỏng (thiếu cột hoặc sai kiểu) bị bỏ qua và ghi nhận ở máy chủ; các hạng mục còn lại vẫn hiện.
- **FR-308** Hạng mục có đường dẫn ảnh không dùng được thì thẻ hiện logo SAA thay cho ảnh.
- **FR-309** Trong lúc dữ liệu giải thưởng đang tải, mục hiện khung chờ sáu ô cùng kích thước lưới, không có chữ hay liên kết; hero và các khối khác không phải chờ.

### Interaction (4xx)

- **FR-401** Bộ chọn ngôn ngữ mặc định "VN"; bấm thì mở danh sách chỉ có VN và EN; bấm lại, bấm ra ngoài, nhấn Esc hoặc Tab thì đóng; mũi tên lên/xuống chuyển giữa hai mục; chọn một ngôn ngữ thì chữ giao diện đổi ngay và lựa chọn được nhớ.
- **FR-402** Ở EN chỉ chữ giao diện (liên kết, nút, nhãn, tiêu đề mục, đơn vị đếm ngược, nhãn thông tin sự kiện, bản quyền) đổi sang tiếng Anh; phần nội dung dài (Root Further, mô tả giải thưởng, đoạn Kudos) và giá trị sự kiện giữ tiếng Việt.
- **FR-403** Ngôn ngữ khai báo của tài liệu trang theo ngôn ngữ đang chọn, kể cả sau khi đổi ngôn ngữ mà không tải lại.

### Security (6xx)

- **FR-601** Trang chủ mở công khai, không cần đăng nhập; khách và người đã đăng nhập thấy cùng nội dung chung, và người xem chỉ đọc được dữ liệu giải thưởng, không sửa được.

## 5. Business Rules

- Mốc đếm ngược phải là thời điểm ISO-8601 có múi giờ; thiếu hoặc sai thì coi như không có mốc: hiện 00 00 00, ẩn "Coming soon", ghi lỗi cấu hình ở máy chủ một lần cho mỗi giá trị sai (BR-001)
- Đồng hồ đếm theo phút và làm tròn lên, chỉ về 00 khi đã tới hoặc qua mốc; mỗi ô có ít nhất hai chữ số, ô ngày dài hơn nếu còn trên 99 ngày (BR-002)
- Nội dung và thứ tự thẻ giải thưởng lấy từ dữ liệu, sắp theo thứ tự tăng dần, không viết cứng trong giao diện (BR-003)
- Liên kết tới trang chưa xây dùng địa chỉ dự kiến; trang chưa xây hiện trang không tìm thấy mặc định là chấp nhận được (BR-004)
- Liên kết của thẻ giải thưởng luôn là trang Awards Information kèm neo là mã định danh hạng mục; thiếu mã thì không kèm neo (BR-005)
- Ngôn ngữ chỉ là VN hoặc EN (mặc định VN); EN chỉ dịch chữ giao diện, nội dung dài giữ tiếng Việt cho tới khi có bản tiếng Anh chính thức (BR-006)
- Trang chủ không yêu cầu đăng nhập; đã đăng nhập hay chưa đều thấy cùng nội dung chung (BR-007)
- Đồng hồ: chưa tới mốc hợp lệ thì hiện thời gian còn lại và "Coming soon"; tới hoặc qua mốc, hoặc không có mốc hợp lệ thì hiện 00 00 00 và ẩn "Coming soon"; chưa sẵn sàng thì hiện "--" (DEC-001)
- Bấm logo hoặc "About SAA 2025" khi đang ở trang chủ thì cuộn lên đầu; liên kết sang trang khác, liên kết có neo, bấm kèm phím bổ trợ hoặc mở tab mới thì không cuộn (DEC-002)
- Mục giải thưởng: có hạng mục hợp lệ thì hiện lưới thẻ; không có hạng mục hoặc không đọc được thì giữ tiêu đề và hiện một thông báo chung thay cho lưới (DEC-003)

## 6. Screens

| Screen Name | SCR### | What User Sees | What User Can Do |
|-------------|--------|-----------------|-------------------|
| Homepage SAA | SCR003_Homepage | header cố định (logo, ba liên kết, bộ chọn ngôn ngữ, vùng tài khoản); hero "ROOT FURTHER" với đồng hồ đếm ngược, thông tin sự kiện và hai nút kêu gọi; phần Root Further; mục giải thưởng; khối Sun* Kudos; footer; nút widget cố định | đổi ngôn ngữ VN/EN; bấm liên kết, nút kêu gọi, "Chi tiết" để đi tới trang liên quan; bấm logo hoặc "About SAA 2025" để về đầu trang |
| Lưới giải thưởng | SCR003_Homepage/REG002_AwardsGrid | tiêu đề mục, sáu thẻ hạng mục (ảnh, tiêu đề, mô tả hai dòng, "Chi tiết") hoặc khung chờ hoặc thông báo thay cho lưới | bấm ảnh, tiêu đề hoặc "Chi tiết" của một thẻ để mở trang Awards Information tại đúng hạng mục |

### User Journey

1. Người xem mở trang chủ và thấy header cố định, hero "ROOT FURTHER" với đồng hồ đếm ngược và thông tin sự kiện.
2. Người xem theo dõi số ngày, giờ, phút còn lại; mỗi phút các số tự giảm mà không cần tải lại.
3. Người xem cuộn xuống đọc phần Root Further rồi tới mục "Hệ thống giải thưởng" với sáu thẻ hạng mục.
4. Người xem bấm một thẻ (hoặc "Chi tiết") và được đưa tới trang thông tin giải thưởng, cuộn đúng tới hạng mục đó.
5. Người xem quay lại, xem khối Sun* Kudos và bấm "Chi tiết" để sang trang Sun* Kudos; hoặc dùng nút ABOUT AWARDS / ABOUT KUDOS ở hero, liên kết ở header và footer.
6. Khi cần, người xem bấm bộ chọn ngôn ngữ và chọn EN — chữ giao diện đổi sang tiếng Anh, phần nội dung dài vẫn là tiếng Việt.
7. Bấm logo hoặc "About SAA 2025" bất kỳ lúc nào để quay về đầu trang chủ.

## 7. User Stories

### US008 — Mở trang Awards Information

**Actor:** Người xem trang chủ
**Goal:** Đi tới trang thông tin giải thưởng từ liên kết ở header, nút ABOUT AWARDS ở hero hoặc liên kết ở footer.
**Business value:** Trang chủ trở thành cửa vào tới thông tin chi tiết về các giải thưởng.

**Acceptance Criteria:**
- [ ] Ba phần tử cùng dẫn tới trang Awards Information: liên kết ở header, nút ABOUT AWARDS ở hero và liên kết ở footer.
- [ ] Hiện tại trang Awards Information chưa được xây nên người xem thấy trang không tìm thấy; chỉ ghi lại ý định điều hướng, không có nội dung đích.

### US009 — Mở trang Sun* Kudos

**Actor:** Người xem trang chủ
**Goal:** Đi tới trang giới thiệu Sun* Kudos từ header, nút ABOUT KUDOS ở hero, nút "Chi tiết" ở khối Kudos hoặc footer.
**Business value:** Kéo người xem tới phong trào ghi nhận đồng nghiệp ngay từ trang chủ.

**Acceptance Criteria:**
- [ ] Bốn phần tử cùng dẫn tới trang Sun* Kudos: liên kết header, nút ABOUT KUDOS, "Chi tiết" ở khối Kudos và liên kết footer.
- [ ] Khối Sun* Kudos có nhãn, tiêu đề, đoạn mô tả, ảnh minh họa và nút "Chi tiết".
- [ ] Trang Sun* Kudos chưa được xây nên hiện tại người xem thấy trang không tìm thấy.

### US010 — Mở trang Tiêu chuẩn chung

**Actor:** Người xem trang chủ
**Goal:** Đi tới trang tiêu chuẩn chung của giải thưởng từ footer.
**Business value:** Người xem tìm được tiêu chuẩn xét giải mà không cần hỏi ở nơi khác.

**Acceptance Criteria:**
- [ ] Footer có liên kết "Tiêu chuẩn chung" (EN: "General Standards"); header không có liên kết này.
- [ ] Trang đích chưa được xây nên hiện tại người xem thấy trang không tìm thấy.

### US011 — Mở chi tiết một hạng mục giải thưởng

**Actor:** Người xem trang chủ
**Goal:** Bấm vào một thẻ giải thưởng để đi tới phần chi tiết của đúng hạng mục đó.
**Business value:** Người xem đi thẳng tới mô tả chi tiết của giải mình quan tâm.

**Acceptance Criteria:**
- [ ] Ảnh, tiêu đề và "Chi tiết" của thẻ cùng dẫn tới trang Awards Information tại đúng hạng mục; chỉ tiêu đề và "Chi tiết" nằm trong thứ tự Tab, ảnh thì không để khỏi lặp.
- [ ] Hạng mục thiếu mã định danh thì mở trang Awards Information mà không cuộn tới đâu.
- [ ] Trang đích chưa được xây nên hiện tại phần cuộn tới hạng mục chưa có nơi nhận.

### US016 — Quay về đầu trang chủ

**Actor:** Người xem trang chủ
**Goal:** Cuộn ngay về đầu trang khi đang ở trang chủ mà bấm logo hoặc "About SAA 2025".
**Business value:** Người xem về đầu trang nhanh sau khi đã cuộn xuống dài.

**Acceptance Criteria:**
- [ ] Bấm logo hoặc "About SAA 2025" ở header hoặc footer khi đang ở trang chủ thì trang cuộn tức thì về đầu, không có hoạt ảnh.
- [ ] Bấm kèm Ctrl, Cmd, Shift hoặc Alt, hoặc bằng nút khác nút trái thì không cuộn trang hiện tại.
- [ ] "About SAA 2025" ở header được tô vàng và gạch chân.

### US017 — Đổi ngôn ngữ trang chủ

**Actor:** Người xem trang chủ
**Goal:** Đọc phần chữ giao diện của trang chủ bằng tiếng Việt hoặc tiếng Anh.
**Business value:** Người không đọc được tiếng Việt vẫn dùng được điều hướng và các nhãn của trang chủ.

**Acceptance Criteria:**
- [ ] Mặc định hiện "VN"; bấm bộ chọn thì mở danh sách chỉ có VN và EN, đóng bằng bấm lại, bấm ra ngoài, Esc hoặc Tab.
- [ ] Chọn EN thì chữ giao diện (liên kết, nút, nhãn, tiêu đề mục, đơn vị đếm ngược, bản quyền) đổi sang tiếng Anh; nội dung dài và giá trị sự kiện giữ tiếng Việt.
- [ ] Mở lại trang chủ vẫn thấy ngôn ngữ đã chọn, và lựa chọn cũng áp dụng cho màn hình Login.

### US018 — Xem đồng hồ đếm ngược tới sự kiện

**Actor:** Người xem trang chủ
**Goal:** Biết còn bao nhiêu ngày, giờ, phút nữa sự kiện bắt đầu, cùng thời gian và địa điểm sự kiện.
**Business value:** Tạo cảm giác chờ đợi và nhắc người xem không bỏ lỡ sự kiện.

**Acceptance Criteria:**
- [ ] Ba ô DAYS, HOURS, MINUTES hiện ít nhất hai chữ số, số một chữ số có số 0 đứng trước; trước khi trang sẵn sàng hiện "--".
- [ ] Sau một phút, số phút giảm một (hoặc giờ, ngày điều chỉnh tương ứng) mà không tải lại trang; quay lại tab đang ẩn thì số đúng ngay.
- [ ] Trước mốc thì thấy nhãn "Coming soon"; tới hoặc qua mốc, hoặc cấu hình mốc sai, thì thấy 00 00 00 và nhãn biến mất.
- [ ] Khối thông tin sự kiện hiện đúng "Thời gian: 26/12/2025", "Địa điểm: Âu Cơ Art Center" và dòng tường thuật trực tiếp theo thiết kế.

### US019 — Xem các hạng mục giải thưởng

**Actor:** Người xem trang chủ
**Goal:** Xem lưới các hạng mục giải thưởng để biết SAA 2025 có những giải nào.
**Business value:** Người xem biết có những giải nào ngay trên trang chủ.

**Acceptance Criteria:**
- [ ] Sáu thẻ hiện đúng thứ tự: Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 - Creator, MVP (Most Valuable Person).
- [ ] Lưới 3 cột từ khổ 1024 điểm ảnh, 2 cột ở khổ nhỏ hơn; mô tả tối đa 2 dòng; rê chuột vào thẻ thì thẻ nâng nhẹ.
- [ ] Khách và người đã đăng nhập đều thấy lưới; trong lúc tải hiện khung chờ sáu ô.
- [ ] Dữ liệu rỗng hoặc không đọc được thì thấy thông báo thay cho lưới, các phần khác của trang vẫn hiện.

## 8. Scenarios

### US008 — Happy Path

**Given** người xem ở trang chủ, **When** bấm "Awards Information" ở header, **Then** được đưa tới trang Awards Information.

### US008 — Error: trang đích chưa được xây

**Given** trang Awards Information chưa được xây, **When** người xem bấm một trong ba liên kết, **Then** thấy trang không tìm thấy và quay lại trang chủ được bằng nút Quay lại hoặc logo.

### US009 — Happy Path

**Given** người xem cuộn tới khối Sun* Kudos, **When** bấm "Chi tiết", **Then** được đưa tới trang Sun* Kudos.

### US009 — Error: ảnh minh họa không tải được

**Given** ảnh minh họa của khối Sun* Kudos không tải được, **When** người xem xem khối này, **Then** tiêu đề, mô tả và nút "Chi tiết" vẫn đọc và bấm được. `[EXPECTED]`

### US010 — Happy Path

**Given** người xem ở trang chủ, **When** bấm "Tiêu chuẩn chung" ở footer, **Then** được đưa tới trang Tiêu chuẩn chung.

### US010 — Error: trang đích chưa được xây

**Given** trang Tiêu chuẩn chung chưa được xây, **When** người xem bấm liên kết, **Then** thấy trang không tìm thấy.

### US011 — Happy Path

**Given** dữ liệu có đủ sáu hạng mục, **When** người xem bấm thẻ "Top Talent", **Then** trang Awards Information mở tại hạng mục Top Talent.

### US011 — Error: hạng mục thiếu mã định danh

**Given** một hạng mục không có mã định danh, **When** người xem bấm thẻ đó, **Then** trang Awards Information mở mà không cuộn tới hạng mục nào.

### US016 — Happy Path

**Given** người xem đã cuộn xuống giữa trang chủ, **When** bấm logo ở header, **Then** trang cuộn tức thì về đầu.

### US016 — Error: bấm kèm phím bổ trợ

**Given** người xem giữ Ctrl, **When** bấm logo, **Then** trang hiện tại không cuộn và trình duyệt mở trang chủ ở tab mới theo cách thường lệ.

### US017 — Happy Path

**Given** trang chủ đang ở VN, **When** người xem chọn EN trong danh sách, **Then** chữ giao diện đổi sang tiếng Anh và lần sau mở lại vẫn là tiếng Anh.

### US017 — Error: giá trị ngôn ngữ đã lưu bị hỏng

**Given** lựa chọn ngôn ngữ đã lưu không phải VN hoặc EN, **When** mở trang chủ, **Then** trang hiện bằng tiếng Việt và bộ chọn ghi "VN".

### US018 — Happy Path

**Given** mốc sự kiện hợp lệ và còn nhiều ngày, **When** người xem giữ trang mở một phút, **Then** số phút giảm một và nhãn "Coming soon" vẫn hiện.

### US018 — Error: cấu hình mốc thiếu hoặc sai định dạng

**Given** mốc đếm ngược chưa được cấu hình hoặc sai định dạng, **When** mở trang chủ, **Then** đồng hồ hiện 00 00 00, nhãn "Coming soon" không hiện và trang vẫn hiển thị bình thường.

### US019 — Happy Path

**Given** dữ liệu có đủ sáu hạng mục, **When** người xem mở trang chủ, **Then** thấy sáu thẻ đúng thứ tự, tiêu đề theo ngôn ngữ đang chọn.

### US019 — Error: không đọc được dữ liệu giải thưởng

**Given** dữ liệu giải thưởng không đọc được hoặc rỗng, **When** mở trang chủ, **Then** mục giải thưởng hiện thông báo ngắn thay cho lưới và các phần khác của trang vẫn hiện.

## 9. Edge Cases

| Scenario | What Happens | User-Facing Message |
|----------|--------------|----------------------|
| Mốc đếm ngược chưa cấu hình hoặc sai định dạng | không dừng trang; đồng hồ hiện 00 00 00, ẩn nhãn "Coming soon", lỗi cấu hình được ghi ở máy chủ một lần cho mỗi giá trị sai | None — silent handling |
| Đã tới hoặc qua mốc sự kiện | đồng hồ giữ 00 00 00 và nhãn "Coming soon" ẩn, không đếm âm | None — silent handling |
| Còn hơn 99 ngày tới sự kiện | ô ngày hiện đủ số (ba chữ số), bố cục không vỡ | None — silent handling |
| Trang mở trong tab nền rồi quay lại sau nhiều phút | khi tab hiện lại, đồng hồ tính lại ngay từ giờ hiện tại nên số hiển thị đúng | None — silent handling |
| Trang chưa sẵn sàng hoặc trình duyệt chưa chạy mã giao diện | ba ô hiện "--" và nhãn "Coming soon" ẩn | None — silent handling |
| Dữ liệu giải thưởng rỗng | mục giải thưởng giữ tiêu đề và hiện thông báo thay cho lưới | "Thông tin giải thưởng sẽ sớm được cập nhật." (EN: "Award information will be updated soon.") |
| Không đọc được dữ liệu giải thưởng | mục giải thưởng giữ tiêu đề và hiện cùng thông báo như khi rỗng, phần còn lại của trang vẫn hiện, lỗi được ghi ở máy chủ | "Thông tin giải thưởng sẽ sớm được cập nhật." (EN: "Award information will be updated soon.") |
| Một số hạng mục có dữ liệu hỏng | hạng mục hỏng bị bỏ, các hạng mục còn lại vẫn hiện; hết hạng mục hợp lệ thì như khi rỗng | None — silent handling |
| Hạng mục thiếu mã định danh | thẻ vẫn hiện, liên kết mở trang Awards Information không kèm neo | None — silent handling |
| Hạng mục có đường dẫn ảnh không dùng được | thẻ hiện logo SAA thay cho ảnh | None — silent handling |
| Mô tả hạng mục quá dài | cắt ở dòng thứ hai và thêm dấu ba chấm | None — silent handling |
| Bấm liên kết tới trang chưa xây | trình duyệt hiện trang không tìm thấy mặc định | Trang 404 mặc định của hệ thống (không có trang lỗi riêng) |
| Ngôn ngữ đã lưu không phải VN hoặc EN | dùng tiếng Việt | None — silent handling |
| Đổi ngôn ngữ không thành công | giữ nguyên ngôn ngữ hiện tại, lỗi được ghi nhận, trang không vỡ | None — silent handling |
| Bấm logo kèm Ctrl/Cmd/Shift/Alt hoặc liên kết có neo | không cuộn trang hiện tại; liên kết hành xử theo cách thường lệ của trình duyệt | None — silent handling |
| Khổ màn hình dưới 1024 điểm ảnh | ba liên kết điều hướng ở header không hiện; logo, bộ chọn ngôn ngữ, vùng tài khoản và footer vẫn dùng được | None — silent handling |
| Ảnh nền hero không tải được | chữ tiêu đề và đồng hồ vẫn đọc rõ trên nền tối `[EXPECTED]` | None — silent handling |
| Người đã đăng nhập mở trang chủ | thấy cùng nội dung chung như khách; vùng tài khoản do feature khác cung cấp | None — silent handling |
| Vùng tài khoản chưa xác định xong trạng thái đăng nhập | vùng giữ chỗ trung tính cùng kích thước, header không dịch chuyển | None — silent handling |

## 10. Edge Behaviours to Verify

- **FR-001** → Sau khi dựng lại dữ liệu local, trang chủ hiện đủ sáu hạng mục mà không cần thêm thao tác.
- **FR-002** → Đổi mốc cấu hình rồi khởi động lại thì đồng hồ tính theo mốc mới.
- **FR-101** → Địa chỉ gốc hiện trang chủ SAA, không bị chuyển sang trang đăng nhập.
- **FR-102** → Header giữ vị trí khi cuộn; logo bên trái, bộ chọn ngôn ngữ bên phải; vùng tài khoản không làm header giật khi tải; dưới 1024 điểm ảnh ba liên kết giữa header ẩn.
- **FR-103** → Bấm logo ở header hoặc footer khi đang ở trang chủ thì cuộn lên đầu.
- **FR-104** → "About SAA 2025" được tô vàng và gạch chân; bấm khi đang ở trang chủ thì cuộn lên đầu; rê chuột lên "Awards Information" thì sáng nền.
- **FR-105** → Footer có logo, bốn liên kết và bản quyền "Bản quyền thuộc về Sun* © 2025" (EN: "Copyright © 2025 Sun*"); bấm "About SAA 2025" cuộn lên đầu.
- **FR-201** → Hero có ảnh nền tối và tiêu đề "ROOT FURTHER" đọc được bằng trình đọc màn hình.
- **FR-202** → Ba ô có hai chữ số (05, 09 khi còn ít); sau một phút phút giảm một.
- **FR-203** → Tới mốc, hoặc cấu hình sai, thì 00 00 00 và không còn "Coming soon"; trước mốc thì "Coming soon" hiện dưới tiêu đề; chưa sẵn sàng thì "--".
- **FR-204** → Hiện đúng "Thời gian: 26/12/2025", "Địa điểm: Âu Cơ Art Center" và dòng tường thuật, không bấm được.
- **FR-205** → ABOUT AWARDS và ABOUT KUDOS dẫn đúng trang; rê chuột thì kiểu nút đổi như nhau.
- **FR-206** → Câu trích nằm sau đoạn thứ ba; ở EN các đoạn Root Further vẫn tiếng Việt.
- **FR-207** → Khối Kudos có nhãn, tiêu đề, mô tả, ảnh và "Chi tiết" dẫn tới Sun* Kudos.
- **FR-208** → Nút widget cố định góc phải dưới, có tên truy cập, bấm không có phản hồi.
- **FR-301** → Mục giải thưởng chỉ có chữ nhỏ và tiêu đề lớn, không có dòng mô tả phụ.
- **FR-302** → Từ 1024 điểm ảnh lưới 3 cột, nhỏ hơn thì 2 cột; mô tả tối đa 2 dòng.
- **FR-303** → Thứ tự thẻ đúng như dữ liệu; ở EN mô tả vẫn tiếng Việt.
- **FR-304** → Bấm ảnh, tiêu đề hoặc "Chi tiết" đều tới Awards Information kèm neo đúng hạng mục.
- **FR-305** → Rê chuột vào thẻ thì thẻ nâng nhẹ và viền sáng hơn.
- **FR-306** → Khi dữ liệu rỗng hoặc lỗi, mục giải thưởng giữ tiêu đề và đổi lưới thành thông báo; header, hero, Kudos, footer vẫn bình thường.
- **FR-307** → Thêm một hạng mục dữ liệu hỏng thì hạng mục đó không hiện, các thẻ còn lại vẫn đủ.
- **FR-308** → Hạng mục có đường dẫn ảnh sai thì thẻ hiện logo SAA.
- **FR-309** → Trong lúc tải, mục giải thưởng hiện sáu ô chờ không chữ; hero không bị chặn.
- **FR-401** → Mặc định "VN"; danh sách chỉ có VN và EN; bấm ra ngoài, bấm lại, Esc hoặc Tab thì đóng; chọn EN thì chữ giao diện đổi.
- **FR-402** → Ở EN, nhãn và tiêu đề mục tiếng Anh; đoạn Root Further, mô tả giải thưởng, đoạn Kudos và giá trị sự kiện vẫn tiếng Việt.
- **FR-403** → Sau khi chọn EN, ngôn ngữ khai báo của trang là tiếng Anh mà không cần tải lại.
- **FR-601** → Mở trang chủ khi chưa đăng nhập không bị chuyển hướng; người xem không có cách nào sửa dữ liệu giải thưởng từ trang.

## 11. Risks & Known Issues

| ID | Type | Description | Impact | Status |
|----|------|--------------|--------|--------|
| RISK-01 | risk | Dòng thông tin sự kiện hiện năm 2025 theo thiết kế, còn mốc đếm ngược được cấu hình là năm 2026 | người xem có thể thấy ngày hiển thị và đồng hồ lệch nhau một năm | confirmed — người dùng chấp nhận (2026-10-08) |
| RISK-02 | risk | Bản nháp cũ ghi mốc đếm ngược bị cố định lúc dựng ứng dụng; mã hiện tại đọc mốc ở mỗi lượt mở trang từ cấu hình của tiến trình máy chủ, nên đổi mốc cần khởi động lại máy chủ chứ chưa chắc cần dựng lại | đổi lịch sự kiện có thể không có hiệu lực ngay cho tới khi khởi động lại máy chủ | [UNVERIFIED] |
| RISK-03 | risk | Các liên kết tới Awards Information, Sun* Kudos, Tiêu chuẩn chung chưa có trang; công cụ kiểm tra liên kết hỏng (test case ID-59) sẽ báo lỗi cho tới khi các trang được xây | ca kiểm thử ID-59 không thể đạt trước khi các trang đích tồn tại | [EXPECTED] |
| RISK-04 | risk | Nút widget trông bấm được nhưng chưa làm gì vì chưa có danh sách tùy chọn (test case ID-54 hoãn) | người dùng bấm mà không có phản hồi | [EXPECTED] |
| RISK-05 | risk | Dữ liệu 6 hạng mục chỉ là dữ liệu seed local (dữ liệu môi trường thật ngoài phạm vi); môi trường thật có thể hiện mục giải thưởng rỗng cho tới khi nạp dữ liệu | trang chủ thật hiện thông báo "Thông tin giải thưởng sẽ sớm được cập nhật." | [INFERRED] |
| RISK-06 | known-issue | Dưới 1024 điểm ảnh, ba liên kết điều hướng ở giữa header bị ẩn và không có menu thay thế | người dùng điện thoại và máy tính bảng chỉ còn đường đi qua nút kêu gọi ở hero, các khối và footer | confirmed theo mã nguồn; có cần menu thay thế hay không xem D007 |
| RISK-07 | known-issue | Chữ số của đồng hồ dùng phông đơn cách (monospace) thay cho phông "Digital Numbers" của thiết kế vì phông này chưa được đóng gói | hình dạng chữ số khác thiết kế Figma | [INFERRED] |
| RISK-08 | known-issue | Mô tả của Top Project Leader kết thúc bằng dấu phẩy treo; mô tả của Best Manager, Signature 2025 - Creator và MVP dùng chung một câu — đúng như Figma, đã chốt giữ nguyên | nội dung giải thưởng trông như văn bản giữ chỗ cho tới khi có nội dung chính thức | confirmed — giữ nguyên Figma, theo dõi như việc nội dung (2026-10-08) |

## 12. Dependencies

| Dependency | Type | Why this feature needs it | Evidence |
|------------|------|-----------------------------|----------|
| F001_LoginWithGoogle | feature | dùng lại bộ chọn ngôn ngữ VN/EN và cách nhớ lựa chọn; sở hữu việc đưa trang chủ vào phạm vi làm mới phiên để người đã đăng nhập không bị đăng xuất bất ngờ; đích sau đăng nhập là trang chủ | FR-101, FR-401, FR-601, BR-006 |
| F003_AccountMenuAdminRole | feature | cung cấp nội dung vùng tài khoản trong header (nút "Đăng nhập" cho khách, chuông và menu cho người đã đăng nhập); trang chủ chỉ giữ chỗ cho vùng này | FR-102, SCR003_Homepage |
| Awards Information, Sun* Kudos, Tiêu chuẩn chung (trang chưa xây) | feature | đích của liên kết, nút kêu gọi, thẻ giải thưởng và footer | FR-104, FR-105, FR-205, FR-304, BR-004 |
| Dịch vụ dữ liệu Supabase (bảng giải thưởng) | external-service | nguồn dữ liệu 6 hạng mục, đọc công khai | FR-001, FR-303, FR-601 |
| Cấu hình mốc sự kiện | config | điểm tựa của đồng hồ đếm ngược | FR-002, BR-001 |
| Tài sản thiết kế từ Figma (logo, key visual, ảnh thẻ giải, ảnh Kudos, biểu tượng) | data | hiển thị đúng thiết kế | FR-201, FR-302, FR-207 |

## 13. Configuration

```text
SAA_COUNTDOWN_TARGET = 2026-12-26T18:30:00+07:00   # mốc sự kiện để đếm ngược; ISO-8601 có múi giờ; thiếu/sai thì đồng hồ về 00
COUNTDOWN_REFRESH = 1 phút                          # đồng hồ cập nhật theo phút
AWARD_GRID_COLUMNS_DESKTOP = 3                      # số cột thẻ giải thưởng từ khổ 1024 điểm ảnh
AWARD_GRID_COLUMNS_COMPACT = 2                      # số cột ở khổ nhỏ hơn 1024 điểm ảnh
AWARD_DESCRIPTION_MAX_LINES = 2                     # mô tả thẻ quá dài thì cắt bằng dấu ba chấm
DEFAULT_LOCALE = vi                                 # ngôn ngữ mặc định (hiển thị "VN"); EN chỉ dịch chữ giao diện
```
