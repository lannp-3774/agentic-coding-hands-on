---
status: implemented
fcode: F008
authored_by: takumi
created: 2026-10-12
lang: vi
---

# Functional Spec — F008_KudosSpotlight

**Priority**: P2
**Type**: ui
**Generated**: 2026-10-12

**See also:** [`technical-spec.md`](./technical-spec.md) — endpoints, Source citations, pseudocode,
key entities, and DB writes for a Dev/QA/SA audience.

**Traceability:** F008_KudosSpotlight → SCR006_SunKudosLiveBoard (vùng Spotlight) → US048, US049, US050, US051, US052, US053 (mã US toàn cục, tiếp sau F007)

## 1. Overview

**Problem:** Trang Sun* Kudos có hàng trăm lời cảm ơn nhưng người xem chỉ thấy từng thẻ một; chưa có chỗ nhìn toàn cảnh xem ai đã nhận kudos, tìm nhanh một người nhận cụ thể rồi mở kudos của họ.
**Solution:** Vùng "SPOTLIGHT BOARD" trên trang Sun* Kudos: một bảng tên người nhận, mỗi kudos là một nút, bố cục cố định cho cùng dữ liệu. Người xem rê chuột để thấy tên và thời gian nhận, bấm để mở kudos, gõ tên vào ô tìm để làm sáng các nút khớp, bật Pan/Zoom để kéo và phóng to bảng, và nhìn dải "kudos mới nhất" bên dưới.
**Scope:** Tiêu đề vùng, nhãn tổng số kudos lấy từ hệ thống, bảng tên có bố cục tất định, tooltip tên + thời gian, mở kudos từ một nút, tìm kiếm tối đa 100 ký tự có tô sáng, công tắc Pan/Zoom (kéo và lăn chuột), dải kudos mới nhất, trạng thái đang tải và trạng thái rỗng; mở công khai cho khách và Sunner.
**Non-Scope:** Vỏ trang, banner, Highlight, All Kudos, bộ lọc, nút tim và sidebar (thuộc các feature khác của bảng Kudos); trang chi tiết kudos và trang hồ sơ (chưa xây); thao tác hai ngón (pinch) và vuốt trên cảm ứng; bản xem trước hồ sơ khi rê chuột; thêm bảng dữ liệu mới; cập nhật trực tiếp khi có kudos mới mà không tải lại trang.

**Actors**

| Actor | Description | Primary goal |
|-------|--------------|---------------|
| Người xem | khách chưa đăng nhập hoặc Sunner đã đăng nhập; cả hai thấy cùng bảng Spotlight, chỉ khác đích khi mở kudos | tìm ra một người nhận trong biển tên và mở kudos của họ |

## 2. Functional Capabilities

| ID | Capability | What the user can do | User Stories | Requirements | Business Rules | Screens |
|----|------------|------------------------|-----------------|---------------|-------------------|---------|
| CAP-01 | Xem bảng Spotlight | Thấy tiêu đề, tổng số kudos, bảng tên người nhận bố cục cố định và dải kudos mới nhất; thấy trạng thái đang tải hoặc rỗng khi chưa có dữ liệu | US048, US053 | FR-001, FR-002, FR-101, FR-201, FR-202, FR-203, FR-206, FR-207, FR-208, FR-209, FR-409, FR-601 | BR-001, BR-002, BR-003, BR-004, DEC-001 | SCR006_SunKudosLiveBoard |
| CAP-02 | Tìm một người nhận | Gõ tên vào ô tìm (tối đa 100 ký tự), thấy các nút khớp được tô sáng và các nút khác mờ đi | US051 | FR-205, FR-404, FR-405, FR-406 | BR-006, DEC-002 | N/A — nằm trên vùng Spotlight, đã tính ở CAP-01 |
| CAP-03 | Di chuyển và phóng to bảng | Bật Pan/Zoom rồi kéo để dịch bảng, lăn chuột để phóng to hoặc thu nhỏ; tắt thì trang cuộn bình thường | US052 | FR-204, FR-403, FR-407, FR-408 | BR-007, SM-001 | N/A — nằm trên vùng Spotlight, đã tính ở CAP-01 |
| CAP-04 | Xem và mở kudos từ một tên | Rê chuột để thấy tên và thời gian nhận; bấm để mở kudos (người chưa có phiên được đưa tới đăng nhập; khách có phiên ẩn danh mở kudos như Sunner) | US049, US050 | FR-401, FR-402 | BR-005, BR-008 | N/A — nằm trên vùng Spotlight, đã tính ở CAP-01 |

