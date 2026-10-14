---
status: implemented
fcode: F009
authored_by: takumi
created: 2026-10-12
lang: vi
---

# Functional Spec — F009_KudosPersonalSidebar

**Priority**: P2
**Type**: ui
**Generated**: 2026-10-12

**See also:** [`technical-spec.md`](./technical-spec.md) — endpoints, Source citations, pseudocode,
key entities, and DB writes for a Dev/QA/SA audience.

**Traceability:** F009_KudosPersonalSidebar → SCR006_SunKudosLiveBoard (vùng sidebar) → US054, US055, US056, US057 (mã US toàn cục, tiếp sau F008)

## 1. Overview

**Problem:** Trang Sun* Kudos - Live board cần một cột bên phải để Sunner thấy thành tích kudos của chính mình (kudos nhận/gửi, tim, Secret Box) và để mọi người thấy ai vừa nhận quà; khách chưa đăng nhập không có số liệu cá nhân nên cần được mời đăng nhập thay vì thấy khối trống.
**Solution:** Cột bên phải có hai khối. Khối thống kê cá nhân (D.1): người đã đăng nhập thấy năm con số của mình và nút "Mở Secret Box" (chưa làm gì), khách thấy lời nhắc đăng nhập. Khối danh sách "10 SUNNER NHẬN QUÀ MỚI NHẤT" (D.3): ai cũng thấy 10 hộp quà đã mở gần nhất, bấm vào một hàng thì tới hồ sơ Sunner (khách thì tới đăng nhập).
**Scope:** Khối D.1 và D.3 của cột bên phải, bảng Secret Box được seed làm nguồn số liệu và danh sách quà, các trạng thái chờ, rỗng và không xác định được số liệu.
**Non-Scope:** Mở Secret Box thật và hộp thoại của nó; danh sách khuyến mãi trong đặc tả D (không có thiết kế); xem trước hồ sơ khi rê chuột; danh hiệu Hero và sao ở sidebar; cập nhật số liệu trực tiếp khi đang xem; trang hồ sơ `/profiles/[id]` (chỉ có liên kết tới trang dự kiến); vỏ trang, bố cục hai cột, thẻ kudos và bảng Sunner/kudos (thuộc Kudos Board Browse); luật tính tim (thuộc Kudos Hearts).

**Actors**

| Actor | Description | Primary goal |
|-------|--------------|---------------|
| Khách chưa đăng nhập | người mở `/sun-kudos` khi chưa có phiên | biết cần đăng nhập để xem thống kê của mình, và vẫn xem được ai vừa nhận quà |
| Sunner đã đăng nhập | người có phiên hợp lệ và hồ sơ Sunner | nắm số kudos, tim và Secret Box của mình, xem ai vừa nhận quà, mở hồ sơ người đó |

## 2. Functional Capabilities

| ID | Capability | What the user can do | User Stories | Requirements | Business Rules | Screens |
|----|------------|------------------------|-----------------|---------------|-------------------|---------|
| CAP-01 | Thống kê cá nhân (D.1) | Sunner đã đăng nhập xem số Kudos nhận và gửi, số tim, số Secret Box đã mở và chưa mở của mình; khách thấy lời nhắc đăng nhập thay cho khối này | US054, US055 | FR-001, FR-101, FR-201, FR-202, FR-203, FR-204, FR-205, FR-206, FR-207, FR-208, FR-209, FR-214, FR-601, FR-602 | BR-001, BR-002, BR-004, DEC-001 | SCR006_SunKudosLiveBoard |
| CAP-02 | Danh sách Sunner nhận quà (D.3) | Ai cũng xem 10 hộp quà đã mở gần nhất và bấm một hàng để tới hồ sơ người nhận (khách tới đăng nhập) | US056, US057 | FR-102, FR-210, FR-211, FR-212, FR-213, FR-215 | BR-003, DEC-002 | N/A — nằm trên vùng sidebar của màn hình Sun* Kudos Live board, đã tính ở CAP-01 |

## 3. Open Decisions

Cả ba mục dưới đây đã chốt ở clarifications.md (lượt "spec gaps" ngày 2026-10-12) và chỉ ghi lại để tra cứu; riêng chữ của lời nhắc đăng nhập là chữ tạm, chờ người sở hữu nội dung.

