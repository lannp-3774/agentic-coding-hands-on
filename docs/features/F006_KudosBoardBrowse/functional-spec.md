---
status: implemented
fcode: F006
authored_by: takumi
created: 2026-10-12
lang: vi
---

# Functional Spec — F006_KudosBoardBrowse

**Priority**: P0
**Type**: ui
**Generated**: 2026-10-12

**See also:** [`technical-spec.md`](./technical-spec.md) — endpoints, Source citations, pseudocode,
key entities, and DB writes for a Dev/QA/SA audience.

**Traceability:** F006_KudosBoardBrowse → SCR006_SunKudosLiveBoard → US034, US035, US036, US037, US038, US039, US040, US041 (mã US toàn cục, tiếp sau US033 của F005)

## 1. Overview

**Problem:** Header, footer, trang chủ và trang Awards Information đều có liên kết "Sun* Kudos" nhưng trang đích chưa có. Sunner và khách chưa có nơi xem những lời cảm ơn, ghi nhận đang diễn ra trong SAA 2025: kudos nào được yêu thích nhất, kudos mới nhất, kudos của một phòng ban hay một chủ đề.
**Solution:** Trang "Sun* Kudos - Live board" công khai: banner và thanh gửi kudos (hiện chưa làm gì), carousel Highlight gồm tối đa 5 kudos nhiều tim nhất, dòng All Kudos mới nhất trước cuộn vô hạn, hai bộ lọc Hashtag/Phòng ban dùng chung cho cả hai, thẻ kudos đủ người gửi, người nhận, danh hiệu Hero, giờ, nội dung, hashtag, ảnh, và nút "Copy Link". Dữ liệu lấy từ hệ thống, nạp sẵn theo nội dung Figma.
**Scope:** Vỏ màn hình `/sun-kudos` và các vùng chừa chỗ cho tim, Spotlight, sidebar; banner và thanh gửi kudos (A.1); carousel Highlight; dòng All Kudos; hai bộ lọc; thẻ kudos (người gửi/nhận, sao và nhãn Hero, giờ, tiêu đề, nội dung, hashtag, ảnh đính kèm); Copy Link; liên kết tới chi tiết và hồ sơ (khách bị đưa tới đăng nhập); header/footer đánh dấu "Sun* Kudos"; VN/EN; nền dữ liệu người và kudos dùng chung cho các feature còn lại của bảng.
**Non-Scope:** Nút thả/rút tim và điểm tim (F007; ở đây chỉ chừa chỗ); bảng Spotlight (F008); sidebar thống kê và danh sách quà (F009); hộp thoại gửi kudos; trang chi tiết kudos và trang hồ sơ (chỉ có liên kết, hiện 404 mặc định); hộp xem nhanh hồ sơ khi rê chuột; mở Secret Box; giao diện quản trị hashtag, phòng ban; sửa hoặc xoá kudos; vuốt/chụm tay trên carousel; dữ liệu môi trường thật (chỉ có dữ liệu seed local).

**Actors**

| Actor | Description | Primary goal |
|-------|--------------|---------------|
| Khách chưa đăng nhập | người mở trang mà chưa có phiên; thấy toàn bộ nội dung công khai | đọc kudos nổi bật và mới nhất, lọc theo chủ đề hoặc phòng ban, chép liên kết một kudos |
| Sunner đã đăng nhập | nhân viên có phiên đăng nhập; thấy cùng nội dung như khách, mở được liên kết sang chi tiết và hồ sơ | đọc kudos, tìm kudos của phòng ban mình quan tâm, mở chi tiết hoặc hồ sơ |
| Hệ thống (nền) | tiến trình tự động trong cơ sở dữ liệu, không có người thao tác | gắn mỗi tài khoản đăng nhập với một Sunner và giữ số kudos nhận luôn đúng |

## 2. Functional Capabilities

| ID | Capability | What the user can do | User Stories | Requirements | Business Rules | Screens |
|----|------------|------------------------|-----------------|---------------|-------------------|---------|
| CAP-01 | Mở trang bảng Kudos | Vào `/sun-kudos` không cần đăng nhập, thấy banner, thanh gửi kudos, chỗ giữ cho tim/Spotlight/sidebar, chọn VN/EN | US034 | FR-101, FR-102, FR-201, FR-202, FR-203, FR-404, FR-601 | BR-001, BR-002, BR-009 | SCR006_SunKudosLiveBoard |
| CAP-02 | Xem Kudos nổi bật | Xem tối đa 5 kudos nhiều tim nhất trong carousel, chuyển thẻ bằng mũi tên, thấy số thứ tự `n/tổng` | US035 | FR-204, FR-205, FR-206, FR-207, FR-208 | BR-004, DEC-001, DEC-002 | N/A — nằm trên màn hình Sun* Kudos Live board, đã tính ở CAP-01 |
| CAP-03 | Đọc dòng All Kudos | Cuộn dòng kudos mới nhất trước và đọc từng thẻ: người gửi, người nhận, danh hiệu Hero, giờ, nội dung, hashtag, ảnh | US036, US040 | FR-209, FR-210, FR-211, FR-212, FR-213, FR-214, FR-215 | BR-003, BR-005, BR-007, BR-008, DEC-003, DEC-004 | N/A — nằm trên màn hình Sun* Kudos Live board, đã tính ở CAP-01 |
| CAP-04 | Lọc kudos theo Hashtag và Phòng ban | Chọn hashtag hoặc phòng ban để thu hẹp cả Highlight lẫn All Kudos, bấm hashtag trên thẻ để lọc, bỏ lọc để xem tất cả | US037 | FR-301, FR-302, FR-303, FR-304, FR-305 | BR-006, DEC-005 | N/A — nằm trên màn hình Sun* Kudos Live board, đã tính ở CAP-01 |
| CAP-05 | Chia sẻ và mở kudos | Chép liên kết của một kudos, mở chi tiết kudos hoặc hồ sơ một Sunner (khách được đưa tới đăng nhập) | US038, US039 | FR-401, FR-402, FR-403 | BR-010, BR-013, DEC-006, DEC-007 | N/A — nằm trên màn hình Sun* Kudos Live board, đã tính ở CAP-01 |
| CAP-06 | Nền dữ liệu Sunner và kudos | Mỗi tài khoản đăng nhập có một Sunner tương ứng; số kudos nhận của người nhận luôn khớp số kudos thật; dữ liệu seed đủ để duyệt và lọc | US041 | FR-001, FR-002, FR-003 | BR-011, BR-012 | N/A — nền dữ liệu chạy nền, không có màn hình riêng |

## 3. Open Decisions

D001 đến D012 đã chốt trong clarifications.md ngày 2026-10-12 (hai lượt đầu); D013, D014, D016 đến D020 và D022 đã chốt ở lượt "spec gaps" cùng ngày; tất cả chỉ ghi lại để tra cứu. Còn chờ xác nhận: D015 và D021, cả hai đều có thể làm theo mặc định rồi đổi sau.

