---
status: implemented
authored_by: takumi
created: 2026-10-09
lang: vi
---

# Functional Spec — F005_CountdownPrelaunch

**Priority**: P1
**Type**: mixed
**Generated**: 2026-10-09

**See also:** [`technical-spec.md`](./technical-spec.md) — endpoints, Source citations, pseudocode,
key entities, and DB writes for a Dev/QA/SA audience.

## 1. Overview

**Problem:** Trước ngày ra mắt, Sun* chưa muốn ai ngoài người phụ trách xem nội dung SAA 2025, nhưng cần một nơi cho mọi người thấy còn bao lâu nữa site mở. Hiện mọi trang đã công khai ngay khi triển khai và không có cách giữ site lại tới giờ mở.
**Solution:** Một trang đếm ngược toàn màn hình ("Sự kiện sẽ bắt đầu sau") hiện số ngày, giờ, phút còn lại. Trước mốc mở site, mọi trang đều đưa người xem về trang này; admin vẫn duyệt được toàn site để kiểm tra nội dung. Khi đồng hồ chạm 0, trình duyệt tự vào trang chủ và site mở bình thường. Mốc mở site đọc từ một cài đặt trong hệ thống nên vận hành đổi được mà không phải triển khai lại.
**Scope:** Trang đếm ngược `/countdown` (nền, tiêu đề hai ngôn ngữ, ba khối ngày/giờ/phút); cổng chặn toàn site trước mốc, kèm ngoại lệ cho admin, trang đăng nhập và bước hoàn tất đăng nhập; tự chuyển sang trang chủ khi về 0; đưa trang đếm ngược về trang chủ sau mốc; cài đặt mốc mở site đọc công khai và chỉ phía vận hành ghi được, dữ liệu seed local đặt mốc ở quá khứ.
**Non-Scope:** Đồng hồ ở trang chủ và mốc sự kiện của nó (thuộc F002, giữ nguyên biến cấu hình riêng); đăng nhập, phiên và vai trò admin (thuộc F001 và F003, chỉ được dùng lại); trang quản trị để đổi mốc (vận hành đổi trực tiếp trong cơ sở dữ liệu); header, footer, bộ chọn ngôn ngữ trên trang đếm ngược (thiết kế không có); coi cổng là kiểm soát an ninh (xem FR-602); mốc cho môi trường thật (chỉ có dữ liệu seed local).

**Actors**

| Actor | Description | Primary goal |
|-------|--------------|---------------|
| Khách | người chưa đăng nhập | biết còn bao lâu nữa site mở và vào site khi tới giờ |
| Người dùng thường | đã đăng nhập, vai trò người dùng | giống khách: chờ tới giờ mở rồi vào site |
| Admin | đã đăng nhập, vai trò admin | duyệt toàn site trước giờ mở để kiểm tra nội dung |
| Người vận hành | người có khoá ghi cơ sở dữ liệu, không phải người dùng cuối | đặt và đổi mốc mở site mà không phải triển khai lại |

## 2. Functional Capabilities

| ID | Capability | What the user can do | User Stories | Requirements | Business Rules | Screens |
|----|------------|------------------------|-----------------|---------------|-------------------|---------|
| CAP-01 | Xem đồng hồ đếm ngược | Mở trang đếm ngược, đọc tiêu đề theo ngôn ngữ đã chọn, thấy số ngày, giờ, phút còn lại tự cập nhật | US028 | FR-201, FR-202, FR-203, FR-204, FR-205, FR-206, FR-207 | BR-005, BR-008, DEC-003 | SCR005_CountdownPrelaunch |
| CAP-02 | Giữ site sau trang đếm ngược trước giờ mở | Khách và người dùng thường bị đưa về trang đếm ngược khi mở bất kỳ trang nào, admin duyệt bình thường, trang đăng nhập luôn mở; vận hành đặt mốc | US029, US030, US033 | FR-001, FR-002, FR-101, FR-102, FR-103, FR-601, FR-602 | BR-001, BR-002, BR-003, BR-004, BR-006, DEC-001 | N/A — cổng nằm trên mọi trang, màn hình duy nhất của feature đã tính ở CAP-01 |
| CAP-03 | Vào site khi tới giờ | Đồng hồ chạm 0 thì tự vào trang chủ; sau mốc mở trang đếm ngược thì được đưa về trang chủ; mọi trang mở bình thường | US031, US032 | FR-104, FR-105, FR-401 | BR-007, DEC-002 | N/A — dùng màn hình đã tính ở CAP-01 và trang chủ của F002 |

