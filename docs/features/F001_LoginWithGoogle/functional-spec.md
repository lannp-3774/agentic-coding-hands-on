---
status: draft
authored_by: takumi
created: 2026-10-07
lang: vi
---

**Priority**: P0
**Type**: ui

## 1. Overview

**Problem:** Ứng dụng SAA 2025 cần một cửa vào duy nhất để người dùng chứng minh mình là ai trước khi dùng các trang bên trong; hiện chưa có màn hình đăng nhập và chưa có trang nào được bảo vệ.
**Solution:** Người dùng đăng nhập bằng tài khoản Google ngay trên màn hình Login, rồi vào trang chính (Todo) đã được bảo vệ. Màn hình Login có hai ngôn ngữ (VN, EN); ai chưa đăng nhập đều bị đưa về Login, ai đã đăng nhập thì bỏ qua Login.
**Scope:** Màn hình Login (header, hero, nút Google, footer), chuyển ngôn ngữ VN/EN cho chữ trên màn hình Login và trang Todo, luồng đăng nhập Google và xử lý hủy/thất bại, chuyển hướng theo trạng thái đăng nhập, trang Todo tối thiểu (hiện email, nút đăng xuất).
**Non-Scope:** Đăng nhập bằng email/mật khẩu hoặc nhà cung cấp khác; đăng ký riêng; giới hạn theo tên miền hay vai trò; danh sách việc cần làm thật sự trên trang Todo; nhớ trang người dùng định vào trước khi bị chuyển sang Login; dịch toàn bộ ứng dụng ngoài màn hình Login.

**Actors**

| Actor | Description | Primary goal |
|-------|--------------|---------------|
| Khách chưa đăng nhập | người mở ứng dụng khi chưa có phiên | đăng nhập bằng tài khoản Google để vào ứng dụng |
| Người dùng đã đăng nhập | người đã có phiên hợp lệ | vào trang chính, xem tài khoản đang dùng và đăng xuất khi cần |

## 2. Functional Capabilities

| ID | Capability | What the user can do | User Stories | Requirements | Business Rules | Screens |
|----|------------|------------------------|-----------------|---------------|-------------------|---------|
| CAP-01 | Đăng nhập bằng Google | Xem màn hình Login, bấm nút Google, đăng nhập thành công để vào trang chính hoặc thấy thông báo lỗi khi hủy/thất bại | US001, US002 | FR-201, FR-202, FR-203, FR-204, FR-205, FR-401, FR-402, FR-403, FR-601 | BR-001, BR-002, BR-003, BR-006, DEC-003 | SCR001 |
| CAP-02 | Chọn ngôn ngữ màn hình Login | Chuyển chữ trên màn hình Login giữa VN và EN, lựa chọn được nhớ | US003 | FR-206, FR-404 | BR-004 | — *(nằm trên màn hình Login, đã tính ở CAP-01)* |
| CAP-03 | Điều hướng theo phiên đăng nhập | Được đưa tới đúng trang tùy đã hay chưa đăng nhập; phiên được duy trì | US004, US005 | FR-001, FR-101, FR-102, FR-103 | BR-005, DEC-001, DEC-002 | — *(áp dụng cho màn hình Login và Todo, đã tính ở CAP-01 và CAP-04)* |
| CAP-04 | Trang chính tối thiểu và đăng xuất | Xem email đang đăng nhập và đăng xuất để quay về màn hình Login | US006, US007 | FR-405, FR-406 | BR-007 | SCR002 |

## 3. Open Decisions

