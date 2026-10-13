import { SPOTLIGHT_SEARCH_MAX_LENGTH } from "./kudos-constants";

// Spotlight search rules (F008 A3: ALG-002, BR-006, DEC-002). Pure, so the
// matching and the submit validation are provable with plain Node.

/** NFD, drop combining marks, `d` for `đ`, lower case, trim: "Nguyễn Đức" -> "nguyen duc". */
export function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .trim();
}

/**
 * Ids of the nodes whose name contains the query, ignoring case and diacritics.
 * A query that normalises to nothing (blank, or only combining marks) matches nothing.
 */
export function matchSpotlightNodes(
  nodes: ReadonlyArray<{ kudosId: string; name: string }>,
  query: string,
): Set<string> {
  const needle = normalizeName(query);
  const matches = new Set<string>();
  if (needle === "") return matches;
  for (const node of nodes) {
    if (normalizeName(node.name).includes(needle)) matches.add(node.kudosId);
  }
  return matches;
}

/** Strings the validation needs; a subset of the Spotlight copy. */
export type SpotlightSearchMessages = {
  searchRequired: string;
  searchTooLong: string;
  noMatch: string;
  /** Contains `{n}`. */
  matchCount: string;
};

/**
 * Outcome of one submit. `error` leaves the current highlight alone; `result`
 * replaces it: `matchIds` is null when nothing matched (every node stays normal).
 */
export type SpotlightSearchOutcome =
  | { kind: "error"; error: string }
  | { kind: "result"; matchIds: Set<string> | null; status: string };

/**
 * Validates on submit, not on input (no `maxLength`): empty (also after
 * normalising) and over-long are rejected.
 */
export function evaluateSpotlightSearch(
  nodes: ReadonlyArray<{ kudosId: string; name: string }>,
  rawValue: string,
  messages: SpotlightSearchMessages,
): SpotlightSearchOutcome {
  const query = rawValue.trim();
  if (query === "") return { kind: "error", error: messages.searchRequired };
  if (query.length > SPOTLIGHT_SEARCH_MAX_LENGTH) return { kind: "error", error: messages.searchTooLong };
  // Only combining marks (e.g. a lone accent) is as empty as a blank query.
  if (normalizeName(query) === "") return { kind: "error", error: messages.searchRequired };

  const matchIds = matchSpotlightNodes(nodes, query);
  if (matchIds.size === 0) return { kind: "result", matchIds: null, status: messages.noMatch };
  return {
    kind: "result",
    matchIds,
    status: messages.matchCount.replace("{n}", String(matchIds.size)),
  };
}
