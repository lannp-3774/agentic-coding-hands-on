import { TargetIcon } from "./awards-information-icons";
import type { AwardsNavViewProps } from "./awards-information-types";

const ITEM =
  "inline-flex w-fit shrink-0 items-center gap-1 rounded-sm p-4 text-sm leading-5 font-bold tracking-[0.25px] whitespace-nowrap text-white transition-colors duration-200 hover:bg-[#FFEA9E]/10 focus-visible:bg-[#FFEA9E]/10 focus-visible:outline-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none lg:whitespace-normal";
// Active item: yellow text with glow + 1px underline (Figma variant 186:1501).
const ITEM_ACTIVE =
  "rounded-none border-b border-[#FFEA9E] text-[#FFEA9E] [text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287]";

/**
 * Controlled award navigation: no state, the parent owns the active slug and the
 * click handler. Below `lg` the <nav> itself scrolls horizontally (sticky tab bar
 * under the 64px header); from `lg` it is a sticky column under the 80px header.
 */
export function AwardsNavView({ ariaLabel, items, activeSlug, navRef, onItemClick }: AwardsNavViewProps) {
  return (
    // mm:313:8459
    <nav
      aria-label={ariaLabel}
      ref={navRef}
      className="sticky top-16 z-20 -mx-4 flex gap-2 overflow-x-auto bg-[#00101A]/90 px-4 py-2 backdrop-blur-sm [scrollbar-width:none] md:-mx-12 md:px-12 lg:top-28 lg:mx-0 lg:w-[178px] lg:shrink-0 lg:flex-col lg:items-start lg:gap-4 lg:overflow-visible lg:bg-transparent lg:p-0 lg:backdrop-blur-none [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item) => {
        const active = item.slug === activeSlug;
        return (
          <a
            key={item.slug}
            href={`#${item.slug}`}
            data-slug={item.slug}
            aria-current={active ? "location" : undefined}
            onClick={(event) => onItemClick(item.slug, event)}
            className={active ? `${ITEM} ${ITEM_ACTIVE}` : ITEM}
          >
            {/* MM_MEDIA_Target, one per nav item (C.1 … C.6): */}
            {/* mm:I313:8460;186:1745 */}
            {/* mm:I313:8461;186:1709 */}
            {/* mm:I313:8462;186:1709 */}
            {/* mm:I313:8463;186:1709 */}
            {/* mm:I313:8464;186:1709 */}
            {/* mm:I313:8465;186:1709 */}
            <TargetIcon className="shrink-0 text-white" />
            {/* mm:I313:8460;186:1502 (C.1 active label) */}
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
