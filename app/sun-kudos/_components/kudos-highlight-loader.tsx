import { HighlightCarousel } from "@/app/_components/sun-kudos-behaviour/highlight-carousel";
import { KudosBoardCard } from "@/app/_components/sun-kudos-behaviour/kudos-feed-list";
import { KudosEmptyState } from "@/app/_components/sun-kudos/board/kudos-empty-state";
import type { SunKudosCopy } from "@/lib/i18n/sun-kudos-copy-types";
import type { KudosFilters } from "@/lib/kudos/kudos-card-types";
import { filterKey } from "@/lib/kudos/kudos-filters";
import { getKudosHighlight } from "@/lib/kudos/get-kudos-highlight";
import { withViewerFlags } from "@/lib/kudos/with-viewer-flags";
import type { KudosViewer } from "./sun-kudos-content";

type KudosHighlightLoaderProps = {
  filters: KudosFilters;
  viewer: Promise<KudosViewer>;
  copy: SunKudosCopy;
};

/**
 * F006 A2 (FR-205, BR-004): the five kudos with the most hearts within the
 * filters, as carousel slides. Empty or failed read -> the empty message in
 * place of the carousel (DEC-001). Request-time read: render inside `<Suspense>`.
 */
export async function KudosHighlightLoader({ filters, viewer, copy }: KudosHighlightLoaderProps) {
  const [result, { signedIn, viewerSunnerId }] = await Promise.all([getKudosHighlight(filters), viewer]);
  const cards = result.status === "ok" ? result.data : [];
  if (cards.length === 0) return <KudosEmptyState message={copy.feed.empty} />;

  const cardCopy = { card: copy.card, toast: copy.toast };
  const { prev, next, slideOf, carouselLabel } = copy.highlight;
  return (
    <HighlightCarousel
      key={filterKey(filters)}
      label={carouselLabel}
      labels={{ prev, next, slideOf }}
      slides={cards.map((card) => (
        <KudosBoardCard
          key={card.id}
          variant="highlight"
          card={withViewerFlags(card, viewerSunnerId)}
          signedIn={signedIn}
          filters={filters}
          copy={cardCopy}
        />
      ))}
    />
  );
}
