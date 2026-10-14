---
status: implemented
fcode: F010
authored_by: takumi
created: 2026-10-14
lang: vi
---

# Functional Spec — F010_KudosWrite

**Priority**: P1
**Type**: ui
**Generated**: 2026-10-14

**See also:** [`technical-spec.md`](./technical-spec.md) — Server Action, route ảnh, hàm `create_kudos`, chính sách kho ảnh, Source citations, pseudocode và bảng dữ liệu cho Dev/QA/SA.

**Traceability:** F010_KudosWrite → SCR006_SunKudosLiveBoard (hộp thoại "Viết Kudo" mở từ thanh gửi kudos A.1; MoMorph `ihQ26W78P2`) → US058, US059, US060, US061, US062, US063 (mã US toàn cục, tiếp sau F009)

> **Ghi chú nguồn:** spec này được promote lúc giao (Stage 6, 2026-10-14). Kỷ luật "fast" của lượt làm này không chạy bước promote ở implement-start, nên nó được viết từ bản nháp tối thiểu (`plans/261013-1628-write-kudos-modal/spec/kudos-write/technical-spec.md`), `clarifications.md` (có thẩm quyền cao nhất) và mã đã giao. Muốn `path:line` đầy đủ cho từng ca, chạy `/tkm:rebuild-spec --features F010`.

## 1. Overview

**Problem:** Bảng Sun* Kudos (F006) mới chỉ để đọc: thanh gửi kudos (A.1) hiện đúng thiết kế nhưng bấm không có gì xảy ra, nên Sunner chưa có cách gửi lời cảm ơn và ghi nhận cho đồng đội. Một số người còn muốn gửi mà không lộ tên.
**Solution:** Bấm thanh A.1, Sunner đã đăng nhập, hoặc khách (hoạt động như "Anonymous", không cần đăng nhập), mở hộp thoại "Viết Kudo": chọn người nhận, đặt danh hiệu, viết nội dung (thanh công cụ Markdown), chọn 1–5 hashtag, đính kèm tối đa 5 ảnh, tuỳ chọn gửi ẩn danh. Gửi xong hộp thoại đóng, hiện thông báo thành công và kudos mới đứng đầu All Kudos mà không tải lại trang. Khách chưa có phiên bấm A.1 thì hệ thống mở một phiên ẩn danh rồi mở hộp thoại; kudos của khách luôn ẩn danh (hộp ẩn danh tick sẵn và bị khoá, tên ẩn danh vẫn tuỳ chọn) và hồ sơ Sunner khách không bao giờ là người nhận hay hiện trong tìm kiếm. Thẻ kudos đọc được nội dung định dạng, và kudos ẩn danh không bao giờ lộ người gửi.
**Scope:** Hộp thoại Viết Kudo và mọi trường của nó; tìm người nhận và gợi ý `@tên`; tải, xoá ảnh; hàm ghi kudos; kho ảnh và hai route ảnh; tên ẩn danh; thẻ hiển thị nội dung Markdown và khối người gửi ẩn danh; số "Kudos bạn đã gửi" của sidebar tính cả kudos ẩn danh.
**Non-Scope:** Thông báo cho người được nhắc `@tên` hoặc người nhận; sửa hay xoá kudos đã gửi; trang chi tiết kudos `/sun-kudos/[id]` và trang `/standards`; dọn ảnh tải lên bị bỏ rơi; giới hạn tốc độ gửi; thanh "Tìm kiếm profile Sunner" (vẫn chưa làm gì); định dạng hiển thị ngay trong ô nhập (ô nhập chỉ hiện ký hiệu Markdown).

**Actors**

| Actor | Description | Primary goal |
|-------|--------------|---------------|
| Khách chưa đăng nhập | người mở `/sun-kudos` khi chưa có tài khoản (chưa có phiên, hoặc đã có phiên ẩn danh từ lần bấm trước) | bấm thanh gửi kudos, viết và gửi kudos ẩn danh như Sunner; không cần đăng nhập |
| Sunner đã đăng nhập | người có phiên hợp lệ và hồ sơ Sunner | gửi lời cảm ơn đến đồng đội, có thể ẩn danh, và thấy kudos hiện ngay trên bảng |

## 2. Functional Capabilities

| ID | Capability | What the user can do | User Stories | Requirements | Business Rules | Screens |
|----|------------|------------------------|-----------------|---------------|-------------------|---------|
| CAP-01 | Mở hộp thoại Viết Kudo | Bấm thanh gửi kudos để mở hộp thoại (khách chưa có phiên thì được mở phiên ẩn danh trước, không sang đăng nhập); đóng bằng Hủy hoặc Escape mà không lưu gì | US058 | FR-101, FR-102, FR-103, FR-105 | DEC-001 | SCR006_SunKudosLiveBoard |
| CAP-02 | Soạn kudos | Chọn người nhận, đặt danh hiệu, viết nội dung bằng thanh công cụ Markdown và `@tên`, chọn hashtag | US059 | FR-104, FR-201, FR-202, FR-203, FR-204, FR-205, FR-206, FR-209 | BR-001, BR-002, BR-003 | N/A — hộp thoại của màn hình Sun* Kudos Live board, đã tính ở CAP-01 |
| CAP-03 | Đính kèm ảnh | Chọn tối đa 5 ảnh jpg/png (≤ 5 MB), xem trước, xoá từng ảnh | US060 | FR-002, FR-003, FR-207, FR-603, FR-604 | BR-004 | N/A — như CAP-02 |
| CAP-04 | Gửi kudos | Bấm Gửi khi mọi trường bắt buộc hợp lệ; thấy thông báo và kudos mới đứng đầu bảng | US061 | FR-301, FR-302, FR-303, FR-304, FR-305, FR-403, FR-601, FR-606 | BR-001, BR-002, BR-003, BR-004, BR-006, BR-007, DEC-002 | N/A — như CAP-02 |
| CAP-05 | Gửi ẩn danh | Tick "Gửi lời cám ơn và ghi nhận ẩn danh", tuỳ chọn đặt tên ẩn danh; khách thì hộp luôn tick và bị khoá, kèm gợi ý "Bạn chưa đăng nhập nên Kudos sẽ được gửi ẩn danh." | US062 | FR-001, FR-208, FR-402, FR-602 | BR-005, DEC-003 | N/A — như CAP-02 |
| CAP-06 | Đọc kudos có định dạng | Thẻ hiển thị đậm, nghiêng, gạch ngang, danh sách đánh số, trích dẫn và liên kết trong nội dung | US063 | FR-401, FR-605 | DEC-003 | SCR006_SunKudosLiveBoard (thẻ kudos của F006) |

