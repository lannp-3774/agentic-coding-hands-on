-- F002 Homepage SAA: the 6 award categories (local seed, runs on `supabase db reset`).
-- Text is copied verbatim from the MoMorph/Figma frame i87tDx10uM, cards C2.1-C2.6.
-- Titles are proper names, so title_en = title_vi. Images live under /public/home/awards.
insert into public.awards (slug, title_vi, title_en, description_vi, image_path, sort_order) values
  ('top-talent', 'Top Talent', 'Top Talent',
    'Vinh danh top cá nhân xuất sắc trên mọi phương diện',
    '/home/awards/top-talent.png', 1),
  ('top-project', 'Top Project', 'Top Project',
    'Vinh danh dự án xuất sắc trên mọi phương diện, dự án có doanh thu nổi bật',
    '/home/awards/top-project.png', 2),
  ('top-project-leader', 'Top Project Leader', 'Top Project Leader',
    'Vinh danh người quản lý truyền cảm hứng và dẫn dắt dự án bứt phá,',
    '/home/awards/top-project-leader.png', 3),
  ('best-manager', 'Best Manager', 'Best Manager',
    'Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm',
    '/home/awards/best-manager.png', 4),
  ('signature-2025-creator', 'Signature 2025 - Creator', 'Signature 2025 - Creator',
    'Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm',
    '/home/awards/signature-2025-creator.png', 5),
  ('mvp', 'MVP (Most Valuable Person)', 'MVP (Most Valuable Person)',
    'Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm',
    '/home/awards/mvp.png', 6)
on conflict (slug) do update set
  title_vi = excluded.title_vi,
  title_en = excluded.title_en,
  description_vi = excluded.description_vi,
  image_path = excluded.image_path,
  sort_order = excluded.sort_order;
