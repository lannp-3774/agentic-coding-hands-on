---
status: implemented
fcode: F007
authored_by: takumi
created: 2026-10-12
lang: vi
---

# Functional Spec — F007_KudosHearts

**Priority**: P1
**Type**: mixed
**Generated**: 2026-10-12

**See also:** [`technical-spec.md`](./technical-spec.md) — endpoints, Source citations, pseudocode,
key entities, and DB writes for a Dev/QA/SA audience.

## 1. Overview

**Problem:** Thẻ kudos trên bảng Sun* Kudos hiện chỉ là nội dung để đọc; Sunner chưa có cách tỏ lòng ghi nhận bằng một cái "tim", còn người gửi kudos chưa được tính điểm khi lời cảm ơn của mình được đồng nghiệp tán thưởng. Carousel Highlight lại sắp theo số tim nên cần một nguồn số tim đáng tin cậy.
**Solution:** Mỗi thẻ kudos (ở Highlight và All Kudos) có một nút tim. Sunner đã đăng nhập thả tim hoặc rút tim ở kudos của người khác và thấy kết quả ngay; khách bấm tim thì được đưa tới trang đăng nhập; người gửi thấy nút tim của kudos mình bị vô hiệu. Mỗi lượt thích cộng tim cho NGƯỜI GỬI kudos (1 tim, hoặc 2 tim vào ngày đặc biệt do vận hành khai báo) và bỏ thích thu hồi đúng số tim đã cộng. Các quy tắc (một lượt mỗi người mỗi kudos, người gửi không tự thích, số tim) do cơ sở dữ liệu giữ, không dựa vào giao diện.
**Scope:** Nút tim và số tim trên thẻ kudos; thả và rút tim với phản hồi ngay trên giao diện; khách được đưa tới đăng nhập; nút vô hiệu cho người gửi; thông báo lỗi ngắn khi thả hoặc rút thất bại; cộng và thu hồi tim cho người gửi kèm trọng số theo ngày đặc biệt; danh sách ngày đặc biệt do vận hành khai báo (dữ liệu seed, chưa có giao diện quản trị).
**Non-Scope:** Thẻ kudos, carousel Highlight, danh sách All Kudos, bộ lọc, vỏ trang, bảng Sunner và kudos (thuộc F006; feature này chỉ sở hữu vùng nút tim); khối thống kê "Số tim bạn nhận được" ở sidebar (thuộc F009, chỉ đọc lại tổng tim); trang quản trị ngày đặc biệt; xem ai đã thích kudos nào; cập nhật số tim theo thời gian thực cho người đang xem khác; thông báo cho người gửi khi có tim; gửi và xoá kudos; chuỗi chuyển hướng quay về trang cũ sau khi đăng nhập.

**Actors**

| Actor | Description | Primary goal |
|-------|--------------|---------------|
| Khách | người chưa đăng nhập, đang xem bảng kudos | xem số tim của các kudos; khi muốn thả tim thì được dẫn tới đăng nhập |
| Sunner đã đăng nhập | người xem đã có phiên, không phải người gửi của kudos đang xem | thả hoặc rút tim cho kudos của người khác |
| Người gửi kudos | một Sunner đã gửi kudos; xem chính kudos của mình | được ghi nhận khi kudos của mình được tán thưởng, và không tự thả tim cho mình |
| Người vận hành | người có khoá ghi cơ sở dữ liệu, không phải người dùng cuối | khai báo ngày đặc biệt để lượt thích vào ngày đó được tính gấp đôi |

## 2. Functional Capabilities