## 3. Open Decisions

Các quyết định lớn đã chốt trong clarifications.md (bố cục tất định, mỗi kudos một nút, tooltip tên + thời gian, bấm mở kudos, công tắc Pan/Zoom kéo + lăn chuột, tìm tối đa 100 ký tự, tổng từ hệ thống, dải kudos mới nhất, trạng thái đang tải và rỗng). D001 đến D005 đã chốt ở lượt "spec gaps" ngày 2026-10-12 và chỉ ghi lại để tra cứu; D006 và D007 còn mở, mỗi dòng có mặc định để làm tiếp.

| D### | Decision | Default proposal | Rationale | Blocks work |
|------|----------|-------------------|-----------|--------------|
| D001 | Spotlight có theo bộ lọc Hashtag và Department của trang không? | **Đã chốt:** không theo bộ lọc: luôn là toàn bộ kudos của sự kiện và tổng thật không đổi khi lọc | Spec chỉ nói bộ lọc tác động Highlight và All Kudos; nhãn tổng lấy từ hệ thống; theo bộ lọc làm bảng thay đổi theo từng lần lọc và phức tạp hơn | no |
| D002 | Khi tổng kudos vượt số nút tối đa (khoảng 300), vẽ những kudos nào? | **Đã chốt:** 300 kudos mới nhất; nhãn tổng vẫn là tổng thật | Đơn giản, ổn định, đúng với dải kudos mới nhất; không cần thêm tiêu chí xếp hạng | no |
| D003 | Tìm kiếm có bỏ qua hoa thường và dấu tiếng Việt không? | **Đã chốt:** có; không phân biệt hoa thường và dấu tiếng Việt, gõ "nguyen" khớp "Nguyễn" | Tên người Việt thường gõ không dấu; spec không nói rõ | no |
| D004 | Ô tìm kiếm xử lý chuỗi quá dài, để trống và xoá chữ thế nào, thông báo lỗi ghi gì? | **Đã chốt:** kiểm khi bấm tìm: cho gõ vượt 100 ký tự nhưng Enter hoặc kính lúp thì báo lỗi (101 ký tự bị từ chối kèm thông báo); để trống mà tìm bị chặn kèm thông báo bắt buộc nhập; xoá hết chữ trong ô thì bỏ tô sáng; chữ thông báo là chữ tạm, do người sở hữu thiết kế xác nhận | Khớp test case "100 ký tự được, 101 bị từ chối, để trống bị chặn"; cần cách quay về bảng nguyên vẹn | no |
| D005 | Dải "kudos mới nhất" hiện gì và theo dạng giờ nào? | **Đã chốt:** 5 kudos mới nhất lúc tải trang, xếp chồng 5 dòng tĩnh như Figma, mỗi dòng "{giờ} {tên người nhận} đã nhận được một Kudos mới" với giờ dạng `hh:mmAM/PM` (ví dụ 08:30PM); không tự cập nhật khi có kudos mới | Khớp bố cục Figma; cập nhật trực tiếp hay luân phiên là thêm ngoài yêu cầu | no |
| D006 | Khi tìm mà không nút nào khớp, và khi bảng rỗng, điều khiển xử lý ra sao? | Không khớp: giữ nút ở kiểu thường và báo "Không tìm thấy"; rỗng: ô tìm và nút Pan/Zoom bị vô hiệu | Làm mờ tất cả trông như hỏng; điều khiển trên bảng rỗng không có tác dụng | no |
| D007 | Chữ thông báo rỗng của Spotlight? | Dùng lại "Hiện tại chưa có Kudos nào." như All Kudos | Cùng thông báo đã chốt cho danh sách và carousel; Figma Spotlight không có chữ riêng | no |

## 4. Requirements

### Foundation (0xx)

