-- F009 Kudos Personal Sidebar: Secret Boxes behind the D.1 counts and the D.3 gift list
-- (local seed, runs on `supabase db reset` after 04-kudos-board.sql, which seeds the owners).
-- The gift name is Figma verbatim (frame MaZUn5xHXZ, D.3 "Nhận được 1 áo phông SAA"); box UUIDs,
-- owners and opened_at are test-only values (not in Figma) from the E2E seed contract
-- e2e/support/kudos-board-seed.ts (SECRET_BOXES): 12 opened boxes with distinct opened_at (Xuân
-- twice among the latest 10) and 4 unopened boxes (3 for An, the viewer account; 1 for Chức).
-- Owner UUIDs: Sunner n = 5c000000-0000-4000-8000-<n> (see 04-kudos-board.sql).
-- Idempotent: upsert by id.
insert into public.secret_boxes (id, owner_id, gift_name, opened_at) values
  ('5b000000-0000-4000-8000-000000000001', '5c000000-0000-4000-8000-000000000002', 'áo phông SAA', '2025-11-05 18:00:00+07'),
  ('5b000000-0000-4000-8000-000000000002', '5c000000-0000-4000-8000-000000000007', 'áo phông SAA', '2025-11-05 15:00:00+07'),
  ('5b000000-0000-4000-8000-000000000003', '5c000000-0000-4000-8000-000000000004', 'áo phông SAA', '2025-11-04 20:00:00+07'),
  ('5b000000-0000-4000-8000-000000000004', '5c000000-0000-4000-8000-000000000005', 'áo phông SAA', '2025-11-04 10:00:00+07'),
  ('5b000000-0000-4000-8000-000000000005', '5c000000-0000-4000-8000-000000000002', 'áo phông SAA', '2025-11-03 16:00:00+07'),
  ('5b000000-0000-4000-8000-000000000006', '5c000000-0000-4000-8000-000000000006', 'áo phông SAA', '2025-11-03 09:00:00+07'),
  ('5b000000-0000-4000-8000-000000000007', '5c000000-0000-4000-8000-000000000008', 'áo phông SAA', '2025-11-02 14:00:00+07'),
  ('5b000000-0000-4000-8000-000000000008', '5c000000-0000-4000-8000-000000000001', 'áo phông SAA', '2025-11-01 11:00:00+07'),
  ('5b000000-0000-4000-8000-000000000009', '5c000000-0000-4000-8000-000000000004', 'áo phông SAA', '2025-10-31 17:00:00+07'),
  ('5b000000-0000-4000-8000-000000000010', '5c000000-0000-4000-8000-000000000003', 'áo phông SAA', '2025-10-30 08:00:00+07'),
  ('5b000000-0000-4000-8000-000000000011', '5c000000-0000-4000-8000-000000000005', 'áo phông SAA', '2025-10-29 12:00:00+07'),
  ('5b000000-0000-4000-8000-000000000012', '5c000000-0000-4000-8000-000000000006', 'áo phông SAA', '2025-10-28 12:00:00+07'),
  ('5b000000-0000-4000-8000-000000000013', '5c000000-0000-4000-8000-000000000004', 'áo phông SAA', null),
  ('5b000000-0000-4000-8000-000000000014', '5c000000-0000-4000-8000-000000000004', 'áo phông SAA', null),
  ('5b000000-0000-4000-8000-000000000015', '5c000000-0000-4000-8000-000000000004', 'áo phông SAA', null),
  ('5b000000-0000-4000-8000-000000000016', '5c000000-0000-4000-8000-000000000001', 'áo phông SAA', null)
on conflict (id) do update set
  owner_id = excluded.owner_id,
  gift_name = excluded.gift_name,
  opened_at = excluded.opened_at;