| ID | Capability | What the user can do | User Stories | Requirements | Business Rules | Screens |
|----|------------|------------------------|-----------------|---------------|-------------------|---------|
| CAP-01 | Thả và rút tim ở kudos của người khác | Bấm nút tim trên thẻ để thả hoặc rút tim và thấy số tim, màu tim đổi ngay; khách bấm thì được đưa tới đăng nhập; người gửi thấy nút vô hiệu ở kudos của mình | US001, US002, US003, US004 | FR-001, FR-201, FR-202, FR-203, FR-401, FR-402, FR-403, FR-404, FR-601, FR-602, FR-603 | BR-001, BR-002, BR-006, DEC-001, DEC-002, SM-001 | SCR006_SunKudosLiveBoard |
| CAP-02 | Cộng và thu hồi tim cho người gửi kudos | Người gửi được cộng 1 tim cho mỗi lượt thích, 2 tim nếu vào ngày đặc biệt, và bị thu hồi đúng số đó khi lượt thích bị rút; vận hành khai báo ngày đặc biệt | US005, US006 | FR-002, FR-003, FR-405, FR-604 | BR-003, BR-004, BR-005 | N/A — chạy ở tầng dữ liệu, màn hình duy nhất của feature đã tính ở CAP-01 |

## 3. Open Decisions

Cả bốn điểm dưới đây đã chốt ở clarifications.md (lượt "spec gaps" ngày 2026-10-12) và chỉ ghi lại để tra cứu; không điểm nào chặn việc làm. Những điều chốt từ trước (người gửi nhận tim, +2 ngày đặc biệt, bỏ thích thu hồi trọng số đã lưu, một lượt mỗi người mỗi kudos, người gửi không tự thích, khách tới đăng nhập) không nhắc lại ở đây.

| D### | Decision | Default proposal | Rationale | Blocks work |
|------|----------|-------------------|-----------|--------------|
| D001 | Khi một kudos bị xoá thì tổng tim của người gửi có giảm theo các lượt thích của kudos đó không? | **Đã chốt:** có; xoá kudos trực tiếp bằng SQL thì tổng tim của người gửi giảm đúng trọng số đã lưu của các lượt thích đó | Giữ tổng tim luôn bằng tổng các lượt thích còn tồn tại; xoá kudos nằm ngoài phạm vi giao diện nên hiếm xảy ra | no |
| D002 | Sau khi thả hoặc rút tim, carousel Highlight có xếp hạng lại ngay không? | **Đã chốt:** không; số tim trên thẻ đổi ngay nhưng thứ tự carousel chỉ đổi khi tải lại hoặc đổi bộ lọc | Thẻ đang xem không nhảy vị trí dưới tay người dùng; đơn giản hơn | no |
| D003 | Thả hoặc rút tim thất bại (mất mạng, lỗi máy chủ, kudos đã bị xoá, tài khoản chưa có hồ sơ Sunner) thì báo gì cho người dùng? | **Đã chốt:** nút và số tim trở về trạng thái trước khi bấm và hiện một thông báo lỗi ngắn (toast). Chữ tạm, chờ người sở hữu nội dung: VN "Không cập nhật được tim. Vui lòng thử lại." / EN "Could not update the heart. Please try again." | Thiết kế Figma không có thông báo lỗi cho nút tim; người dùng cần biết lượt bấm không được ghi | no |
| D004 | Cùng một kudos hiện ở cả Highlight và All Kudos thì hai nút tim có luôn cùng trạng thái không? | **Đã chốt:** có; bấm ở một nơi thì nơi kia đổi theo, không cần tải lại. Một kho trạng thái tim dùng chung theo từng kudos do F007 cấp và F006 gắn vào trang; trang truyền `likedByMe` và `isSender` cho từng thẻ | Hai nút lệch nhau là lỗi dễ thấy | no |

## 4. Requirements

### Foundation (0xx)

- **FR-001** Mỗi lượt thích được lưu thành một bản ghi riêng gồm người thích, kudos được thích và số tim lượt đó cộng cho người gửi; một người có tối đa một bản ghi cho mỗi kudos.
- **FR-002** Ngày đặc biệt là một danh sách ngày do vận hành khai báo trong cơ sở dữ liệu (seed local, chưa có giao diện quản trị); ai cũng đọc được, chỉ phía vận hành ghi được.
- **FR-003** Số tim của kudos và tổng tim của người gửi do cơ sở dữ liệu tự cập nhật cùng lúc với lượt thích; không ai chỉnh được trực tiếp từ trình duyệt.