- **FR-001** Tên người nhận, thời điểm nhận và tổng số kudos của bảng lấy từ dữ liệu kudos có sẵn của hệ thống; feature không thêm bảng dữ liệu mới.
- **FR-002** Bảng vẽ tối đa khoảng 300 nút dù tổng kudos nhiều hơn; đó là 300 kudos mới nhất (D002).

### Navigation (1xx)

- **FR-101** Vùng Spotlight nằm trên trang Sun* Kudos, sau carousel Highlight và trước danh sách All Kudos; không có địa chỉ riêng.

### Spotlight Board (2xx)

- **FR-201** Vùng có chữ nhỏ "Sun* Annual Awards 2025" và chữ lớn "SPOTLIGHT BOARD".
- **FR-202** Nhãn "{n} KUDOS" với n là tổng số kudos lấy từ hệ thống, không bị cắt theo số nút vẽ.
- **FR-203** Mỗi kudos là một nút hiện tên người nhận; người nhận có nhiều kudos có nhiều nút; vị trí do bố cục tất định, cùng dữ liệu thì cùng vị trí.
- **FR-204** Có nút Pan/Zoom với chú thích "Pan/Zoom" khi rê chuột, mặc định tắt, thể hiện rõ đang bật hay tắt.
- **FR-205** Có ô tìm kiếm với biểu tượng kính lúp và gợi ý "Tìm kiếm", chấp nhận tối đa 100 ký tự.
- **FR-206** Dải kudos mới nhất ở góc dưới trái bảng, xếp chồng tối đa 5 dòng của 5 kudos mới nhất (mới nhất ở trên cùng), mỗi dòng hiện giờ dạng `hh:mmAM/PM` theo múi giờ Asia/Ho_Chi_Minh, tên người nhận và câu "đã nhận được một Kudos mới"; đọc một lần lúc tải trang, không tự cập nhật (D005); ít hơn 5 kudos thì hiện bấy nhiêu dòng.
- **FR-207** Trong lúc dữ liệu đang tải, vùng hiện khung chờ không chữ cùng kích thước vùng thật; các phần khác của trang không phải chờ.
- **FR-208** Chưa có kudos nào thì vùng giữ tiêu đề và nhãn "0 KUDOS", thay bảng bằng thông báo rỗng (xem D007) và vô hiệu ô tìm với nút Pan/Zoom.
- **FR-209** Không đọc được dữ liệu thì vùng hiện như trạng thái rỗng; lỗi ghi ở máy chủ; phần còn lại của trang vẫn hiện.

### Interaction (4xx)

- **FR-401** Rê chuột hoặc đưa tiêu điểm bàn phím vào một nút thì hiện chú thích gồm tên người nhận và thời gian nhận; rời đi hoặc nhấn Esc thì ẩn.
- **FR-402** Bấm một nút mở kudos tương ứng; người chưa có phiên được đưa tới trang đăng nhập (khách đã có phiên ẩn danh, sau khi bấm tim hoặc mở Viết Kudo, đi tới kudos như Sunner); trang kudos chưa xây thì người đã đăng nhập thấy trang không tìm thấy mặc định.
- **FR-403** Khi Pan/Zoom bật, kéo chuột dịch bảng và lăn chuột phóng to hoặc thu nhỏ trong khoảng 0.5 đến 4 lần; khi tắt, kéo và lăn chuột không tác động lên bảng và trang cuộn bình thường.
- **FR-404** Nhấn Enter hoặc bấm kính lúp thì các nút có tên khớp (không phân biệt hoa thường và dấu tiếng Việt, D003) được tô sáng, các nút còn lại mờ đi, và số nút khớp được báo cho người dùng trình đọc màn hình.
- **FR-405** Chuỗi tìm 100 ký tự được chấp nhận; 101 ký tự bị từ chối kèm thông báo lỗi; để trống mà bấm tìm bị chặn kèm thông báo bắt buộc nhập (xem D004). Ô tìm không chặn việc gõ quá 100 ký tự; lỗi chỉ hiện khi bấm tìm.
- **FR-406** Xoá hết chữ trong ô tìm thì bỏ tô sáng, mọi nút trở lại kiểu thường.
- **FR-407** Bàn phím: Tab đi qua từng nút theo thứ tự trong trang, nút nhận tiêu điểm tự được đưa vào tầm nhìn; khi Pan/Zoom bật, phím mũi tên dịch bảng và `+`/`-` phóng to hoặc thu nhỏ [EXPECTED].
- **FR-408** Khi người xem bật giảm chuyển động trên thiết bị, bảng không có hiệu ứng chuyển động và dải kudos mới nhất đứng yên.
- **FR-409** Chữ giao diện của vùng (tiêu đề, nhãn, gợi ý, thông báo) đổi theo VN/EN; tên người nhận giữ nguyên.