| D### | Decision | Default proposal | Rationale | Blocks work |
|------|----------|-------------------|-----------|--------------|
| D001 | Lời nhắc đăng nhập của khách ghi chữ gì và có nút hay chỉ là liên kết? (thiết kế chỉ vẽ trạng thái đã đăng nhập) | **Đã chốt:** dòng chữ "Đăng nhập để xem thống kê Kudos của bạn" kèm một nút "Đăng nhập" tới `/login` (chữ tạm); EN: "Log in to see your Kudos stats" / "Login" | Dùng lại kiểu nút "Đăng nhập" của header, không cần biểu tượng mới | no |
| D002 | Người đã đăng nhập nhưng không xác định được số liệu (lỗi đọc, hoặc chưa có hồ sơ Sunner) thì khối D.1 hiện gì? | **Đã chốt:** năm giá trị hiện "—", nút "Mở Secret Box" vẫn hiện; số 0 thật vẫn hiện "0" | Không báo số 0 sai khi thật ra là lỗi; trang không vỡ | no |
| D003 | Danh sách quà tính theo hộp hay theo Sunner: một Sunner mở nhiều hộp gần đây thì xuất hiện một hay nhiều hàng? | **Đã chốt:** theo hộp: mỗi hộp đã mở một hàng (khớp quyết định "10 hộp mở gần nhất"), nên một Sunner có thể xuất hiện nhiều lần | Đơn giản nhất, không cần gom theo người; tiêu đề "10 SUNNER" của Figma coi như nhãn | no |

## 4. Requirements

### Foundation (0xx)

- **FR-001** Dữ liệu Secret Box nằm trong một bảng seed duy nhất: mỗi hộp thuộc một Sunner, có tên quà và thời điểm mở (trống nghĩa là chưa mở).

### Navigation (1xx)

- **FR-101** Sidebar nằm ở cột bên phải của `/sun-kudos` cạnh danh sách All Kudos, cuộn độc lập với trang; khối thống kê đứng trên, danh sách quà đứng dưới.
- **FR-102** Bấm một hàng trong danh sách quà: người đã đăng nhập tới `/profiles/[id]` của Sunner đó (trang dự kiến, hiện báo 404), khách tới `/login`.

### Sidebar (2xx)

- **FR-201** Khối thống kê liệt kê theo thứ tự: Số Kudos bạn nhận được, Số Kudos bạn đã gửi, Số tim bạn nhận được, đường kẻ, Số Secret Box bạn đã mở, Số Secret Box chưa mở, rồi nút "Mở Secret Box".
- **FR-202** "Số Kudos bạn nhận được" là số kudos mà người dùng là người nhận.
- **FR-203** "Số Kudos bạn đã gửi" là số kudos mà người dùng là người gửi, kể cả kudos gửi ẩn danh; số này lấy từ hàm `get_my_sent_kudos_count()` (F010) vì trình duyệt không đọc được người gửi của kudos.
- **FR-204** "Số tim bạn nhận được" là tổng tim người dùng đã kiếm với tư cách người gửi kudos (theo luật tim của Kudos Hearts), không phải tim trên các kudos họ nhận. Chỉ chính chủ thấy con số này; không ai đọc được tổng tim của người khác (F010 review C2).
- **FR-205** "Số Secret Box bạn đã mở" và "chưa mở" là số hộp của chính người dùng có và không có thời điểm mở.
- **FR-206** Nút "Mở Secret Box" hiển thị đúng thiết kế nhưng chưa làm gì: không hộp thoại, không đổi số liệu.
- **FR-207** Khách thấy lời nhắc đăng nhập gồm một dòng chữ và nút "Đăng nhập" tới `/login` thay cho cả khối thống kê, kể cả nút "Mở Secret Box" (D001).
- **FR-208** Trong lúc đọc phiên và số liệu, khối thống kê là khung giữ chỗ kích thước cố định, không chữ, nên người đã đăng nhập không thấy lời nhắc đăng nhập nhấp nháy.
- **FR-209** Người đã đăng nhập mà không xác định được số liệu (lỗi đọc, chưa có hồ sơ Sunner) thì năm giá trị hiện "—" và nút vẫn hiện; giá trị bằng 0 thật hiện "0".
- **FR-210** Danh sách quà có tiêu đề "10 SUNNER NHẬN QUÀ MỚI NHẤT"; mỗi hàng gồm avatar tròn, tên Sunner in đậm và dòng "Nhận được 1 <tên quà>".
- **FR-211** Danh sách là 10 hộp đã mở gần nhất, hộp mở sau cùng ở trên cùng; ít hơn 10 thì hiện bấy nhiêu; khách cũng thấy.
- **FR-212** Danh sách rỗng thì hiện "Chưa có dữ liệu".
- **FR-213** Trong lúc đọc dữ liệu, danh sách quà là khung giữ chỗ không chữ, cùng kích thước.
- **FR-214** Nhãn của khối thống kê và lời nhắc đăng nhập dịch theo ngôn ngữ đang chọn (VN/EN).
- **FR-215** Tiêu đề và câu mô tả của danh sách quà dịch theo ngôn ngữ; tên Sunner và tên quà giữ nguyên như dữ liệu.