## 3. Open Decisions

Cả chín quyết định đã chốt ngày 2026-10-09 (clarifications.md; D008 và D009 chốt ở lượt hỏi thứ hai về các điểm spec phát hiện khi soạn) và chỉ ghi lại để tra cứu.

| D### | Decision | Default proposal | Rationale | Blocks work |
|------|----------|-------------------|-----------|--------------|
| D001 | "Khoá điều hướng tới khi về 0" nghĩa là gì? | **Đã chốt:** cổng toàn site; trước mốc mọi trang đưa về trang đếm ngược; khi về 0 trang tự vào trang chủ và site mở | Câu "khoá điều hướng" trong thiết kế chỉ hợp lý nếu áp cho cả site | no |
| D002 | Mốc lấy từ đâu? | **Đã chốt:** một cài đặt riêng của site trong Supabase (`prelaunch_ends_at`), ai cũng đọc được, chỉ vận hành ghi; trang chủ giữ biến cấu hình riêng | Đổi mốc không cần triển khai lại; hai mốc không phụ thuộc nhau | no |
| D003 | Địa chỉ của trang? | **Đã chốt:** `/countdown` | Ngắn, đúng tên thiết kế | no |
| D004 | Trước mốc, cái gì vẫn mở? | **Đã chốt:** admin duyệt toàn site; `/login` và `/auth/callback` luôn mở để admin đăng nhập; mọi người còn lại bị đưa về trang đếm ngược | Admin cần kiểm tra nội dung trước giờ mở | no |
| D005 | Seed local đặt mốc ở đâu? | **Đã chốt:** ở quá khứ nên site local luôn mở; test về đếm ngược tự đặt mốc tương lai rồi khôi phục; muốn thấy khoá thì sửa một dòng trong Supabase Studio | Các bộ test hiện có không bị chuyển hướng | no |
| D006 | Mốc thiếu, hỏng hoặc không đọc được? | **Đã chốt:** site mở (fail open), lỗi ghi ở máy chủ | Đây là cổng ra mắt, không phải kiểm soát an ninh | no |
| D007 | Mở trang đếm ngược sau mốc? | **Đã chốt:** chuyển về `/` | Trang đếm ngược hết ý nghĩa | no |
| D008 | Đồng hồ trình duyệt chạy nhanh hơn đồng hồ máy chủ thì sao (trình duyệt về 0 sớm, chuyển sang trang chủ, máy chủ còn khoá nên trả lại trang đếm ngược)? | **Đã chốt:** đếm theo giờ máy chủ: máy chủ gửi giờ hiện tại cùng lúc dựng trang, trình duyệt tính độ lệch một lần rồi đếm theo giờ máy chủ, nên về 0 đúng lúc máy chủ mở site | Loại bỏ vòng chuyển qua lại do lệch đồng hồ; chỉ còn độ trễ mạng, và sai số đó làm đồng hồ chạy chậm chứ không nhanh | no |
| D009 | Admin chưa đăng nhập vào site bằng cách nào khi đang khoá? | **Đã chốt:** mở thẳng `/login`, không đổi giao diện; `/login` và `/auth/callback` vẫn mở nên sau khi đăng nhập admin qua được cổng | Giữ nguyên thiết kế (không header); thêm liên kết sẽ lộ đường vào cho mọi người | no |

## 4. Requirements

### Foundation (0xx)

- **FR-001** Mốc mở site là một thời điểm duy nhất lưu trong cài đặt của site; ai cũng đọc được, chỉ vận hành ghi được.
- **FR-002** Dữ liệu seed local đặt mốc ở quá khứ nên site local luôn mở sau khi dựng; muốn thử cổng thì đổi mốc.

### Navigation (1xx)

