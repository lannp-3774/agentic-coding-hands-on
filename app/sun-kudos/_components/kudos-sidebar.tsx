import { Suspense } from "react";
import {
  GiftRecipientsSkeleton,
  PersonalStatsSkeleton,
} from "@/app/_components/sun-kudos/sidebar/sidebar-skeletons";
import type { SunKudosCopy } from "@/lib/i18n/sun-kudos-copy-types";
import { GiftRecipientsRegion } from "./gift-recipients-region";
import { PersonalStatsRegion } from "./personal-stats-region";

/**
 * Sidebar content for the board (F009): personal stats above the gift list.
 * Each region has its own `<Suspense>` with a fixed-size skeleton, so a
 * signed-in viewer never sees the guest login prompt flash (FR-208) and the
 * two reads stream independently.
 *
 * Not an `<aside>`: SunKudosBoardLayout renders the page's only complementary
 * landmark and mounts this inside it.
 */
export function KudosSidebar({ copy }: { copy: SunKudosCopy["sidebar"] }) {
  return (
    <div className="flex w-full flex-col gap-6">
      <Suspense fallback={<PersonalStatsSkeleton />}>
        <PersonalStatsRegion copy={copy} />
      </Suspense>
      <Suspense fallback={<GiftRecipientsSkeleton />}>
        <GiftRecipientsRegion copy={copy} />
      </Suspense>
    </div>
  );
}