### Security (6xx)

- **FR-601** Thống kê cá nhân chỉ của chính người đang đăng nhập; máy chủ xác định người dùng từ phiên, không nhận mã người dùng từ trình duyệt hay đường dẫn; hàng Sunner của người xem được tra bằng một hàm của cơ sở dữ liệu chỉ trả hàng của chính người gọi, email và mã tài khoản của Sunner không mở cho trình duyệt.
- **FR-602** Trình duyệt không ghi được dữ liệu Secret Box; hộp chưa mở của người khác không đọc được, hộp đã mở của mọi người đọc công khai.

## 5. Business Rules

- Một hộp "đã mở" khi có thời điểm mở, "chưa mở" khi thời điểm mở trống; số hộp và danh sách quà đều suy từ đây, không có số đếm lưu riêng (BR-001)
- "Số tim bạn nhận được" lấy từ tổng tim người gửi do Kudos Hearts giữ, sidebar không tự cộng lại từ lượt thích (BR-002)
- Danh sách quà gồm 10 hộp đã mở gần nhất, mỗi hộp một hàng, hộp chưa mở không bao giờ vào danh sách (BR-003)
- Thống kê cá nhân chỉ tính cho người đang đăng nhập và quyết ở máy chủ; ẩn với khách là giao diện, quyền đọc dữ liệu riêng do cơ sở dữ liệu chặn (BR-004)
- Khối thống kê: đang đọc thì giữ chỗ không chữ; khách thì lời nhắc đăng nhập; đã đăng nhập đủ số liệu thì năm giá trị và nút; không xác định được số liệu thì "—" (DEC-001)
- Danh sách quà: đang đọc thì giữ chỗ không chữ; rỗng thì "Chưa có dữ liệu"; có hàng thì liên kết tới hồ sơ nếu đã đăng nhập, tới đăng nhập nếu là khách (DEC-002)

## 6. Screens

| Screen Name | SCR### | What User Sees | What User Can Do |
|-------------|--------|-----------------|-------------------|
| Sun* Kudos - Live board — vùng sidebar bên phải (D) | SCR006_SunKudosLiveBoard | khối thống kê cá nhân (năm số liệu và nút "Mở Secret Box", hoặc lời nhắc đăng nhập cho khách) rồi danh sách "10 SUNNER NHẬN QUÀ MỚI NHẤT" | khách bấm lời nhắc để tới đăng nhập; mọi người bấm một hàng quà (đã đăng nhập tới hồ sơ, khách tới đăng nhập); bấm "Mở Secret Box" chưa có tác dụng |

Đây là một vùng của màn hình `/sun-kudos`, không phải màn hình riêng; vỏ màn hình thuộc Kudos Board Browse.

### User Journey

