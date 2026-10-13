"use client";

import type { SunKudosCopy } from "@/lib/i18n/sun-kudos-copy-types";
import type { KudosCard, KudosFilters, KudosPage } from "@/lib/kudos/kudos-card-types";
import { useKudosInfiniteList } from "@/lib/kudos/use-kudos-infinite-list";
import { withViewerFlags } from "@/lib/kudos/with-viewer-flags";
import { KudosFeedView } from "../sun-kudos/board/kudos-feed-view";
import { KudosCardView, type KudosCardVariant } from "../sun-kudos/card/kudos-card-view";
import { CopyLinkButton } from "./copy-link-button";
import { KudosHeartButton } from "./kudos-heart-button";
import { toKudosCardLinks } from "./kudos-card-links";

/** Copy one live card needs: card labels + the toast texts of its heart and Copy Link. */
export type KudosBoardCardCopy = Pick<SunKudosCopy, "card" | "toast">;

type KudosBoardCardProps = {
  variant: KudosCardVariant;
  /** Already flagged for the viewer (`withViewerFlags`). */
  card: KudosCard;
  signedIn: boolean;
  filters: KudosFilters;
  copy: KudosBoardCardCopy;
};

/**
 * One kudos card with its live heart and Copy Link (F006 A3/A6, F007 A3), shared
 * by the Highlight slides and the All Kudos list so both build links and slots
 * the same way. Must sit under <KudosHeartProvider> and <KudosToastProvider>.
 */
export function KudosBoardCard({ variant, card, signedIn, filters, copy }: KudosBoardCardProps) {
  return (
    <KudosCardView
      variant={variant}
      card={card}
      links={toKudosCardLinks(card, { signedIn, filters })}
      copy={copy.card}
      heartSlot={
        <KudosHeartButton
          kudosId={card.id}
          initialCount={card.likeCount}
          initialLiked={card.likedByMe}
          isSender={card.isSender}
          signedIn={signedIn}
          labels={{ heart: copy.card.heart, failed: copy.toast.heartFailed }}
        />
      }
      copyLinkSlot={
        <CopyLinkButton
          kudosId={card.id}
          label={copy.card.copyLink}
          messages={{ copied: copy.toast.copied, failed: copy.toast.copyFailed }}
        />
      }
    />
  );
}

type KudosFeedListProps = {
  /** Page 1 from the server, cards already flagged for the viewer. Never empty here. */
  initial: KudosPage;
  filters: KudosFilters;
  viewerSunnerId: string | null;
  signedIn: boolean;
  copy: KudosBoardCardCopy & Pick<SunKudosCopy, "feed">;
};

/**
 * All Kudos list (F006 A6, FR-209, FR-210, FR-215): page 1 from the server, then
 * `GET /api/kudos` pages as the sentinel nears the viewport. The page mounts it
 * with `key={filterKey(filters)}`, so a filter change drops loaded pages and
 * aborts an in-flight request (DEC-005).
 */
export function KudosFeedList({ initial, filters, viewerSunnerId, signedIn, copy }: KudosFeedListProps) {
  const { items, status, sentinelRef, retry } = useKudosInfiniteList({
    initial,
    filters,
    viewerSunnerId,
    withViewerFlags,
  });

  return (
    <KudosFeedView status={status} sentinelRef={sentinelRef} onRetry={retry} labels={copy.feed}>
      {items.map((card) => (
        <KudosBoardCard key={card.id} variant="feed" card={card} signedIn={signedIn} filters={filters} copy={copy} />
      ))}
    </KudosFeedView>
  );
}