| D### | Decision | Default proposal | Rationale | Blocks work |
|------|----------|-------------------|-----------|--------------|
| D001 | Phạm vi lượt này? | **Đã chốt:** cả màn hình, dùng dữ liệu thật trong hệ thống nạp theo nội dung Figma; F006 làm vỏ trang, banner, Highlight, All Kudos, bộ lọc, Copy Link, nền dữ liệu | Chia 4 feature; F006 là nền của ba feature còn lại | no |
| D002 | Điều khiển trỏ tới màn hình chưa có (gửi kudos A.1, chi tiết, hồ sơ, hộp thoại Secret Box)? | **Đã chốt:** liên kết tới địa chỉ dự kiến `/sun-kudos/[id]`, `/profiles/[id]` (404 mặc định cho tới khi xây); Copy Link chép địa chỉ tuyệt đối của chi tiết; A.1 và "Mở Secret Box" hiện đúng Figma nhưng chưa làm gì; hộp xem nhanh hồ sơ ngoài phạm vi | Không chặn việc xây bảng; cùng cách xử lý như F004 | no |
| D003 | Ai xem và dùng được bảng? | **Đã chốt:** khách xem mọi thứ công khai; bấm hồ sơ hoặc chi tiết thì khách được đưa tới `/login` | Đọc kudos là công khai, hành động gắn với người dùng thì cần đăng nhập | no |
| D004 | Nhãn danh hiệu Hero tính thế nào? | **Đã chốt:** theo số kudos NHẬN: 0–9 New Hero (0 sao), 10–19 Rising Hero (1), 20–49 Super Hero (2), 50+ Legend Hero (3); chỉ hiện ở nơi Figma có (thẻ, khối người gửi/người nhận) | Khớp ba mức tooltip sao trong thiết kế | no |
| D005 | Bộ lọc Phòng ban khớp ai? | **Đã chốt:** phòng ban của người NHẬN | Phòng ban được ghi nhận là thứ người xem quan tâm | no |
| D006 | Hashtag là chữ tự do hay danh sách sẵn? | **Đã chốt:** danh sách cố định theo các thẻ trong Figma, gắn nhiều-nhiều với kudos; bộ lọc Hashtag liệt kê đúng danh sách này | Bộ lọc cần tập giá trị xác định, tránh trùng lặp chữ hoa/thường | no |
| D007 | Một kudos có mấy người nhận? | **Đã chốt:** đúng một người nhận (thẻ Figma chỉ có một khối người nhận) | Khớp thiết kế thẻ | no |
| D008 | Thẻ hai bên của carousel có bấm được không, có vuốt không? | **Đã chốt:** hai bên chỉ để nhìn, không bấm được; không cần vuốt hay chụm tay | Giảm phạm vi; đúng ghi chú "mờ và không tương tác" của Figma | no |
| D009 | Chữ định dạng giờ và ngôn ngữ? | **Đã chốt:** giờ `HH:mm - MM/DD/YYYY` theo múi giờ Asia/Ho_Chi_Minh; EN chỉ dịch nhãn giao diện, nội dung kudos giữ nguyên chữ gốc (quy tắc của F002) | Nhất quán với các trang đã có | no |
| D010 | Trạng thái rỗng? | **Đã chốt:** Highlight và All Kudos rỗng đều hiện "Hiện tại chưa có Kudos nào." | Chữ nguyên văn từ thiết kế | no |
| D011 | Nhãn "IDOL GIỚI TRẺ" (D.4) là gì? | **Đã chốt:** là nhãn tiêu đề của kudos, hiện phía trên nội dung kèm biểu tượng bút; bấm vào thì lọc như một hashtag (xem D014 về cách làm) | Theo spec D.4 | no |
| D012 | Chính sách kiểm thử? | **Đã chốt:** `e2e-red-first`, dùng bộ Playwright đã có (lọc, carousel, cuộn vô hạn, Copy Link, chuyển tới đăng nhập là hành vi) | Quy tắc MoMorph cho tương tác có chuyển trạng thái | no |
| D013 | Thanh "Tìm kiếm profile Sunner" ở cạnh A.1 (thấy trong khung Figma nhưng không có mục spec riêng) có làm không? | **Đã chốt:** hiện đúng Figma, chưa làm gì (như A.1) | Cùng cách xử lý với A.1, không thêm phạm vi | no |
| D014 | Bấm nhãn tiêu đề lọc theo hashtag nào, khi bộ lọc chỉ nhận giá trị trong danh sách hashtag? | **Đã chốt:** tiêu đề là cột chữ tự do `title` riêng của kudos; bấm vào thì đặt bộ lọc Hashtag chỉ khi có hashtag trùng chữ, không trùng thì nhãn chỉ là chữ thường, không bấm được | Giữ danh sách hashtag cố định (D006) mà vẫn đúng spec D.4 | no |
| D015 | Trước khi F007 xong, vùng nút tim trên thẻ hiện gì? | **Chờ xác nhận:** biểu tượng tim xám kèm số tim chỉ để xem, không bấm được; F007 thay bằng nút thật | Số tim là căn cứ sắp xếp Highlight nên người xem cần thấy; F007 vẫn là chủ của nút | no |
| D016 | Khách bị đưa tới đăng nhập có quay lại trang vừa bấm sau khi đăng nhập không? | **Đã chốt:** không; chỉ chuyển tới `/login`, đăng nhập xong về trang chủ như hiện nay, F001 không đổi | Luồng đăng nhập hiện cố định đích về trang chủ; thêm đích quay lại là đổi F001 | no |
| D017 | Bấm một ảnh đính kèm (C.3.6) thì sao? | **Đã chốt:** mở ảnh gốc ở tab mới | Đơn giản nhất mà vẫn "xem ảnh đầy đủ"; hộp xem ảnh trong trang có thể làm sau | no |
| D018 | Nhãn phòng ban hiển thị mã (ví dụ CEVC10) hay tên đầy đủ? | **Đã chốt:** chỉ hiện mã phòng ban, cả trên thẻ lẫn trong danh sách lọc | Thẻ Figma hiện mã; tên đầy đủ chưa có trong đầu vào | no |
| D019 | Highlight có kèm kudos 0 tim, và cùng số tim thì xếp thế nào? | **Đã chốt:** xếp theo số tim giảm dần, cùng số tim thì mới hơn trước; kudos 0 tim vẫn được lấy để đủ 5 thẻ khi có đủ kudos; sau khi thả hoặc rút tim carousel không xếp lại ngay, chỉ xếp lại khi tải lại hoặc đổi bộ lọc | Bộ lọc hẹp vẫn cho ra carousel; kết quả luôn xác định | no |
| D020 | Chữ cho các thông báo Figma chưa có: lỗi nạp thêm, lỗi chép liên kết, mục "bỏ lọc" trong danh sách lọc, nhãn đang tải? | **Đã chốt (chữ tạm, chờ người sở hữu nội dung):** VN "Không tải thêm được Kudos.", nút "Thử lại"; "Không sao chép được liên kết"; mục "Tất cả"; EN tương ứng "Could not load more Kudos.", "Try again", "Could not copy the link", "All" | Cần chữ để làm trạng thái lỗi; bản dịch dùng được, chờ người sở hữu nội dung | no |
| D021 | Kích thước trang và lượng dữ liệu seed? | **Chờ xác nhận:** mỗi lần nạp 10 kudos; seed khoảng 60 kudos (đủ nhiều trang và một người nhận đủ 50 kudos để có Legend) | Đủ thử cuộn vô hạn và mọi mức Hero; Figma ghi "388 KUDOS" cho Spotlight nên số seed cuối do F008 xác nhận | no |
| D022 | Khổ màn hình nhỏ của trang bảng thế nào? | **Đã chốt:** dưới khổ máy tính xếp một cột, sidebar nằm dưới All Kudos, carousel chỉ hiện một thẻ, không ẩn gì | Figma của khung này chỉ có khổ máy tính nên đây là quy tắc mặc định, chưa có thiết kế riêng | no |