1. Người xem mở `/sun-kudos` và thấy cột bên phải cạnh danh sách All Kudos; trong lúc dữ liệu đang đọc, hai khối là khung giữ chỗ.
2. Khách thấy lời nhắc đăng nhập ở khối trên; bấm vào thì sang màn hình đăng nhập.
3. Sunner đã đăng nhập thấy số kudos nhận, kudos gửi, tim và Secret Box đã mở/chưa mở của mình; bấm "Mở Secret Box" thì chưa có gì xảy ra.
4. Cả hai thấy danh sách 10 Sunner nhận quà mới nhất ở khối dưới; cột cuộn riêng khi dài.
5. Sunner đã đăng nhập bấm một hàng và tới hồ sơ người đó (hiện báo 404 vì trang chưa xây); khách bấm thì tới màn hình đăng nhập.

## 7. User Stories

### US054 — Xem thống kê Kudos cá nhân

**Actor:** Sunner đã đăng nhập
**Goal:** Nhìn nhanh số kudos đã nhận và gửi, số tim kiếm được và tình trạng Secret Box của mình.
**Business value:** Sunner thấy ngay thành tích của mình nên có động lực tiếp tục gửi và ghi nhận kudos.

**Acceptance Criteria:**
- [ ] Khối hiện năm giá trị theo thứ tự: kudos nhận, kudos gửi, tim nhận được, Secret Box đã mở, Secret Box chưa mở.
- [ ] Giá trị khớp dữ liệu của chính người dùng; giá trị bằng 0 hiện "0".
- [ ] Nút "Mở Secret Box" hiển thị nhưng bấm không có tác dụng.
- [ ] Không xác định được số liệu thì năm giá trị hiện "—".

### US055 — Được mời đăng nhập thay cho thống kê

**Actor:** Khách chưa đăng nhập
**Goal:** Biết rằng thống kê cá nhân cần đăng nhập và đi tới đăng nhập chỉ bằng một lần bấm.
**Business value:** Khách không thấy khối trống hay số liệu giả, và được dẫn vào luồng đăng nhập.

**Acceptance Criteria:**
- [ ] Khách thấy lời nhắc đăng nhập (dòng chữ và nút "Đăng nhập" tới `/login`) thay cho khối thống kê.
- [ ] Khách không thấy năm giá trị và không thấy nút "Mở Secret Box".
- [ ] Người đã đăng nhập không bao giờ thấy lời nhắc này nhấp nháy trong lúc trang đang đọc phiên.

### US056 — Xem 10 Sunner nhận quà mới nhất

**Actor:** Khách chưa đăng nhập
**Goal:** Thấy ai vừa mở hộp quà và nhận được quà gì.
**Business value:** Cho cả khách thấy phần thưởng đang diễn ra, tạo sự hào hứng tham gia.

**Acceptance Criteria:**
- [ ] Danh sách có tiêu đề "10 SUNNER NHẬN QUÀ MỚI NHẤT" và tối đa 10 hàng, mới nhất trên cùng.
- [ ] Mỗi hàng có avatar tròn, tên Sunner in đậm và dòng "Nhận được 1 <tên quà>".
- [ ] Không có hộp đã mở thì hiện "Chưa có dữ liệu".
- [ ] Hộp chưa mở không xuất hiện trong danh sách.

### US057 — Mở hồ sơ người vừa nhận quà

**Actor:** Sunner đã đăng nhập
**Goal:** Từ danh sách quà đi tới hồ sơ của người nhận.
**Business value:** Kết nối các Sunner với nhau qua ghi nhận chung.

**Acceptance Criteria:**
- [ ] Đã đăng nhập: bấm một hàng thì tới `/profiles/[id]` của Sunner đó; trang chưa xây nên hiện báo 404 và phiên vẫn còn.
- [ ] Khách: bấm một hàng thì tới `/login`.

## 8. Scenarios

### US054 — Happy Path

**Given** Sunner đã đăng nhập có số liệu seed đã biết, **When** mở `/sun-kudos`, **Then** khối thống kê hiện năm giá trị đúng với số liệu đó và nút "Mở Secret Box".

### US054 — Error: không xác định được số liệu

**Given** Sunner đã đăng nhập nhưng việc đọc số liệu lỗi hoặc chưa có hồ sơ Sunner, **When** mở `/sun-kudos`, **Then** năm giá trị hiện "—", nút "Mở Secret Box" vẫn hiện và phần còn lại của trang bình thường.

