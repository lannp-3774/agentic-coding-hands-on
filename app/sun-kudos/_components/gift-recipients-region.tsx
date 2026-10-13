import { GiftRecipientsView } from "@/app/_components/sun-kudos/sidebar/gift-recipients-view";
import type { SunKudosCopy } from "@/lib/i18n/sun-kudos-copy-types";
import { getRecentGiftRecipients } from "@/lib/kudos/get-recent-gift-recipients";
import { profileHref } from "@/lib/kudos/kudos-links";
import { getCurrentUser } from "@/lib/supabase/current-user";

/**
 * D.3 for F009 A2 (FR-210..215): the latest opened Secret Boxes. Rows link to
 * the Sunner profile for a signed-in viewer and to /login for a guest (FR-102).
 * A failed read and an empty list both show the same empty message.
 *
 * Request-time read: render inside `<Suspense>` (see KudosSidebar).
 * `getCurrentUser` is `cache()`d, so the session is read once per request.
 */
export async function GiftRecipientsRegion({ copy }: { copy: SunKudosCopy["sidebar"] }) {
  const [user, gifts] = await Promise.all([getCurrentUser(), getRecentGiftRecipients()]);
  const signedIn = user !== null;
  const rows = gifts.status === "ok" ? gifts.data : [];

  return (
    <GiftRecipientsView
      title={copy.giftTitle}
      rows={rows.map((row) => ({ ...row, href: profileHref(row.sunnerId, signedIn) }))}
      lineTemplate={copy.giftLine}
      emptyMessage={copy.empty}
    />
  );
}