| D### | Decision | Default proposal | Rationale | Blocks work |
|------|----------|-------------------|-----------|--------------|
| D001 | Chữ tiếng Anh của màn hình Login (hai dòng mô tả, footer, nút, tiêu đề) là gì? Chỉ thông báo lỗi đã chốt: "Login failed. Please try again." | **Đã chốt (2026-10-07):** giữ nguyên "ROOT FURTHER" và "LOGIN With Google"; EN: "Start your journey with SAA 2025." / "Log in to explore!" / footer "Copyright © 2025 Sun*" | Thiết kế chỉ có bản tiếng Việt; tiêu đề và nhãn nút là thương hiệu nên giữ nguyên | no |
| D002 | Trang Todo (nhãn nút đăng xuất, chữ khác) có theo ngôn ngữ đã chọn không? | **Đã chốt (2026-10-07):** trang Todo dùng chung từ điển VN/EN theo cookie `NEXT_LOCALE`; nhãn nút "Đăng xuất" / "Log out" | Locale đã được đọc phía server nên dùng lại từ điển gần như không tốn công | no |
| D003 | Bố cục màn hình Login ở khổ hẹp (máy tính bảng, điện thoại) trông thế nào? | **Đã chốt (2026-10-07):** giữ nguyên bố cục, thu nhỏ tỉ lệ: header cố định trên, footer cố định dưới, nội dung hero dồn gọn theo chiều ngang | Thiết kế chỉ nêu "giữ vị trí ở mọi kích thước" mà không có khung hình riêng cho khổ hẹp | no |
| D004 | Danh sách thả xuống của bộ chọn ngôn ngữ ghi gì cho mỗi mục? | **Đã chốt (2026-10-07):** mỗi mục gồm cờ và mã ngắn "VN" / "EN", giống nhãn đang hiển thị | Nhất quán với nhãn trên bộ chọn và đủ ổn định để kiểm thử | no |

## 4. Requirements

### Foundation (0xx)

- **FR-001** Phiên đăng nhập được giữ qua các lần tải trang và tự làm mới khi còn hiệu lực, để người dùng không phải đăng nhập lại liên tục.

### Navigation (1xx)

- **FR-101** Khách chưa đăng nhập mở màn hình Login thì thấy màn hình Login.
- **FR-102** Người dùng đã đăng nhập mở màn hình Login thì được chuyển thẳng sang trang chính (Todo).
- **FR-103** Khách chưa đăng nhập mở trang chính (Todo) thì bị chuyển về màn hình Login.

### Login (2xx)

- **FR-201** Header cố định ở đầu cửa sổ: logo ở bên trái, bộ chọn ngôn ngữ ở bên phải, giữ vị trí ở mọi kích thước cửa sổ.
- **FR-202** Logo Sun* Annual Awards 2025 chỉ để nhìn, không bấm được.
- **FR-203** Phần hero có ảnh nền key visual, tiêu đề "ROOT FURTHER" và hai dòng mô tả "Bắt đầu hành trình của bạn cùng SAA 2025." và "Đăng nhập để khám phá!"; các dòng này không tương tác.
- **FR-204** Nút "LOGIN With Google" có biểu tượng Google, nằm dưới hai dòng mô tả, và nổi bóng khi rê chuột qua.
- **FR-205** Footer cố định ở cuối cửa sổ với chữ "Bản quyền thuộc về Sun* © 2025", không tương tác.
- **FR-206** Bộ chọn ngôn ngữ mặc định là "VN", có cờ Việt Nam bên trái và mũi tên xuống bên phải; rê chuột thì sáng lên và con trỏ đổi thành bàn tay; bấm thì mở danh sách ngôn ngữ.

### Interaction (4xx)

- **FR-401** Bấm nút Google thì chuyển cùng tab sang trang đăng nhập của Google; trong lúc chờ, nút bị vô hiệu và hiện biểu tượng đang tải.
- **FR-402** Xác thực Google thành công thì người dùng có phiên đăng nhập và được chuyển tới trang chính (Todo).
- **FR-403** Hủy hoặc thất bại thì quay lại màn hình Login và hiện ngay dưới nút thông báo "Đăng nhập không thành công. Vui lòng thử lại."; thông báo biến mất ở lần thử kế tiếp.
- **FR-404** Chọn một ngôn ngữ trong danh sách thì toàn bộ chữ trên màn hình Login đổi theo ngay và lựa chọn được nhớ cho lần sau.
- **FR-405** Trang chính (Todo) cho người đã đăng nhập thấy email của mình và một nút Đăng xuất; chữ trên trang theo ngôn ngữ đã chọn (VN/EN, D002).
- **FR-406** Bấm Đăng xuất thì kết thúc phiên và quay về màn hình Login.