## 4. Requirements

### Foundation (0xx)

- **FR-001** Người, phòng ban, kudos, hashtag và ảnh đính kèm nằm trong dữ liệu của hệ thống, có sẵn dữ liệu seed local theo nội dung Figma đủ để duyệt, lọc và cuộn nhiều trang. Mỗi kudos có một tiêu đề là chữ tự do riêng (không phải hashtag, D014); mỗi kudos có số tim và mỗi Sunner có tổng tim, cả hai mặc định 0 và cùng do feature này tạo cột (F007 chỉ thêm lượt thích, ngày đặc biệt và bước giữ cho hai số đó đúng).
- **FR-002** Mỗi tài khoản đăng nhập có đúng một Sunner tương ứng: khớp với Sunner có sẵn cùng email hoặc tạo mới (chỉ khi email đã xác nhận; chưa xác nhận thì chưa có Sunner cho tới khi xác nhận), để các feature sau biết người đang xem là Sunner nào. Sunner của người đang xem được tra bằng một hàm của cơ sở dữ liệu chỉ trả hàng của chính người gọi; email và mã tài khoản của Sunner không mở cho trình duyệt.
- **FR-003** Số kudos nhận của mỗi Sunner được hệ thống tự cập nhật mỗi khi kudos được thêm hoặc xoá, và là căn cứ của sao và nhãn Hero.

### Navigation (1xx)

- **FR-101** Mở `/sun-kudos` thì thấy trang, không cần đăng nhập; tới được từ header, footer, trang chủ, Awards Information hoặc gõ địa chỉ trực tiếp, kèm hoặc không kèm giá trị lọc.
- **FR-102** Ở header và footer, "Sun* Kudos" ở trạng thái đang chọn; "About SAA 2025" và "Awards Information" trở về kiểu thường; các trang khác không đổi.

### Sun* Kudos - Live board (2xx)

- **FR-201** Banner đầu trang có ảnh nền, tiêu đề "Hệ thống ghi nhận và cảm ơn" và logo "SAA 2025 KUDOS", chỉ để xem, không bấm được.
- **FR-202** Thanh gửi kudos hiện biểu tượng bút và chữ "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?"; bấm vào chưa làm gì; thanh "Tìm kiếm profile Sunner" cạnh nó cũng hiện đúng Figma và chưa làm gì (D013).
- **FR-203** Mỗi thẻ kudos có chỗ cho nút tim, và trang có vùng giữ chỗ cho Spotlight và sidebar, để bố cục không nhảy khi ba feature kia được cắm vào. Trang gắn sẵn một kho trạng thái tim dùng chung theo từng kudos (logic do F007 cấp) để cùng một kudos ở Highlight và All Kudos luôn cùng trạng thái, và truyền cho mỗi thẻ hai giá trị: người xem đã thích kudos đó chưa (`likedByMe`) và có phải người gửi không (`isSender`). Dưới khổ máy tính trang xếp một cột, sidebar nằm dưới All Kudos, không phần nào bị ẩn (D022).
- **FR-204** Khối Highlight có chữ nhỏ "Sun* Annual Awards 2025", tiêu đề "HIGHLIGHT KUDOS" và hai nút lọc ở đầu khối.
- **FR-205** Carousel Highlight hiện tối đa 5 kudos nhiều tim nhất trong phạm vi bộ lọc hiện tại, mặc định ở thẻ 1; kudos 0 tim vẫn được lấy để đủ 5 thẻ khi có đủ kudos, cùng số tim thì mới hơn trước; sau khi thả hoặc rút tim thứ tự không đổi ngay, chỉ xếp lại khi tải lại trang hoặc đổi bộ lọc (D019).
- **FR-206** Thẻ đang xem ở giữa, to và rõ; hai thẻ bên mờ và không bấm được; mũi tên trước tắt ở thẻ đầu, mũi tên sau tắt ở thẻ cuối; bộ đếm hiện `n/tổng` và đổi theo thẻ; dưới khổ máy tính carousel chỉ hiện thẻ đang xem (D022).
- **FR-207** Thẻ Highlight cắt nội dung ở 3 dòng, có "Copy Link" và "Xem chi tiết", không có ảnh đính kèm; thẻ cùng khối người gửi và người nhận như thẻ All Kudos (FR-211).
- **FR-208** Highlight không có kudos hoặc không đọc được dữ liệu thì hiện "Hiện tại chưa có Kudos nào."; trong lúc tải hiện khung chờ không chữ cùng kích thước carousel.
- **FR-209** Khối All Kudos có chữ nhỏ "Sun* Annual Awards 2025" và tiêu đề "ALL KUDOS", liệt kê kudos mới nhất trước.
- **FR-210** Cuộn gần cuối danh sách thì tự nạp thêm kudos cũ hơn; hết kudos thì dừng; không thẻ nào xuất hiện hai lần.
- **FR-211** Thẻ có khối người gửi, mũi tên, khối người nhận: ảnh đại diện, tên, phòng ban (chỉ hiện mã, ví dụ CEVC10; D018), 0 đến 3 sao và nhãn Hero; rê chuột hoặc lấy tiêu điểm vào sao thì hiện lời giải thích đúng mức sao (0 sao không có).
- **FR-212** Thẻ hiện giờ gửi dạng `HH:mm - MM/DD/YYYY`, nhãn tiêu đề phía trên nội dung (chữ tự do của kudos; chỉ bấm được khi có hashtag trùng chữ, FR-304) và nội dung kudos, cắt ở 5 dòng rồi "..." ở All Kudos.
- **FR-213** Thẻ hiện tối đa 5 hashtag trên một dòng, dư thì "..."; bấm một hashtag đặt bộ lọc Hashtag (FR-304).
- **FR-214** Thẻ All Kudos hiện tối đa 5 ảnh đính kèm hình vuông, căn trái; bấm một ảnh thì mở ảnh gốc ở tab mới (D017).
- **FR-215** All Kudos không có kudos hoặc không đọc được dữ liệu thì hiện "Hiện tại chưa có Kudos nào."; lỗi khi nạp thêm giữ nguyên các thẻ đã có và cho thử lại; trong lúc tải hiện khung chờ.