- **FR-101** Trước mốc, khách và người dùng thường mở bất kỳ trang nào (ngoài ngoại lệ) đều bị đưa về trang đếm ngược.
- **FR-102** Trang đăng nhập và bước hoàn tất đăng nhập luôn mở, kể cả trước mốc.
- **FR-103** Trước mốc, admin duyệt toàn bộ site bình thường.
- **FR-104** Từ mốc trở đi, mọi trang mở bình thường và không ai bị đưa về trang đếm ngược.
- **FR-105** Từ mốc trở đi, mở trang đếm ngược thì được đưa về trang chủ.

### Countdown Prelaunch (2xx)

- **FR-201** Trang có nền toàn màn hình phủ lớp tối, tiêu đề ở trên và ba khối ngày, giờ, phút.
- **FR-202** Tiêu đề là "Sự kiện sẽ bắt đầu sau" (VN) hoặc "Event starts in" (EN) theo ngôn ngữ đã chọn; nhãn DAYS, HOURS, MINUTES giống nhau ở cả hai ngôn ngữ.
- **FR-203** Mỗi khối có ít nhất hai chữ số (đệm 0); số ngày dài hơn khi còn trên 99 ngày.
- **FR-204** Giá trị tự cập nhật khi đổi phút, không cần tải lại; trước khi sẵn sàng hiện "--".
- **FR-205** Từ mốc trở đi cả ba khối hiện 00.
- **FR-206** Trang không có header, footer hay bộ chọn ngôn ngữ; chỉ dùng ngôn ngữ đã chọn trước đó.
- **FR-207** Đồng hồ đếm theo giờ của máy chủ chứ không theo đồng hồ máy người xem, nên về 0 đúng lúc site mở dù đồng hồ máy lệch.

### Interaction (4xx)

- **FR-401** Khi đồng hồ chạm 0, trình duyệt tự chuyển sang trang chủ mà không cần bấm hay tải lại.

### Security (6xx)

- **FR-601** Admin được nhận biết chỉ bằng vai trò lưu ở hồ sơ người dùng trên máy chủ, không bằng dữ liệu người dùng tự ghi được.
- **FR-602** Cổng này là cổng ra mắt, không phải kiểm soát an ninh: nó không thay việc từng trang tự kiểm tra quyền và không chặn thao tác gửi form.

## 5. Business Rules

- Site chỉ khoá khi mốc đọc được và còn ở tương lai; tới mốc hoặc qua mốc là mở, tính theo giờ máy chủ (BR-001)
- Mốc thiếu dòng, sai hay không đọc được thì site mở và lỗi ghi ở máy chủ; mốc để trống có chủ ý thì site mở im lặng; vì đây là cổng ra mắt chứ không phải kiểm soát an ninh (BR-002)
- Khi đang khoá chỉ admin được xem site; không xác định được vai trò thì coi là người thường và bị đưa về trang đếm ngược (BR-003)
- Việc đưa người dùng đi chỉ là tạm thời, tới đích cố định, và chỉ khi họ mở trang; thao tác gửi form không bị cổng chặn (BR-004)
- Đồng hồ tính theo phút làm tròn lên, ô nào cũng ít nhất hai chữ số, 00 từ mốc trở đi, giống hệt đồng hồ trang chủ (BR-005)
- Mốc mở site (cài đặt trong hệ thống) và mốc sự kiện của trang chủ (cấu hình triển khai) độc lập; đổi hay hỏng một mốc không ảnh hưởng mốc kia (BR-006)
- Mỗi lần tải trang, trình duyệt chỉ tự chuyển sang trang chủ nhiều nhất một lần và thay chỗ trang đếm ngược trong lịch sử (BR-007)
- Số đếm và lúc tự chuyển sang trang chủ đều theo giờ máy chủ; đồng hồ máy người xem lệch không làm sai kết quả (BR-008)
- Trước mốc: người không phải admin mở trang nào cũng ra trang đếm ngược, admin xem bình thường, trang đăng nhập luôn mở; từ mốc trở đi không ai bị chuyển (DEC-001)
- Mở trang đếm ngược: trước mốc thấy đồng hồ; từ mốc trở đi, hoặc khi mốc hỏng, được đưa về trang chủ (DEC-002)
- Đồng hồ: chưa sẵn sàng thì hiện "--"; còn thời gian thì hiện phần còn lại; tới mốc hoặc không có mốc thì hiện 00 và tự vào trang chủ (DEC-003)