### Security (6xx)

- **FR-601** Vùng Spotlight mở công khai: khách và Sunner thấy cùng dữ liệu, chỉ xem, không thao tác nào ghi dữ liệu.

## 5. Business Rules

- Spotlight là dữ liệu công khai, chỉ đọc; xem bảng không cần đăng nhập và không ai bị chuyển hướng khỏi trang chỉ vì xem (BR-001)
- Mỗi kudos là đúng một nút và nút hiện tên người nhận; người nhận có nhiều kudos thì có nhiều nút cùng tên (BR-002)
- Bố cục tất định: vị trí chỉ phụ thuộc dữ liệu và một thứ tự cố định, không có yếu tố ngẫu nhiên, nên tải lại cho cùng vị trí (BR-003)
- Bảng vẽ tối đa khoảng 300 nút nhưng nhãn tổng luôn là tổng thật trong hệ thống (BR-004)
- Thời gian nhận hiển thị theo dạng `HH:mm - MM/DD/YYYY` theo múi giờ Asia/Ho_Chi_Minh (BR-005)
- Chuỗi tìm tối đa 100 ký tự và không được để trống; khớp không phân biệt hoa thường và dấu (D003, đã chốt) (BR-006)
- Kéo và lăn chuột chỉ tác động lên bảng khi Pan/Zoom đang bật; tắt thì trang cuộn bình thường (BR-007)
- Có phiên (đã đăng nhập, hoặc khách có phiên ẩn danh) thì bấm nút mở kudos tương ứng; chưa có phiên thì được đưa tới trang đăng nhập (BR-008)
- Vùng Spotlight ở đúng một trong ba trạng thái: đang tải, rỗng (kể cả khi không đọc được dữ liệu) hoặc bảng tương tác (DEC-001)
- Tìm kiếm: chưa tìm thì mọi nút ở kiểu thường; tìm có kết quả thì nút khớp sáng và nút khác mờ; tìm không có kết quả thì báo "Không tìm thấy" và giữ nút ở kiểu thường (DEC-002)
- Chế độ Pan/Zoom có ba trạng thái: tắt (mặc định), bật, và đang kéo; mỗi lần mở trang bắt đầu ở trạng thái tắt (SM-001)

## 6. Screens

| Screen Name | SCR### | What User Sees | What User Can Do |
|-------------|--------|-----------------|-------------------|
| Sun* Kudos - Live board, vùng Spotlight (B.6–B.7) | SCR006_SunKudosLiveBoard | chữ nhỏ và chữ lớn "SPOTLIGHT BOARD"; nhãn "{n} KUDOS"; nút Pan/Zoom và ô tìm kiếm; bảng tên người nhận (mỗi nút một tên), dải kudos mới nhất ở góc dưới trái; hoặc khung chờ; hoặc thông báo rỗng | rê chuột xem tên và thời gian; bấm tên để mở kudos; tìm tên; bật Pan/Zoom rồi kéo và lăn chuột; dùng bàn phím để đi qua các tên |

Vùng này là một phần của màn hình Sun* Kudos - Live board, vỏ màn hình thuộc feature Kudos Board Browse; feature này không tạo màn hình mới và không có bản đặc tả màn hình riêng.

### User Journey

1. Người xem mở trang Sun* Kudos, cuộn qua Highlight và thấy vùng SPOTLIGHT BOARD với nhãn tổng số kudos và các tên người nhận.
2. Người xem rê chuột vào một tên — chú thích hiện tên và thời gian nhận.
3. Người xem gõ một tên vào ô tìm rồi nhấn Enter — các tên khớp sáng lên, các tên khác mờ đi.
4. Người xem bật Pan/Zoom, kéo bảng và lăn chuột để phóng to tên cần xem; tắt Pan/Zoom để cuộn trang lại bình thường.
5. Người xem bấm một tên — người đã đăng nhập tới kudos đó, khách được đưa tới trang đăng nhập.

