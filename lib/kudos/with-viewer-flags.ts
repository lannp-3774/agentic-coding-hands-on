import type { KudosCard } from "./kudos-card-types";

/**
 * Marks a card for the current viewer (F006 A1, F007 FR-203): `isSender` when
 * the viewer's Sunner sent it, so the heart button renders disabled. Pure and
 * import-free, so the server (page 1) and the infinite-scroll hook (API pages)
 * share it. A guest or an unresolved Sunner (`null`) is never the sender; the
 * DB refuses self-likes regardless. `likedByMe` already comes from the card's
 * own-like embed and is left as is.
 */
export function withViewerFlags(card: KudosCard, viewerSunnerId: string | null): KudosCard {
  const isSender = viewerSunnerId !== null && card.sender.id === viewerSunnerId;
  return card.isSender === isSender ? card : { ...card, isSender };
}
