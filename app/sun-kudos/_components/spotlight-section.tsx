import { Suspense } from "react";
import { SpotlightBoard } from "@/app/_components/sun-kudos-behaviour/spotlight-board";
import { SpotlightSectionView } from "@/app/_components/sun-kudos/spotlight/spotlight-section-view";
import { SpotlightEmpty, SpotlightSkeleton } from "@/app/_components/sun-kudos/spotlight/spotlight-states";
import {
  SPOTLIGHT_BOARD_HEIGHT,
  SPOTLIGHT_BOARD_WIDTH,
  type SpotlightCopy,
} from "@/app/_components/sun-kudos/spotlight/spotlight-view-types";
import { kudosDetailHref } from "@/lib/kudos/kudos-links";
import { getSpotlightData } from "@/lib/kudos/get-spotlight-data";
import { layoutSpotlightNodes } from "@/lib/kudos/spotlight-layout";
import { getCurrentUser } from "@/lib/supabase/current-user";

type SpotlightSectionProps = {
  copy: SpotlightCopy;
  /** Small line above the divider, "Sun* Annual Awards 2025". */
  eyebrow: string;
  /** Shown when there is no kudos to place (or the read failed): `sunKudos.feed.empty`. */
  emptyMessage: string;
};

/**
 * Spotlight (F008 A1-A7). Mount it as-is: it carries its own `<Suspense>` with the
 * whole-section skeleton and already renders the labelled `<section>`, so the parent
 * must not wrap it in another region.
 */
export function SpotlightSection(props: SpotlightSectionProps) {
  return (
    <Suspense fallback={<SpotlightSkeleton />}>
      <SpotlightContent {...props} />
    </Suspense>
  );
}

/**
 * Request-time read (data + viewer in parallel), then the deterministic layout and
 * the per-viewer hrefs (guests -> /login). The Spotlight ignores the page filters.
 * Both getters never throw; a failed read comes back empty and shows the empty state.
 */
async function SpotlightContent({ copy, eyebrow, emptyMessage }: SpotlightSectionProps) {
  const [source, user] = await Promise.all([getSpotlightData(), getCurrentUser()]);
  const signedIn = user !== null;

  const nodes = layoutSpotlightNodes(source.nodes, {
    width: SPOTLIGHT_BOARD_WIDTH,
    height: SPOTLIGHT_BOARD_HEIGHT,
  }).map((node) => ({ ...node, href: kudosDetailHref(node.kudosId, signedIn) }));

  return (
    <SpotlightSectionView eyebrow={eyebrow} title={copy.title}>
      {nodes.length === 0 ? (
        <SpotlightEmpty message={emptyMessage} copy={copy} />
      ) : (
        <SpotlightBoard total={source.total} nodes={nodes} ticker={source.ticker} copy={copy} />
      )}
    </SpotlightSectionView>
  );
}