## 7. User Stories

### US048 — Xem bảng Spotlight và tổng số kudos

**Actor:** Người xem
**Goal:** Thấy toàn cảnh những người đã nhận kudos và tổng số kudos trên một bảng.
**Business value:** Người xem cảm nhận được quy mô của phong trào ghi nhận mà không phải đọc từng thẻ.

**Acceptance Criteria:**
- [ ] Vùng có "SPOTLIGHT BOARD" và nhãn "{n} KUDOS" với n bằng tổng số kudos trong hệ thống.
- [ ] Mỗi kudos có một nút hiện tên người nhận, tối đa khoảng 300 nút; tải lại trang cho cùng vị trí.
- [ ] Trong lúc tải thấy khung chờ không chữ; không có kudos thì thấy "Hiện tại chưa có Kudos nào.".
- [ ] Khách và Sunner thấy cùng bảng.

### US049 — Xem thời gian nhận kudos qua chú thích

**Actor:** Người xem
**Goal:** Rê chuột hoặc dùng bàn phím vào một tên để biết tên đầy đủ và thời gian nhận kudos.
**Business value:** Người xem biết kudos được nhận khi nào mà không phải mở trang chi tiết.

**Acceptance Criteria:**
- [ ] Rê chuột hoặc Tab tới một nút thì hiện chú thích có tên và thời gian dạng `HH:mm - MM/DD/YYYY`.
- [ ] Rời nút thì chú thích ẩn.

### US050 — Mở kudos từ một tên

**Actor:** Người xem
**Goal:** Bấm một tên trên bảng để xem kudos của người đó.
**Business value:** Từ bảng khám phá, người xem đi thẳng tới nội dung lời cảm ơn.

**Acceptance Criteria:**
- [ ] Sunner đã đăng nhập bấm một nút thì mở kudos tương ứng (trang chưa xây thì thấy trang không tìm thấy mặc định).
- [ ] Người chưa có phiên bấm một nút thì được đưa tới trang đăng nhập; khách có phiên ẩn danh thì mở kudos như Sunner.
- [ ] Kéo bảng rồi nhả chuột trên một nút không mở kudos.

### US051 — Tìm tên người nhận

**Actor:** Người xem
**Goal:** Gõ một tên vào ô tìm để làm sáng các nút khớp.
**Business value:** Người xem tìm ra một người nhận cụ thể trong hàng trăm tên.

**Acceptance Criteria:**
- [ ] Tìm một tên có trong bảng thì các nút khớp sáng, các nút khác mờ.
- [ ] 100 ký tự được chấp nhận; 101 ký tự bị từ chối kèm thông báo lỗi.
- [ ] Để trống mà bấm tìm thì bị chặn kèm thông báo bắt buộc nhập.
- [ ] Xoá hết chữ thì mọi nút trở lại kiểu thường.

### US052 — Kéo và phóng to bảng

**Actor:** Người xem
**Goal:** Bật Pan/Zoom rồi kéo và lăn chuột để xem phần bảng mình quan tâm.
**Business value:** Bảng có nhiều tên vẫn đọc được từng tên mà không làm hỏng việc cuộn trang.

**Acceptance Criteria:**
- [ ] Pan/Zoom mặc định tắt; lăn chuột trên bảng khi tắt thì trang cuộn bình thường.
- [ ] Bật rồi kéo thì bảng dịch theo; lăn chuột thì phóng to hoặc thu nhỏ trong khoảng 0.5 đến 4 lần.
- [ ] Nút Pan/Zoom thể hiện rõ đang bật hay tắt.

### US053 — Xem dải kudos mới nhất

**Actor:** Người xem
**Goal:** Biết kudos nào vừa được trao gần đây nhất.
**Business value:** Tạo cảm giác bảng "đang sống" và khuyến khích người xem gửi kudos.

**Acceptance Criteria:**
- [ ] Dải ở góc dưới trái xếp chồng tối đa 5 dòng của 5 kudos mới nhất, mỗi dòng có giờ `hh:mmAM/PM`, tên người nhận và câu "đã nhận được một Kudos mới".
- [ ] Dải được đọc một lần lúc tải trang, không đổi khi có kudos mới sau đó.
- [ ] Bật giảm chuyển động thì dải đứng yên.

