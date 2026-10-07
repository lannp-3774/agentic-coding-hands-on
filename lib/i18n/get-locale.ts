import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./locales";

/**
 * Reads the NEXT_LOCALE cookie. Request-time API: call it only inside a
 * component wrapped in <Suspense> or inside a Server Action — never in the
 * root layout (cacheComponents would block every route).
 */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