## 3. Open Decisions

Tất cả đã chốt ở clarifications.md (lượt 2026-10-13 và lượt review 2026-10-14); không mục nào còn chặn việc làm. Chỉ ghi lại để tra cứu.

| D### | Decision | Default proposal | Rationale | Blocks work |
|------|----------|-------------------|-----------|--------------|
| D001 | Trình soạn nội dung dùng gì (đậm, nghiêng, gạch ngang, danh sách đánh số, liên kết, trích dẫn)? | **Đã chốt:** `textarea` thường kèm thanh công cụ bọc phần chọn bằng ký hiệu Markdown (`**`, `_`, `~~`, `1. `, `[chữ](url)`, `> `); thẻ hiển thị bằng bộ dựng của riêng dự án, chỉ phần tử React, không HTML thô, liên kết chỉ http/https; ô nhập hiện ký hiệu, không hiện định dạng | Không thêm dependency, không mở đường chèn HTML | no |
| D002 | Gửi ẩn danh có thật sự ẩn không? | **Đã chốt:** ẩn thật: trình duyệt không bao giờ đọc được người gửi của kudos ẩn danh; mã người gửi vẫn có ở DB cho tim, luật tự thích và số liệu của chính người gửi | Giữ lời hứa "ẩn danh" với người dùng | no |
| D003 | Tên ẩn danh có bắt buộc không, và thẻ hiện gì khi để trống? | **Đã chốt:** tuỳ chọn, tối đa 50 ký tự; trống thì thẻ hiện "Người gửi ẩn danh" (EN "Anonymous sender"); thẻ ẩn danh không ảnh đại diện, không liên kết hồ sơ | Spec G không ghi dấu bắt buộc | no |
| D004 | Ảnh lưu ở đâu và phục vụ thế nào? | **Đã chốt (lượt review C1, thay cho bản đầu dùng `<uid>` trong đường dẫn):** kho riêng của Supabase, tên đối tượng ngẫu nhiên `kudos/<uuid>.<jpg\|png>`, phục vụ qua `/api/kudos/images/<uuid>.<jpg\|png>`; quyền sở hữu nằm ở `owner_id` của đối tượng, không nằm trong đường dẫn | Đường dẫn có mã người gửi sẽ nối kudos ẩn danh với kudos có tên; giữ luật "chỉ ảnh cục bộ" | no |
| D005 | Danh hiệu có bắt buộc không? | **Đã chốt:** bắt buộc, 1–50 ký tự sau khi bỏ khoảng trắng, lưu làm tiêu đề kudos (có trong khung Figma, thiếu trong CSV spec) | Khớp thiết kế | no |
| D006 | Các luật nhỏ còn lại | **Đã chốt:** hashtag chỉ chọn từ danh sách có sẵn, 1–5, không trùng; không gửi cho chính mình; nội dung 1–2000 ký tự; ảnh jpg/png ≤ 5 MB, 0–5; `@tên` chỉ gợi ý Sunner và lưu thành chữ, không thông báo; "Tiêu chuẩn cộng đồng" liên kết `/standards` | Mặc định hợp lý, không thêm phạm vi | no |
| D007 | Gửi xong thì sao? | **Đã chốt:** hộp thoại đóng, thông báo thành công, bảng làm mới; kudos mới đứng đầu All Kudos mà không tải lại | Phản hồi tức thì | no |
| D008 | Nút Gửi hay báo lỗi khi bỏ trống (ID-48 và ID-56 trái nhau)? | **Đã chốt:** Gửi vô hiệu cho tới khi người nhận, Danh hiệu, nội dung và ≥ 1 hashtag hợp lệ; mỗi trường báo lỗi sau khi rời trường; lỗi từ máy chủ hiện lại đúng trường | Giữ cả hai ý | no |
| D009 | Tìm người nhận và gợi ý `@tên` khớp thế nào? | **Đã chốt:** khớp `full_name` không phân biệt hoa thường sau khi bỏ khoảng trắng đầu cuối; `%` `_` `*` `\` là chữ thường; tối đa 10 kết quả; tối thiểu 1 ký tự; "@ # $" cho "không có kết quả" | Chống khớp ngoài ý muốn | no |
| D010 | Thanh gửi kudos A.1 còn "chưa làm gì" như D013 của F006 không? | **Đã chốt (F010 thay D013 của F006 chỉ cho A.1):** người đã đăng nhập mở hộp thoại, khách tới `/login`; thanh "Tìm kiếm profile Sunner" vẫn chưa làm gì. **Thay thế (2026-10-14, guests act as Anonymous, clarifications plan 261014-1505):** khách không còn tới `/login`: bấm A.1 thì mở phiên ẩn danh rồi mở hộp thoại | Mục tiêu của feature này | no |
| D011 | Lượt thích kudos ẩn danh có làm lộ người gửi qua tổng tim không? | **Đã chốt (review round 2, C2, 2026-10-14):** không: `sunners.hearts_total` không còn đọc được từ trình duyệt (bỏ khỏi quyền cột của `anon`/`authenticated`; chủ đọc qua `get_my_sunner()` cho sidebar F009). Người gửi vẫn được cộng tim từ kudos ẩn danh; số tim trên thẻ (`kudos.like_count`) vẫn công khai và vẫn tăng. Thay cho ghi chú cũ "chấp nhận kẽ hở đếm tim" | Người dùng muốn thấy số tim tăng, kể cả kudos ẩn danh, mà không lộ người gửi | no |

## 4. Requirements

### Foundation (0xx)

- **FR-001** Mỗi kudos có cờ "ẩn danh" (mặc định không) và tên ẩn danh tuỳ chọn tối đa 50 ký tự, chỉ có khi ẩn danh; kudos đã có trước đó là không ẩn danh.
- **FR-002** Ảnh đính kèm nằm trong kho riêng; tên đối tượng là chuỗi ngẫu nhiên không chứa người tải; đường dẫn lưu cùng kudos là đường dẫn cục bộ `/api/kudos/images/<uuid>.<jpg|png>`.
- **FR-003** Một ảnh đã tải lên chỉ gắn được vào một kudos.

### Navigation (1xx)

- **FR-101** Bấm thanh gửi kudos (A.1): người đã đăng nhập thấy hộp thoại mở ra; khách chưa có phiên thì hệ thống mở phiên ẩn danh (một lần) rồi hộp thoại mở ra, không sang `/login`; nếu không mở được phiên ẩn danh thì hộp thoại không mở và hiện thông báo "Không mở được khung viết Kudos. Vui lòng thử lại." (EN "The Kudos form could not be opened. Please try again."). Thanh "Tìm kiếm profile Sunner" vẫn chưa làm gì.
- **FR-102** Hộp thoại là `dialog` có tên "Gửi lời cám ơn và ghi nhận đến đồng đội"; khi mở, tiêu điểm chuyển vào hộp thoại, phím Tab không ra ngoài, trang phía sau không cuộn; khi đóng, tiêu điểm trả về thanh đã mở nó.
- **FR-103** Hủy hoặc Escape đóng hộp thoại và không lưu gì; lần mở sau trống; ảnh đã tải lên mà chưa gửi bị xoá. Khi đang gửi (Gửi đang chạy) thì Hủy bị vô hiệu và Escape không đóng hộp thoại, để ảnh mà hàm ghi kudos đang gắn không bị xoá giữa chừng (review round 2).
- **FR-104** Có liên kết "Tiêu chuẩn cộng đồng" tới `/standards` (trang chưa xây, hiện 404 mặc định).
- **FR-105** Chữ giao diện của hộp thoại theo VN/EN đang chọn; nội dung người dùng nhập giữ nguyên.

### Form (2xx)

- **FR-201** Thứ tự từ trên xuống: tiêu đề, Người nhận, Danh hiệu, thanh công cụ + ô nội dung + dòng gợi ý "@ + tên", Hashtag, Image, hộp ẩn danh (kèm ô tên ẩn danh khi tick), liên kết "Tiêu chuẩn cộng đồng", Hủy, Gửi. Dưới breakpoint `sm`, liên kết "Tiêu chuẩn cộng đồng" của thanh công cụ xuống dòng riêng.
- **FR-202** Người nhận: chữ gõ vào chỉ là từ khoá tìm; người nhận là Sunner chọn từ gợi ý (gõ lại thì bỏ lựa chọn); gợi ý khớp tên theo D009, sắp theo tên, tối đa 10, không có chính người gửi; không khớp thì "Không tìm thấy Sunner phù hợp". Ô này không báo lỗi lúc mới mở hộp thoại, chỉ báo sau khi rời ô mà chưa chọn ai.
- **FR-203** Danh hiệu bắt buộc, 1–50 ký tự sau khi bỏ khoảng trắng.
- **FR-204** Nội dung bắt buộc, 1–2000 ký tự sau khi bỏ khoảng trắng; sáu nút Đậm, Nghiêng, Gạch ngang, Danh sách đánh số, Liên kết, Trích dẫn bọc phần chọn bằng ký hiệu Markdown (bấm lần nữa thì bỏ); nút Liên kết hỏi đường dẫn bằng hộp nhập của trình duyệt.
- **FR-205** Gõ `@` ở đầu dòng hoặc sau khoảng trắng gợi ý Sunner; chọn thì thay `@từ-khoá` bằng `@Họ tên ` dưới dạng chữ thường, không thông báo cho ai.
- **FR-206** Hashtag: chọn 1–5 từ danh sách có sẵn theo thứ tự cố định, không nhập tự do; mỗi chip có nút xoá riêng; không chọn trùng; đủ 5 thì không thêm được và báo "Tối đa 5 hashtag".
- **FR-207** Ảnh: 0–5, jpg hoặc png, mỗi ảnh ≤ 5 MB; chọn được nhiều tệp một lần; ảnh tải lên ngay khi chọn và hiện ảnh nhỏ xem trước; tệp sai loại hoặc quá lớn bị từ chối kèm thông báo và không thành ảnh nhỏ; nút "Image" ẩn khi đủ 5; xoá một ảnh thì trả chỗ trống và xoá ảnh đã tải.
- **FR-208** Hộp "Gửi lời cám ơn và ghi nhận ẩn danh" mặc định tắt; bật thì hiện ô tên ẩn danh (tuỳ chọn, ≤ 50 ký tự). Với khách (chưa đăng nhập, kể cả có phiên ẩn danh) hộp luôn tick và bị khoá (`disabled`), có gợi ý "Bạn chưa đăng nhập nên Kudos sẽ được gửi ẩn danh." (EN "You are not logged in, so your Kudos will be sent anonymously.") ngay dưới hộp; ô tên ẩn danh vẫn hiện và tuỳ chọn.
- **FR-209** Mỗi trường báo lỗi sau khi rời trường; riêng lỗi "quá dài" báo ngay; lỗi do máy chủ trả về hiện lại đúng trường; thông báo "quá dài" ghi đúng giới hạn của từng trường (50 hoặc 2000).

### Submit (3xx)

- **FR-301** Gửi vô hiệu cho tới khi người nhận, Danh hiệu, nội dung và ít nhất một hashtag hợp lệ và không còn ảnh nào đang tải.
- **FR-302** Bấm Gửi: nút vô hiệu, hiện vòng quay thay biểu tượng gửi và không gửi lặp; thành công thì hộp thoại đóng, hiện "Gửi Kudos thành công!", bảng làm mới và kudos mới đứng đầu All Kudos, không tải lại trang.
- **FR-303** Thất bại: lỗi theo trường hiện ở đúng trường; tài khoản chưa liên kết Sunner thấy thông báo riêng; lỗi khác thấy "Gửi Kudos không thành công. Vui lòng thử lại."; hộp thoại vẫn mở và giữ dữ liệu; hết phiên thì tới `/login`.
- **FR-304** Người gửi luôn là Sunner của người đang có phiên (tài khoản, hoặc hồ sơ Sunner khách của phiên ẩn danh); không nhận mã người gửi từ trình duyệt. Kudos của hồ sơ Sunner khách luôn ẩn danh, do cơ sở dữ liệu ép chứ không chỉ do hộp bị khoá; hồ sơ Sunner khách không bao giờ là người nhận (bị từ chối như người nhận không tồn tại) và `searchSunners` không trả về hồ sơ khách.
- **FR-305** Hashtag lặp trong yêu cầu chỉ tính một lần.

### Card (4xx)

- **FR-401** Thẻ hiển thị nội dung theo tập Markdown con: đoạn văn, trích dẫn (`> `), danh sách đánh số (`1. `), đậm (`**`), nghiêng (`_x_` hoặc `*x*`), gạch ngang (`~~`), liên kết `[chữ](http/https)`; mọi thứ khác, kể cả HTML, giữ nguyên là chữ; liên kết mở tab mới. Nội dung chữ thường vẫn cắt 3 dòng (Highlight) hoặc 5 dòng (All Kudos) như trước.
- **FR-402** Thẻ kudos ẩn danh không có ảnh đại diện (chỉ ô xám trơn), không liên kết hồ sơ, không phòng ban, nhãn Hero hay sao; hiện tên ẩn danh người gửi đã đặt, hoặc "Người gửi ẩn danh" khi để trống.
- **FR-403** Số "Kudos bạn đã gửi" ở sidebar (F009) tính cả kudos ẩn danh của chính người xem.

### Security (6xx)

- **FR-601** Đường ghi duy nhất của trình duyệt vào kudos là hàm `create_kudos` chạy với quyền của người gọi có phiên (tài khoản hoặc phiên ẩn danh); mọi luật ở FR-203..FR-207 được kiểm lại phía cơ sở dữ liệu; ba bảng kudos, hashtag, ảnh được ghi trong một giao dịch.
- **FR-602** Cột `sender_id` của kudos không đọc được từ trình duyệt (chọn, lọc, nhúng đều bị từ chối); người gửi công khai chỉ qua `public_sender_id`, rỗng khi ẩn danh. Tổng tim `hearts_total` của Sunner cũng không đọc được từ trình duyệt (chủ đọc qua `get_my_sunner()`), nên lượt thích kudos ẩn danh không làm lộ người gửi; người gửi vẫn được cộng tim từ kudos ẩn danh, và số tim trên thẻ (`like_count`) vẫn công khai và tăng như thường (D011).
- **FR-603** Tải ảnh lên cần phiên; loại tệp xác định bằng byte đầu tệp (JPEG, PNG), không tin MIME hay tên tệp; tệp lớn hơn 5 MB bị từ chối.
- **FR-604** Ảnh chưa gắn kudos chỉ người tải đọc và xoá được; ảnh đã gắn kudos công khai và không ai xoá được; tệp có tên không đúng dạng `<uuid>.<jpg|png>` hay chưa gắn thì phục vụ 404.
- **FR-605** Nội dung thẻ chỉ dựng bằng phần tử React, không HTML thô, không `dangerouslySetInnerHTML`; liên kết chỉ http/https.
- **FR-606** Hai Server Action `sendKudos` và `searchSunners` là endpoint công khai: kiểm hình dạng đầu vào, lấy người dùng từ phiên đã xác minh; người chưa có phiên nhận `unauthenticated` (gửi) hoặc danh sách rỗng (tìm), không có gì được ghi; người có phiên ẩn danh được gửi như Sunner (kudos luôn ẩn danh) và tìm người nhận như mọi người (kết quả bỏ hồ sơ khách).

## 5. Business Rules

- Người nhận phải là Sunner có thật và khác người gửi; không gửi kudos cho chính mình (BR-001)
- Danh hiệu 1–50 và nội dung 1–2000 ký tự Unicode sau khi bỏ khoảng trắng đầu cuối (đếm theo điểm mã, emoji tính 1); trình duyệt và cơ sở dữ liệu cùng quy tắc, cơ sở dữ liệu là bên quyết định (BR-002)
- Hashtag 1–5, phân biệt, đều thuộc danh sách có sẵn; ảnh 0–5 (BR-003)
- Mỗi ảnh đính kèm phải là đối tượng do chính người gửi tải lên và chưa gắn kudos nào (BR-004)
- Tên ẩn danh chỉ có nghĩa khi kudos ẩn danh; tên trống nghĩa là dùng chữ mặc định (BR-005)
- Kudos, hashtag và ảnh của một lần gửi được ghi cùng một giao dịch: một phần lỗi thì không ghi gì (BR-006)
- "Kudos đã gửi" đếm theo người gửi thật, kể cả kudos ẩn danh (BR-007)
- Hộp thoại: người đã có phiên thì mở; khách chưa có phiên thì mở phiên ẩn danh rồi mở, lỗi thì thông báo và không mở, không tới `/login` (DEC-001)
- Nút Gửi: chưa đủ điều kiện thì vô hiệu; đang gửi thì nút vô hiệu kèm vòng quay; thành công thì đóng, thông báo, làm mới bảng; lỗi theo trường thì hiện ở trường; chưa có Sunner hoặc lỗi chung thì thông báo lỗi; hết phiên thì tới `/login` (DEC-002)
- Khối người gửi trên thẻ: có người gửi công khai thì khối người đầy đủ; ẩn danh có tên thì tên đó; ẩn danh trống tên thì chữ mặc định; thân thẻ luôn dựng từ cây Markdown đã phân tích ở máy chủ (DEC-003)

## 6. Screens

| Screen Name | SCR### | What User Sees | What User Can Do |
|-------------|--------|-----------------|-------------------|
| Sun* Kudos - Live board — hộp thoại "Viết Kudo" (mở từ thanh gửi kudos A.1) | SCR006_SunKudosLiveBoard | lớp phủ tối và hộp thoại kem 752px: tiêu đề, Người nhận, Danh hiệu, thanh công cụ và ô nội dung, Hashtag, Image, hộp ẩn danh, "Tiêu chuẩn cộng đồng", Hủy, Gửi | tìm và chọn người nhận; gõ danh hiệu và nội dung; dùng thanh công cụ và `@tên`; thêm, bớt hashtag và ảnh; tick ẩn danh; Hủy hoặc Gửi |

Đây là hộp thoại của màn hình `/sun-kudos`, không phải màn hình riêng (không có SCR### mới); vỏ màn hình thuộc Kudos Board Browse.

### User Journey

1. Sunner đã đăng nhập mở `/sun-kudos`, bấm thanh "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?" — hộp thoại mở, tiêu điểm vào hộp thoại.
2. Gõ vài chữ vào Người nhận, chọn một Sunner trong gợi ý; gõ Danh hiệu; viết nội dung, bôi đen một cụm rồi bấm "Đậm"; gõ `@` để nhắc một đồng nghiệp.
3. Bấm "+ Hashtag", chọn một hashtag (chip hiện ra); bấm "+ Image", chọn ảnh (ảnh nhỏ hiện ngay, đang tải rồi sẵn sàng).
4. Tuỳ chọn tick ẩn danh và gõ tên ẩn danh.
5. Nút Gửi bật khi đủ bốn trường bắt buộc; bấm Gửi — nút vô hiệu kèm vòng quay, rồi hộp thoại đóng, hiện "Gửi Kudos thành công!" và kudos mới nằm đầu All Kudos.
6. Khách bấm cùng thanh đó thì có phiên ẩn danh và hộp thoại mở như trên; hộp ẩn danh tick sẵn, bị khoá và có gợi ý; kudos gửi đi là ẩn danh.

## 7. User Stories

### US058 — Mở hộp thoại Viết Kudo

**Actor:** Sunner đã đăng nhập; khách chưa đăng nhập
**Goal:** Bắt đầu viết một kudos từ thanh gửi kudos của bảng.
**Business value:** Biến thanh A.1 từ phần trang trí thành lối vào gửi kudos; khách cũng gửi được (hoạt động như "Anonymous") mà không phải đăng nhập.

**Acceptance Criteria:**
- [ ] Người đã đăng nhập bấm thanh gửi kudos thấy hộp thoại có tên "Gửi lời cám ơn và ghi nhận đến đồng đội".
- [ ] Khách bấm thanh đó thì hộp thoại mở (sau khi hệ thống mở phiên ẩn danh), không tới `/login`.
- [ ] Với khách, hộp ẩn danh tick sẵn và bị khoá, có gợi ý "Bạn chưa đăng nhập nên Kudos sẽ được gửi ẩn danh."; Gửi vẫn cần đủ người nhận, danh hiệu, nội dung và hashtag.
- [ ] Hủy hoặc Escape đóng hộp thoại; lần mở sau các trường trống.
- [ ] Tab không ra khỏi hộp thoại; đóng xong, tiêu điểm về thanh gửi kudos.

### US059 — Soạn nội dung kudos

**Actor:** Sunner đã đăng nhập
**Goal:** Chọn người nhận, đặt danh hiệu, viết nội dung và chọn hashtag.
**Business value:** Lời cảm ơn đủ thông tin để người nhận hiểu và để bảng lọc được theo hashtag.

**Acceptance Criteria:**
- [ ] Gõ tên vào Người nhận thì gợi ý các Sunner có tên chứa chữ đó (không phân biệt hoa thường, bỏ khoảng trắng đầu cuối), tối đa 10; chọn một gợi ý thì ô nhận tên đó và danh sách đóng.
- [ ] Danh hiệu trống thì báo "Không được để trống" sau khi rời ô; quá 50 ký tự thì báo ngay "Tối đa 50 ký tự".
- [ ] Sáu nút của thanh công cụ bọc phần chọn bằng ký hiệu Markdown tương ứng.
- [ ] Gõ `@` gợi ý Sunner; chọn thì chèn `@Họ tên ` vào nội dung.
- [ ] "+ Hashtag" liệt kê đúng danh sách hashtag có sẵn; chọn thì thành chip; nút xoá trên chip bỏ đúng hashtag đó; tối đa 5.

### US060 — Đính kèm ảnh

**Actor:** Sunner đã đăng nhập
**Goal:** Thêm tối đa 5 ảnh minh hoạ cho kudos.
**Business value:** Kudos giàu thông tin hơn mà vẫn giữ ảnh trong hệ thống của dự án.

**Acceptance Criteria:**
- [ ] Chọn ảnh jpg hoặc png ≤ 5 MB thì thấy ảnh nhỏ ngay và ảnh được tải lên.
- [ ] Tệp sai loại thì báo "Chỉ chấp nhận ảnh JPG hoặc PNG"; tệp quá 5 MB thì báo "Ảnh không được vượt quá 5 MB"; cả hai không tạo ảnh nhỏ.
- [ ] Đủ 5 ảnh thì nút "Image" ẩn; xoá một ảnh thì nút hiện lại.
- [ ] Hủy hộp thoại hoặc xoá ảnh nhỏ thì ảnh đã tải lên (chưa gửi) bị xoá.

### US061 — Gửi kudos và thấy nó trên bảng

**Actor:** Sunner đã đăng nhập
**Goal:** Gửi kudos và thấy nó hiện ngay.
**Business value:** Phản hồi tức thì khiến Sunner tin việc gửi đã thành công.

**Acceptance Criteria:**
- [ ] Gửi vô hiệu cho tới khi người nhận, Danh hiệu, nội dung và ít nhất một hashtag hợp lệ.
- [ ] Bấm Gửi thành công: hộp thoại đóng, hiện "Gửi Kudos thành công!", kudos mới đứng đầu All Kudos không cần tải lại.
- [ ] Máy chủ từ chối một trường thì lỗi hiện ở đúng trường và hộp thoại vẫn mở với dữ liệu cũ.
- [ ] Không thể gửi kudos cho chính mình.

### US062 — Gửi kudos ẩn danh

**Actor:** Sunner đã đăng nhập
**Goal:** Gửi lời cảm ơn mà không lộ tên.
**Business value:** Người ngại nêu tên vẫn dám ghi nhận đồng đội.

**Acceptance Criteria:**
- [ ] Tick hộp ẩn danh thì hiện ô tên ẩn danh; bỏ tick thì ô ẩn đi và tên bị bỏ qua.
- [ ] Thẻ của kudos ẩn danh hiện tên ẩn danh đã đặt, hoặc "Người gửi ẩn danh" khi để trống, không ảnh đại diện và không liên kết hồ sơ.
- [ ] Trình duyệt không đọc được người gửi của kudos ẩn danh qua API của bảng kudos.
- [ ] Số "Kudos bạn đã gửi" của người gửi vẫn tính kudos ẩn danh này.

### US063 — Đọc kudos có định dạng

**Actor:** Khách chưa đăng nhập; Sunner đã đăng nhập
**Goal:** Thấy nội dung kudos với đậm, nghiêng, gạch ngang, danh sách, trích dẫn và liên kết.
**Business value:** Lời cảm ơn dễ đọc và có nhấn mạnh như người viết định.

**Acceptance Criteria:**
- [ ] Nội dung có `**x**`, `_x_`, `~~x~~`, `1. x`, `> x`, `[chữ](https://...)` hiện đúng định dạng trên thẻ.
- [ ] HTML trong nội dung hiện nguyên là chữ, không được thực thi.
- [ ] Liên kết trong nội dung mở tab mới; liên kết không phải http/https hiện là chữ.
- [ ] Nội dung chữ thường hiện y như trước.

## 8. Scenarios

### US058 — Happy Path

**Given** Sunner đã đăng nhập ở `/sun-kudos`, **When** bấm thanh gửi kudos, **Then** hộp thoại "Gửi lời cám ơn và ghi nhận đến đồng đội" mở và tiêu điểm nằm trong đó.

### US058 — Happy Path: khách bấm thanh gửi kudos

**Given** khách chưa đăng nhập và chưa có phiên, **When** bấm thanh gửi kudos, **Then** một phiên ẩn danh được mở, hộp thoại mở, hộp ẩn danh tick sẵn và bị khoá; không tới `/login`. Gửi xong thì kudos mới hiện đầu All Kudos là kudos ẩn danh (tên ẩn danh đã đặt, hoặc "Người gửi ẩn danh").

### US058 — Error: không mở được phiên ẩn danh

**Given** khách chưa có phiên, **When** bấm thanh gửi kudos mà việc mở phiên ẩn danh thất bại (mất mạng, bị giới hạn lượt), **Then** hộp thoại không mở và hiện thông báo lỗi "Không mở được khung viết Kudos. Vui lòng thử lại."

### US059 — Happy Path

**Given** hộp thoại đang mở, **When** gõ "Nguyễn" vào Người nhận và chọn một gợi ý, **Then** ô nhận tên Sunner đó, danh sách đóng và Gửi vẫn tắt vì các trường khác chưa đủ.

### US059 — Error: nhập "@ # $" vào Người nhận

**Given** hộp thoại đang mở, **When** gõ "@ # $" vào Người nhận, **Then** danh sách hiện "Không tìm thấy Sunner phù hợp".

### US060 — Happy Path

**Given** hộp thoại đang mở, **When** chọn một ảnh png 1 MB, **Then** ảnh nhỏ hiện và ảnh được tải lên; chọn thêm đến 5 ảnh thì nút "Image" ẩn.

### US060 — Error: tệp quá lớn hoặc sai loại

**Given** hộp thoại đang mở, **When** chọn một tệp 6 MB hoặc một tệp `.gif`, **Then** thấy thông báo lỗi tương ứng và không có ảnh nhỏ mới.

### US061 — Happy Path

**Given** mọi trường bắt buộc hợp lệ, **When** bấm Gửi, **Then** hộp thoại đóng, hiện "Gửi Kudos thành công!" và kudos mới nằm đầu All Kudos.

### US061 — Error: máy chủ từ chối

**Given** mọi trường hợp lệ ở phía trình duyệt nhưng máy chủ từ chối (ví dụ người nhận vừa bị xoá), **When** bấm Gửi, **Then** lỗi hiện ở trường tương ứng hoặc thông báo "Gửi Kudos không thành công. Vui lòng thử lại.", hộp thoại vẫn mở và dữ liệu được giữ.

### US062 — Happy Path

**Given** hộp thoại đang mở và đã điền đủ, **When** tick ẩn danh, gõ tên "Một người bạn" rồi Gửi, **Then** thẻ mới hiện "Một người bạn" ở chỗ người gửi, không ảnh đại diện, không liên kết hồ sơ.

### US062 — Error: tên ẩn danh quá dài

**Given** đã tick ẩn danh, **When** gõ tên ẩn danh dài hơn 50 ký tự, **Then** ô báo "Tối đa 50 ký tự" và Gửi tắt.

### US063 — Happy Path

**Given** một kudos có nội dung `**Cảm ơn** bạn` và một dòng `1. việc một`, **When** mở `/sun-kudos`, **Then** "Cảm ơn" hiện đậm và dòng sau là mục danh sách đánh số.

### US063 — Error: nội dung chứa HTML hoặc liên kết lạ

**Given** một kudos có `<script>x</script>` và `[bấm](javascript:x)`, **When** mở `/sun-kudos`, **Then** cả hai hiện nguyên là chữ, không có phần tử `script` hay liên kết `javascript:`.

## 9. Edge Cases

| Scenario | What Happens | User-Facing Message |
|----------|--------------|----------------------|
| Danh sách hashtag không đọc được lúc mở trang | picker rỗng nên không đủ hashtag hợp lệ, Gửi luôn tắt; lỗi ghi log ở máy chủ | None — Gửi không bật |
| Tài khoản đăng nhập chưa có hồ sơ Sunner | máy chủ trả `noSunner`, không ghi gì | "Tài khoản của bạn chưa được liên kết với hồ sơ Sunner." |
| Gõ lại sau khi đã chọn người nhận | lựa chọn bị bỏ, phải chọn lại một gợi ý | "Không được để trống" sau khi rời ô, nếu chưa chọn |
| Chọn nhiều tệp, có cái sai loại hoặc quá số lượng | tệp hợp lệ được nhận đến đủ 5, tệp còn lại bị từ chối | "Chỉ chấp nhận ảnh JPG hoặc PNG", "Ảnh không được vượt quá 5 MB" hoặc "Tối đa 5 ảnh" |
| Ảnh còn đang tải khi bấm Gửi | Gửi vô hiệu cho tới khi mọi ảnh xong | ảnh nhỏ phủ lớp mờ kèm vòng quay trong lúc tải |
| Tải ảnh lên lỗi (mạng, kho ảnh) | ảnh nhỏ bị bỏ, không gắn vào kudos | "Tải ảnh lên không thành công. Vui lòng thử lại." |
| Đóng hộp thoại khi ảnh đã tải mà chưa gửi | ảnh bị xoá ngay (cố gắng hết sức); không xoá được thì ảnh mồ côi còn trong kho | None — silent handling |
| Bấm Gửi hai lần liên tiếp | lần thứ hai bị chặn khi đang gửi | None — nút vô hiệu kèm vòng quay |
| Bấm Hủy hoặc Escape khi đang gửi | không có tác dụng: hộp thoại ở nguyên và ảnh chưa bị xoá đến khi gửi xong | None — Hủy vô hiệu |
| Hai yêu cầu cùng gắn một ảnh | một yêu cầu thành công, yêu cầu kia bị từ chối cả lần gửi | "Tải ảnh lên không thành công. Vui lòng thử lại." |
| Phiên hết hạn lúc bấm Gửi | máy chủ trả `unauthenticated`, đưa tới `/login`, không ghi gì | None — chuyển trang |
| Khách tự tìm hồ sơ Sunner khách để làm người nhận (qua ô tìm, hoặc gọi thẳng `sendKudos`/`create_kudos` với mã của hồ sơ khách) | ô tìm không trả hồ sơ khách; gọi thẳng thì bị từ chối như người nhận không tồn tại (`recipient: required`) | lỗi trường Người nhận |
| Khách gọi thẳng `create_kudos` với `p_is_anonymous = false` | cơ sở dữ liệu ép ẩn danh: kudos vẫn ẩn danh | None — silent handling |
| Nội dung có HTML, `javascript:` hoặc ký hiệu Markdown không đóng | hiện nguyên là chữ | None — silent handling |
| Người gửi tự thích kudos ẩn danh của mình | nút tim bật (trình duyệt không biết ai là người gửi); DB từ chối, thông báo lỗi ngắn của F007 hiện | thông báo lỗi tim của F007 |
| Khách đọc `/rest/v1/kudos` với `select=sender_id` hoặc `select=*` | bị từ chối (quyền cột) | None — truy cập bị từ chối ở máy chủ |
| Ai đó mở `/api/kudos/images/<uuid>.png` của ảnh chưa gắn | 404, kể cả với chủ ảnh (chủ chỉ thấy ảnh nhỏ cục bộ khi soạn) | None |

## 10. Edge Behaviours to Verify

- **FR-001** → kudos mới ẩn danh có cờ ẩn danh và tên; kudos cũ vẫn không ẩn danh.
- **FR-002** → ảnh tải lên có đường dẫn `/api/kudos/images/<uuid>.<ext>` không chứa mã người dùng.
- **FR-003** → gắn cùng một ảnh vào kudos thứ hai thì bị từ chối.
- **FR-101** → người đã đăng nhập bấm A.1 thấy hộp thoại; khách bấm thì có phiên ẩn danh và hộp thoại mở, không sang `/login`; không mở được phiên thì không có hộp thoại và có thông báo lỗi.
- **FR-102** → hộp thoại có `role="dialog"` và đúng tên; Tab không ra ngoài; đóng thì tiêu điểm về thanh gửi kudos.
- **FR-103** → Hủy hoặc Escape đóng; mở lại thì trống; ảnh chưa gửi bị xoá; đang gửi thì cả hai không có tác dụng.
- **FR-104** → có liên kết "Tiêu chuẩn cộng đồng" tới `/standards`.
- **FR-105** → đổi sang EN thì nhãn hộp thoại đổi, nội dung nhập không đổi.
- **FR-201** → thứ tự các trường đúng như liệt kê.
- **FR-202** → "Nguyễn" gợi ý đúng; "an" khớp không phân biệt hoa thường; "@ # $" cho không kết quả; chọn gợi ý thì điền tên và đóng danh sách; không thấy chính mình.
- **FR-203** → Danh hiệu trống và quá 50 ký tự đều báo lỗi.
- **FR-204** → mỗi nút thanh công cụ bọc phần chọn đúng ký hiệu; nội dung trống và quá 2000 ký tự báo lỗi.
- **FR-205** → chọn gợi ý `@` thì chèn đúng `@Họ tên `.
- **FR-206** → danh sách hashtag đúng và theo thứ tự; thêm, xoá chip; không có chip thứ sáu.
- **FR-207** → đủ 5 ảnh thì nút ẩn; sai loại và quá 5 MB bị từ chối; xoá ảnh trả chỗ.
- **FR-208** → tick ẩn danh hiện ô tên; mặc định tắt; với khách thì tick sẵn, bị khoá và có gợi ý.
- **FR-209** → lỗi hiện sau khi rời trường; "quá dài" hiện ngay với giới hạn đúng của trường.
- **FR-301** → Gửi tắt cho tới khi đủ điều kiện, và tắt khi còn ảnh đang tải.
- **FR-302** → thành công: đóng, toast, kudos mới đầu All Kudos không tải lại.
- **FR-303** → lỗi máy chủ: hộp thoại mở, dữ liệu giữ, lỗi đúng trường hoặc toast.
- **FR-304** → người gửi trên thẻ mới (không ẩn danh) là Sunner của tài khoản đăng nhập.
- **FR-305** → hashtag lặp không sinh hai dòng hashtag.
- **FR-401** → các ký hiệu Markdown hiện đúng định dạng; HTML hiện nguyên; liên kết mở tab mới.
- **FR-402** → thẻ ẩn danh không có ảnh đại diện hay liên kết hồ sơ; hiện tên đã đặt hoặc chữ mặc định.
- **FR-403** → sau khi gửi ẩn danh, "Số Kudos bạn đã gửi" tăng 1.
- **FR-601** → gọi `create_kudos` bằng `anon` bị từ chối; `insert` thẳng vào `kudos` bị từ chối.
- **FR-602** → `select=sender_id` và `select=*` trên `kudos` bị từ chối; kudos ẩn danh có `public_sender_id` rỗng.
- **FR-603** → khách tải ảnh nhận 401; tệp đổi đuôi `.png` nhưng không phải ảnh nhận 415; tệp quá 5 MB nhận 413.
- **FR-604** → khách đọc ảnh chưa gắn nhận 404; chủ xoá được ảnh chưa gắn; không ai xoá được ảnh đã gắn.
- **FR-605** → không có phần tử `script` nào từ nội dung; liên kết không phải http/https hiện là chữ.
- **FR-606** → người chưa có phiên gọi `sendKudos` nhận `unauthenticated`, `searchSunners` nhận danh sách rỗng; khách có phiên ẩn danh gửi được và tìm được (không thấy hồ sơ khách).

## 11. Risks & Known Issues

| ID | Type | Description | Impact | Status |
|----|------|--------------|--------|--------|
| RISK-01 | risk | Đã xử lý (review round 2, C2): `sunners.hearts_total` không còn đọc được từ trình duyệt, nên so sánh tổng tim quanh một lượt thích không chỉ ra người gửi kudos ẩn danh. Tim vẫn cộng cho người gửi (kể cả kudos ẩn danh); số tim trên thẻ (`kudos.like_count`) vẫn công khai | Thay cho quyết định cũ "chấp nhận kẽ hở đếm tim" | [CONFIRMED] đã chốt (clarifications 2026-10-14, "review round 2", C2) |
| RISK-02 | risk | Người gửi vẫn thấy nút tim bật trên kudos ẩn danh của chính mình vì trình duyệt không biết ai là người gửi; DB từ chối, giao diện hiện thông báo lỗi ngắn | Trải nghiệm thừa nhưng không sai dữ liệu | [EXPECTED] hoãn (clarifications) |
| RISK-03 | risk | Tên ẩn danh có thể giả giống tên người thật | Giả mạo bằng chữ | [EXPECTED] quyết định sản phẩm, chưa chặn |
| RISK-04 | risk | Chưa có giới hạn tốc độ gửi và tải ảnh; ảnh tải lên mà không gửi chỉ được xoá khi đóng hộp thoại (cố gắng hết sức), chưa có tác vụ dọn ảnh mồ côi | Kho ảnh có thể phình; lạm dụng gửi | [EXPECTED] hoãn (clarifications) |
| RISK-05 | risk | Migration kho ảnh ghi đè (upsert) cấu hình bucket `images` nếu bucket cùng tên đã có trên dự án hosted: đổi sang riêng tư, giới hạn 5 MiB, chỉ jpeg/png | Có thể đổi hành vi của bucket đang dùng cho việc khác | [EXPECTED] đã được người duyệt migration chấp nhận (2026-10-14) |
| RISK-06 | risk | Thẻ mang cả nguồn Markdown lẫn cây đã phân tích; route ảnh đọc cả tệp vào bộ nhớ trước khi trả; làm mới bảng dựng lại danh sách All Kudos | Tải tăng nhẹ, tốn bộ nhớ ở ảnh lớn | [EXPECTED] hoãn (review, mức Low) |
| RISK-07 | risk | Spec G của MoMorph và file test case có điểm chưa khớp (ID-48 và ID-56; Danh hiệu có trong Figma nhưng không có trong CSV) | Đã chốt ở D005 và D008 | [INFERRED] đã giải quyết bằng clarifications |
| RISK-08 | risk | Khách gửi kudos không cần đăng nhập và chưa có giới hạn tốc độ hay captcha cho phiên ẩn danh, nên mỗi phiên mới gửi và tải ảnh được thêm; chỉ có trần của Supabase (mặc định 30 lượt đăng nhập ẩn danh mỗi giờ mỗi IP; local nâng lên 1000 để chạy hết bộ E2E) | Có thể bị dùng để gửi kudos rác hàng loạt | [ACCEPTED] người dùng chấp nhận (clarifications 2026-10-14); làm giới hạn tốc độ và captcha trước khi chạy thật. **Triển khai thật:** bật anonymous sign-ins trên dự án Supabase và chọn mức giới hạn đăng nhập ẩn danh |
| RISK-04 | risk | Chưa có giới hạn tốc độ gửi và tải ảnh;'],

## 12. Dependencies

| Dependency | Type | Why this feature needs it | Evidence |
|------------|------|-----------------------------|----------|
| F006_KudosBoardBrowse | feature | thanh gửi kudos A.1, vỏ trang, thẻ kudos (nơi hiện nội dung Markdown và khối ẩn danh), bảng Sunner/kudos/hashtag/ảnh, hàm `get_my_sunner()` (đường duy nhất đọc `hearts_total` của chính người xem), toast, danh sách hashtag, quy tắc ảnh cục bộ | FR-101, FR-202, FR-401, FR-402 |
| F007_KudosHearts | feature | trigger tim dùng `sender_id`; luật chặn tự thích; kho tim hiển thị trên thẻ mới | FR-304, FR-402 |
| F009_KudosPersonalSidebar | feature | số "Kudos bạn đã gửi" đổi sang hàm `get_my_sent_kudos_count()` | FR-403 |
| F001_LoginWithGoogle | feature | `/login` là đích khi người dùng hết phiên lúc Gửi (không còn là đích của khách bấm A.1) | FR-303 |
| F003_AccountMenuAdminRole | feature | `getCurrentUser()` (có `isAnonymous`) phân biệt người có phiên và người chưa có phiên ở Server Action và route ảnh | FR-606 |
| Phiên ẩn danh của khách (`ensureGuestSession`, migration `20261014084206_guest_anonymous_sunners`) | infrastructure | mở phiên ẩn danh Supabase và hồ sơ Sunner khách (`sunners.is_guest`) để khách gửi kudos | FR-101, FR-304 |
| Supabase Storage | service | kho ảnh riêng (bucket `images`) với bốn policy | FR-002, FR-604 |
| Trang `/standards` | feature | đích của "Tiêu chuẩn cộng đồng"; chưa xây nên 404 | FR-104 |

## 13. Configuration

```text
WRITE_KUDOS_LIMITS.titleMax          = 50       # ký tự của Danh hiệu
WRITE_KUDOS_LIMITS.bodyMax           = 2000     # ký tự của nội dung
WRITE_KUDOS_LIMITS.hashtagsMax       = 5
WRITE_KUDOS_LIMITS.imagesMax         = 5
WRITE_KUDOS_LIMITS.anonymousNameMax  = 50
KUDOS_IMAGE_MAX_BYTES                = 5 MiB    # cũng là file_size_limit của bucket images
SEARCH_LIMIT (searchSunners)         = 10       # số gợi ý tối đa
SEARCH_MAX_LENGTH (searchSunners)    = 100      # từ khoá dài hơn thì trả rỗng
DEBOUNCE_MS (tìm người nhận)         = 200
```

Hằng số trong mã (`lib/kudos/kudos-write-validation.ts`, `lib/kudos/kudos-image-files.ts`, `lib/kudos/send-kudos-action.ts`, `app/_components/write-kudos-behaviour/use-sunner-search.ts`); không có biến môi trường hay cờ tính năng mới.