## 8. Scenarios

### US048 — Happy Path

**Given** hệ thống có 388 kudos, **When** khách mở trang Sun* Kudos, **Then** vùng Spotlight hiện "388 KUDOS" và các nút tên người nhận (tối đa khoảng 300).

### US048 — Error: Chưa có kudos nào

**Given** hệ thống chưa có kudos, **When** người xem mở trang, **Then** vùng hiện "0 KUDOS" và thông báo "Hiện tại chưa có Kudos nào." thay cho bảng, còn các vùng khác của trang vẫn hiện.

### US049 — Happy Path

**Given** một kudos nhận lúc 10:00 ngày 30/10/2025 (giờ Việt Nam), **When** người xem rê chuột vào nút của kudos đó, **Then** chú thích hiện tên người nhận và "10:00 - 10/30/2025".

### US049 — Error: Đưa tiêu điểm bàn phím vào nút

**Given** người xem dùng bàn phím, **When** nhấn Tab tới một nút rồi nhấn Esc, **Then** chú thích hiện khi tiêu điểm vào nút và ẩn sau khi nhấn Esc.

### US050 — Happy Path

**Given** Sunner đã đăng nhập, **When** bấm một nút trên bảng, **Then** trình duyệt chuyển tới kudos tương ứng.

### US050 — Error: Khách bấm một nút

**Given** người chưa có phiên (chưa đăng nhập, chưa thả tim hay mở Viết Kudo), **When** bấm một nút, **Then** được đưa tới trang đăng nhập.

### US051 — Happy Path

**Given** bảng có các tên chứa "Nguyễn", **When** người xem gõ "Nguyễn" rồi nhấn Enter, **Then** các nút khớp sáng lên và các nút còn lại mờ đi.

### US051 — Error: Chuỗi tìm không hợp lệ

**Given** ô tìm đang trống, **When** người xem bấm kính lúp, **Then** thấy thông báo bắt buộc nhập và tô sáng hiện có không đổi; tương tự, 101 ký tự bị từ chối với thông báo lỗi.

### US052 — Happy Path

**Given** Pan/Zoom đang bật, **When** người xem kéo chuột và lăn chuột trên bảng, **Then** bảng dịch và phóng to theo.

### US052 — Error: Lăn chuột khi Pan/Zoom tắt

**Given** Pan/Zoom đang tắt, **When** người xem lăn chuột trên bảng, **Then** trang cuộn bình thường và bảng không đổi.

### US053 — Happy Path

**Given** kudos mới nhất do "Nguyễn Bá Chức" nhận, **When** người xem mở trang, **Then** dải ở góc dưới trái hiện 5 dòng, dòng trên cùng có giờ `hh:mmAM/PM`, tên đó và câu "đã nhận được một Kudos mới".

### US053 — Error: Chưa có kudos

**Given** hệ thống chưa có kudos, **When** người xem mở trang, **Then** không hiện dải kudos mới nhất.

## 9. Edge Cases

