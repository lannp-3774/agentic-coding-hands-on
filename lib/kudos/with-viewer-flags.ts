import type { KudosCard } from "./kudos-card-types";

/**
 * Marks a card for the current viewer (F006 A1, F007 FR-203): `isSender` when
 * the viewer's Sunner sent it, so the heart button renders disabled. Pure and
 * import-free, so the server (page 1) and the infinite-scroll hook (API pages)
 * share it. A card already marked by the read (`kudos_sent_by_me()`, the only
 * source for the viewer's own anonymous kudos, whose `sender` is null) stays
 * marked; otherwise the named sender is compared. A guest or an unresolved
 * Sunner (`null`) adds nothing; the DB refuses self-likes regardless.
 * `likedByMe` already comes from the card's own-like embed and is left as is.
 */
export function withViewerFlags(card: KudosCard, viewerSunnerId: string | null): KudosCard {
  const isSender =
    card.isSender || (viewerSunnerId !== null && card.sender !== null && card.sender.id === viewerSunnerId);
  return card.isSender === isSender ? card : { ...card, isSender };
}
