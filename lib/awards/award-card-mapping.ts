import type { Locale } from "@/lib/i18n/locales";

// Pure mapping from `public.awards` rows to homepage cards (F002 A3:
// FR-303, FR-304, BR-005, BR-006). Only a type import, so it stays provable
// with plain Node.

/** Columns read from `public.awards` (INT-001). */
export const AWARD_COLUMNS = "slug,title_vi,title_en,description_vi,image_path";

export type AwardRow = {
  slug: string;
  title_vi: string;
  title_en: string;
  description_vi: string;
  image_path: string;
};

/** One homepage award card; same shape as the AwardsGrid item. */
export type AwardCard = {
  key: string;
  title: string;
  description: string;
  imageSrc: string;
  href: string;
};

export const AWARDS_INFORMATION_PATH = "/awards-information";

// Stand-in when a row's image_path is not a usable local path: the design ships
// no dedicated "missing award image" asset, so the SAA mark is used.
export const AWARD_IMAGE_FALLBACK_SRC = "/home/logo.png";

/** Runtime guard for untyped query rows: every selected column is a string. */
export function isAwardRow(value: unknown): value is AwardRow {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.slug === "string" &&
    typeof row.title_vi === "string" &&
    typeof row.title_en === "string" &&
    typeof row.description_vi === "string" &&
    typeof row.image_path === "string"
  );
}

/**
 * Rows (already in `sort_order`) to cards, order preserved. Title follows the
 * locale (EN falls back to VN when blank); the description is always VN
 * (no English copy yet). Link: Awards Information + `#slug`, or no anchor
 * when the slug is blank.
 */
export function toAwardCards(rows: readonly AwardRow[], locale: Locale): AwardCard[] {
  return rows.map((row) => {
    const slug = row.slug.trim();
    return {
      key: row.slug,
      title: locale === "en" ? row.title_en.trim() || row.title_vi : row.title_vi,
      description: row.description_vi,
      imageSrc: isLocalPath(row.image_path) ? row.image_path : AWARD_IMAGE_FALLBACK_SRC,
      href: slug ? `${AWARDS_INFORMATION_PATH}#${encodeURIComponent(slug)}` : AWARDS_INFORMATION_PATH,
    };
  });
}

// Root-relative path under /public; rejects blanks, relative paths, URLs and
// protocol-relative "//host" values (next/image would throw or fetch remotely).
function isLocalPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");
}
