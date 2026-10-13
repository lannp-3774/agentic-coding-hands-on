import { CarouselArrowButton } from "./carousel-arrow-button";
import type { HighlightCarouselViewProps } from "./board-types";

// Card width 528 + gap 24 (mm:2940:13463): distance between neighbouring slide centres.
const SLIDE_STEP_PX = 552;

const fillSlideOf = (template: string, n: number, total: number) =>
  template.replace("{n}", String(n)).replace("{total}", String(total));

/**
 * "{n}/{total}" with the current page emphasised: Figma B.5.2 shows it large and
 * #FFEA9E against the 28px #999 remainder (run styles measured from the reference
 * render, MoMorph only exposes the base #999 style). The text stays one string.
 */
function SlideCounterText({ template, n, total }: { template: string; n: number; total: number }) {
  const [before, after = ""] = template.split("{n}");
  return (
    <>
      {before}
      <span className="text-[46px] leading-9 text-[#FFEA9E]">{n}</span>
      {after.replace("{total}", String(total))}
    </>
  );
}

/**
 * Highlight carousel frame. Every slide is rendered in one grid cell and shifted
 * sideways by its distance to the focused slide: offset 0 is full and interactive,
 * +-1 are inert and faded by the edge gradients (desktop only), the rest are hidden.
 * Below desktop width only the focused slide shows.
 */
export function HighlightCarouselView({ slides, index, onPrev, onNext, labels, label }: HighlightCarouselViewProps) {
  const total = slides.length;
  if (total === 0) return null;
  const current = Math.min(Math.max(index, 0), total - 1);
  const canPrev = current > 0;
  const canNext = current < total - 1;

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className="flex flex-col gap-10">
      {/* mm:2940:13461 */}
      <div className="relative w-full">
        {/* mm:2940:13463 */}
        <div className="grid min-h-[525px] w-full grid-cols-1 items-center justify-items-center overflow-hidden px-4 lg:px-0">
          {slides.map((slide, i) => {
            const offset = i - current;
            return (
              <div
                key={i}
                role="group"
                aria-roledescription="slide"
                aria-label={fillSlideOf(labels.slideOf, i + 1, total)}
                inert={offset !== 0}
                style={{ transform: `translateX(${offset * SLIDE_STEP_PX}px)` }}
                className={`col-start-1 row-start-1 w-[528px] max-w-full transition-transform duration-300 motion-reduce:transition-none ${
                  Math.abs(offset) > 1 ? "invisible" : ""
                } ${offset !== 0 ? "max-lg:hidden" : ""}`}
              >
                {slide}
              </div>
            );
          })}
        </div>

        {/* mm:2940:13469 */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-[400px] max-w-[35%] items-center bg-[linear-gradient(90deg,#00101A_50%,rgba(255,255,255,0)_100%)] pl-20 lg:flex">
          {/* mm:2940:13470 */}
          <CarouselArrowButton direction="prev" variant="overlay" disabled={!canPrev} onClick={onPrev} />
        </div>
        {/* mm:2940:13467 */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-[400px] max-w-[35%] items-center justify-end bg-[linear-gradient(270deg,#00101A_50%,rgba(255,255,255,0)_100%)] pr-[140px] lg:flex">
          {/* mm:2940:13468 */}
          <CarouselArrowButton direction="next" variant="overlay" disabled={!canNext} onClick={onNext} />
        </div>
      </div>

      {/* mm:2940:13471 */}
      <div className="flex items-center justify-center gap-8 px-4">
        {/* mm:2940:13472 */}
        <CarouselArrowButton direction="prev" variant="nav" disabled={!canPrev} onClick={onPrev} label={labels.prev} />
        {/* mm:2940:13473 */}
        <p
          aria-live="polite"
          aria-atomic="true"
          className="min-w-14 text-center text-[28px] leading-9 font-bold text-[#999]"
        >
          <SlideCounterText template={labels.slideOf} n={current + 1} total={total} />
        </p>
        {/* mm:2940:13474 */}
        <CarouselArrowButton direction="next" variant="nav" disabled={!canNext} onClick={onNext} label={labels.next} />
      </div>
    </div>
  );
}