| Scenario | What Happens | User-Facing Message |
|----------|--------------|----------------------|
| Chuỗi tìm đúng 100 ký tự | Được chấp nhận và tìm bình thường | None — silent handling |
| Chuỗi tìm 101 ký tự (dán vào) | Không tìm, tô sáng hiện có giữ nguyên | "Thông báo lỗi quá dài (chữ chờ xác nhận, D004)" |
| Bấm tìm khi ô trống | Bị chặn | "Thông báo bắt buộc nhập (chữ chờ xác nhận, D004)" |
| Tìm chuỗi không khớp tên nào | Các nút giữ kiểu thường | "Không tìm thấy" |
| Tổng kudos nhiều hơn số nút vẽ (388 so với 300) | Nhãn ghi tổng thật, chỉ vẽ phần nút tối đa | None — silent handling |
| Một người nhận nhiều kudos | Có nhiều nút cùng tên, mỗi nút một thời gian riêng | None — silent handling |
| Có ít hơn 5 kudos | Dải kudos mới nhất hiện bấy nhiêu dòng | None — silent handling |
| Có kudos mới sau khi trang đã tải | Dải và bảng không đổi cho tới khi tải lại trang | None — silent handling |
| Chưa có kudos nào | Tiêu đề và "0 KUDOS" giữ nguyên, ô tìm và Pan/Zoom bị vô hiệu | "Hiện tại chưa có Kudos nào." |
| Không đọc được dữ liệu | Hiện như rỗng, lỗi ghi ở máy chủ, vùng khác của trang vẫn hiện | "Hiện tại chưa có Kudos nào." |
| Lăn chuột khi Pan/Zoom tắt | Trang cuộn, bảng không đổi | None — silent handling |
| Kéo bảng rồi nhả chuột trên một nút | Không mở kudos | None — silent handling |
| Người chưa có phiên bấm một nút | Được đưa tới trang đăng nhập | None — silent handling |
| Người đã đăng nhập bấm khi trang kudos chưa xây | Thấy trang không tìm thấy mặc định | Trang không tìm thấy mặc định |
| Hai tên dài nằm gần nhau và chồng chữ | Chấp nhận phần chồng còn lại; chú thích và phóng to bù lại | None — silent handling |
| Thiết bị bật giảm chuyển động | Bảng không có hiệu ứng, dải kudos mới nhất đứng yên | None — silent handling |
| Trang còn khoá trước giờ mở (F005) và người mở không phải admin | Được đưa tới trang đếm ngược thay vì trang này | None — silent handling |
| Ngôn ngữ EN | Chữ giao diện của vùng dịch sang tiếng Anh; tên người nhận giữ nguyên | None — silent handling |

## 10. Edge Behaviours to Verify

- **FR-001** → Không có bảng dữ liệu mới nào được thêm; nhãn tổng và tên khớp dữ liệu seed
- **FR-002** → Với hơn khoảng 300 kudos, bảng không vẽ quá số nút tối đa
- **FR-101** → Vùng nằm sau Highlight, trước All Kudos; khách không bị chuyển hướng
- **FR-201** → Có "Sun* Annual Awards 2025" và "SPOTLIGHT BOARD"
- **FR-202** → "{n} KUDOS" bằng tổng kudos trong dữ liệu, kể cả khi lớn hơn số nút
- **FR-203** → Mỗi kudos một nút, người nhận nhiều kudos có nhiều nút; hai lần tải cho cùng vị trí
- **FR-204** → Nút Pan/Zoom mặc định tắt, có chú thích "Pan/Zoom", thể hiện bật/tắt
- **FR-205** → Ô tìm có kính lúp và gợi ý "Tìm kiếm"
- **FR-206** → Dải hiện đúng 5 kudos mới nhất với giờ `hh:mmAM/PM`, không đổi khi có kudos mới sau lúc tải, và đứng yên khi giảm chuyển động
- **FR-207** → Khung chờ không chữ khi dữ liệu chậm
- **FR-208** → Rỗng thì "0 KUDOS", thông báo rỗng, ô tìm và Pan/Zoom bị vô hiệu
- **FR-209** → Lỗi đọc dữ liệu hiện như rỗng, vùng khác vẫn hiện
- **FR-401** → Rê chuột hoặc Tab vào nút hiện tên và thời gian đúng múi giờ; Esc ẩn
- **FR-402** → Có phiên (kể cả ẩn danh) mở kudos; chưa có phiên tới trang đăng nhập
- **FR-403** → Bật: kéo và lăn chuột đổi bảng trong 0.5–4 lần; tắt: trang cuộn
- **FR-404** → Enter hoặc kính lúp tô sáng nút khớp, làm mờ nút khác, báo số kết quả
- **FR-405** → 100 ký tự được, 101 bị từ chối, trống bị chặn
- **FR-406** → Xoá chữ thì bỏ tô sáng
- **FR-407** → Tab đi qua các nút; nút nhận tiêu điểm vào tầm nhìn
- **FR-408** → Giảm chuyển động thì bảng và dải không có hiệu ứng
- **FR-409** → EN đổi chữ giao diện, tên người nhận giữ nguyên
- **FR-601** → Khách xem được cùng dữ liệu và không có thao tác ghi nào

## 11. Risks & Known Issues

