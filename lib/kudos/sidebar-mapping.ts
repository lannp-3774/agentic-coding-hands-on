// Row guards and mappers for the personal sidebar (F009 A1/A2). Rows come from
// PostgREST as `unknown`; anything malformed is dropped or reported, never trusted.

import type { GiftRecipient, PersonalStats, PersonalStatsResult } from "./sidebar-types";
import { safeAvatarUrl } from "./safe-media-path";

/** Shown for every stat when the viewer's numbers cannot be read (F009 FR-209). */
export const STAT_UNAVAILABLE = "—";

/** Columns the stats getter needs from `get_my_sunner()`. */
export type SunnerStatsRow = { id: string; kudos_received_count: number; hearts_total: number };

/** `secret_boxes` row with its owner embedded, as the gift list selects it. */
export type GiftBoxRow = {
  id: string;
  gift_name: string;
  opened_at: string;
  owner: { id: string; full_name: string; avatar_url: string | null };
};

export const GIFT_BOX_SELECT = "id, gift_name, opened_at, owner:sunners!owner_id(id, full_name, avatar_url)";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const isNonEmptyString = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";
const isCount = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0;

/** The viewer's Sunner from the `get_my_sunner()` result (a 0-or-1 row table), else null. */
export function firstSunnerRow(data: unknown): SunnerStatsRow | null {
  const row: unknown = Array.isArray(data) ? data[0] : null;
  if (!isRecord(row)) return null;
  const { id, kudos_received_count, hearts_total } = row;
  if (!isNonEmptyString(id) || !isCount(kudos_received_count) || !isCount(hearts_total)) return null;
  return { id, kudos_received_count, hearts_total };
}

/** `hearts` is hearts earned as a sender (`hearts_total`), not likes on received kudos (BR-002). */
export function toPersonalStats(
  sunner: SunnerStatsRow,
  sent: number,
  boxesOpened: number,
  boxesUnopened: number,
): PersonalStats {
  return {
    received: sunner.kudos_received_count,
    sent,
    hearts: sunner.hearts_total,
    boxesOpened,
    boxesUnopened,
  };
}

/** View strings for the five D.1 rows: real zeros stay "0", unreadable stats show "—". */
export function toStatValues(result: PersonalStatsResult): Record<keyof PersonalStats, string> {
  if (result.status !== "ok") {
    return {
      received: STAT_UNAVAILABLE,
      sent: STAT_UNAVAILABLE,
      hearts: STAT_UNAVAILABLE,
      boxesOpened: STAT_UNAVAILABLE,
      boxesUnopened: STAT_UNAVAILABLE,
    };
  }
  const { received, sent, hearts, boxesOpened, boxesUnopened } = result.stats;
  return {
    received: String(received),
    sent: String(sent),
    hearts: String(hearts),
    boxesOpened: String(boxesOpened),
    boxesUnopened: String(boxesUnopened),
  };
}

export function isGiftBoxRow(v: unknown): v is GiftBoxRow {
  if (!isRecord(v) || !isRecord(v.owner)) return false;
  const { id, gift_name, opened_at, owner } = v;
  return (
    isNonEmptyString(id) &&
    isNonEmptyString(gift_name) &&
    isNonEmptyString(opened_at) &&
    isNonEmptyString(owner.id) &&
    isNonEmptyString(owner.full_name) &&
    (owner.avatar_url === null || typeof owner.avatar_url === "string")
  );
}

/** One row per box (the same Sunner may appear twice); `href` is added by the viewer-aware caller. */
export function toGiftRecipients(rows: GiftBoxRow[]): Omit<GiftRecipient, "href">[] {
  return rows.map((r) => ({
    boxId: r.id,
    sunnerId: r.owner.id,
    name: r.owner.full_name,
    avatarUrl: safeAvatarUrl(r.owner.avatar_url),
    giftName: r.gift_name,
  }));
}
