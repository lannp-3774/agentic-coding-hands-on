/**
 * Seed contract for the Sun* Kudos E2E suite (F006-F009). Phase 07 seeds
 * (supabase/seeds/common/04-kudos-board.sql, 05-special-days.sql, 06-secret-boxes.sql)
 * MUST produce exactly these rows; specs read their expectations from here.
 * Read-only for every other phase: a mismatch is BLOCKED back to the tester.
 *
 * Decisions honoured (clarifications.md): department filter = receiver's department;
 * ~60 kudos incl. one receiver at exactly 50 (D021); secret_boxes opened = public,
 * unopened = owner only; special_days only in 2025 (never "today").
 * Seed sets kudos.like_count and sunners.hearts_total directly (hearts_total = sum of
 * like_count over kudos the sunner SENT); kudos_received_count comes from the A12
 * trigger while kudos rows are inserted in seq order (oldest first). No seed likes.
 *
 * Mock data comes from Figma frame MaZUn5xHXZ (names, CECV2/CEVC10, Dedicated/Inspring/IDOL GIỚI TRẺ,
 * body text, "áo phông SAA", the 10:00 - 10/30/2025 and 08:30PM samples). Values a test needs that Figma
 * cannot express are marked `// test-only value (not in Figma)`; UUIDs, emails, passwords, timestamps,
 * like counts and secret_boxes.opened_at are test-only values (not in Figma) throughout.
 */

const uuid = (prefix: string, n: number) => `${prefix}-0000-4000-8000-${String(n).padStart(12, '0')}`;
export const sunnerId = (n: number) => uuid('5c000000', n);
export const kudosId = (n: number) => uuid('4b000000', n);
export const boxId = (n: number) => uuid('5b000000', n);

/** departments(code, name): Figma cards show "CECV2"; the spec text names "CEVC10". Ordered by code. */
export const DEPARTMENTS = ['CECV2', 'CEVC10'] as const;

/** hashtags(slug, label, sort_order) — the fixed Hashtag filter list. Figma: "#Dedicated #Inspring" (sic). */
export const HASHTAGS = [
  { slug: 'dedicated', label: 'Dedicated', sortOrder: 1 },
  { slug: 'inspring', label: 'Inspring', sortOrder: 2 },
  { slug: 'idol-gioi-tre', label: 'IDOL GIỚI TRẺ', sortOrder: 3 }, // Figma title tag, also a hashtag (D014)
  { slug: 'teamwork', label: 'Teamwork', sortOrder: 4 }, // test-only value (not in Figma): >5 tags (BR-007)
  { slug: 'creative', label: 'Creative', sortOrder: 5 }, // test-only value (not in Figma): single-match filter
  { slug: 'problem-solver', label: 'Problem Solver', sortOrder: 6 }, // test-only value (not in Figma): pair filter
] as const;
export type HashtagSlug = (typeof HASHTAGS)[number]['slug'];

export type SeedSunner = { id: string; name: string; email: string; department: string; avatar: string | null };
const avatar = (n: number) => `/sun-kudos/avatars/avatar-0${n}.png`;
const sunner = (n: number, name: string, email: string, department: string, withAvatar = true): SeedSunner => ({
  id: sunnerId(n), name, email, department, avatar: withAvatar ? avatar(n) : null,
});

/**
 * sunners rows (user_id NULL in the seed; the auth.users trigger links them by email).
 * Names are Figma verbatim (casing kept); emails are test-only values (not in Figma).
 */
export const SUNNERS = {
  CHUC: sunner(1, 'Nguyễn Bá Chức', 'nguyen-ba-chuc@example.com', 'CECV2'), // Legend: exactly 50 received
  XUAN: sunner(2, 'Huỳnh Dương Xuân', 'huynh-duong-xuan@example.com', 'CECV2'),
  SENDER: sunner(3, 'Đỗ hoàng Hiệp', 'sender-kudos@example.com', 'CECV2'),
  VIEWER: sunner(4, 'Dương thúy An', 'viewer-kudos@example.com', 'CECV2'),
  THUY: sunner(5, 'Mai phương Thúy', 'mai-phuong-thuy@example.com', 'CEVC10'),
  TRANG: sunner(6, 'Lê Kiều Trang', 'le-kieu-trang@example.com', 'CEVC10'),
  QUY: sunner(7, 'Nguyễn Văn Quy', 'nguyen-van-quy@example.com', 'CECV2'),
  HLINH: sunner(8, 'Nguyễn Hoàng Linh', 'nguyen-hoang-linh@example.com', 'CECV2'),
  LINK_1: sunner(9, 'Link Test Một', 'link-test-1@example.com', 'CECV2', false), // test-only value (not in Figma)
  LINK_2: sunner(10, 'Link Test Hai', 'link-test-2@example.com', 'CECV2', false), // test-only value (not in Figma)
} as const;