### Security (6xx)

- **FR-601** Sau khi đăng nhập, nơi đến luôn là trang chính (Todo); không nhận địa chỉ đích do bên ngoài truyền vào.

## 5. Business Rules

- Mọi tài khoản Google đều được phép đăng nhập, không giới hạn theo tên miền hay danh sách riêng (BR-001)
- Đích sau đăng nhập luôn cố định là trang chính (Todo), không đọc từ địa chỉ yêu cầu (BR-002)
- Hủy và thất bại dùng chung một thông báo; mã lỗi nào khác hai loại này đều không hiện thông báo (BR-003)
- Ngôn ngữ chỉ là VN hoặc EN và mặc định VN; giá trị lạ hoặc thiếu được hiểu là VN (BR-004)
- Phiên không hợp lệ hoặc đã hết hạn được đối xử như chưa đăng nhập (BR-005)
- Trong lúc chờ xác thực, nút Google không bấm lại được nên không thể gửi hai yêu cầu đăng nhập chồng nhau (BR-006)
- Trang chính tự kiểm tra lại phiên mỗi lần hiển thị, không chỉ dựa vào bước chuyển hướng bên ngoài (BR-007)
- Truy cập màn hình Login: có phiên thì sang trang chính, không có phiên thì hiện màn hình Login (DEC-001)
- Truy cập trang chính: không có phiên thì về màn hình Login, không kèm thông báo lỗi (DEC-002)
- Khi Google trả người dùng về: đổi được phiên thì vào trang chính; hủy hoặc lỗi thì về màn hình Login kèm thông báo (DEC-003)

## 6. Screens

| Screen Name | SCR### | What User Sees | What User Can Do |
|-------------|--------|-----------------|-------------------|
| Login | SCR001_Login | header cố định (logo, bộ chọn ngôn ngữ), hero "ROOT FURTHER" cùng hai dòng mô tả, nút "LOGIN With Google", footer cố định; thông báo lỗi dưới nút khi hủy/thất bại | đổi ngôn ngữ VN/EN; bấm nút Google để đăng nhập |
| Todo | SCR002_Todo | email của người đang đăng nhập và nút Đăng xuất | đăng xuất |

### User Journey

1. Khách chưa đăng nhập mở ứng dụng và thấy màn hình Login bằng tiếng Việt, bộ chọn ghi "VN".
2. Khách bấm bộ chọn ngôn ngữ, chọn EN — chữ trên màn hình Login đổi sang tiếng Anh; lựa chọn được nhớ.
3. Khách bấm "LOGIN With Google" — nút bị vô hiệu và hiện biểu tượng đang tải, rồi trang đăng nhập của Google mở ra trong cùng tab.
4. Khách chọn tài khoản Google và đồng ý — hệ thống lập phiên và đưa khách tới màn hình Todo, nơi hiện email của khách.
5. Nếu khách hủy hoặc Google báo lỗi, khách quay lại màn hình Login và thấy thông báo lỗi dưới nút; bấm lại để thử tiếp.
6. Người dùng bấm Đăng xuất trên màn hình Todo — phiên kết thúc và họ về lại màn hình Login.

## 7. User Stories

### US001 — Đăng nhập bằng Google

**Actor:** Khách chưa đăng nhập
**Goal:** Đăng nhập vào ứng dụng bằng tài khoản Google của mình.
**Business value:** Cho người dùng vào ứng dụng nhanh, không phải tạo hay nhớ mật khẩu riêng.