### Filters (3xx)

- **FR-301** Hai nút "Hashtag" và "Phòng ban" mở danh sách giá trị lấy từ hệ thống; chọn một giá trị thì lọc; nút hiện giá trị đang chọn; có mục bỏ lọc "Tất cả" để xem tất cả (D020).
- **FR-302** Bộ lọc áp dụng cho cả Highlight và All Kudos; đổi bộ lọc thì carousel về thẻ 1 và All Kudos nạp lại từ đầu.
- **FR-303** Lọc Phòng ban khớp phòng ban của người nhận; lọc Hashtag khớp kudos có gắn hashtag đó; đặt cả hai thì kudos phải thoả cả hai.
- **FR-304** Bấm một hashtag (hoặc nhãn tiêu đề, chỉ khi có hashtag trùng chữ; D014) trên thẻ thì đặt bộ lọc Hashtag như chọn trong danh sách, giữ nguyên bộ lọc Phòng ban.
- **FR-305** Bộ lọc nằm trên địa chỉ: mở lại, chia sẻ hoặc bấm Back giữ nguyên lọc; giá trị sai định dạng bị bỏ qua, giá trị đúng định dạng nhưng không có trong danh sách cho kết quả rỗng; không lỗi.

### Interaction (4xx)

- **FR-401** "Copy Link" chép địa chỉ tuyệt đối của chi tiết kudos vào clipboard và hiện thông báo nhỏ "Link copied — ready to share!"; nơi không có clipboard hiện đại vẫn chép được, thất bại thì báo lỗi.
- **FR-402** "Xem chi tiết" và nội dung thẻ dẫn tới `/sun-kudos/[id]`; ảnh đại diện và tên người gửi, người nhận dẫn tới `/profiles/[id]`; trang đích chưa xây thì thấy trang không tìm thấy mặc định.
- **FR-403** Khách bấm các liên kết ở FR-402 thì được đưa tới `/login`, không tới trang đích; đăng nhập xong về trang chủ như hiện nay, không quay lại trang vừa bấm (D016).
- **FR-404** Chữ giao diện của trang có hai ngôn ngữ VN và EN theo lựa chọn đã lưu; nội dung kudos, tên, hashtag và phòng ban giữ nguyên chữ gốc.

### Security (6xx)

- **FR-601** Dữ liệu bảng kudos mở công khai cho khách lẫn Sunner, chỉ đọc; email và mã tài khoản (`user_id`) của Sunner không bao giờ đến trình duyệt; trình duyệt không ghi được vào bảng nào của feature, kể cả bộ đếm.

## 5. Business Rules

- Khách và Sunner đã đăng nhập thấy cùng dữ liệu công khai của bảng, không ai bị chuyển hướng khỏi trang, và không ai ghi được dữ liệu từ trình duyệt (BR-001)
- Mỗi trang chỉ đánh dấu đang chọn đúng một liên kết điều hướng, là liên kết trỏ về chính trang đó; ở trang này là "Sun* Kudos" (BR-002)
- Hạng Hero tính theo số kudos NHẬN: 0–9 New Hero (0 sao), 10–19 Rising Hero (1), 20–49 Super Hero (2), từ 50 Legend Hero (3); không lưu riêng (BR-003)
- Highlight lấy tối đa 5 kudos nhiều tim nhất trong phạm vi bộ lọc; cùng số tim thì mới hơn trước; kudos 0 tim vẫn được lấy để đủ 5 thẻ; thứ tự không xếp lại ngay sau khi thả hoặc rút tim, chỉ khi tải lại hoặc đổi bộ lọc (BR-004)
- All Kudos xếp mới nhất trước; mỗi kudos xuất hiện đúng một lần khi cuộn; trang kế tiếp nối đúng sau thẻ cuối đã thấy (BR-005)
- Bộ lọc gồm một hashtag (danh sách cố định) và một phòng ban (của người nhận), kết hợp bằng "và", dùng chung cho Highlight và All Kudos (BR-006)
- Giới hạn hiển thị của thẻ: nội dung 3 dòng (Highlight) hoặc 5 dòng (All Kudos), hashtag tối đa 5 trên một dòng, ảnh đính kèm tối đa 5 (BR-007)
- Giờ hiển thị luôn là `HH:mm - MM/DD/YYYY` theo múi giờ Asia/Ho_Chi_Minh, không phụ thuộc múi giờ của người xem (BR-008)
- Ngôn ngữ chỉ là VN hoặc EN (mặc định VN); EN chỉ dịch nhãn giao diện, nội dung kudos, tên, hashtag, phòng ban giữ nguyên (BR-009)
- Liên kết tới trang chưa xây dùng địa chỉ dự kiến; khách bấm thì tới đăng nhập (xong về trang chủ, không quay lại), Sunner đã đăng nhập tới đích dự kiến (BR-010)
- Một tài khoản chỉ ứng với tối đa một Sunner: khớp Sunner có sẵn chưa gắn cùng email đã xác nhận, không khớp thì tạo mới; tài khoản chưa xác nhận email không gắn và không tạo Sunner nào cho tới khi xác nhận; không bao giờ giành Sunner của tài khoản khác (BR-011)
- Số kudos nhận của người nhận do hệ thống tự cộng, trừ theo kudos được thêm, xoá; không ai sửa trực tiếp (BR-012)
- Địa chỉ Copy Link là địa chỉ tuyệt đối của chi tiết kudos, dựng lúc bấm từ địa chỉ trang đang mở (BR-013)
- Highlight: có kudos thì hiện carousel; không có hoặc không đọc được dữ liệu thì hiện thông báo rỗng thay cho carousel (DEC-001)
- Mũi tên carousel: ở thẻ đầu mũi tên trước tắt, ở thẻ cuối mũi tên sau tắt; một thẻ duy nhất thì cả hai tắt và bộ đếm là 1/1 (DEC-002)
- All Kudos, lần tải đầu: có kudos thì hiện danh sách; không có hoặc không đọc được thì hiện thông báo rỗng (DEC-003)
- All Kudos, nạp thêm: gần cuối và còn kudos thì nạp; lỗi thì giữ thẻ đã có và cho thử lại; hết kudos thì dừng im lặng (DEC-004)
- Chọn bộ lọc: chọn giá trị khác thì đặt; chọn "Tất cả" thì bỏ; bấm hashtag đang là bộ lọc thì không đổi; bộ lọc còn lại luôn được giữ (DEC-005)
- Copy Link: dùng clipboard hiện đại khi có; không có hoặc bị từ chối thì dùng cách dự phòng; cả hai thất bại thì báo lỗi, thành công thì báo "Link copied — ready to share!" (DEC-006)
- Liên kết trên thẻ: Sunner đã đăng nhập tới chi tiết hoặc hồ sơ dự kiến; khách (kể cả khi không xác định được phiên) tới đăng nhập (DEC-007)

