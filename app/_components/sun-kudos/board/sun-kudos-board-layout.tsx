import { BoardGutter } from "./board-gutter";
import type { SunKudosBoardLayoutProps } from "./board-types";

/**
 * Page grid of /sun-kudos below the header (R2-R7). Vertical rhythm follows the
 * Figma frame: 64px banner to Highlight, 120px between blocks on desktop. Desktop
 * (lg+): All Kudos column left (max 680px) and a sticky 422px sidebar column right
 * that scrolls on its own. Below desktop: one column, sidebar under the feed.
 * Highlight and Spotlight keep their loaded height so Suspense swaps do not jump.
 * `feedHeader` pads itself (KudosSectionHeading); only the feed + sidebar row uses BoardGutter.
 */
export function SunKudosBoardLayout({
  banner,
  highlight,
  spotlight,
  feed,
  sidebar,
  feedHeader,
  feedLabelledBy,
}: SunKudosBoardLayoutProps) {
  const BoardBlock = feedLabelledBy ? "section" : "div";
  return (
    // mm:2940:13434
    <div className="flex w-full flex-col pb-20 lg:pb-[120px]">
      {banner}

      {/* mm:2940:13451 (Highlight 786px tall on desktop) */}
      <div className="mt-16 flex flex-col gap-10 lg:min-h-[786px]">{highlight}</div>

      {/* mm:2940:14170 (Spotlight 791px tall on desktop) */}
      <div className="mt-16 lg:mt-[120px] lg:min-h-[791px]">{spotlight}</div>

      {/* mm:2940:13475 */}
      <BoardBlock
        aria-labelledby={feedLabelledBy}
        className="mt-16 flex flex-col gap-10 lg:mt-[120px]"
      >
        {feedHeader}
        {/* mm:2940:13481 */}
        <BoardGutter className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          {/* mm:2940:13482 */}
          <div className="min-w-0 flex-1 lg:max-w-[680px]">{feed}</div>
          {/* mm:2940:13488 — sticky only when the whole signed-in sidebar (~937px + 96px offset) fits the
              viewport, otherwise it scrolls with the page so no row is cut and no inner scrollbar appears.
              `overflow-x-clip` on the page shell keeps sticky working. */}
          <aside className="w-full lg:w-[422px] lg:shrink-0 lg:[@media(min-height:1040px)]:sticky lg:[@media(min-height:1040px)]:top-24">
            {sidebar}
          </aside>
        </BoardGutter>
      </BoardBlock>
    </div>
  );
}
