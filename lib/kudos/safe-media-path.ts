// Guards for media paths read from the DB (F006 ALG-002). Avatars and gallery
// images must both be local paths under /public (avatars: clarifications
// 2026-10-13, M1), so a row can never make a viewer's browser load remote content.

/**
 * Local path under /public, the same rule as the DB checks
 * (`^/[^/\\[:space:]][^\\[:space:]]*$`): one leading "/" (never a
 * protocol-relative "//"), no backslash, no whitespace and no control character
 * anywhere (a "/\t/host" must not turn protocol-relative in an href).
 */
const LOCAL_PATH_PATTERN = /^\/[^/\\\s\p{Cc}][^\\\s\p{Cc}]*$/u;

function isLocalPath(v: string): boolean {
  return LOCAL_PATH_PATTERN.test(v);
}

/** Local path, else null (the UI shows the initial instead). */
export function safeAvatarUrl(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return isLocalPath(s) ? s : null;
}

/** Gallery image: local path only. */
export function isAllowedImagePath(v: unknown): v is string {
  return typeof v === "string" && isLocalPath(v);
}