## 6. Screens

| Screen Name | SCR### | What User Sees | What User Can Do |
|-------------|--------|-----------------|-------------------|
| Sun* Kudos - Live board | SCR006_SunKudosLiveBoard | header cố định ("Sun* Kudos" đang chọn); banner "Hệ thống ghi nhận và cảm ơn"; thanh gửi kudos và thanh "Tìm kiếm profile Sunner"; khối Highlight với hai nút lọc và carousel; vùng giữ chỗ Spotlight; khối All Kudos với dòng thẻ kudos; vùng giữ chỗ sidebar bên phải; footer | lọc theo Hashtag và Phòng ban; chuyển thẻ Highlight bằng mũi tên; cuộn để nạp thêm kudos; bấm hashtag để lọc; Copy Link; mở chi tiết hoặc hồ sơ (khách tới đăng nhập); đổi VN/EN; dùng header và footer đi các trang khác |

### User Journey

1. Người xem mở "Sun* Kudos" từ header, footer, trang chủ hoặc Awards Information — không cần đăng nhập — và thấy banner, thanh gửi kudos rồi khối Highlight.
2. Người xem đọc thẻ giữa của carousel, bấm mũi tên sau để xem thẻ kế (thẻ 2/5), mũi tên trước tắt ở thẻ 1 và mũi tên sau tắt ở thẻ 5.
3. Người xem mở danh sách "Phòng ban", chọn một phòng ban — cả carousel (về thẻ 1) lẫn dòng All Kudos bên dưới chỉ còn kudos gửi tới người của phòng ban đó.
4. Người xem bấm một hashtag trên thẻ — bộ lọc Hashtag được đặt, phòng ban vẫn giữ, danh sách thu hẹp thêm.
5. Người xem cuộn xuống dòng All Kudos — kudos mới nhất trước, tới gần cuối thì kudos cũ hơn tự nạp thêm.
6. Người xem bấm "Copy Link" ở một thẻ — thấy "Link copied — ready to share!" và có địa chỉ chi tiết trong clipboard.
7. Người xem bấm "Xem chi tiết" hoặc ảnh đại diện — Sunner đã đăng nhập tới trang dự kiến (hiện 404 mặc định), khách được đưa tới đăng nhập.
8. Khi cần, người xem chọn "Tất cả" để bỏ lọc, hoặc chọn EN để đổi chữ giao diện.

## 7. User Stories

### US034 — Mở trang bảng Kudos

**Actor:** Khách chưa đăng nhập
**Goal:** Vào được trang Sun* Kudos từ các liên kết đã có hoặc bằng địa chỉ trực tiếp mà không phải đăng nhập.
**Business value:** Liên kết "Sun* Kudos" khắp site có đích thật; ai cũng thấy phong trào ghi nhận đang sôi nổi thế nào.

Sunner đã đăng nhập cũng thấy cùng nội dung; chỉ vùng tài khoản ở header khác.

**Acceptance Criteria:**
- [ ] Khách mở trang thấy banner, thanh gửi kudos, khối Highlight, dòng All Kudos, không bị chuyển sang đăng nhập.
- [ ] "Sun* Kudos" ở header và footer đang chọn; "About SAA 2025" và "Awards Information" không còn đang chọn.
- [ ] Thanh gửi kudos có đúng chữ gợi ý của Figma và bấm vào chưa làm gì.
- [ ] Chọn EN thì nhãn giao diện đổi sang tiếng Anh, nội dung kudos giữ nguyên.

### US035 — Xem kudos nổi bật bằng carousel

**Actor:** Khách chưa đăng nhập
**Goal:** Xem nhanh các kudos được yêu thích nhất và duyệt từng cái bằng mũi tên.
**Business value:** Những lời ghi nhận tiêu biểu được nhìn thấy trước, khuyến khích văn hoá cảm ơn.

**Acceptance Criteria:**
- [ ] Carousel có tối đa 5 thẻ, theo thứ tự số tim giảm dần; cùng số tim thì mới hơn trước; kudos 0 tim vẫn được lấy để đủ 5 thẻ.
- [ ] Thẻ giữa to và rõ, hai bên mờ và không bấm được; bộ đếm hiện đúng `n/tổng`.
- [ ] Mũi tên trước tắt ở thẻ 1, mũi tên sau tắt ở thẻ cuối; bấm mũi tên đổi thẻ và bộ đếm.
- [ ] Không có kudos phù hợp thì hiện "Hiện tại chưa có Kudos nào." thay cho carousel.

### US036 — Cuộn dòng All Kudos

**Actor:** Khách chưa đăng nhập
**Goal:** Đọc lần lượt các kudos từ mới tới cũ mà không phải bấm chuyển trang.
**Business value:** Người xem theo dõi được luồng ghi nhận đang diễn ra và không bỏ lỡ kudos nào.

**Acceptance Criteria:**
- [ ] Danh sách bắt đầu bằng kudos mới nhất; thẻ nào cũng đủ người gửi, người nhận, giờ, nội dung.
- [ ] Cuộn gần cuối thì kudos cũ hơn tự nạp thêm, không lặp thẻ, hết kudos thì dừng.
- [ ] Nội dung dài bị cắt ở 5 dòng, hashtag dư thì "...", ảnh đính kèm tối đa 5 hình vuông căn trái, bấm một ảnh mở ảnh gốc ở tab mới.
- [ ] Không có kudos thì hiện "Hiện tại chưa có Kudos nào."; nạp thêm lỗi thì giữ thẻ đã có và cho thử lại.

### US037 — Lọc kudos theo Hashtag và Phòng ban

**Actor:** Khách chưa đăng nhập
**Goal:** Thu hẹp Highlight và All Kudos theo một chủ đề hoặc một phòng ban.
**Business value:** Người xem tìm thấy ngay kudos mình quan tâm thay vì cuộn qua tất cả.

**Acceptance Criteria:**
- [ ] Hai danh sách lọc liệt kê đúng các hashtag và phòng ban có trong hệ thống; nút hiện giá trị đang chọn.
- [ ] Chọn giá trị thì cả carousel (về thẻ 1) và All Kudos (nạp lại từ đầu) chỉ còn kudos thoả bộ lọc; phòng ban khớp người nhận.
- [ ] Bấm một hashtag trên thẻ đặt bộ lọc Hashtag và giữ bộ lọc Phòng ban.
- [ ] Chọn "Tất cả" thì bỏ lọc; mở địa chỉ có sẵn giá trị lọc thì trang lọc ngay từ đầu.

