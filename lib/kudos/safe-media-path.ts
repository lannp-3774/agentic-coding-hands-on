// Guards for media paths read from the DB (F006 ALG-002). Avatars may be local
// or https; gallery images must be local, so a row cannot make the page load
// arbitrary remote content.

/** Local path under /public: starts with a single "/", no protocol-relative "//", no "\". */
function isLocalPath(v: string): boolean {
  return v.startsWith("/") && !v.startsWith("//") && !v.includes("\\");
}

/** Local path or `https://` URL, else null (the UI shows the initial instead). */
export function safeAvatarUrl(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (s === "") return null;
  return isLocalPath(s) || s.startsWith("https://") ? s : null;
}

/** Gallery image: local path only. */
export function isAllowedImagePath(v: unknown): v is string {
  return typeof v === "string" && isLocalPath(v);
}
