-- F006 Kudos Board Browse: departments, hashtags, Sunners and 60 kudos with their hashtags and
-- images (local seed, runs on `supabase db reset` after 01-03 — seeds run in filename order).
-- Mock content comes from the MoMorph/Figma frame MaZUn5xHXZ ("Sun* Kudos - Live board"): Sunner
-- names, departments CECV2/CEVC10, hashtags Dedicated/Inspring (sic)/IDOL GIỚI TRẺ, the body text
-- and the 10:00 - 10/30/2025 and 08:30PM samples. Rows mirror the E2E seed contract
-- e2e/support/kudos-board-seed.ts exactly; UUIDs, emails, timestamps, like counts, the
-- Teamwork/Creative/Problem Solver tags, the "Link Test" Sunners and the NGƯỜI TRUYỀN LỬA title
-- are test-only values (not in Figma).
-- Kudos are inserted oldest first so seq follows time. kudos_received_count is produced by the
-- kudos trigger; like_count is set directly (there are no seed likes) and hearts_total is derived
-- from it (sum of like_count over the kudos each Sunner SENT). user_id stays NULL: the auth.users
-- trigger links a Sunner when an account with the same confirmed email appears.
-- Avatar and gallery files under /public/sun-kudos are delivered by the UI track; only paths here.
-- Idempotent: upserts by primary key; links (user_id) and received counts are never overwritten.
--
-- Sunner numbers (UUID 5c000000-0000-4000-8000-<n>): 1 Chức (exactly 50 received, Legend),
-- 2 Xuân, 3 Hiệp (E2E sender account), 4 An (E2E viewer account), 5 Thúy, 6 Trang, 7 Quy,
-- 8 Linh, 9/10 link-trigger test Sunners. Kudos n -> UUID 4b000000-0000-4000-8000-<n>, seq = n.

-- Figma shows departments by code only, so the name repeats the code.
insert into public.departments (code, name) values
  ('CECV2', 'CECV2'),
  ('CEVC10', 'CEVC10')
on conflict (code) do update set name = excluded.name;

insert into public.hashtags (slug, label, sort_order) values
  ('dedicated', 'Dedicated', 1),
  ('inspring', 'Inspring', 2),
  ('idol-gioi-tre', 'IDOL GIỚI TRẺ', 3),
  ('teamwork', 'Teamwork', 4),
  ('creative', 'Creative', 5),
  ('problem-solver', 'Problem Solver', 6)
on conflict (slug) do update set label = excluded.label, sort_order = excluded.sort_order;

insert into public.sunners (id, full_name, email, department_code, avatar_url) values
  ('5c000000-0000-4000-8000-000000000001', 'Nguyễn Bá Chức', 'nguyen-ba-chuc@example.com', 'CECV2', '/sun-kudos/avatars/avatar-01.png'),
  ('5c000000-0000-4000-8000-000000000002', 'Huỳnh Dương Xuân', 'huynh-duong-xuan@example.com', 'CECV2', '/sun-kudos/avatars/avatar-02.png'),
  ('5c000000-0000-4000-8000-000000000003', 'Đỗ hoàng Hiệp', 'sender-kudos@example.com', 'CECV2', '/sun-kudos/avatars/avatar-03.png'),
  ('5c000000-0000-4000-8000-000000000004', 'Dương thúy An', 'viewer-kudos@example.com', 'CECV2', '/sun-kudos/avatars/avatar-04.png'),
  ('5c000000-0000-4000-8000-000000000005', 'Mai phương Thúy', 'mai-phuong-thuy@example.com', 'CEVC10', '/sun-kudos/avatars/avatar-05.png'),
  ('5c000000-0000-4000-8000-000000000006', 'Lê Kiều Trang', 'le-kieu-trang@example.com', 'CEVC10', '/sun-kudos/avatars/avatar-06.png'),
  ('5c000000-0000-4000-8000-000000000007', 'Nguyễn Văn Quy', 'nguyen-van-quy@example.com', 'CECV2', '/sun-kudos/avatars/avatar-07.png'),
  ('5c000000-0000-4000-8000-000000000008', 'Nguyễn Hoàng Linh', 'nguyen-hoang-linh@example.com', 'CECV2', '/sun-kudos/avatars/avatar-08.png'),
  ('5c000000-0000-4000-8000-000000000009', 'Link Test Một', 'link-test-1@example.com', 'CECV2', null),
  ('5c000000-0000-4000-8000-000000000010', 'Link Test Hai', 'link-test-2@example.com', 'CECV2', null)
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  department_code = excluded.department_code,
  avatar_url = excluded.avatar_url;

