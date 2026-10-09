// ALG-001 (F002 FR-002, BR-001): turns an ISO countdown target into epoch ms.
// Sources: env SAA_COUNTDOWN_TARGET (F002, default label) and
// site_settings.prelaunch_ends_at (F005 § 5.3 item 1, labelled by the caller).
// Pure and import-free on purpose (provable with plain Node, usable anywhere).

// ISO-8601 date-time with a REQUIRED offset (`Z` or `±hh:mm`). An offset-less
// value is parsed as local time, which differs per runtime/timezone, so it is
// rejected rather than silently shifting the countdown by hours.
const ISO_WITH_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

const DEFAULT_LABEL = "[countdown] SAA_COUNTDOWN_TARGET";

// The parser runs on every request, so a misconfigured setting would flood the
// log. Each distinct key is reported once per server process.
const reported = new Set<string>();

/** Logs `message` once per distinct `key` (per server process). */
export function reportOnce(key: string, message: string): void {
  if (reported.has(key)) return;
  reported.add(key);
  console.error(message);
}

/**
 * Parses the countdown target. Missing, blank, offset-less or impossible
 * values return `null` (the countdown shows 00 00 00) and log one
 * configuration error per distinct label + value (per server process).
 * `label` names the source in the log line; the default keeps the F002
 * homepage message unchanged. Never throws.
 */
export function parseCountdownTarget(
  raw: string | undefined,
  label: string = DEFAULT_LABEL,
): number | null {
  const value = raw?.trim();
  if (!value) {
    reportOnce(`${label}|`, `${label} is missing or blank`);
    return null;
  }

  const ms = ISO_WITH_OFFSET.test(value) ? Date.parse(value) : Number.NaN;
  if (!Number.isFinite(ms)) {
    reportOnce(
      `${label}|${value}`,
      `${label} is not an ISO-8601 date-time with offset (Z or ±hh:mm): ${JSON.stringify(value)}`,
    );
    return null;
  }
  return ms;
}