## 6. Screens

| Screen Name | SCR### | What User Sees | What User Can Do |
|-------------|--------|-----------------|-------------------|
| Countdown Prelaunch (Đếm ngược prelaunch) | SCR005_CountdownPrelaunch | nền toàn màn hình phủ lớp tối; tiêu đề "Sự kiện sẽ bắt đầu sau" hoặc "Event starts in"; ba khối số ngày, giờ, phút kiểu LED hai chữ số với nhãn DAYS, HOURS, MINUTES; không header, footer hay bộ chọn ngôn ngữ | xem đồng hồ tự cập nhật; chờ — tới 0 thì được đưa sang trang chủ; trang không có nút hay liên kết nào để bấm |

### User Journey

1. Khách mở bất kỳ địa chỉ nào của site trước giờ mở — được đưa tới Countdown Prelaunch và thấy tiêu đề cùng số ngày, giờ, phút còn lại.
2. Khách chờ — số phút giảm dần, không cần tải lại trang.
3. Đồng hồ chạm 00 00 00 — trình duyệt tự vào trang chủ, site mở bình thường.
4. Admin đăng nhập qua trang đăng nhập (luôn mở) rồi mở các trang như thường — thấy nội dung thật dù còn trước giờ mở.
5. Sau giờ mở, ai mở lại địa chỉ trang đếm ngược cũng được đưa về trang chủ.

## 7. User Stories

### US028 — Xem đồng hồ đếm ngược prelaunch

**Actor:** Khách
**Goal:** xem còn bao nhiêu ngày, giờ, phút nữa site mở
**Business value:** người chờ biết khi nào quay lại và không hỏi người phụ trách.

**Acceptance Criteria:**
- [ ] Trang hiện nền, tiêu đề đúng ngôn ngữ đã chọn và ba khối DAYS, HOURS, MINUTES
- [ ] Mỗi khối có ít nhất hai chữ số; số ngày hiện đủ khi còn trên 99 ngày
- [ ] Số tự cập nhật theo phút, không cần tải lại; trước khi sẵn sàng hiện "--"
- [ ] Không có header, footer hay bộ chọn ngôn ngữ

### US029 — Bị giữ ở trang đếm ngược khi mở trang khác trước giờ mở

**Actor:** Khách
**Goal:** thấy trang đếm ngược dù mở địa chỉ nào của site trước giờ mở
**Business value:** nội dung chưa ra mắt không bị xem trước giờ mở.

**Acceptance Criteria:**
- [ ] Trước mốc, mở trang chủ hoặc trang Awards Information bị đưa về trang đếm ngược
- [ ] Người dùng thường đã đăng nhập cũng bị đưa về trang đếm ngược
- [ ] Trang đăng nhập và bước hoàn tất đăng nhập vẫn mở

### US030 — Admin duyệt toàn site trước giờ mở

**Actor:** Admin
**Goal:** xem mọi trang như khi site mở để kiểm tra nội dung
**Business value:** lỗi nội dung được phát hiện và sửa trước giờ ra mắt.

**Acceptance Criteria:**
- [ ] Admin đã đăng nhập mở trang chủ và Awards Information như thường, không bị đưa về trang đếm ngược
- [ ] Không xác định được vai trò thì bị coi là người dùng thường

### US031 — Tự vào site khi đồng hồ chạm 0

**Actor:** Khách
**Goal:** vào site ngay khi tới giờ mà không phải tải lại
**Business value:** người chờ vào site đúng lúc ra mắt, không phải đoán giờ.

**Acceptance Criteria:**
- [ ] Khi đồng hồ chạm 0, trình duyệt tự tới trang chủ
- [ ] Nút Back không đưa về trang đếm ngược đã bỏ
- [ ] Đồng hồ máy người xem lệch nhanh hay chậm vẫn không làm trình duyệt sang trang chủ trước giờ mở

### US032 — Rời trang đếm ngược sau giờ mở

