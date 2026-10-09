-- F004 Awards Information: detail copy and prize tiers of the 6 award categories
-- (local seed, runs on `supabase db reset` after 01-awards.sql — seeds run in filename order).
-- Text is copied verbatim from the MoMorph/Figma frame zFYDgyj_pD, cards D.1-D.6 (inventory:
-- plans/261009-0806-awards-information/momorph/awards-information-content.md): trailing spaces
-- trimmed. The double space Figma uses as a paragraph break (Signature, MVP) is stored as a real
-- blank line, chr(10) || chr(10); the page renders descriptions with white-space: pre-line.
-- EN units/notes per clarifications.
-- Idempotent: awards rows are updated by slug, prize tiers upserted by (award_slug, sort_order).

update public.awards as a set
  nav_label = v.nav_label,
  quantity = v.quantity,
  unit_vi = v.unit_vi,
  unit_en = v.unit_en,
  detail_description_vi = v.detail_description_vi
from (values
  ('top-talent', 'Top Talent', 10, 'Cá nhân', 'Individual',
    'Giải thưởng Top Talent vinh danh những cá nhân xuất sắc toàn diện – những người không ngừng khẳng định năng lực chuyên môn vững vàng, hiệu suất công việc vượt trội, luôn mang lại giá trị vượt kỳ vọng, được đánh giá cao bởi khách hàng và đồng đội. Với tinh thần sẵn sàng nhận mọi nhiệm vụ tổ chức giao phó, họ luôn là nguồn cảm hứng, thúc đẩy động lực và tạo ảnh hưởng tích cực đến cả tập thể.'),
  ('top-project', 'Top Project', 2, 'Tập thể', 'Team',
    'Giải thưởng Top Project vinh danh các tập thể dự án xuất sắc với kết quả kinh doanh vượt kỳ vọng, hiệu quả vận hành tối ưu và tinh thần làm việc tận tâm. Đây là các dự án có độ phức tạp kỹ thuật cao, hiệu quả tối ưu hóa nguồn lực và chi phí tốt, đề xuất các ý tưởng có giá trị cho khách hàng, đem lại lợi nhuận vượt trội và nhận được phản hồi tích cực từ khách hàng. Các thành viên tuân thủ nghiêm ngặt các tiêu chuẩn phát triển nội bộ trong phát triển dự án, tạo nên một hình mẫu về sự xuất sắc và chuyên nghiệp.'),
  ('top-project-leader', 'Top Project Leader', 3, 'Cá nhân', 'Individual',
    'Giải thưởng Top Project Leader vinh danh những nhà quản lý dự án xuất sắc – những người hội tụ năng lực quản lý vững vàng, khả năng truyền cảm hứng mạnh mẽ, và tư duy “Aim High – Be Agile” trong mọi bài toán và bối cảnh. Dưới sự dẫn dắt của họ, các thành viên không chỉ cùng nhau vượt qua thử thách và đạt được mục tiêu đề ra, mà còn giữ vững ngọn lửa nhiệt huyết, tinh thần Wasshoi, và trưởng thành để trở thành phiên bản tinh hoa – hạnh phúc hơn của chính mình.'),
  ('best-manager', 'Best Manager', 1, 'Cá nhân', 'Individual',
    'Giải thưởng Best Manager vinh danh những nhà lãnh đạo tiêu biểu – người đã dẫn dắt đội ngũ của mình tạo ra kết quả vượt kỳ vọng, tác động nổi bật đến hiệu quả kinh doanh và sự phát triển bền vững của tổ chức. Dưới sự lãnh đạo của họ, đội ngũ luôn chinh phục và làm chủ mọi mục tiêu bằng năng lực đa nhiệm, khả năng phối hợp hiệu quả, và tư duy ứng dụng công nghệ linh hoạt trong kỷ nguyên số. Họ truyền cảm hứng để tập thể trở nên tự tin tràn đầy năng lượng, sẵn sàng đón nhận, thậm chí dẫn dắt tạo ra những thay đổi có tính cách mạng.'),
  ('signature-2025-creator', 'Signature 2025 Creator', 1, 'Cá nhân hoặc tập thể', 'Individual or team',
    'Giải thưởng Signature vinh danh cá nhân hoặc tập thể thể hiện tinh thần đặc trưng mà Sun* hướng tới trong từng thời kỳ.' || chr(10) || chr(10) || 'Trong năm 2025, giải thưởng Signature vinh danh Creator - cá nhân/tập thể mang tư duy chủ động và nhạy bén, luôn nhìn thấy cơ hội trong thách thức và tiên phong trong hành động. Họ là những người nhạy bén với vấn đề, nhanh chóng nhận diện và đưa ra những giải pháp thực tiễn, mang lại giá trị rõ rệt cho dự án, khách hàng hoặc tổ chức. Với tư duy kiến tạo và tinh thần “Creator” đặc trưng của Sun*, họ không chỉ phản ứng tích cực trước sự thay đổi mà còn chủ động tạo ra cải tiến, góp phần định hình chuẩn mực mới cho cách mà người Sun* tạo giá trị.'),
  ('mvp', 'MVP', 1, 'Cá nhân', 'Individual',
    'Giải thưởng MVP vinh danh cá nhân xuất sắc nhất năm – gương mặt tiêu biểu đại diện cho toàn bộ tập thể Sun*. Họ là người đã thể hiện năng lực vượt trội, tinh thần cống hiến bền bỉ, và tầm ảnh hưởng sâu rộng, để lại dấu ấn mạnh mẽ trong hành trình của Sun* suốt năm qua.' || chr(10) || chr(10) || 'Không chỉ nổi bật bởi hiệu suất và kết quả công việc, họ còn là nguồn cảm hứng lan tỏa – thông qua suy nghĩ, hành động và ảnh hưởng tích cực của mình đối với tập thể. MVP là người hội tụ đầy đủ phẩm chất của người Sun* ưu tú, đồng thời mang trên mình trọng trách lớn lao: trở thành hình mẫu đại diện cho con người và tinh thần Sun*, góp phần dẫn dắt tập thể vươn tới những đỉnh cao mới.')
) as v (slug, nav_label, quantity, unit_vi, unit_en, detail_description_vi)
where a.slug = v.slug;

-- Amounts in whole VND; a null note means the card shows no note line (Best Manager, MVP).
insert into public.award_prizes (award_slug, sort_order, amount_vnd, note_vi, note_en) values
  ('top-talent', 1, 7000000, 'cho mỗi giải thưởng', 'per award'),
  ('top-project', 1, 15000000, 'cho mỗi giải thưởng', 'per award'),
  ('top-project-leader', 1, 7000000, 'cho mỗi giải thưởng', 'per award'),
  ('best-manager', 1, 10000000, null, null),
  ('signature-2025-creator', 1, 5000000, 'cho giải cá nhân', 'for the individual award'),
  ('signature-2025-creator', 2, 8000000, 'cho giải tập thể', 'for the team award'),
  ('mvp', 1, 15000000, null, null)
on conflict (award_slug, sort_order) do update set
  amount_vnd = excluded.amount_vnd,
  note_vi = excluded.note_vi,
  note_en = excluded.note_en;
