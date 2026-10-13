import type { KudosFilters } from "./kudos-card-types";
import { KUDOS_FILTER_COLUMNS } from "./kudos-card-columns";

// Hashtag / Department filters of the Sun* Kudos board (F006 BR-006, ALG-001).
// Filters live in the URL; this module is the single allow-list between a URL
// (page searchParams or the `/api/kudos` query) and PostgREST, shared by
// Highlight, All Kudos page 1 and page 2+. Pure: also imported by client code.

/** `hashtags.slug` (same rule as the DB check). */
export const HASHTAG_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;
/** `departments.code` (same rule as the DB check). */
export const DEPARTMENT_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$/;
/**
 * All Kudos cursor = `kudos.seq` of the last card: a positive integer without
 * leading zeros, at most 18 digits so it always fits a Postgres bigint.
 */
export const KUDOS_CURSOR_PATTERN = /^[1-9]\d{0,17}$/;

const BOARD_PATH = "/sun-kudos";
const FILTER_PATTERNS = { hashtag: HASHTAG_SLUG_PATTERN, department: DEPARTMENT_CODE_PATTERN } as const;
type FilterName = keyof typeof FILTER_PATTERNS;
const FILTER_NAMES: readonly FilterName[] = ["hashtag", "department"]; // URL key order

/** Page `searchParams` (awaited) or any `URLSearchParams`. */
export type KudosSearchParams = URLSearchParams | Record<string, string | string[] | undefined>;

function firstValue(input: KudosSearchParams, name: FilterName): string | undefined {
  if (input instanceof URLSearchParams) return input.get(name) ?? undefined;
  const value = input[name];
  return Array.isArray(value) ? value[0] : value;
}

function allowed(name: FilterName, value: string | null | undefined): string | null {
  return typeof value === "string" && FILTER_PATTERNS[name].test(value) ? value : null;
}

/**
 * Page boundary: the first value of each key, kept only when well formed.
 * A malformed value is ignored (the page renders unfiltered, BR-006); a well
 * formed but unknown one simply matches nothing.
 */
export function parseKudosFilters(input: KudosSearchParams): KudosFilters {
  return {
    hashtag: allowed("hashtag", firstValue(input, "hashtag")),
    department: allowed("department", firstValue(input, "department")),
  };
}

/**
 * API boundary (`GET /api/kudos`): absent keys mean "no filter", but a key
 * that is present must appear once and be well formed, else `null` (the
 * route answers 400). Silently widening a filtered page would mix results.
 */
export function parseKudosFiltersStrict(params: URLSearchParams): KudosFilters | null {
  const filters: KudosFilters = { hashtag: null, department: null };
  for (const name of FILTER_NAMES) {
    const values = params.getAll(name);
    if (values.length === 0) continue;
    const value = values.length === 1 ? allowed(name, values[0]) : null;
    if (value === null) return null;
    filters[name] = value;
  }
  return filters;
}

/** A PostgREST filter builder (or anything with the same `eq`). */
type EqFilterable<Q> = { eq(column: string, value: string): Q };

/**
 * Applies the filters (AND) to a kudos query selected with
 * `kudosCardColumns(filters)`: department = the RECEIVER's department
 * (clarifications), hashtag via the aliased `!inner` filter embed.
 * Pass the builder as a variable: inferring `Q` from an inline
 * `supabase.from(...).select(...)` makes tsc recurse (TS2589).
 */
export function applyKudosFilters<Q extends EqFilterable<Q>>(query: Q, filters: KudosFilters): Q {
  let filtered = query;
  if (filters.department) filtered = filtered.eq(KUDOS_FILTER_COLUMNS.department, filters.department);
  if (filters.hashtag) filtered = filtered.eq(KUDOS_FILTER_COLUMNS.hashtag, filters.hashtag);
  return filtered;
}

/**
 * Board URL for `current` with `patch` applied (`null` clears a key, the other
 * key is kept). Malformed values are dropped; keys always in the same order,
 * so equal filters give equal URLs.
 */
export function buildFilterHref(current: KudosFilters, patch: Partial<KudosFilters>): string {
  const next = { ...current, ...patch };
  const params = new URLSearchParams();
  for (const name of FILTER_NAMES) {
    const value = allowed(name, next[name]);
    if (value !== null) params.set(name, value);
  }
  const query = params.toString();
  return query ? `${BOARD_PATH}?${query}` : BOARD_PATH;
}

/** Stable identity of a filter set, used as React `key` to reset carousel and feed. */
export function filterKey(filters: KudosFilters): string {
  return buildFilterHref(filters, {});
}