### US055 — Happy Path

**Given** khách chưa đăng nhập, **When** mở `/sun-kudos`, **Then** khối thống kê được thay bằng lời nhắc đăng nhập; bấm nút "Đăng nhập" thì tới `/login`.

### US055 — Error: phiên hết hạn

**Given** người dùng đã đăng nhập nhưng phiên hết hạn khi tải lại trang, **When** mở `/sun-kudos`, **Then** họ được xử lý như khách: thấy lời nhắc đăng nhập, không thấy số liệu cũ.

### US056 — Happy Path

**Given** có ít nhất 10 hộp đã mở, **When** ai đó mở `/sun-kudos`, **Then** danh sách hiện đúng 10 hàng theo thời điểm mở từ mới đến cũ, mỗi hàng có avatar, tên và "Nhận được 1 <tên quà>".

### US056 — Error: chưa có hộp nào được mở

**Given** chưa có hộp quà nào được mở, **When** ai đó mở `/sun-kudos`, **Then** danh sách hiện "Chưa có dữ liệu" và trang không báo lỗi.

### US057 — Happy Path

**Given** Sunner đã đăng nhập, **When** bấm một hàng trong danh sách quà, **Then** trình duyệt tới trang hồ sơ của Sunner đó (hiện 404 do trang chưa xây).

### US057 — Error: khách bấm hàng quà

**Given** khách chưa đăng nhập, **When** bấm một hàng trong danh sách quà, **Then** trình duyệt tới `/login`.

## 9. Edge Cases

| Scenario | What Happens | User-Facing Message |
|----------|--------------|----------------------|
| Khách mở trang | khối thống kê được thay bằng lời nhắc đăng nhập, không chạy truy vấn thống kê nào | "Đăng nhập để xem thống kê Kudos của bạn" và nút "Đăng nhập" (chữ tạm, D001) |
| Người đã đăng nhập chưa có hồ sơ Sunner hoặc việc đọc số liệu lỗi | năm giá trị hiện "—", nút vẫn hiện, lỗi chỉ ghi nhật ký ở máy chủ | "—" thay cho từng số |
| Người dùng chưa có kudos hay Secret Box nào | năm giá trị đều là 0 thật | "0" cho từng số |
| Chưa có hộp quà nào được mở | danh sách quà rỗng | "Chưa có dữ liệu" |
| Có ít hơn 10 hộp đã mở | hiện bấy nhiêu hàng, không độn thêm | None — silent handling |
| Một Sunner mở nhiều hộp gần đây | xuất hiện nhiều hàng, mỗi hộp một hàng (D003) | None — silent handling |
| Có hộp được mở trong lúc người dùng đang xem | không cập nhật trực tiếp; thấy khi tải lại trang | None — silent handling |
| Phiên hết hạn lúc tải lại | xử lý như khách: lời nhắc đăng nhập và hàng quà dẫn tới đăng nhập | "Đăng nhập để xem thống kê Kudos của bạn" |
| Khách cố đọc hộp chưa mở hay ghi dữ liệu Secret Box từ trình duyệt | cơ sở dữ liệu từ chối; chỉ hộp đã mở được đọc công khai | None — truy cập bị từ chối ở máy chủ, giao diện không có đường làm việc này |

## 10. Edge Behaviours to Verify