**Actor:** Khách
**Goal:** không bị kẹt ở một trang đếm ngược đã hết ý nghĩa
**Business value:** liên kết hoặc dấu trang tới trang đếm ngược vẫn dùng được sau ra mắt.

**Acceptance Criteria:**
- [ ] Sau mốc, mở trang đếm ngược thì được đưa về trang chủ
- [ ] Mốc trống hoặc hỏng thì cũng về trang chủ

### US033 — Đặt mốc mở site

**Actor:** Người vận hành
**Goal:** đặt hoặc đổi thời điểm mở site mà không phải triển khai lại
**Business value:** dời giờ ra mắt chỉ mất một thao tác dữ liệu, ít rủi ro.

**Acceptance Criteria:**
- [ ] Đặt mốc ở tương lai thì khoá site từ request kế tiếp
- [ ] Đặt mốc ở quá khứ hoặc để trống thì site mở
- [ ] Người ngoài phía vận hành đọc được mốc nhưng không đổi được

## 8. Scenarios

### US028 — Happy Path

**Given** mốc cách 1 ngày 2 giờ 3 phút và ngôn ngữ VN, **When** khách mở trang đếm ngược, **Then** thấy "Sự kiện sẽ bắt đầu sau" và ba khối 01, 02, 03 với nhãn DAYS, HOURS, MINUTES.

### US028 — Error: Mốc hỏng

**Given** mốc trống hoặc không đọc được, **When** khách mở trang đếm ngược, **Then** được đưa về trang chủ, không thấy lỗi hay trang trắng.

### US029 — Happy Path

**Given** mốc còn ở tương lai và khách chưa đăng nhập, **When** khách mở trang Awards Information, **Then** được đưa tới trang đếm ngược.

### US029 — Error: Không đọc được mốc

**Given** hệ thống không đọc được mốc, **When** khách mở trang chủ, **Then** trang chủ hiện bình thường và lỗi chỉ ghi ở máy chủ.

### US030 — Happy Path

**Given** mốc còn ở tương lai và admin đã đăng nhập, **When** admin mở trang chủ, **Then** trang chủ hiện bình thường.

### US030 — Error: Không tra được vai trò

**Given** mốc còn ở tương lai và người dùng đã đăng nhập nhưng hệ thống không tra được vai trò, **When** họ mở trang chủ, **Then** bị coi là người dùng thường và được đưa tới trang đếm ngược.

### US031 — Happy Path

**Given** khách đang ở trang đếm ngược và còn vài giây tới mốc, **When** đồng hồ chạm 00 00 00, **Then** trình duyệt tự tới trang chủ.

### US031 — Error: Đồng hồ trình duyệt lệch

**Given** đồng hồ trình duyệt nhanh hơn máy chủ hàng giờ, **When** khách mở trang đếm ngược, **Then** số hiển thị vẫn theo giờ máy chủ và trình duyệt chỉ sang trang chủ khi máy chủ qua mốc, không bị trả lại trang đếm ngược.

### US032 — Happy Path

**Given** mốc đã qua, **When** khách mở trang đếm ngược, **Then** được đưa về trang chủ.

### US032 — Error: Mốc trống

**Given** cài đặt mốc để trống, **When** khách mở trang đếm ngược, **Then** cũng về trang chủ.

### US033 — Happy Path

**Given** vận hành đặt mốc ở tương lai, **When** khách mở trang chủ, **Then** bị đưa tới trang đếm ngược ở lần mở kế tiếp.

### US033 — Error: Giá trị không phải thời điểm

**Given** vận hành nhập một giá trị không phải thời điểm, **When** lưu, **Then** cơ sở dữ liệu từ chối và mốc cũ giữ nguyên.

## 9. Edge Cases