### Nút tim trên thẻ kudos (2xx)

- **FR-201** Mỗi thẻ kudos, ở cả carousel Highlight và danh sách All Kudos, có một nút tim kèm số tim hiện tại; số tim hiện cho mọi người, kể cả khách.
- **FR-202** Tim màu xám khi người xem chưa thích kudos đó và màu đỏ khi đã thích.
- **FR-203** Nút tim trên kudos do chính người xem gửi bị vô hiệu: không bấm được và không bao giờ đỏ.

### Interaction (4xx)

- **FR-401** Sunner đã đăng nhập (không phải người gửi) bấm tim đang xám thì tim chuyển đỏ và số tim tăng 1 ngay, không phải chờ tải lại.
- **FR-402** Bấm lại khi tim đang đỏ thì tim chuyển xám và số tim giảm 1 ngay.
- **FR-403** Khi máy chủ từ chối hoặc có lỗi, nút tim và số tim trở về đúng trạng thái trước khi bấm và hiện một thông báo lỗi ngắn (D003).
- **FR-404** Cùng một kudos hiện ở nhiều nơi trên trang thì mọi nút tim của kudos đó luôn cùng trạng thái và cùng số tim (kho trạng thái dùng chung do F007 cấp, F006 gắn vào trang; D004).
- **FR-405** Sau mỗi lượt thích hoặc bỏ thích, tổng tim của người gửi kudos tăng hoặc giảm đúng số tim lượt thích đó mang lại (1, hoặc 2 nếu thả vào ngày đặc biệt).

### Security (6xx)

- **FR-601** Khách bấm nút tim thì được đưa tới trang đăng nhập và không có lượt thích nào được ghi.
- **FR-602** Máy chủ tự kiểm lại phiên đăng nhập ở mỗi lần thả hoặc rút tim; ẩn hay vô hiệu nút chỉ là tiện ích giao diện, không phải rào chắn.
- **FR-603** Không ai xem được ai đã thích kudos nào; mỗi người chỉ biết mình đã thích gì, còn người khác chỉ thấy tổng số tim.
- **FR-604** Trình duyệt không ghi được trực tiếp lên bộ đếm tim hay lên số tim của một lượt thích, nên gọi thẳng vào hệ thống cũng không tự cộng tim được.

## 5. Business Rules

- Mỗi người chỉ thả được tối đa một lượt tim cho một kudos; thả lần thứ hai không có tác dụng (BR-001)
- Người gửi kudos không thả tim được cho kudos của chính mình; cơ sở dữ liệu từ chối chứ không chỉ nút bị vô hiệu (BR-002)
- Mỗi lượt thích cộng 1 tim cho người gửi kudos, 2 tim nếu lượt thích diễn ra vào ngày đặc biệt; ngày tính theo giờ Việt Nam (Asia/Ho_Chi_Minh) lúc thả, và người nhận kudos không được cộng gì (BR-003)
- Bỏ thích thu hồi đúng số tim lượt thích đó đã cộng khi thả, kể cả khi ngày đặc biệt đã qua hay danh sách ngày đặc biệt đã đổi (BR-004)
- Số tim hiện trên thẻ là số lượt thích đang có, mỗi lượt tính 1 dù thả vào ngày đặc biệt; chỉ tim của người gửi mới có trọng số (BR-005)
- Thả khi đã thả, hay rút khi chưa thả, đều không đổi gì và không báo lỗi (BR-006)
- Nút tim: khách thấy tim xám bấm được để sang đăng nhập; người đã đăng nhập chưa thích thấy tim xám, đã thích thấy tim đỏ; người gửi thấy tim xám bị vô hiệu; số tim luôn hiện (DEC-002)
- Máy chủ nhận yêu cầu thả tim: không có phiên thì báo cần đăng nhập và không ghi; là người gửi thì từ chối; đã thích sẵn thì giữ nguyên; kudos không còn thì từ chối; còn lại thì ghi một lượt thích (DEC-001)
- Một lượt thích của một người trên một kudos chỉ ở một trong hai trạng thái, chưa thích hoặc đã thích; thả chuyển sang đã thích, rút chuyển về chưa thích (SM-001)