- **FR-001** → seed có hộp đã mở và chưa mở, mỗi hộp có chủ và tên quà.
- **FR-101** → sidebar nằm bên phải danh sách All Kudos, khối thống kê trên danh sách quà, cuộn riêng.
- **FR-102** → bấm hàng quà: đã đăng nhập tới `/profiles/[id]`, khách tới `/login`.
- **FR-201** → năm giá trị và nút đúng thứ tự, có đường kẻ giữa tim và Secret Box.
- **FR-202** → số kudos nhận khớp số kudos mà người dùng là người nhận.
- **FR-203** → số kudos gửi khớp số kudos mà người dùng là người gửi, kể cả kudos ẩn danh; gửi thêm một kudos ẩn danh thì số này tăng 1.
- **FR-204** → số tim bằng tổng tim người gửi, không đổi khi người dùng nhận thêm kudos.
- **FR-205** → hai số Secret Box cộng lại bằng tổng số hộp của người dùng.
- **FR-206** → bấm "Mở Secret Box": không hộp thoại, không đổi số, không điều hướng.
- **FR-207** → khách chỉ thấy lời nhắc đăng nhập, không thấy số hay nút.
- **FR-208** → người đã đăng nhập tải trang không thấy lời nhắc đăng nhập nhấp nháy.
- **FR-209** → mất dữ liệu thì thấy "—", số 0 thật thì thấy "0".
- **FR-210** → mỗi hàng quà có avatar, tên đậm và "Nhận được 1 <tên quà>".
- **FR-211** → tối đa 10 hàng, đúng thứ tự mới nhất trước, không có hộp chưa mở.
- **FR-212** → không có hộp đã mở thì thấy "Chưa có dữ liệu".
- **FR-213** → lúc chờ, danh sách là khung không chữ cùng kích thước.
- **FR-214** → đổi VN/EN thì nhãn khối thống kê đổi, số liệu không đổi.
- **FR-215** → đổi VN/EN thì tiêu đề và câu mô tả quà đổi, tên Sunner và tên quà không đổi.
- **FR-601** → người dùng A không thấy số liệu của người dùng B bằng cách nào.
- **FR-602** → từ trình duyệt không ghi được hộp, không đọc được hộp chưa mở của người khác.

## 11. Risks & Known Issues

| ID | Type | Description | Impact | Status |
|----|------|--------------|--------|--------|
| RISK-01 | risk | Sidebar đọc bảng Sunner, bảng kudos và cột tổng tim do Kudos Board Browse và Kudos Hearts tạo; nếu tên, cột hoặc hàm tra Sunner của người xem (`get_my_sunner()` của Kudos Board Browse) lệch thì số liệu D.1 sai hoặc không đọc được | Số liệu cá nhân sai hoặc hiện "—" cho mọi người dùng | [INFERRED] |
| RISK-02 | risk | Số liệu là ảnh chụp lúc tải trang, không cập nhật trực tiếp; người dùng có thể thấy số cũ tới khi tải lại | Số hiển thị chậm hơn thực tế một nhịp | [EXPECTED] |

## 12. Dependencies

| Dependency | Type | Why this feature needs it | Evidence |
|------------|------|-----------------------------|----------|
| F006_KudosBoardBrowse | feature | vỏ trang và cột bên phải, bảng Sunner (tên, avatar, kudos nhận, tổng tim), hàm tra Sunner của người xem, bảng kudos, thành phần avatar dùng chung | FR-101, FR-202, FR-210 |
| F010_KudosWrite | feature | hàm `get_my_sent_kudos_count()` đếm kudos đã gửi của chính người xem (kể cả ẩn danh), thay cho việc đếm theo `kudos.sender_id` vốn không còn đọc được từ trình duyệt | FR-203 |
| F007_KudosHearts | feature | tổng tim người gửi kiếm được cho "Số tim bạn nhận được" (cột do F006 tạo, F007 bảo trì) | FR-204, BR-002 |
| F001_LoginWithGoogle | feature | màn hình `/login` là đích của khách | FR-102, FR-207 |
| F003_AccountMenuAdminRole | feature | đọc người dùng hiện tại từ phiên để phân biệt khách và người đã đăng nhập | FR-207, FR-601 |
| F005_CountdownPrelaunch | feature | cổng trước giờ ra mắt chặn `/sun-kudos` như mọi trang | FR-101 |
| Dữ liệu Secret Box seed | data | nguồn số liệu D.1 và danh sách D.3; không có luồng nào tạo hay mở hộp trong phạm vi này | FR-001, FR-205, FR-211 |
| Trang hồ sơ `/profiles/[id]` | feature | đích của hàng quà; chưa xây nên báo 404 | FR-102 |

## 13. Configuration

```text
KUDOS_GIFT_LIST_LIMIT = 10   # số hộp quà đã mở hiển thị trong danh sách "10 SUNNER NHẬN QUÀ MỚI NHẤT"
```
