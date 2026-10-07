"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale } from "./locales";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function setLocale(locale: string): Promise<void> {
  // Client input crosses the server boundary: allow-list before writing.
  if (!isLocale(locale)) return;

  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  });
}