## 6. Screens

| Screen Name | SCR### | What User Sees | What User Can Do |
|-------------|--------|-----------------|-------------------|
| Sun* Kudos - Live board, vùng nút tim trên thẻ kudos (Highlight và All Kudos); vỏ màn hình thuộc kudos-board-browse | SCR006_SunKudosLiveBoard | biểu tượng tim kèm số tim ở thanh thao tác của thẻ; tim xám hoặc đỏ theo trạng thái của người xem; với người gửi, nút tim mờ và không bấm được | bấm tim để thả hoặc rút (Sunner đã đăng nhập, không phải người gửi); bấm tim để sang trang đăng nhập (khách); người gửi không bấm được nút của kudos mình |

### User Journey

1. Khách mở bảng Sun* Kudos và thấy các thẻ kudos cùng số tim của từng thẻ.
2. Khách bấm vào tim của một thẻ — được đưa tới trang đăng nhập, không có tim nào được thả.
3. Sunner đăng nhập rồi quay lại bảng, thấy các thẻ kudos của người khác có tim xám và bấm được.
4. Sunner bấm tim của một thẻ — tim chuyển đỏ và số tim tăng 1 ngay; người gửi kudos đó được cộng tim (1, hoặc 2 nếu hôm nay là ngày đặc biệt).
5. Sunner đổi ý và bấm lại — tim chuyển xám, số tim giảm 1, người gửi bị thu hồi đúng số tim đã cộng.
6. Người gửi kudos mở bảng — thấy nút tim trên kudos của chính mình bị vô hiệu, không thả tim được cho mình.

## 7. User Stories

### US001 — Thả tim cho kudos của người khác

**Actor:** Sunner đã đăng nhập
**Goal:** tỏ lòng ghi nhận một kudos của người khác bằng một cái tim
**Business value:** ghi nhận nhanh, nhẹ, khuyến khích văn hoá cảm ơn và cho Highlight một tín hiệu đáng tin về kudos nổi bật.

**Acceptance Criteria:**
- [ ] Bấm tim xám thì tim chuyển đỏ và số tim tăng 1 ngay
- [ ] Tải lại trang vẫn thấy tim đỏ và số tim mới
- [ ] Bấm thả khi đã thả sẵn không tạo lượt thích thứ hai và không đổi số tim

### US002 — Rút tim đã thả

**Actor:** Sunner đã đăng nhập
**Goal:** bỏ lượt tim mình đã thả
**Business value:** sửa được một lần bấm nhầm, giữ số tim phản ánh đúng ý người xem.

**Acceptance Criteria:**
- [ ] Bấm tim đỏ thì tim chuyển xám và số tim giảm 1 ngay
- [ ] Tải lại trang vẫn thấy tim xám và số tim mới
- [ ] Rút khi chưa thả không báo lỗi và không đổi số tim

### US003 — Khách bấm tim được đưa tới đăng nhập

**Actor:** Khách
**Goal:** thả tim nhưng phải đăng nhập trước
**Business value:** giữ chỉ người đã đăng nhập mới tạo tương tác, đồng thời dẫn khách vào luồng đăng nhập.

**Acceptance Criteria:**
- [ ] Khách bấm nút tim thì được đưa tới trang đăng nhập
- [ ] Không có lượt thích nào được ghi và số tim không đổi
- [ ] Khách vẫn thấy số tim của mọi thẻ

### US004 — Người gửi không thả tim cho kudos của chính mình

**Actor:** Người gửi kudos
**Goal:** xem kudos của mình mà không thể tự cộng tim cho mình
**Business value:** ngăn người gửi tự nâng điểm, giữ tổng tim phản ánh sự tán thưởng của người khác.

