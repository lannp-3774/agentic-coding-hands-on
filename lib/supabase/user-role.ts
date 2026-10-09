// The one admin rule, shared by F003 `getCurrentUser()` and the F005 prelaunch
// gate in the proxy (F005 technical-spec § 5.3 item 2, BR-003; F003 BR-001/BR-002).
// Pure and import-free on purpose: no next/* so the proxy can use it, and two
// copies of a security rule can never drift apart.

export type UserRole = "user" | "admin";

/**
 * Maps a raw `profiles.role` value to a role. Only the exact string `"admin"`
 * is admin; anything else (`"Admin"`, `" admin"`, `null`, a number, …) is
 * `"user"`, so an unexpected value can never grant admin (fail closed).
 */
export function toUserRole(value: unknown): UserRole {
  return value === "admin" ? "admin" : "user";
}
