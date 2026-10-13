import type { KudosCard, KudosCardLinks, KudosFilters } from "@/lib/kudos/kudos-card-types";
import { buildFilterHref } from "@/lib/kudos/kudos-filters";
import { kudosDetailHref, profileHref } from "@/lib/kudos/kudos-links";

export type KudosCardLinkContext = {
  /** No session: detail and profile links go to /login (BR-010). */
  signedIn: boolean;
  /** Current URL filters; tag links set `hashtag` and keep `department` (DEC-005). */
  filters: KudosFilters;
};

/**
 * Every href of one kudos card, built in one place for Highlight and All Kudos
 * (F006 A10, FR-304, FR-305, D014). The title is a link only when a hashtag
 * with the same text exists (`titleTagSlug`). Pure: used on the server
 * (Highlight slides) and in the browser (All Kudos pages 2+).
 */
export function toKudosCardLinks(card: KudosCard, { signedIn, filters }: KudosCardLinkContext): KudosCardLinks {
  const tagHref = (slug: string) => buildFilterHref(filters, { hashtag: slug });
  return {
    detailHref: kudosDetailHref(card.id, signedIn),
    senderHref: profileHref(card.sender.id, signedIn),
    receiverHref: profileHref(card.receiver.id, signedIn),
    titleHref: card.titleTagSlug ? tagHref(card.titleTagSlug) : null,
    hashtagHrefs: card.hashtags.map((tag) => tagHref(tag.slug)),
  };
}