**Acceptance Criteria:**
- [ ] Nút tim trên kudos của chính mình bị vô hiệu, số tim vẫn hiện
- [ ] Dù gọi thẳng vào hệ thống, lượt thích của người gửi cho kudos của mình bị từ chối và không đổi số tim nào

### US005 — Người gửi nhận tim theo lượt thích

**Actor:** Người gửi kudos
**Goal:** được cộng tim khi kudos mình gửi được đồng nghiệp tán thưởng, nhiều hơn vào ngày đặc biệt
**Business value:** khuyến khích gửi kudos có ý nghĩa và tạo điểm nhấn vào những ngày đặc biệt.

**Acceptance Criteria:**
- [ ] Lượt thích vào ngày thường cộng 1 tim cho người gửi; vào ngày đặc biệt cộng 2 tim
- [ ] Bỏ thích thu hồi đúng số tim lượt đó đã cộng, kể cả sau khi ngày đặc biệt đã qua
- [ ] Người nhận kudos không được cộng tim từ lượt thích

### US006 — Vận hành khai báo ngày đặc biệt

**Actor:** Người vận hành
**Goal:** chọn những ngày mà lượt thích được tính gấp đôi cho người gửi
**Business value:** chủ động tạo đợt tăng tương tác mà không phải sửa mã hay triển khai lại.

**Acceptance Criteria:**
- [ ] Thêm một ngày vào danh sách thì lượt thích tạo vào ngày đó cộng 2 tim cho người gửi
- [ ] Người dùng thường và khách không sửa được danh sách ngày đặc biệt

## 8. Scenarios

### US001 — Happy Path

**Given** Sunner đã đăng nhập đang xem kudos của người khác với tim xám và số tim 10, **When** bấm tim, **Then** tim chuyển đỏ, số tim hiện 11 và tải lại trang vẫn thế.

### US001 — Error: Thất bại khi thả

**Given** Sunner đã đăng nhập bấm tim đúng lúc mất mạng, **When** yêu cầu không tới được máy chủ, **Then** tim trở về xám, số tim trở về 10 và hiện thông báo lỗi ngắn (D003).

### US002 — Happy Path

**Given** Sunner đã thả tim (tim đỏ, số tim 11), **When** bấm lại, **Then** tim chuyển xám và số tim hiện 10.

### US002 — Error: Rút khi chưa thả

**Given** một tab cũ vẫn hiện tim đỏ nhưng lượt thích đã được rút ở tab khác, **When** bấm tim ở tab cũ, **Then** không có lỗi; hệ thống giữ trạng thái chưa thích và số tim khớp lại với số thật.

### US003 — Happy Path

**Given** khách chưa đăng nhập đang xem bảng kudos, **When** bấm tim của một thẻ, **Then** được đưa tới trang đăng nhập và số tim của thẻ không đổi.

### US003 — Error: Phiên hết hạn giữa chừng

**Given** Sunner đã đăng nhập nhưng phiên đã hết hạn trong lúc trang còn mở, **When** bấm tim, **Then** máy chủ không chấp nhận lượt thích, người dùng được đưa tới trang đăng nhập và tim trở về trạng thái trước khi bấm.

### US004 — Happy Path

**Given** người gửi mở bảng kudos có kudos do mình gửi, **When** nhìn nút tim của kudos đó, **Then** nút bị vô hiệu, tim xám và số tim vẫn hiện.

### US004 — Error: Gọi thẳng để tự thích

**Given** người gửi bỏ qua giao diện và yêu cầu thả tim cho kudos của mình, **When** hệ thống xử lý, **Then** yêu cầu bị từ chối và cả số tim của kudos lẫn tổng tim của người gửi đều không đổi.

### US005 — Happy Path

**Given** hôm nay không phải ngày đặc biệt và tổng tim của người gửi là 40, **When** một Sunner khác thả tim kudos của người đó, **Then** tổng tim của người gửi là 41; và khi Sunner kia rút tim thì về lại 40.