| Scenario | What Happens | User-Facing Message |
|----------|--------------|----------------------|
| Mốc thiếu dòng, hỏng hoặc cơ sở dữ liệu không trả lời | Site mở; trang đếm ngược đưa về trang chủ; lỗi ghi ở máy chủ (mốc để trống có chủ ý thì mở im lặng, không ghi lỗi) | None — silent handling |
| Người đã đăng nhập mở trang đăng nhập khi site đang khoá | Được đưa về trang chủ như trước; nếu không phải admin thì tiếp tục tới trang đếm ngược | None — silent handling |
| Người dùng thường mở trang chưa xây (ví dụ Profile) khi đang khoá | Được đưa tới trang đếm ngược thay vì trang không tìm thấy | None — silent handling |
| Admin chưa đăng nhập mở một trang khi đang khoá | Bị coi là khách, được đưa tới trang đếm ngược; phải mở thẳng trang đăng nhập (D009) | None — silent handling |
| Còn trên 99 ngày | Khối ngày hiện đủ số, nhiều chữ số hơn | None — silent handling |
| Trang đếm ngược không bật JavaScript | Ba khối giữ "--" và không tự chuyển; tải lại sau mốc vẫn vào trang chủ | None — silent handling |
| Tab bị trình duyệt làm chậm khi ở nền | Quay lại tab thì đồng hồ cập nhật ngay, rồi chuyển nếu đã qua mốc | None — silent handling |
| Vận hành dời mốc xa hơn khi có người đang mở trang đếm ngược | Trang đang mở đếm tới mốc cũ; chạm 0 thì tới trang chủ, bị đưa lại trang đếm ngược với mốc mới rồi đếm tiếp | None — silent handling |
| Đồng hồ máy người xem nhanh hay chậm hơn máy chủ | Không ảnh hưởng: số đếm và lúc chuyển theo giờ máy chủ; nếu mạng chậm, trình duyệt chuyển hơi muộn chứ không sớm (D008) | None — silent handling |
| Mốc đúng bằng thời điểm hiện tại | Site mở; đồng hồ hiện 00 00 00 | None — silent handling |
| Ngôn ngữ đã lưu có giá trị lạ | Trang hiện tiếng Việt | None — silent handling |

## 10. Edge Behaviours to Verify

- **FR-001** → Khách đọc được mốc nhưng không ghi được; chỉ phía vận hành ghi được; giá trị không phải thời điểm bị từ chối
- **FR-002** → Sau khi dựng lại cơ sở dữ liệu local, mở trang chủ không bị chuyển hướng
- **FR-101** → Mốc ở tương lai: khách mở trang chủ, Awards Information và một địa chỉ chưa có trang đều tới trang đếm ngược; người dùng thường đã đăng nhập cũng vậy
- **FR-102** → Mốc ở tương lai: trang đăng nhập hiện bình thường và đăng nhập Google hoàn tất được
- **FR-103** → Mốc ở tương lai: admin đã đăng nhập mở trang chủ và Awards Information thấy trang thật
- **FR-104** → Mốc ở quá khứ hoặc để trống: mọi trang hiện bình thường cho khách; hành vi của đăng nhập, trang chủ, menu tài khoản, Awards Information không đổi
- **FR-105** → Mốc ở quá khứ hoặc để trống: mở trang đếm ngược tới trang chủ
- **FR-201** → Trang hiện nền toàn màn hình có lớp tối, tiêu đề và ba khối
- **FR-202** → VN hiện "Sự kiện sẽ bắt đầu sau", EN hiện "Event starts in"; nhãn DAYS, HOURS, MINUTES chữ hoa trắng ở cả hai
- **FR-203** → Mốc cách 9 phút hiện 00 00 09; cách 1 ngày 2 giờ 3 phút hiện 01 02 03; trên 99 ngày hiện đủ chữ số
- **FR-204** → Số đổi khi qua phút mà không tải lại; trước khi sẵn sàng hiện "--"
- **FR-205** → Tới mốc, cả ba khối hiện 00
- **FR-206** → Trang không có header, footer hay bộ chọn ngôn ngữ
- **FR-207** → Với đồng hồ trình duyệt đặt lệch hàng giờ, số hiển thị vẫn theo giờ máy chủ và trình duyệt không sang trang chủ trước giờ mở
- **FR-401** → Mốc cách vài giây: tới 0 trình duyệt tự vào trang chủ, nút Back không quay lại trang đếm ngược, không chuyển trước mốc
- **FR-601** → Người dùng đã đăng nhập mà vai trò không tra được hoặc không phải admin bị đưa tới trang đếm ngược khi đang khoá
- **FR-602** → Thao tác gửi form tới một trang khi đang khoá không bị chuyển hướng; nội dung trang đã mở vẫn công khai

