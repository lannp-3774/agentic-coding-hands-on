import { PersonalStatsLoginPrompt } from "@/app/_components/sun-kudos/sidebar/personal-stats-login-prompt";
import { PersonalStatsView } from "@/app/_components/sun-kudos/sidebar/personal-stats-view";
import type { SunKudosCopy } from "@/lib/i18n/sun-kudos-copy-types";
import { getKudosPersonalStats } from "@/lib/kudos/get-kudos-personal-stats";
import { toStatValues } from "@/lib/kudos/sidebar-mapping";

/**
 * D.1 for F009 A1 (FR-201..205, FR-209). No session -> login prompt; a session,
 * an anonymous guest's included (its own guest Sunner's counts) -> the five
 * numbers, or "—" for each when they cannot be read. The getter never throws
 * and takes the identity from the session only (FR-601).
 *
 * Request-time read: render inside `<Suspense>` (see KudosSidebar).
 */
export async function PersonalStatsRegion({ copy }: { copy: SunKudosCopy["sidebar"] }) {
  const result = await getKudosPersonalStats();

  if (result.status === "guest") {
    return <PersonalStatsLoginPrompt text={copy.loginPrompt} buttonLabel={copy.loginButton} href="/login" />;
  }

  // User decision: the flame always carries the "x2" badge.
  return <PersonalStatsView values={toStatValues(result)} copy={copy} showMultiplierBadge />;
}
