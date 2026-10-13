import { SpotlightFrame, SpotlightScaledFrame, SPOTLIGHT_SECTION_CLASS } from "./spotlight-frame";
import { SpotlightPanZoomButton } from "./spotlight-pan-zoom-button";
import { SpotlightSearchBox } from "./spotlight-search-box";
import { SpotlightTotalLabel, formatSpotlightTotal } from "./spotlight-total-label";
import type { SpotlightCopy } from "./spotlight-view-types";

/**
 * Loading placeholder (FR-207): no text, same footprint as the loaded section
 * (129px heading block + board box), so nothing shifts when the data arrives. Below md
 * the loaded board has its controls above (44px total + 12px + 44px search row) and the
 * ticker below the frame (5 lines of 24px, two-line each on a phone), so those heights are held here; the frame itself is the same
 * scaled box, and none of it is drawn scaled.
 */
export function SpotlightSkeleton() {
  return (
    // mm:2940:13476 + mm:2940:14174 (loading placeholder)
    <div aria-hidden="true" className={SPOTLIGHT_SECTION_CLASS}>
      <div className="mx-auto flex h-[129px] w-full max-w-[1152px] flex-col gap-4 motion-safe:animate-pulse">
        <div className="h-8 w-64 max-w-full rounded bg-white/10" />
        <div className="h-px w-full bg-[#2E3940]" />
        <div className="h-16 w-full max-w-[576px] rounded bg-[#FFEA9E]/10" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="h-[100px] md:hidden" />
        <SpotlightScaledFrame>
          <div className="size-full bg-white/[0.04] motion-safe:animate-pulse" />
        </SpotlightScaledFrame>
        <div className="h-[215px] min-[460px]:h-[120px] md:hidden" />
      </div>
    </div>
  );
}

type SpotlightEmptyProps = {
  /** "Hiện tại chưa có Kudos nào." */
  message: string;
  copy: SpotlightCopy;
};

/** Empty board (FR-208): "0 KUDOS" and the message, search and Pan/Zoom disabled. Natural size at every width. */
export function SpotlightEmpty({ message, copy }: SpotlightEmptyProps) {
  return (
    // mm:2940:14174 (B.7, empty state)
    <SpotlightFrame>
      <SpotlightTotalLabel text={formatSpotlightTotal(0, copy.kudosSuffix)} />
      <SpotlightSearchBox
        search={{ value: "", error: null, status: null, disabled: true }}
        copy={copy}
      />
      <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-xl leading-8 font-bold text-white">
        {message}
      </p>
      <SpotlightPanZoomButton label={copy.panZoom} pressed={false} disabled />
    </SpotlightFrame>
  );
}
