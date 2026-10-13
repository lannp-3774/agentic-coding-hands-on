// Display times for kudos, always Asia/Ho_Chi_Minh (BR-008). Vietnam has no
// DST, so a fixed +7h shift read with `getUTC*` gives the same text on the
// server and in any browser (no ICU, no hydration drift).

const VN_OFFSET_MS = 7 * 3_600_000;

const pad2 = (n: number) => String(n).padStart(2, "0");

/** ISO instant shifted to Vietnam time; null when it does not parse. */
function toVietnamDate(iso: string): Date | null {
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : new Date(ms + VN_OFFSET_MS);
}

/** `HH:mm - MM/DD/YYYY`, e.g. "10:00 - 10/30/2025"; "" for an invalid input. */
export function formatKudosTime(iso: string): string {
  const d = toVietnamDate(iso);
  if (!d) return "";
  const date = `${pad2(d.getUTCMonth() + 1)}/${pad2(d.getUTCDate())}/${d.getUTCFullYear()}`;
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())} - ${date}`;
}

/** 12-hour ticker time `hh:mmAM|PM`, e.g. "08:30PM"; "" for an invalid input. */
export function formatTickerTime(iso: string): string {
  const d = toVietnamDate(iso);
  if (!d) return "";
  const h = d.getUTCHours();
  return `${pad2(h % 12 || 12)}:${pad2(d.getUTCMinutes())}${h < 12 ? "AM" : "PM"}`;
}
