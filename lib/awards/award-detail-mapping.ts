import type { Locale } from "@/lib/i18n/locales";
import { AWARD_IMAGE_FALLBACK_SRC, isLocalPath } from "./award-card-mapping";

// Pure mapping from `public.awards` + embedded `public.award_prizes` rows to the
// Awards Information blocks (F004: ALG-002, BR-004..006, FR-207). Only a type
// import plus `./award-card-mapping`, so it stays provable with plain Node.

/** Columns read from `public.awards` with the embedded prizes (INT-001). */
export const AWARD_DETAIL_COLUMNS =
  "slug,title_vi,title_en,image_path,nav_label,detail_description_vi,quantity,unit_vi,unit_en," +
  "award_prizes(sort_order,amount_vnd,note_vi,note_en)";

export type AwardPrizeRow = {
  sort_order: number;
  amount_vnd: number;
  note_vi: string | null;
  note_en: string | null;
};

export type AwardDetailRow = {
  slug: string;
  title_vi: string;
  title_en: string;
  image_path: string;
  nav_label: string;
  detail_description_vi: string;
  quantity: number;
  unit_vi: string;
  unit_en: string | null;
  award_prizes: AwardPrizeRow[];
};

/** One award block; structurally identical to Track A's `AwardDetailView`. */
export type AwardDetail = {
  slug: string;
  navLabel: string;
  title: string;
  description: string;
  quantity: string;
  unit: string;
  prizes: { amount: string; note: string | null }[];
  imageSrc: string;
  imageSide: "left" | "right";
};

const isString = (value: unknown): value is string => typeof value === "string";
const isNonBlank = (value: unknown): value is string => isString(value) && value.trim() !== "";
const isNullableString = (value: unknown): value is string | null =>
  value === null || isString(value);

function isAwardPrizeRow(value: unknown): value is AwardPrizeRow {
  if (typeof value !== "object" || value === null) return false;
  const prize = value as Record<string, unknown>;
  return (
    Number.isInteger(prize.sort_order) &&
    Number.isInteger(prize.amount_vnd) &&
    (prize.amount_vnd as number) >= 0 &&
    isNullableString(prize.note_vi) &&
    isNullableString(prize.note_en)
  );
}

/** Runtime guard for untyped query rows; one bad prize makes the whole row malformed. */
export function isAwardDetailRow(value: unknown): value is AwardDetailRow {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    isString(row.slug) &&
    isString(row.title_vi) &&
    isString(row.title_en) &&
    isString(row.image_path) &&
    isNonBlank(row.nav_label) &&
    isNonBlank(row.detail_description_vi) &&
    isNonBlank(row.unit_vi) &&
    isNullableString(row.unit_en) &&
    Number.isInteger(row.quantity) &&
    (row.quantity as number) > 0 &&
    Array.isArray(row.award_prizes) &&
    row.award_prizes.every(isAwardPrizeRow)
  );
}

// 7000000 -> "7.000.000 VNĐ". Regex grouping, not toLocaleString: no ICU dependency.
function formatAmount(amountVnd: number): string {
  return `${String(amountVnd).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} VNĐ`;
}

// EN text falls back to VN when blank.
function pick(locale: Locale, vi: string, en: string): string {
  return locale === "en" ? en.trim() || vi : vi;
}

/**
 * Rows (already in `sort_order`) to blocks, order preserved. Title, unit and
 * prize notes follow the locale (EN falls back to VN when blank); the
 * description is always VN. A blank note becomes `null` (BR-006). Pictures
 * alternate left, right, ... by position (FR-207).
 */
export function toAwardDetails(rows: readonly AwardDetailRow[], locale: Locale): AwardDetail[] {
  return rows.map((row, index) => ({
    slug: row.slug,
    navLabel: row.nav_label,
    title: pick(locale, row.title_vi, row.title_en),
    description: row.detail_description_vi,
    quantity: String(row.quantity).padStart(2, "0"),
    unit: pick(locale, row.unit_vi, row.unit_en ?? ""),
    prizes: [...row.award_prizes]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((prize) => ({
        amount: formatAmount(prize.amount_vnd),
        note: pick(locale, prize.note_vi ?? "", prize.note_en ?? "").trim() || null,
      })),
    imageSrc: isLocalPath(row.image_path) ? row.image_path : AWARD_IMAGE_FALLBACK_SRC,
    imageSide: index % 2 === 0 ? "left" : "right",
  }));
}
