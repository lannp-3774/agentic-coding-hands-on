import type { ReactNode } from "react";
import { SPOTLIGHT_SECTION_CLASS } from "./spotlight-frame";

// One Spotlight per page, so a fixed id is enough for aria-labelledby.
const HEADING_ID = "spotlight-board-heading";

type SpotlightSectionViewProps = {
  /** Small line above the divider, "Sun* Annual Awards 2025". */
  eyebrow: string;
  /** Big yellow title, "SPOTLIGHT BOARD"; also the region's accessible name. */
  title: string;
  /** The board (or its empty state). */
  children: ReactNode;
};

/** mm:2940:13476 (B.6) heading block, then the B.7 board passed as children. */
export function SpotlightSectionView({ eyebrow, title, children }: SpotlightSectionViewProps) {
  return (
    <section aria-labelledby={HEADING_ID} className={SPOTLIGHT_SECTION_CLASS}>
      {/* mm:2940:13476 */}
      <header className="mx-auto flex w-full max-w-[1152px] flex-col gap-4">
        {/* mm:2940:13477 */}
        <p className="text-xl leading-8 font-bold text-white md:text-2xl">{eyebrow}</p>
        {/* mm:2940:13478 */}
        <div aria-hidden="true" className="h-px w-full bg-[#2E3940]" />
        {/* mm:2940:13480 */}
        <h2
          id={HEADING_ID}
          className="text-4xl leading-tight font-bold tracking-[-0.25px] text-[#FFEA9E] md:text-[57px] md:leading-16"
        >
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}
