// Link targets for kudos controls. The single place guests are routed to
// /login (BR-010, F008 BR-008, F009 FR-102). Ids come from DB rows (uuid).

const LOGIN_PATH = "/login";

/** Kudos detail for a signed-in viewer, `/login` for a guest. */
export function kudosDetailHref(id: string, signedIn: boolean): string {
  return signedIn ? `/sun-kudos/${id}` : LOGIN_PATH;
}

/** Sunner profile for a signed-in viewer, `/login` for a guest. */
export function profileHref(id: string, signedIn: boolean): string {
  return signedIn ? `/profiles/${id}` : LOGIN_PATH;
}

/** Absolute detail URL that "Copy Link" puts on the clipboard (not guest-gated). */
export function absoluteKudosUrl(origin: string, id: string): string {
  return `${origin.replace(/\/+$/, "")}/sun-kudos/${id}`;
}