### US005 — Error: Rút tim sau ngày đặc biệt

**Given** một Sunner đã thả tim vào ngày đặc biệt (người gửi được cộng 2), **When** ngày đặc biệt đã qua và Sunner đó rút tim, **Then** người gửi bị trừ đúng 2, không phải 1.

### US006 — Happy Path

**Given** vận hành thêm ngày hôm nay vào danh sách ngày đặc biệt, **When** một Sunner thả tim kudos của người khác, **Then** người gửi được cộng 2 tim.

### US006 — Error: Người không phải vận hành ghi danh sách

**Given** khách hoặc người dùng thường cố ghi vào danh sách ngày đặc biệt, **When** hệ thống xử lý, **Then** yêu cầu bị từ chối và danh sách không đổi.

## 9. Edge Cases

| Scenario | What Happens | User-Facing Message |
|----------|--------------|----------------------|
| Bấm tim hai lần liên tiếp rất nhanh | lần bấm thứ hai bị bỏ qua cho tới khi lần đầu xong; kết quả cuối khớp một lần bấm | "None — silent handling" |
| Hai tab cùng mở, một tab đã thả, tab kia thả nữa | lượt thứ hai không có tác dụng; tab sau khớp lại số tim thật | "None — silent handling" |
| Rút tim khi chưa thả | không có gì để xoá, không đổi số tim | "None — silent handling" |
| Người gửi cố thả tim cho kudos của mình bằng cách gọi thẳng | bị từ chối; không bộ đếm nào đổi | "None — nút đã vô hiệu; yêu cầu gọi thẳng không có thông báo trên giao diện" |
| Tài khoản đã đăng nhập nhưng chưa có hồ sơ Sunner | không thả được; nút trở về trạng thái trước khi bấm | "Không cập nhật được tim. Vui lòng thử lại." (D003, chữ tạm) |
| Kudos bị xoá đúng lúc đang thả tim | lượt thích bị từ chối; nút trở về trạng thái trước khi bấm | "Không cập nhật được tim. Vui lòng thử lại." (D003, chữ tạm) |
| Phiên hết hạn lúc bấm | máy chủ không chấp nhận; chuyển tới trang đăng nhập | "None — chuyển thẳng tới trang đăng nhập" |
| Thả đúng khoảng nửa đêm giờ Việt Nam | ngày đặc biệt tính theo giờ máy chủ lúc ghi lượt thích, không theo đồng hồ người xem | "None — silent handling" |
| Cùng một kudos có mặt ở Highlight và All Kudos | hai nút tim đổi cùng nhau | "None — silent handling" |
| Rút tim sau khi ngày đặc biệt đã qua hoặc đã bị xoá khỏi danh sách | trừ đúng số tim đã lưu cùng lượt thích | "None — silent handling" |
| Danh sách chưa có kudos nào | không có thẻ nên không có nút tim | "Hiện tại chưa có Kudos nào." |

## 10. Edge Behaviours to Verify

- **FR-001** → thả hai lần một kudos chỉ tạo một lượt thích; số tim chỉ tăng 1
- **FR-002** → thêm một ngày vào danh sách ngày đặc biệt thì lượt thích vào ngày đó cộng 2; khách và người dùng thường không ghi được danh sách
- **FR-003** → số tim của kudos và tổng tim của người gửi đổi cùng lúc với lượt thích, không cần thao tác nào khác
- **FR-201** → thẻ nào cũng có nút tim và số tim, khách cũng thấy
- **FR-202** → tim xám khi chưa thích, đỏ khi đã thích; tải lại trang vẫn giữ màu
- **FR-203** → ở kudos của chính mình, nút tim bị vô hiệu và không bao giờ đỏ
- **FR-401** → bấm tim xám thì đỏ và số +1 ngay
- **FR-402** → bấm tim đỏ thì xám và số −1 ngay
- **FR-403** → khi lỗi, nút và số trở về như trước khi bấm và có thông báo lỗi ngắn
- **FR-404** → cùng một kudos ở Highlight và All Kudos thì hai nút luôn khớp nhau
- **FR-405** → tổng tim người gửi +1 (ngày thường) hoặc +2 (ngày đặc biệt) khi thả; bỏ thích trừ đúng số đó
- **FR-601** → khách bấm tim thì sang trang đăng nhập và không có lượt thích nào được ghi
- **FR-602** → phiên hết hạn lúc bấm thì không ghi lượt thích và chuyển tới trang đăng nhập
- **FR-603** → không có cách nào xem danh sách người đã thích một kudos
- **FR-604** → gọi thẳng vào hệ thống để cộng tim hay chọn số tim đều bị từ chối

