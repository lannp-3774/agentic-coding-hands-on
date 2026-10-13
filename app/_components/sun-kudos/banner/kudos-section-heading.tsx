import type { KudosSectionHeadingProps } from "./kudos-banner-types";

/**
 * Eyebrow + rule + big yellow title (+ optional right-hand actions). Used for
 * HIGHLIGHT KUDOS (B.1) and ALL KUDOS (C.1); also fits SPOTLIGHT BOARD (B.6).
 * The eyebrow stays outside the heading so the heading's text is just the title
 * (the surrounding region is named by it). `relative` keeps the heading above
 * the banner artwork.
 */
export function KudosSectionHeading({
  eyebrow,
  title,
  as: Heading = "h2",
  id,
  actions,
}: KudosSectionHeadingProps) {
  return (
    // mm:2940:13452 (B.1_header), mm:2940:13476 (B.6), mm:2940:14221 (C.1) — Header Giải thưởng
    <div className="relative px-4 md:px-12 xl:px-36">
      <div className="mx-auto flex w-full max-w-[1152px] flex-col gap-4">
        {/* mm:2940:13454 / mm:2940:13477 / mm:2940:14222 */}
        <p className="text-xl leading-8 font-bold md:text-2xl">{eyebrow}</p>
        {/* mm:2940:13455 / mm:2940:13478 / mm:2940:14223 — Rectangle 26 */}
        <hr className="h-px border-0 bg-[#2E3940]" />
        {/* mm:2940:13456 / mm:2940:14224 — Frame 488 */}
        <div className="flex flex-wrap items-center justify-between gap-4 md:gap-8">
          {/* mm:2940:13457 (HIGHLIGHT KUDOS) / mm:2940:14225 (ALL KUDOS) */}
          <Heading
            id={id}
            className="text-4xl leading-tight font-bold tracking-[-0.25px] text-[#FFEA9E] md:text-[57px] md:leading-16"
          >
            {title}
          </Heading>
          {actions}
        </div>
      </div>
    </div>
  );
}