**Acceptance Criteria:**
- [ ] Bấm "LOGIN With Google" thì nút bị vô hiệu, có biểu tượng đang tải và trình duyệt chuyển cùng tab sang Google.
- [ ] Xác thực thành công thì người dùng thấy màn hình Todo.
- [ ] Mọi tài khoản Google đều đăng nhập được.

### US002 — Thấy thông báo khi đăng nhập không thành công

**Actor:** Khách chưa đăng nhập
**Goal:** Biết đăng nhập đã không thành công và thử lại được.
**Business value:** Người dùng không bị kẹt hay phải đoán chuyện gì đã xảy ra.

**Acceptance Criteria:**
- [ ] Hủy hoặc thất bại thì quay lại màn hình Login và thấy "Đăng nhập không thành công. Vui lòng thử lại." ngay dưới nút.
- [ ] Bấm nút lần nữa thì thông báo biến mất và quá trình đăng nhập bắt đầu lại.

### US003 — Chuyển ngôn ngữ màn hình Login

**Actor:** Khách chưa đăng nhập
**Goal:** Đọc màn hình Login bằng tiếng Việt hoặc tiếng Anh.
**Business value:** Người dùng không đọc được tiếng Việt vẫn đăng nhập được mà không bị bỡ ngỡ.

**Acceptance Criteria:**
- [ ] Mặc định hiện "VN"; bấm bộ chọn thì danh sách ngôn ngữ mở ra.
- [ ] Chọn EN thì chữ trên màn hình Login đổi sang tiếng Anh.
- [ ] Mở lại màn hình Login vẫn thấy ngôn ngữ đã chọn.

### US004 — Người đã đăng nhập bỏ qua màn hình Login

**Actor:** Người dùng đã đăng nhập
**Goal:** Không phải nhìn lại màn hình Login khi đã có phiên.
**Business value:** Tránh bước thừa và tránh nhầm rằng mình chưa đăng nhập.

**Acceptance Criteria:**
- [ ] Mở màn hình Login khi đã đăng nhập thì được chuyển thẳng sang màn hình Todo.

### US005 — Khách chưa đăng nhập không vào được trang chính

**Actor:** Khách chưa đăng nhập
**Goal:** Biết cần đăng nhập mới vào được trang chính.
**Business value:** Trang chính chỉ dành cho người đã xác thực.

**Acceptance Criteria:**
- [ ] Mở màn hình Todo khi chưa đăng nhập thì được đưa về màn hình Login, không có thông báo lỗi.
- [ ] Phiên hết hạn giữa chừng thì lần mở màn hình Todo kế tiếp cũng bị đưa về màn hình Login.

### US006 — Xem tài khoản đang đăng nhập

**Actor:** Người dùng đã đăng nhập
**Goal:** Biết mình đang đăng nhập bằng tài khoản nào.
**Business value:** Người dùng xác nhận đúng tài khoản trước khi làm việc tiếp.

**Acceptance Criteria:**
- [ ] Màn hình Todo hiện đúng email của tài khoản đang đăng nhập.
- [ ] Màn hình Todo có nút Đăng xuất.

### US007 — Đăng xuất

**Actor:** Người dùng đã đăng nhập
**Goal:** Kết thúc phiên làm việc của mình.
**Business value:** Người dùng thoát an toàn khỏi máy dùng chung.

**Acceptance Criteria:**
- [ ] Bấm Đăng xuất thì về màn hình Login.
- [ ] Sau khi đăng xuất, mở màn hình Todo thì bị đưa về màn hình Login.

## 8. Scenarios

### US001 — Happy Path

**Given** khách ở màn hình Login, **When** bấm "LOGIN With Google" và hoàn tất xác thực với một tài khoản Google, **Then** khách thấy màn hình Todo với email của mình.

### US001 — Error: Google không trả kết quả hợp lệ

**Given** khách đã bấm nút Google, **When** bước xác thực quay về nhưng không đổi được thành phiên, **Then** khách ở màn hình Login và thấy "Đăng nhập không thành công. Vui lòng thử lại."