## 11. Risks & Known Issues

| ID | Type | Description | Impact | Status |
|----|------|--------------|--------|--------|
| RISK-01 | risk | Xoá một kudos (ví dụ bằng thao tác trực tiếp trên cơ sở dữ liệu) kéo theo xoá các lượt thích và làm giảm tổng tim của người gửi; hành vi này chưa được xác nhận | tổng tim của người gửi có thể giảm ngoài ý người vận hành | đã chốt (D001): xoá kudos làm tổng tim của người gửi giảm đúng trọng số đã lưu |
| RISK-02 | risk | Số tim trên thẻ đếm lượt thích (mỗi lượt 1) còn tổng tim của người gửi có trọng số (1 hoặc 2), nên vào ngày đặc biệt hai con số có thể khác nhau; spec MoMorph thì ghi "người nhận" khi bỏ thích trong khi quyết định chốt là người gửi | người xem có thể nhầm số tim trên thẻ với "Số tim bạn nhận được" ở sidebar | confirmed (clarifications.md: người gửi nhận tim; số tim trên thẻ là số lượt thích) |
| RISK-03 | risk | Trước khi F006 xác nhận cách hai nút của cùng một kudos dùng chung trạng thái, hai nút có thể lệch nhau trong lúc chờ phản hồi | số tim hiển thị tạm thời không nhất quán trong một thẻ | đã chốt (D004): một kho trạng thái dùng chung, F006 gắn vào trang |

## 12. Dependencies

| Dependency | Type | Why this feature needs it | Evidence |
|------------|------|-----------------------------|----------|
| F006_KudosBoardBrowse (provisional) | feature | sở hữu thẻ kudos, danh sách, bảng kudos (kèm cột số tim) và bảng Sunner (người gửi, kèm cột tổng tim, cả hai do F006 tạo); gắn kho trạng thái tim vào trang; nút tim đặt trong thẻ và nhận `likedByMe`, `isSender` từ đó | FR-201, FR-203, FR-404 |
| F001 / F003 (đăng nhập và nhận biết người đã đăng nhập) | feature | biết người xem là khách hay Sunner đã đăng nhập, và kiểm lại phiên ở máy chủ | FR-601, FR-602 |
| Dịch vụ cơ sở dữ liệu Supabase | infrastructure | lưu lượt thích và ngày đặc biệt; quyền truy cập từng dòng và bộ đếm tự cập nhật giữ các quy tắc ở mức dữ liệu | FR-001, FR-003, FR-604, BR-002 |
| Danh sách ngày đặc biệt (seed) | data | quyết định lượt thích nào được tính 2 tim | FR-002, BR-003 |

## 13. Configuration

```text
LIKE_HEARTS_NORMAL = 1                  # tim người gửi nhận cho một lượt thích ngày thường
LIKE_HEARTS_SPECIAL_DAY = 2             # tim người gửi nhận cho một lượt thích vào ngày đặc biệt (mỗi ngày có thể đặt 1 hoặc 2)
SPECIAL_DAYS = danh sách ngày          # vận hành khai báo trong cơ sở dữ liệu, chưa có trang quản trị
SPECIAL_DAY_TIMEZONE = Asia/Ho_Chi_Minh # "ngày" tính theo giờ Việt Nam tại lúc thả
```