-- K01-K48: filler kudos to Chức every 2 hours from 2025-10-20 08:00 (+07), senders rotating
-- Thúy, Trang, Quy, Linh, Xuân, like_count = n % 4. K49-K60: the rows individual specs use.
-- body_kind NULL = the Figma body, 'rich' = the 8-line body (> 5 lines, BR-007).
with figma (body, line_a, line_b) as (
  values (
    'Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống...',
    'Cảm ơn người em bình thường nhưng phi thường :D',
    'Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team')
), seed (n, sender, receiver, title, body_kind, like_count, created_at) as (
  select n, (array[5, 6, 7, 8, 2])[(n - 1) % 5 + 1], 1, null::text, null::text, n % 4,
    timestamptz '2025-10-20 08:00:00+07' + (n - 1) * interval '2 hours'
  from generate_series(1, 48) as n
  union all values
    (49, 3, 7, 'IDOL GIỚI TRẺ', null, 40, timestamptz '2025-10-25 09:00:00+07'),
    (50, 5, 1, null, null, 35, timestamptz '2025-10-26 09:00:00+07'),
    (51, 6, 4, null, null, 30, timestamptz '2025-10-27 09:00:00+07'),
    (52, 2, 8, null, null, 25, timestamptz '2025-10-28 09:00:00+07'),
    (53, 7, 3, null, null, 20, timestamptz '2025-10-29 09:00:00+07'),
    (54, 8, 2, 'NGƯỜI TRUYỀN LỬA', 'rich', 15, timestamptz '2025-10-29 15:00:00+07'),
    (55, 4, 6, null, null, 4, timestamptz '2025-10-30 10:00:00+07'),
    (56, 7, 5, null, null, 3, timestamptz '2025-11-01 09:00:00+07'),
    (57, 4, 6, null, null, 0, timestamptz '2025-11-02 09:00:00+07'),
    (58, 2, 5, null, null, 0, timestamptz '2025-11-03 09:00:00+07'),
    (59, 3, 6, null, null, 0, timestamptz '2025-11-04 09:00:00+07'),
    (60, 6, 1, null, null, 6, timestamptz '2025-11-05 20:30:00+07')
)
insert into public.kudos (id, sender_id, receiver_id, title, body, like_count, created_at)
select
  ('4b000000-0000-4000-8000-' || lpad(s.n::text, 12, '0'))::uuid,
  ('5c000000-0000-4000-8000-' || lpad(s.sender::text, 12, '0'))::uuid,
  ('5c000000-0000-4000-8000-' || lpad(s.receiver::text, 12, '0'))::uuid,
  s.title,
  case when s.body_kind = 'rich'
    then array_to_string(array[f.line_a, f.line_b, f.line_a, f.line_b, f.line_a, f.line_b, f.line_a, f.line_b], chr(10))
    else f.body end,
  s.like_count,
  s.created_at
from seed as s cross join figma as f
order by s.n
on conflict (id) do update set
  sender_id = excluded.sender_id,
  receiver_id = excluded.receiver_id,
  title = excluded.title,
  body = excluded.body,
  like_count = excluded.like_count,
  created_at = excluded.created_at;

-- Filler tags alternate Dedicated (odd n) / Inspring (even n); K54 carries all six (> 5, BR-007).
insert into public.kudos_hashtags (kudos_id, hashtag_slug)
select ('4b000000-0000-4000-8000-' || lpad(t.n::text, 12, '0'))::uuid, t.slug
from (
  select n, case when n % 2 = 1 then 'dedicated' else 'inspring' end from generate_series(1, 48) as n
  union all values
    (49, 'dedicated'), (49, 'inspring'),
    (50, 'teamwork'),
    (51, 'dedicated'),
    (52, 'inspring'),
    (53, 'dedicated'), (53, 'teamwork'),
    (54, 'dedicated'), (54, 'inspring'), (54, 'idol-gioi-tre'), (54, 'teamwork'), (54, 'creative'), (54, 'problem-solver'),
    (55, 'dedicated'),
    (56, 'problem-solver'), (56, 'teamwork'),
    (57, 'problem-solver'),
    (58, 'inspring'),
    (59, 'creative'),
    (60, 'inspring')
) as t (n, slug)
on conflict (kudos_id, hashtag_slug) do nothing;

-- K54 gallery: six images (> 5, BR-007), the sixth repeats the first.
insert into public.kudos_images (kudos_id, sort_order, image_path) values
  ('4b000000-0000-4000-8000-000000000054', 1, '/sun-kudos/gallery/gallery-01.png'),
  ('4b000000-0000-4000-8000-000000000054', 2, '/sun-kudos/gallery/gallery-02.png'),
  ('4b000000-0000-4000-8000-000000000054', 3, '/sun-kudos/gallery/gallery-03.png'),
  ('4b000000-0000-4000-8000-000000000054', 4, '/sun-kudos/gallery/gallery-04.png'),
  ('4b000000-0000-4000-8000-000000000054', 5, '/sun-kudos/gallery/gallery-05.png'),
  ('4b000000-0000-4000-8000-000000000054', 6, '/sun-kudos/gallery/gallery-01.png')
on conflict (kudos_id, sort_order) do update set image_path = excluded.image_path;

-- hearts_total of the seed Sunners = sum of like_count over the kudos they sent (no seed likes).
update public.sunners as s
   set hearts_total = coalesce((select sum(k.like_count) from public.kudos as k where k.sender_id = s.id), 0)
 where s.id::text like '5c000000-0000-4000-8000-%';