### US002 — Happy Path

**Given** khách hủy ở trang Google, **When** quay về màn hình Login, **Then** thông báo lỗi hiện dưới nút và nút dùng lại được.

### US002 — Error: thử lại vẫn thất bại

**Given** thông báo lỗi đang hiện, **When** khách bấm nút và lần này cũng thất bại, **Then** thông báo biến mất lúc bắt đầu thử rồi hiện lại khi quay về.

### US003 — Happy Path

**Given** màn hình Login đang ở VN, **When** khách chọn EN trong danh sách, **Then** chữ trên màn hình đổi sang tiếng Anh và lần sau mở lại vẫn là tiếng Anh.

### US003 — Error: giá trị ngôn ngữ đã lưu bị hỏng

**Given** lựa chọn ngôn ngữ đã lưu không phải VN hoặc EN, **When** khách mở màn hình Login, **Then** màn hình hiện bằng tiếng Việt.

### US004 — Happy Path

**Given** người dùng đã đăng nhập, **When** mở màn hình Login, **Then** họ thấy màn hình Todo.

### US004 — Error: phiên đã hết hạn

**Given** phiên của người dùng đã hết hạn, **When** họ mở màn hình Login, **Then** họ thấy màn hình Login như khách chưa đăng nhập.

### US005 — Happy Path

**Given** khách chưa đăng nhập, **When** mở màn hình Todo, **Then** họ thấy màn hình Login.

### US005 — Error: phiên hết hạn giữa chừng

**Given** người dùng đang ở màn hình Todo và phiên hết hạn, **When** họ tải lại trang, **Then** họ thấy màn hình Login.

### US006 — Happy Path

**Given** người dùng đã đăng nhập, **When** mở màn hình Todo, **Then** họ thấy email của mình và nút Đăng xuất.

### US006 — Error: phiên mất khi đang xem

**Given** phiên không còn hợp lệ, **When** người dùng mở màn hình Todo, **Then** họ được đưa về màn hình Login thay vì thấy email.

### US007 — Happy Path

**Given** người dùng đang ở màn hình Todo, **When** bấm Đăng xuất, **Then** họ thấy màn hình Login.

### US007 — Error: phiên đã hết hạn trước khi bấm

**Given** phiên đã hết hạn, **When** người dùng bấm Đăng xuất, **Then** họ vẫn được đưa về màn hình Login.

## 9. Edge Cases

| Scenario | What Happens | User-Facing Message |
|----------|--------------|----------------------|
| Khách hủy ở trang Google | quay về màn hình Login, nút dùng lại được | "Đăng nhập không thành công. Vui lòng thử lại." |
| Kết quả xác thực không hợp lệ hoặc đã hết hạn | quay về màn hình Login, không có phiên | "Đăng nhập không thành công. Vui lòng thử lại." |
| Dịch vụ xác thực không phản hồi hoặc mất mạng | không tạo phiên, nút bật lại | "Đăng nhập không thành công. Vui lòng thử lại." |
| Bấm nút Quay lại của trình duyệt khi đang chờ Google | trang được tải lại để nút về trạng thái bình thường | None — silent handling |
| Địa chỉ màn hình Login mang mã lỗi lạ | bỏ qua mã đó, hiện màn hình Login bình thường | None — silent handling |
| Ngôn ngữ đã lưu không phải VN hoặc EN | dùng tiếng Việt | None — silent handling |
| Phiên hết hạn hoặc không hợp lệ khi mở màn hình Todo | đối xử như chưa đăng nhập, đưa về màn hình Login | None — silent handling |

## 10. Edge Behaviours to Verify