| ID | Type | Description | Impact | Status |
|----|------|--------------|--------|--------|
| RISK-01 | risk | Test case yêu cầu "101 ký tự bị từ chối kèm lỗi" nhưng ô nhập thường chặn gõ ở 100 ký tự nên không bao giờ thấy lỗi | QA có thể báo sai hoặc không kiểm được trường hợp này | đã chốt (D004): cho gõ vượt, báo lỗi khi bấm tìm |
| RISK-02 | risk | Cảm ứng không hỗ trợ pinch và không có nút phóng to trên màn hình, nên trên điện thoại chỉ kéo được, không phóng to được | Người dùng điện thoại đọc tên nhỏ khó hơn | [EXPECTED] chấp nhận ở vòng này theo quyết định đã chốt; xem lại nếu cần |
| RISK-03 | risk | Bố cục tất định không có bộ giải va chạm nên tên dài ở vị trí gần nhau có thể chồng chữ | Một số tên khó đọc cho tới khi phóng to hoặc rê chuột | [EXPECTED] chấp nhận; chú thích và phóng to bù lại |
| RISK-04 | risk | Nhãn tổng (ví dụ 388) lớn hơn số nút vẽ (300) nên người xem đếm nút không khớp nhãn | Có thể bị hỏi vì sao thiếu tên | đã chốt (D002): nhãn ghi tổng thật, bảng vẽ 300 kudos mới nhất |
| RISK-05 | risk | Trang chi tiết kudos và hồ sơ chưa xây; test case "bấm nút mở chi tiết kudos" chưa đạt được trọn vẹn | Chỉ đạt ở mức đích dự kiến và trang không tìm thấy mặc định | [EXPECTED] cho tới khi trang chi tiết được xây |
| RISK-06 | risk | Dải kudos mới nhất trong Figma ghi giờ dạng 12 giờ (08:30PM), khác dạng `HH:mm` dùng ở thời gian nhận | Hiển thị giờ không nhất quán trong cùng vùng | đã chốt (D005): dải dùng dạng 12 giờ `hh:mmAM/PM` như Figma, tooltip dùng `HH:mm - MM/DD/YYYY` |
| RISK-07 | risk | Vùng phụ thuộc dữ liệu kudos, người nhận và trạng thái đăng nhập của feature Kudos Board Browse, chưa có mã để xác nhận cách truyền | Phải chỉnh lại khi feature đó chốt vỏ trang | [UNVERIFIED] |

## 12. Dependencies

| Dependency | Type | Why this feature needs it | Evidence |
|------------|------|-----------------------------|----------|
| Kudos Board Browse (F006) | feature | Cấp vỏ trang, khe cho vùng Spotlight, dữ liệu kudos và người nhận (tên, số kudos đã nhận) và trạng thái đăng nhập; F008 chỉ đọc, không thêm bảng | FR-001, FR-101, BR-008 |
| Đăng nhập (F001) | feature | Trang đăng nhập là đích khi khách bấm một nút; phiên làm mới ở mọi lần mở trang | FR-402, BR-008 |
| Khoá trước giờ mở (F005) | feature | Trang Sun* Kudos bị khoá như mọi trang trước giờ mở nên vùng này cũng vậy | FR-601 |
| Chữ VN/EN (cơ chế ngôn ngữ của F002) | feature | Chữ giao diện của vùng dịch theo ngôn ngữ đã chọn | FR-409 |
| Trang chi tiết kudos (chưa xây) | feature | Đích khi người đã đăng nhập bấm một nút; chưa xây | FR-402 |
| Cơ sở dữ liệu Supabase local | infrastructure | Nơi đọc dữ liệu kudos công khai | FR-001, FR-601 |

## 13. Configuration

```text
SPOTLIGHT_MAX_NODES = 300          # số nút tối đa trên bảng, dù tổng kudos nhiều hơn
SPOTLIGHT_SEARCH_MAX_LENGTH = 100  # số ký tự tối đa của chuỗi tìm kiếm (kiểm khi bấm tìm, không chặn lúc gõ)
SPOTLIGHT_TICKER_LINES = 5         # số dòng của dải kudos mới nhất
SPOTLIGHT_ZOOM_MIN = 0.5           # mức thu nhỏ nhỏ nhất của bảng
SPOTLIGHT_ZOOM_MAX = 4             # mức phóng to lớn nhất của bảng
```
