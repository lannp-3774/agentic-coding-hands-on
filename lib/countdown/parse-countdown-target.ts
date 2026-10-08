// ALG-001 (F002 FR-002, BR-001): turns SAA_COUNTDOWN_TARGET into epoch ms.
// Pure and import-free on purpose (provable with plain Node, usable anywhere).

// ISO-8601 date-time with a REQUIRED offset (`Z` or `±hh:mm`). An offset-less
// value is parsed as local time, which differs per runtime/timezone, so it is
// rejected rather than silently shifting the countdown by hours.
const ISO_WITH_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

// The parser runs on every request, so a misconfigured env var would flood the
// log. Each distinct invalid value is reported once per server process.
const reported = new Set<string>();

function reportOnce(key: string, message: string): void {
  if (reported.has(key)) return;
  reported.add(key);
  console.error(message);
}

/**
 * Parses the countdown target. Missing, blank, offset-less or impossible
 * values return `null` (the page shows 00 00 00 and hides "Coming soon") and
 * log one configuration error per distinct value (per server process).
 * Never throws.
 */
export function parseCountdownTarget(raw: string | undefined): number | null {
  const value = raw?.trim();
  if (!value) {
    reportOnce("", "[countdown] SAA_COUNTDOWN_TARGET is missing or blank");
    return null;
  }

  const ms = ISO_WITH_OFFSET.test(value) ? Date.parse(value) : Number.NaN;
  if (!Number.isFinite(ms)) {
    reportOnce(
      value,
      `[countdown] SAA_COUNTDOWN_TARGET is not an ISO-8601 date-time with offset (Z or ±hh:mm): ${JSON.stringify(value)}`,
    );
    return null;
  }
  return ms;
}