/** Auth accounts created by ensureUser(); SENDER/VIEWER link to the seed sunners above. Passwords: test-only. */
export const TEST_ACCOUNTS = {
  SENDER: { email: SUNNERS.SENDER.email, password: 'Sender123456!' },
  VIEWER: { email: SUNNERS.VIEWER.email, password: 'Viewer123456!' },
} as const;
/** Reserved for the serial link-trigger spec only: no other spec may create these auth users. */
export const LINK_TEST_EMAILS = { confirmed: SUNNERS.LINK_1.email, unconfirmed: SUNNERS.LINK_2.email } as const;

export type SeedKudos = {
  n: number; id: string; senderId: string; receiverId: string; title: string | null; body: string;
  likeCount: number; createdAt: string; hashtags: HashtagSlug[]; images: string[];
  /** BR-008 label `HH:mm - MM/DD/YYYY` (Asia/Ho_Chi_Minh); unique per kudos, so specs identify cards by it. */
  timeLabel: string;
};

/** Figma body text, verbatim; every kudos uses it (the 8-line case repeats its sentences). */
export const FIGMA_BODY =
  'Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống...';
const FIGMA_LINE_A = 'Cảm ơn người em bình thường nhưng phi thường :D';
const FIGMA_LINE_B = 'Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team';
/** 8-line body (> 5 lines, BR-007). */
export const RICH_BODY = Array.from({ length: 8 }, (_, i) => (i % 2 === 0 ? FIGMA_LINE_A : FIGMA_LINE_B)).join('\n');

const pad = (v: number) => String(v).padStart(2, '0');
/** BR-008: created_at + 7h, formatted with getUTC* (same rule the app must use). */
export function vnTimeLabel(iso: string): string {
  const t = new Date(Date.parse(iso) + 7 * 3_600_000);
  return `${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())} - ${pad(t.getUTCMonth() + 1)}/${pad(t.getUTCDate())}/${t.getUTCFullYear()}`;
}

const S = SUNNERS;
const gallery = (n: number) => `/sun-kudos/gallery/gallery-0${n}.png`;
const FILLER_SENDERS = [S.THUY, S.TRANG, S.QUY, S.HLINH, S.XUAN];
const FILLER_TAGS: HashtagSlug[] = ['dedicated', 'inspring'];
const FILLER_START_MS = Date.parse('2025-10-20T08:00:00+07:00');

const row = (r: Omit<SeedKudos, 'timeLabel'>): SeedKudos => ({ ...r, timeLabel: vnTimeLabel(r.createdAt) });

/** K01-K48: filler kudos to Nguyễn Bá Chức, every 2 hours from 2025-10-20 08:00 (+07). */
const FILLER: SeedKudos[] = Array.from({ length: 48 }, (_, i) => row({
  n: i + 1, id: kudosId(i + 1), senderId: FILLER_SENDERS[i % 5].id, receiverId: S.CHUC.id, title: null,
  body: FIGMA_BODY, likeCount: (i + 1) % 4, createdAt: new Date(FILLER_START_MS + i * 7_200_000).toISOString(),
  hashtags: [FILLER_TAGS[i % 2]], images: [],
}));

const k = (n: number, from: SeedSunner, to: SeedSunner, likeCount: number, createdAt: string,
  hashtags: HashtagSlug[], title: string | null = null, body = FIGMA_BODY, images: string[] = []): SeedKudos =>
  row({ n, id: kudosId(n), senderId: from.id, receiverId: to.id, title, body, likeCount, createdAt, hashtags, images });

/** K49-K60: the rows individual specs reference (seq = n, inserted after the filler). */
const SPECIAL: SeedKudos[] = [
  k(49, S.SENDER, S.QUY, 40, '2025-10-25T09:00:00+07:00', ['dedicated', 'inspring'], 'IDOL GIỚI TRẺ'),
  k(50, S.THUY, S.CHUC, 35, '2025-10-26T09:00:00+07:00', ['teamwork']),
  k(51, S.TRANG, S.VIEWER, 30, '2025-10-27T09:00:00+07:00', ['dedicated']),
  k(52, S.XUAN, S.HLINH, 25, '2025-10-28T09:00:00+07:00', ['inspring']),
  k(53, S.QUY, S.SENDER, 20, '2025-10-29T09:00:00+07:00', ['dedicated', 'teamwork']),
  k(54, S.HLINH, S.XUAN, 15, '2025-10-29T15:00:00+07:00', HASHTAGS.map((h) => h.slug),
    'NGƯỜI TRUYỀN LỬA', RICH_BODY, [1, 2, 3, 4, 5, 1].map(gallery)), // title: test-only value (not in Figma)
  k(55, S.VIEWER, S.TRANG, 4, '2025-10-30T10:00:00+07:00', ['dedicated']), // Figma time sample "10:00 - 10/30/2025"
  k(56, S.QUY, S.THUY, 3, '2025-11-01T09:00:00+07:00', ['problem-solver', 'teamwork']),
  k(57, S.VIEWER, S.TRANG, 0, '2025-11-02T09:00:00+07:00', ['problem-solver']),
  k(58, S.XUAN, S.THUY, 0, '2025-11-03T09:00:00+07:00', ['inspring']),
  k(59, S.SENDER, S.TRANG, 0, '2025-11-04T09:00:00+07:00', ['creative']),
  k(60, S.TRANG, S.CHUC, 6, '2025-11-05T20:30:00+07:00', ['inspring']), // Figma ticker "08:30PM Nguyễn Bá Chức"
];

