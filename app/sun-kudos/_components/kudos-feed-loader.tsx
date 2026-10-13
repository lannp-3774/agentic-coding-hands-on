import { KudosFeedList } from "@/app/_components/sun-kudos-behaviour/kudos-feed-list";
import { KudosEmptyState } from "@/app/_components/sun-kudos/board/kudos-empty-state";
import type { SunKudosCopy } from "@/lib/i18n/sun-kudos-copy-types";
import type { KudosFilters } from "@/lib/kudos/kudos-card-types";
import { filterKey } from "@/lib/kudos/kudos-filters";
import { getKudosPage } from "@/lib/kudos/get-kudos-page";
import { withViewerFlags } from "@/lib/kudos/with-viewer-flags";
import type { KudosViewer } from "./sun-kudos-content";

type KudosFeedLoaderProps = {
  filters: KudosFilters;
  viewer: Promise<KudosViewer>;
  copy: SunKudosCopy;
};

/**
 * F006 A4 (FR-209, BR-005): first All Kudos page, newest first, flagged for the
 * viewer; later pages load in the browser. Empty or failed read -> the empty
 * message in place of the list. Request-time read: render inside `<Suspense>`.
 */
export async function KudosFeedLoader({ filters, viewer, copy }: KudosFeedLoaderProps) {
  const [result, { signedIn, viewerSunnerId }] = await Promise.all([getKudosPage(filters, null), viewer]);
  if (result.status === "error" || result.data.items.length === 0) {
    return <KudosEmptyState message={copy.feed.empty} />;
  }

  const initial = {
    ...result.data,
    items: result.data.items.map((card) => withViewerFlags(card, viewerSunnerId)),
  };
  return (
    <KudosFeedList
      key={filterKey(filters)}
      initial={initial}
      filters={filters}
      viewerSunnerId={viewerSunnerId}
      signedIn={signedIn}
      copy={{ card: copy.card, toast: copy.toast, feed: copy.feed }}
    />
  );
}