- **FR-001** → Sau khi đăng nhập, tải lại trang vẫn còn đăng nhập; phiên hết hạn thì bị coi là chưa đăng nhập.
- **FR-102** → Đã đăng nhập mà mở màn hình Login thì thấy màn hình Todo.
- **FR-103** → Chưa đăng nhập mà mở màn hình Todo thì thấy màn hình Login, không có thông báo lỗi.
- **FR-201** → Logo ở bên trái, bộ chọn ngôn ngữ ở bên phải, cả hai giữ vị trí khi đổi kích thước cửa sổ.
- **FR-203** → Tiêu đề và hai dòng mô tả đúng chữ, không bấm hay chọn được.
- **FR-204** → Nút có biểu tượng Google và nổi bóng khi rê chuột.
- **FR-205** → Footer luôn thấy ở cuối cửa sổ kể cả khi cuộn, và không tương tác.
- **FR-206** → Mặc định "VN" có cờ bên trái, mũi tên bên phải; rê chuột sáng lên và con trỏ thành bàn tay; bấm thì mở danh sách.
- **FR-401** → Bấm nút thì nút bị vô hiệu và có biểu tượng đang tải; trang chuyển sang Google trong cùng tab.
- **FR-402** → Xác thực thành công thì vào màn hình Todo.
- **FR-403** → Hủy hoặc thất bại thì có thông báo dưới nút; bấm lại thì thông báo mất.
- **FR-404** → Chọn EN thì chữ trên màn hình Login đổi sang tiếng Anh và được nhớ.
- **FR-405** → Màn hình Todo hiện đúng email và có nút Đăng xuất.
- **FR-406** → Đăng xuất xong thì về màn hình Login và không vào lại được màn hình Todo.
- **FR-601** → Nơi đến sau đăng nhập luôn là màn hình Todo dù địa chỉ yêu cầu có kèm đích nào khác.

## 11. Risks & Known Issues

| ID | Type | Description | Impact | Status |
|----|------|--------------|--------|--------|
| RISK-01 | risk | Truy cập bằng một địa chỉ khác với địa chỉ đã đăng ký cho đăng nhập (ví dụ 127.0.0.1 thay vì localhost) làm bước xác thực quay về không khớp | đăng nhập luôn báo không thành công trong môi trường phát triển | [INFERRED] |
| RISK-02 | risk | Khi ứng dụng Google còn ở chế độ thử nghiệm, chỉ các tài khoản thử nghiệm được thêm sẵn mới đăng nhập được | tài khoản Google khác bị từ chối dù quy tắc BR-001 cho phép mọi tài khoản | [INFERRED] |

## 12. Dependencies

| Dependency | Type | Why this feature needs it | Evidence |
|------------|------|-----------------------------|----------|
| Google (đăng nhập OAuth) | external-service | xác thực danh tính người dùng bằng tài khoản Google | FR-401, FR-402, BR-001 |
| Dịch vụ xác thực Supabase (bản chạy local khi phát triển) | external-service | lập, làm mới và hủy phiên đăng nhập | FR-001, FR-402, FR-406 |
| Tài sản thiết kế từ Figma (logo, key visual, cờ VN, biểu tượng Google) | data | hiển thị đúng thiết kế màn hình Login | FR-201, FR-203, FR-204, FR-206 |
| Thông tin OAuth Google và danh sách địa chỉ chuyển hướng được phép | config | dịch vụ xác thực chỉ cho phép quay về đúng địa chỉ đã đăng ký | FR-402, RISK-01 |

## 13. Configuration

```text
DEFAULT_LOCALE = vi                  # ngôn ngữ mặc định của màn hình Login (hiển thị "VN")
SUPPORTED_LOCALES = vi, en           # hai ngôn ngữ được phép chọn
LOCALE_COOKIE = NEXT_LOCALE          # nơi nhớ lựa chọn ngôn ngữ, giữ 1 năm
POST_LOGIN_DESTINATION = /todo       # nơi đến duy nhất sau khi đăng nhập thành công
LOGIN_ERROR_MESSAGE_VI = "Đăng nhập không thành công. Vui lòng thử lại."
LOGIN_ERROR_MESSAGE_EN = "Login failed. Please try again."
```