## 11. Risks & Known Issues

| ID | Type | Description | Impact | Status |
|----|------|--------------|--------|--------|
| RISK-01 | risk | Test case MoMorph về truy cập (khách "được phép hoặc bị chặn", người dùng đặc quyền thấp "bị từ chối", phiên hết hạn "về trang đăng nhập") không khớp quyết định: khách và người thường đối xử như nhau, trang đếm ngược không cần đăng nhập, phiên hết hạn không có nghĩa gì ở đây | QA chạy theo test case gốc báo lỗi giả hoặc xác nhận nhầm hành vi | [EXPECTED] test case được đọc theo quyết định đã chốt (clarifications.md) |
| RISK-02 | risk | Đồng hồ máy người xem lệch so với máy chủ có thể làm trình duyệt về 0 sớm rồi bị máy chủ trả lại trang đếm ngược | Trang nhấp nháy quanh mốc; đã được loại bỏ bằng cách đếm theo giờ máy chủ, chỉ còn độ trễ mạng làm đồng hồ chậm chứ không nhanh | [EXPECTED] đã xử lý theo D008; sai số còn lại là độ trễ giữa lúc máy chủ dựng trang và lúc trang chạy |
| RISK-03 | risk | Mỗi lần mở trang giờ tốn thêm một lượt đọc cơ sở dữ liệu ở bước chặn truy cập; không cache | Cơ sở dữ liệu chậm làm mọi trang chậm cho tới hạn chờ, rồi site mở (fail open) | [EXPECTED] chấp nhận ở phiên bản đầu; thêm cache ngắn khi đo thấy chậm |
| RISK-04 | risk | Ca E2E của cổng đổi một dòng dùng chung, trong khi bộ E2E hiện chạy song song nhiều tệp | Khi mốc đang ở tương lai, các tệp E2E khác chạy cùng lúc bị chuyển về trang đếm ngược và lỗi giả | [EXPECTED] đã xử lý: ca cổng chạy trong một nhóm kiểm thử riêng, sau nhóm chính, một luồng, nên không chạy cùng các tệp khác (technical-spec § 5.1) |

## 12. Dependencies

| Dependency | Type | Why this feature needs it | Evidence |
|------------|------|-----------------------------|----------|
| F001_LoginWithGoogle | feature | Trang đăng nhập và bước hoàn tất đăng nhập phải luôn mở; bước chặn truy cập mở rộng cùng quy tắc làm mới phiên và quy tắc chuyển hướng đăng nhập đã có | FR-102, BR-004 |
| F002_HomepageSaa | feature | Dùng lại phép tính phút của đồng hồ trang chủ; trang chủ là đích khi đồng hồ về 0 và vẫn giữ mốc riêng | FR-203, FR-401, BR-005, BR-006 |
| F003_AccountMenuAdminRole | feature | Vai trò admin lưu ở hồ sơ người dùng quyết định ai được qua cổng | FR-103, FR-601, BR-003 |
| F004_AwardsInformation | feature | Trang Awards Information nằm trong phạm vi cổng như mọi trang khác | FR-101 |
| Cài đặt mốc mở site | data | Nơi lưu mốc; chỉ có dữ liệu seed local | FR-001, FR-002, BR-001 |
| Cơ sở dữ liệu Supabase local | infrastructure | Lưu cài đặt, áp quyền đọc công khai và ghi riêng cho vận hành | FR-001, BR-002 |
| Thiết kế MoMorph 8PJQswPZmU | external-service | Nền, bố cục, chữ và test case của màn hình | FR-201, FR-202 |

## 13. Configuration

```text
prelaunch_ends_at = (thời điểm có múi giờ)    # mốc mở site; trước mốc site bị khoá, trống hoặc từ mốc trở đi site mở
SAA_COUNTDOWN_TARGET = (thời điểm có múi giờ) # mốc sự kiện của đồng hồ trang chủ; độc lập với mốc mở site
```
