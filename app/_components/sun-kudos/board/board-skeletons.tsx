// Suspense fallbacks of the Sun* Kudos board: no text, same footprint as the loaded
// blocks so the swap does not shift the page (screen spec §5 loading rows).

const PULSE = "animate-pulse rounded bg-white/5 motion-reduce:animate-none";
const CARD_PULSE = "animate-pulse rounded-2xl bg-white/5 motion-reduce:animate-none";

/** Carousel stage (3 card frames, sides only on desktop) and the pager row. */
export function HighlightSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-10">
      {/* mm:2940:13463 */}
      <div className="flex min-h-[525px] w-full items-center justify-center gap-6 overflow-hidden px-4 lg:px-0">
        <div className={`hidden h-[525px] w-[528px] shrink-0 lg:block ${CARD_PULSE}`} />
        <div className={`h-[525px] w-[528px] max-w-full shrink-0 ${CARD_PULSE}`} />
        <div className={`hidden h-[525px] w-[528px] shrink-0 lg:block ${CARD_PULSE}`} />
      </div>
      {/* mm:2940:13471 */}
      <div className="flex h-[52px] items-center justify-center gap-8">
        <div className={`size-12 ${PULSE}`} />
        <div className={`h-9 w-14 ${PULSE}`} />
        <div className={`size-12 ${PULSE}`} />
      </div>
    </div>
  );
}

/** Hashtag and Phòng ban buttons (136x56 and 158x56, gap 8). */
export function FilterBarSkeleton() {
  return (
    // mm:2940:13458
    <div aria-hidden="true" className="flex h-14 items-center gap-2">
      <div className={`h-14 w-[136px] ${PULSE}`} />
      <div className={`h-14 w-[158px] ${PULSE}`} />
    </div>
  );
}

/** Card-shaped frames below the loaded cards while the next page loads. */
export function FeedLoadingRows() {
  return (
    <div aria-hidden="true" className="flex w-full flex-col gap-6">
      <div className={`h-96 w-full md:h-[480px] ${CARD_PULSE}`} />
    </div>
  );
}

/** First load of All Kudos (C.2): a few card frames at the loaded column width. */
export function FeedSkeleton() {
  return (
    // mm:2940:13482
    <div aria-hidden="true" className="flex w-full flex-col gap-6">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className={`h-96 w-full md:h-[480px] ${CARD_PULSE}`} />
      ))}
    </div>
  );
}