### US038 — Chép liên kết một kudos

**Actor:** Khách chưa đăng nhập
**Goal:** Chép địa chỉ của một kudos để gửi cho người khác.
**Business value:** Lời ghi nhận được chia sẻ ra ngoài trang, lan toả thêm.

**Acceptance Criteria:**
- [ ] Bấm "Copy Link" thì clipboard có địa chỉ tuyệt đối `/sun-kudos/[id]` của kudos đó.
- [ ] Hiện thông báo nhỏ "Link copied — ready to share!".
- [ ] Trình duyệt không có clipboard hiện đại vẫn chép được; thất bại thì báo lỗi rõ ràng.

### US039 — Mở chi tiết kudos hoặc hồ sơ từ thẻ

**Actor:** Sunner đã đăng nhập
**Goal:** Từ một thẻ, mở chi tiết kudos hoặc hồ sơ của người gửi, người nhận.
**Business value:** Từ bảng chung đi sâu vào một lời ghi nhận hay một đồng nghiệp.

**Acceptance Criteria:**
- [ ] "Xem chi tiết" và nội dung thẻ dẫn tới `/sun-kudos/[id]`; ảnh đại diện và tên dẫn tới `/profiles/[id]`.
- [ ] Trang đích chưa xây thì thấy trang không tìm thấy mặc định, trang bảng không bị lỗi.
- [ ] Khách bấm cùng các liên kết đó thì được đưa tới `/login`; đăng nhập xong về trang chủ.

### US040 — Thấy sao và nhãn Hero của người gửi, người nhận

**Actor:** Khách chưa đăng nhập
**Goal:** Nhìn ra mức đóng góp của người gửi và người nhận ngay trên thẻ.
**Business value:** Sao và nhãn Hero ghi nhận người được cảm ơn nhiều, khuyến khích tiếp tục lan toả.

**Acceptance Criteria:**
- [ ] 0–9 kudos nhận: New Hero, 0 sao; 10–19: Rising Hero, 1 sao; 20–49: Super Hero, 2 sao; từ 50: Legend Hero, 3 sao.
- [ ] Rê chuột hoặc lấy tiêu điểm vào sao hiện lời giải thích đúng mức sao; 0 sao không có.
- [ ] Số kudos nhận đổi khi có kudos mới hoặc bị xoá thì nhãn đổi theo, không cần sửa tay.

### US041 — Gắn tài khoản đăng nhập với một Sunner

**Actor:** Hệ thống (nền)
**Goal:** Mỗi tài khoản vừa tạo được gắn với đúng một Sunner, có sẵn hoặc mới tạo.
**Business value:** Các feature tim và thống kê biết người đang xem là ai mà không phải dựng hồ sơ riêng.

**Acceptance Criteria:**
- [ ] Tài khoản có email đã xác nhận, trùng email một Sunner chưa gắn thì được gắn vào Sunner đó.
- [ ] Không có Sunner trùng thì một Sunner mới được tạo, mang tên của tài khoản (không mang ảnh đại diện: ảnh chỉ là đường dẫn cục bộ, không sao chép từ tài khoản).
- [ ] Tài khoản chưa xác nhận email chưa có Sunner (không gắn, không tạo) cho tới khi email được xác nhận.
- [ ] Đăng ký tài khoản không bao giờ thất bại vì bước gắn này; tài khoản đã có Sunner không bị gắn lại.

## 8. Scenarios

### US034 — Happy Path

**Given** khách chưa đăng nhập đang ở trang chủ, **When** bấm "Sun* Kudos" ở header, **Then** trang bảng Kudos hiện đủ banner, khối Highlight, dòng All Kudos, không có màn hình đăng nhập chen vào, và "Sun* Kudos" ở header đang chọn.

### US034 — Error: Site còn khoá trước giờ mở

**Given** site đang khoá theo F005 và người mở không phải admin, **When** mở `/sun-kudos`, **Then** được đưa tới trang đếm ngược thay vì trang bảng; admin xem bình thường.

### US035 — Happy Path

**Given** có hơn 5 kudos và không có bộ lọc, **When** mở trang, **Then** carousel hiện 5 kudos nhiều tim nhất, bộ đếm là 1/5, mũi tên trước tắt; bấm mũi tên sau bốn lần thì bộ đếm là 5/5 và mũi tên sau tắt.

### US035 — Error: Bộ lọc không khớp kudos nào

**Given** bộ lọc đặt cho một cặp hashtag và phòng ban không có kudos, **When** trang tải, **Then** thay cho carousel là "Hiện tại chưa có Kudos nào." và không có lỗi.

### US036 — Happy Path

**Given** hệ thống có nhiều hơn một trang kudos, **When** người xem cuộn gần cuối danh sách, **Then** kudos cũ hơn nối tiếp xuống dưới, không lặp thẻ nào, và dừng khi hết kudos.

### US036 — Error: Nạp thêm thất bại

**Given** mạng mất đúng lúc nạp thêm, **When** yêu cầu nạp lỗi, **Then** các thẻ đã có vẫn còn, bên dưới hiện "Không tải thêm được Kudos." kèm nút "Thử lại", bấm nút thì nạp lại.

### US037 — Happy Path

**Given** người xem ở trang không có bộ lọc, **When** chọn một phòng ban rồi bấm một hashtag trên thẻ, **Then** địa chỉ trang mang cả hai giá trị lọc, carousel về thẻ 1, dòng All Kudos nạp lại và chỉ còn kudos thoả cả hai.

### US037 — Error: Giá trị lọc không hợp lệ trên địa chỉ

**Given** địa chỉ mang giá trị lọc sai định dạng, **When** trang tải, **Then** giá trị đó bị bỏ qua, trang hiện như chưa lọc, không lỗi.

### US038 — Happy Path

**Given** người xem ở trang bảng, **When** bấm "Copy Link" ở một thẻ, **Then** clipboard có địa chỉ tuyệt đối của chi tiết kudos và hiện "Link copied — ready to share!".

### US038 — Error: Không chép được

**Given** trình duyệt từ chối mọi cách chép, **When** bấm "Copy Link", **Then** hiện thông báo "Không sao chép được liên kết", trang không lỗi.

### US039 — Happy Path

**Given** Sunner đã đăng nhập, **When** bấm "Xem chi tiết" ở một thẻ, **Then** trình duyệt chuyển tới địa chỉ chi tiết dự kiến của kudos đó (hiện là trang không tìm thấy mặc định).

### US039 — Error: Khách bấm liên kết cần đăng nhập

**Given** khách chưa đăng nhập, **When** bấm ảnh đại diện của một người nhận, **Then** được đưa tới màn hình đăng nhập, không tới hồ sơ.

### US040 — Happy Path

