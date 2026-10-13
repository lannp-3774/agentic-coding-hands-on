import { SPOTLIGHT_TICKER_LINES } from "./kudos-constants";
import { formatKudosTime, formatTickerTime } from "./kudos-time";
import type { SpotlightTickerLine } from "./spotlight-types";

// Pure mapping from `public.kudos` rows (with the receiver embedded) to the
// Spotlight's unpositioned nodes and ticker lines (F008 A2: BR-002, BR-004,
// BR-005). No framework imports, so it stays provable with plain Node.

/**
 * Columns read from `public.kudos` (INT-001); `receiver` is the to-one embed.
 * `seq` is cast to text like the card columns: a bigint is exact as a string,
 * while a JSON number loses precision past 2^53.
 */
export const SPOTLIGHT_COLUMNS =
  "id,seq:seq::text,created_at,receiver:sunners!receiver_id(full_name,kudos_received_count)";

export type SpotlightRow = {
  id: string;
  /** `kudos.seq` as text (positive integer, no leading zero). */
  seq: string;
  created_at: string;
  receiver: { full_name: string; kudos_received_count: number };
};

/** One kudos before layout: everything ALG-001 needs except `href`, `x`, `y`, `size`. */
export type SpotlightNodeDraft = {
  kudosId: string;
  name: string;
  /** `HH:mm - MM/DD/YYYY`, Asia/Ho_Chi_Minh. */
  timeLabel: string;
  /** Receiver's total kudos; drives font size and layout order. */
  receivedCount: number;
  /**
   * Insert order, only a layout tie-break (`spotlight-layout` compares numbers):
   * exact up to 2^53; two seqs equal as doubles fall through to the id tie-break.
   */
  seq: number;
};

/** What `getSpotlightData` returns: the layout and the hrefs are added by the caller. */
export type SpotlightSource = {
  /** Real total of kudos, not capped by the node limit. */
  total: number;
  nodes: SpotlightNodeDraft[];
  ticker: SpotlightTickerLine[];
};

export const EMPTY_SPOTLIGHT_SOURCE: SpotlightSource = { total: 0, nodes: [], ticker: [] };

/** Same rule as the card mapping's `seq` guard. */
const SEQ_PATTERN = /^[1-9]\d*$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Runtime guard for untyped query rows (name, count, seq and time must be usable). */
export function isSpotlightRow(value: unknown): value is SpotlightRow {
  if (!isRecord(value)) return false;
  const { id, seq, created_at: createdAt, receiver } = value;
  if (typeof id !== "string" || id === "") return false;
  if (typeof seq !== "string" || !SEQ_PATTERN.test(seq)) return false;
  if (typeof createdAt !== "string" || Number.isNaN(Date.parse(createdAt))) return false;
  if (!isRecord(receiver)) return false;
  const count = receiver.kudos_received_count;
  return (
    typeof receiver.full_name === "string" &&
    receiver.full_name.trim() !== "" &&
    typeof count === "number" &&
    Number.isFinite(count)
  );
}

/** One node per kudos, never grouped by receiver (BR-002); row order is kept. */
export function toSpotlightNodes(rows: SpotlightRow[]): SpotlightNodeDraft[] {
  return rows.map((row) => ({
    kudosId: row.id,
    name: row.receiver.full_name.trim(),
    timeLabel: formatKudosTime(row.created_at),
    receivedCount: row.receiver.kudos_received_count,
    seq: Number(row.seq),
  }));
}

/** Newest first: the first rows of the `seq desc` list, 12-hour times (D005). */
export function toTickerLines(rows: SpotlightRow[]): SpotlightTickerLine[] {
  return rows.slice(0, SPOTLIGHT_TICKER_LINES).map((row) => ({
    kudosId: row.id,
    time12h: formatTickerTime(row.created_at),
    name: row.receiver.full_name.trim(),
  }));
}
