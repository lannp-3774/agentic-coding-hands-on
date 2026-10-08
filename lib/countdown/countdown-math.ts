// ALG-002 (F002 FR-202, FR-203, BR-002): minute math for the homepage countdown.
// Pure and import-free on purpose (provable with plain Node, shared by the hook).

export const MINUTE_MS = 60_000;
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

/** [days, hours, minutes], each zero-padded to at least two digits. */
export type CountdownValues = [days: string, hours: string, minutes: string];

/**
 * Whole minutes left, rounded UP: 0 only at/after the target, never early.
 * A missing target (`null`) counts as reached.
 */
export function minutesLeft(targetMs: number | null, nowMs: number): number {
  if (targetMs === null) return 0;
  return Math.ceil(Math.max(0, targetMs - nowMs) / MINUTE_MS);
}

/** Splits minutes into padded [days, hours, minutes]; days may exceed 2 digits. */
export function toCountdownValues(minutes: number): CountdownValues {
  const total = Number.isFinite(minutes) && minutes > 0 ? Math.floor(minutes) : 0;
  return [
    pad2(Math.floor(total / MINUTES_PER_DAY)),
    pad2(Math.floor((total % MINUTES_PER_DAY) / MINUTES_PER_HOUR)),
    pad2(total % MINUTES_PER_HOUR),
  ];
}

/**
 * Milliseconds until `minutesLeft` next changes (the next minute boundary
 * measured from the target), or `null` when there is nothing left to tick:
 * no target, or the target is reached.
 */
export function msUntilNextChange(targetMs: number | null, nowMs: number): number | null {
  if (targetMs === null) return null;
  const left = targetMs - nowMs;
  if (left <= 0) return null;
  return left % MINUTE_MS || MINUTE_MS;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}