**Given** một người nhận có đúng 20 kudos nhận, **When** thẻ của họ hiện, **Then** khối người nhận hiện 2 sao và "Super Hero"; rê vào sao thấy lời giải thích của mức 2 sao.

### US040 — Error: Người chưa nhận kudos nào

**Given** một Sunner chưa nhận kudos nào, **When** họ xuất hiện là người gửi trên thẻ, **Then** hiện "New Hero", không có sao và không có tooltip sao.

### US041 — Happy Path

**Given** có Sunner sẵn email `a@x` chưa gắn tài khoản, **When** một tài khoản có email đã xác nhận `a@x` được tạo, **Then** tài khoản đó được gắn vào Sunner này, không tạo Sunner thứ hai.

### US041 — Error: Email chưa xác nhận

**Given** có Sunner sẵn email `a@x`, **When** một tài khoản email `a@x` nhưng chưa xác nhận được tạo, **Then** Sunner có sẵn không bị gắn và tài khoản chưa có Sunner nào; việc đăng ký vẫn thành công, và khi email được xác nhận thì tài khoản được gắn hoặc nhận Sunner.

## 9. Edge Cases

| Scenario | What Happens | User-Facing Message |
|----------|--------------|----------------------|
| Bộ lọc không khớp kudos nào | Highlight và All Kudos đều hiện trạng thái rỗng; danh sách lọc vẫn mở được để đổi hoặc bỏ lọc | "Hiện tại chưa có Kudos nào." |
| Có ít hơn 5 kudos nổi bật | Bộ đếm theo số thẻ thực (ví dụ 1/3); một thẻ thì cả hai mũi tên tắt | None — silent handling |
| Giá trị lọc trên địa chỉ sai định dạng, hoặc đúng định dạng nhưng không có trong danh sách | Sai định dạng: bỏ qua, như chưa lọc; đúng định dạng nhưng lạ: kết quả rỗng; không lỗi | "Hiện tại chưa có Kudos nào." (khi rỗng) |
| Đổi bộ lọc khi đang nạp trang kế | Yêu cầu cũ bị huỷ, danh sách nạp lại từ đầu theo bộ lọc mới, không lẫn thẻ cũ | None — silent handling |
| Cuộn tới cuối, hết kudos | Dừng nạp, không báo gì | None — silent handling |
| Nạp trang kế lỗi | Giữ các thẻ đã có, hiện nút thử lại | "Không tải thêm được Kudos." |
| Đọc dữ liệu lần đầu lỗi | Coi như rỗng ở phần bị lỗi, lỗi ghi ở máy chủ; các phần khác vẫn hiện | "Hiện tại chưa có Kudos nào." |
| Nội dung kudos rất dài hoặc nhiều hashtag, nhiều ảnh | Nội dung cắt "..." ở 3 hoặc 5 dòng; hashtag một dòng rồi "..."; chỉ 5 ảnh đầu | None — silent handling |
| Trình duyệt không có clipboard hiện đại (ví dụ địa chỉ `http` không phải máy cục bộ) | Dùng cách dự phòng; cả hai thất bại thì báo lỗi | "Không sao chép được liên kết" |
| Khách bấm ảnh đại diện, tên hoặc "Xem chi tiết" | Được đưa tới đăng nhập, không tới trang đích | None — silent handling |
| Sunner đã đăng nhập bấm liên kết tới trang chưa xây | Thấy trang không tìm thấy mặc định | Trang không tìm thấy mặc định |
| Sunner chưa có phòng ban hoặc chưa có ảnh đại diện | Không hiện dòng phòng ban; ảnh thay bằng chữ cái đầu của tên; vẫn không khớp bộ lọc Phòng ban | None — silent handling |
| Có kudos được thêm hoặc xoá lúc người xem đang cuộn | Số kudos nhận và nhãn Hero cập nhật ở lần tải sau; danh sách đang xem không nhảy | None — silent handling |
| Site còn khoá trước giờ mở (F005), người mở không phải admin | Được đưa tới trang đếm ngược; admin xem bình thường | None — silent handling |
| Ngôn ngữ EN | Nhãn giao diện tiếng Anh; nội dung kudos, tên, hashtag, phòng ban giữ nguyên | None — silent handling |
| Khổ màn hình dưới máy tính | Một cột: sidebar nằm dưới All Kudos, carousel chỉ hiện một thẻ; không phần nào bị ẩn | None — silent handling |
| Bấm một ảnh đính kèm | Mở ảnh gốc ở tab mới; trang bảng giữ nguyên | None — silent handling |
| Nhãn tiêu đề của kudos không trùng chữ với hashtag nào | Nhãn chỉ là chữ thường, không bấm được | None — silent handling |

## 10. Edge Behaviours to Verify

- **FR-101** → Khách và Sunner đã đăng nhập đều mở được trang, không bị chuyển sang đăng nhập
- **FR-102** → "Sun* Kudos" ở header và footer đang chọn; "Awards Information" ở header chữ thường
- **FR-201** → Banner có tiêu đề "Hệ thống ghi nhận và cảm ơn" và logo, bấm vào không có gì xảy ra
- **FR-202** → Thanh gửi kudos có đúng chữ gợi ý, bấm vào không mở gì và không chuyển trang
- **FR-205** → Carousel có tối đa 5 thẻ, thứ tự số tim giảm dần, cùng số tim thì mới hơn trước
- **FR-206** → Mũi tên trước tắt ở thẻ 1, mũi tên sau tắt ở thẻ cuối, bộ đếm đúng, thẻ bên không bấm được
- **FR-208** → Bộ lọc không khớp thì Highlight hiện "Hiện tại chưa có Kudos nào."
- **FR-210** → Cuộn xuống nạp thêm, không lặp thẻ, hết thì dừng
- **FR-211** → Thẻ có đủ người gửi, mũi tên, người nhận, phòng ban, sao, nhãn Hero; tooltip sao đúng mức
- **FR-212** → Giờ dạng `HH:mm - MM/DD/YYYY` theo giờ Việt Nam; nội dung All Kudos cắt ở 5 dòng
- **FR-213** → Tối đa 5 hashtag trên một dòng, dư thì "..."
- **FR-214** → Tối đa 5 ảnh đính kèm hình vuông căn trái; bấm ảnh mở ảnh gốc ở tab mới
- **FR-215** → Không có kudos thì hiện thông báo rỗng; nạp thêm lỗi thì thẻ cũ còn và có thể thử lại
- **FR-301** → Hai danh sách lọc có đúng giá trị từ hệ thống, nút hiện giá trị đang chọn, có mục bỏ lọc
- **FR-302** → Đổi bộ lọc thì cả Highlight (về thẻ 1) và All Kudos đổi theo
- **FR-303** → Lọc phòng ban chỉ giữ kudos có người nhận thuộc phòng ban đó; hai bộ lọc cùng đặt thì kudos phải thoả cả hai
- **FR-304** → Bấm hashtag trên thẻ đặt bộ lọc Hashtag và giữ bộ lọc Phòng ban
- **FR-305** → Địa chỉ mang giá trị lọc hợp lệ thì lọc ngay; sai định dạng thì bỏ qua, không lỗi
- **FR-401** → Copy Link đưa địa chỉ tuyệt đối vào clipboard và hiện đúng "Link copied — ready to share!"
- **FR-402** → "Xem chi tiết", nội dung, ảnh đại diện và tên dẫn tới đúng địa chỉ dự kiến
- **FR-403** → Khách bấm các liên kết đó thì tới đăng nhập; đăng nhập xong về trang chủ
- **FR-404** → Chọn EN đổi nhãn giao diện, nội dung kudos không đổi
- **FR-601** → Email Sunner không có trong dữ liệu trả về trình duyệt; ghi từ trình duyệt bị từ chối
- **FR-002** → Tài khoản mới có đúng một Sunner (gắn hoặc mới tạo)
- **FR-003** → Thêm hoặc xoá một kudos đổi số kudos nhận của người nhận đúng một đơn vị

