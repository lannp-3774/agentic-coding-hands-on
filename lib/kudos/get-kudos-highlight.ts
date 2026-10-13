import type { KudosCard, KudosFilters, KudosRead } from "./kudos-card-types";
import { toKudosCards } from "./kudos-card-mapping";
import { HIGHLIGHT_MAX_CARDS } from "./kudos-constants";
import { readKudos } from "./get-kudos-page";

/**
 * Highlight carousel cards (F006 A2, BR-004): within the current filters, the
 * kudos with the most hearts, ties newest first (`like_count desc, seq desc`),
 * at most `HIGHLIGHT_MAX_CARDS`. 0-heart kudos still fill the five slots
 * (D019). The order is fixed at load: no re-sort after a like.
 *
 * Never throws (`{status: "error"}` after a `[kudos]` log). Request-time only.
 */
export function getKudosHighlight(filters: KudosFilters): Promise<KudosRead<KudosCard[]>> {
  return readKudos(filters, { order: "hearts", cursor: null, limit: HIGHLIGHT_MAX_CARDS }, toKudosCards);
}