/** All 60 kudos in insert order (seq ascending). */
export const KUDOS: SeedKudos[] = [...FILLER, ...SPECIAL];
export const KUDOS_TOTAL = KUDOS.length; // 60
export const KUDOS_BY_N = (n: number): SeedKudos => KUDOS[n - 1];
/** Seed has no kudos_likes rows; every spec that likes restores this. */
export const SEED_LIKE_ROWS = 0;

/** Derived expectations (pure functions of the rows above). */
export const receivedCountOf = (id: string) => KUDOS.filter((r) => r.receiverId === id).length;
export const sentCountOf = (id: string) => KUDOS.filter((r) => r.senderId === id).length;
export const heartsTotalOf = (id: string) =>
  KUDOS.filter((r) => r.senderId === id).reduce((sum, r) => sum + r.likeCount, 0);
const deptOf = (id: string) => Object.values(SUNNERS).find((s) => s.id === id)?.department;
export type KudosFilter = { hashtag?: HashtagSlug; department?: string };
/** BR-005 + BR-006: rows matching the filter (hashtag AND receiver department), newest seq first. */
export const feedOrder = (f: KudosFilter = {}) =>
  KUDOS.filter((r) => (!f.hashtag || r.hashtags.includes(f.hashtag)) && (!f.department || deptOf(r.receiverId) === f.department))
    .sort((a, b) => b.n - a.n);
/** BR-004: Highlight = top 5 of the filtered rows by like_count desc, then seq desc. */
export const highlightOrder = (f: KudosFilter = {}) =>
  feedOrder(f).sort((a, b) => b.likeCount - a.likeCount || b.n - a.n).slice(0, 5);
export const KUDOS_PAGE_SIZE = 10;

/** secret_boxes(id, owner_id, gift_name, opened_at): 12 opened (distinct opened_at) + 4 unopened. */
const box = (n: number, owner: SeedSunner, gift: string, openedAt: string | null) =>
  ({ id: boxId(n), ownerId: owner.id, ownerName: owner.name, gift, openedAt });
/** Figma D.3 gift, verbatim ("Nhận được 1 áo phông SAA"). */
const GIFT = 'áo phông SAA';
export const SECRET_BOXES = [
  box(1, S.XUAN, GIFT, '2025-11-05T18:00:00+07:00'),
  box(2, S.QUY, GIFT, '2025-11-05T15:00:00+07:00'),
  box(3, S.VIEWER, GIFT, '2025-11-04T20:00:00+07:00'),
  box(4, S.THUY, GIFT, '2025-11-04T10:00:00+07:00'),
  box(5, S.XUAN, GIFT, '2025-11-03T16:00:00+07:00'), // same person twice in the latest 10
  box(6, S.TRANG, GIFT, '2025-11-03T09:00:00+07:00'),
  box(7, S.HLINH, GIFT, '2025-11-02T14:00:00+07:00'),
  box(8, S.CHUC, GIFT, '2025-11-01T11:00:00+07:00'),
  box(9, S.VIEWER, GIFT, '2025-10-31T17:00:00+07:00'),
  box(10, S.SENDER, GIFT, '2025-10-30T08:00:00+07:00'),
  box(11, S.THUY, GIFT, '2025-10-29T12:00:00+07:00'),
  box(12, S.TRANG, GIFT, '2025-10-28T12:00:00+07:00'),
  box(13, S.VIEWER, GIFT, null),
  box(14, S.VIEWER, GIFT, null),
  box(15, S.VIEWER, GIFT, null),
  box(16, S.CHUC, GIFT, null),
];
export const OPENED_BOXES = SECRET_BOXES.filter((b) => b.openedAt !== null);
/** D.3: the 10 most recently opened boxes, newest first (array order above). */
export const GIFT_LIST = OPENED_BOXES.slice(0, 10);

/** special_days(day, weight): 2025 only, so "today" is never special unless a serial spec adds it. */
export const SPECIAL_DAYS = [{ day: '2025-11-20', weight: 2 }, { day: '2025-12-25', weight: 2 }] as const;

/** VIEWER's D.1 numbers in FR-201 order. */
export const VIEWER_STATS = {
  received: receivedCountOf(S.VIEWER.id), // 1
  sent: sentCountOf(S.VIEWER.id), // 2
  hearts: heartsTotalOf(S.VIEWER.id), // 4
  boxesOpened: SECRET_BOXES.filter((b) => b.ownerId === S.VIEWER.id && b.openedAt).length, // 2
  boxesUnopened: SECRET_BOXES.filter((b) => b.ownerId === S.VIEWER.id && !b.openedAt).length, // 3
};