## 11. Risks & Known Issues

| ID | Type | Description | Impact | Status |
|----|------|--------------|--------|--------|
| RISK-01 | risk | Bài kiểm thử Awards Information hiện mong `/sun-kudos` là 404 và vài tài liệu (F002, F004, screen-flow, permissions-matrix) ghi "/sun-kudos chưa xây" | QA hoặc người đọc tài liệu thấy mâu thuẫn sau khi trang có thật | [RESOLVED] bài kiểm thử và các tài liệu đó đã sửa ở bước giao (Stage 6, 2026-10-13) |
| RISK-02 | risk | Số tim của kudos nạp thẳng bằng dữ liệu seed, còn F007 mới bảo trì số này sau; chưa có lượt thích thật nào đứng sau các số seed | Sau khi F007 chạy, số tim seed không khớp bản ghi lượt thích; bỏ tim không bao giờ làm số âm | [INFERRED] chấp nhận vì chỉ là dữ liệu seed local |
| RISK-03 | risk | Gắn tài khoản với Sunner có sẵn theo email có thể bị lợi dụng nếu email chưa được xác nhận | Người đăng ký email trùng có thể chiếm hồ sơ Sunner có sẵn | [EXPECTED] chỉ gắn khi email đã xác nhận (BR-011) |
| RISK-04 | risk | Cuộn vô hạn nối tiếp theo thứ tự chèn, không theo giờ ghi trên kudos | Kudos nhập lùi ngày hiện theo thứ tự chèn, giờ trên thẻ có thể không giảm đều | [EXPECTED] seed chèn theo thứ tự thời gian (D021) |
| RISK-05 | risk | Nhãn Hero hiện theo số kudos nhận hiện tại, không phải số lúc kudos được gửi | Cùng một thẻ cũ có thể đổi nhãn theo thời gian | [INFERRED] đúng với quy tắc đã chốt (D004) |
| RISK-06 | risk | Khung Figma đang ở trạng thái thiết kế "in_progress" và chưa có khổ nhỏ; thanh "Tìm kiếm profile Sunner" không có mục spec | Thiết kế có thể đổi sau khi làm | [EXPECTED] D013 và D022 đã chốt (hiện đúng Figma nhưng chưa làm gì; một cột khi hẹp); thiết kế còn `in_progress` nên có thể đổi |
| RISK-07 | risk | Ảnh đại diện chỉ là đường dẫn cục bộ dưới `/public`; không nhúng ảnh ngoài, không sao chép avatar Google hay `user_metadata` | Tài khoản mới hiện chữ cái đầu cho tới khi có cách đưa ảnh cục bộ vào | [EXPECTED] đã chốt 2026-10-13 (clarifications, review M1) |
| RISK-08 | risk | Test case mong "bấm ảnh đại diện mở trang hồ sơ" và "bấm chi tiết mở trang chi tiết" nhưng hai trang chưa xây | Các ca đó chưa đạt, chỉ đạt ở mức liên kết đúng và trang lỗi mặc định | [EXPECTED] chấp nhận cho tới khi hai trang được xây (D002) |

## 12. Dependencies

| Dependency | Type | Why this feature needs it | Evidence |
|------------|------|-----------------------------|----------|
| F001_LoginWithGoogle | feature | Đăng nhập Google tạo tài khoản mà feature này gắn với Sunner; quy tắc làm mới phiên áp cho mọi trang | FR-002, FR-601 |
| F002_HomepageSaa | feature | Dùng lại vỏ trang, header, footer, bộ chọn ngôn ngữ; trang chủ trỏ vào đây | FR-101, FR-102, FR-404 |
| F003_AccountMenuAdminRole | feature | Vùng tài khoản và chuông ở header; biết ai đã đăng nhập để quyết định liên kết thẻ | FR-402, FR-403 |
| F005_CountdownPrelaunch | feature | Trang bảng bị khoá như mọi trang trước giờ mở site | US034 |
| F007_KudosHearts | feature | Cắm nút tim vào vùng giữ chỗ trên thẻ, cấp kho trạng thái tim dùng chung (F006 gắn vào trang) và duy trì số tim dùng để xếp Highlight | FR-203, FR-205 |
| F008_KudosSpotlight | feature | Cắm bảng Spotlight vào vùng giữ chỗ; đọc lại dữ liệu kudos và Sunner của feature này | FR-203 |
| F009_KudosPersonalSidebar | feature | Cắm sidebar vào vùng giữ chỗ bên phải; đọc lại dữ liệu Sunner và kudos | FR-203 |
| Nội dung Figma của khung Sun* Kudos - Live board | data | Chữ, ảnh, hashtag, phòng ban, kudos mẫu dùng làm dữ liệu seed | FR-001, FR-201 |
| Cơ sở dữ liệu Supabase local | infrastructure | Nơi lưu dữ liệu, áp quyền đọc công khai, chạy các bước nền | FR-001, FR-003, FR-601 |

## 13. Configuration

```text
KUDOS_PAGE_SIZE = 10           # số kudos nạp mỗi lần ở All Kudos (D021)
HIGHLIGHT_MAX_CARDS = 5        # số thẻ tối đa trong carousel Highlight
CARD_CONTENT_LINES_HIGHLIGHT = 3   # nội dung thẻ Highlight cắt ở số dòng này
CARD_CONTENT_LINES_FEED = 5    # nội dung thẻ All Kudos cắt ở số dòng này
CARD_HASHTAGS_MAX = 5          # số hashtag tối đa hiện trên một thẻ
CARD_IMAGES_MAX = 5            # số ảnh đính kèm tối đa hiện trên một thẻ
HERO_TIERS = 10 / 20 / 50      # ngưỡng số kudos nhận của Rising, Super, Legend (BR-003)
COPY_TOAST_SECONDS = 3         # thông báo nhỏ tự tắt sau bấy nhiêu giây
```
