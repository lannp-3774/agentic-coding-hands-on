import { connection } from "next/server";
import { HtmlLangSync } from "@/app/_components/html-lang";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { readPrelaunchEndsAt } from "@/lib/prelaunch/read-prelaunch-ends-at";
import { PrelaunchCountdownLive } from "./prelaunch-countdown-live";

/**
 * F005 A1: /countdown body. Request-time on purpose, so it renders inside the
 * page's <Suspense>. No header, footer or language selector (FR-206) and no
 * server-side redirect: the proxy (A4) moves viewers away once the gate opens,
 * and the client (A5) handles the race where the moment passes mid-render.
 */
export async function CountdownPrelaunchContent() {
  // Opt in to request-time rendering before any clock, cookie or DB read.
  // Outside any try/catch: connection() signals dynamic rendering by throwing.
  await connection();

  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const { targetMs, serverNowMs } = await readTargetAndServerNow();

  return (
    <>
      <HtmlLangSync locale={locale} />
      <PrelaunchCountdownLive
        targetMs={targetMs}
        serverNowMs={serverNowMs}
        title={dictionary.countdownPrelaunch.title}
        labels={dictionary.home.countdown}
      />
    </>
  );
}

// A plain async function, not render code: this runs once per request after
// `await connection()`, which is where the clock may be read (the
// react-hooks/purity rule cannot see that, so it stays out of the component).
async function readTargetAndServerNow(): Promise<{ targetMs: number | null; serverNowMs: number }> {
  // Never throws, fails open to null (BR-002); null counts down as 00 00 00.
  const targetMs = await readPrelaunchEndsAt();
  // Taken after the read: a smaller gap to the browser, still the safe
  // direction (the page can only lag the server, never lead it). ALG-003.
  return { targetMs, serverNowMs: Date.now() };
}
