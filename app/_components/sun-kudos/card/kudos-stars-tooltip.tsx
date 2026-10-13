import { useId } from "react";
import type { HeroStars } from "@/lib/kudos/kudos-card-types";
import type { SunKudosCopy } from "@/lib/i18n/sun-kudos-copy-types";
import { StarIcon } from "./card-icons";

// 1-3 stars next to the hero badge; focusable so keyboard users get the same
// tooltip as hover (a11y). 0 stars renders nothing. The tooltip text stays in
// the DOM and is only revealed visually.
export function KudosStarsTooltip({
  stars,
  tooltips,
}: {
  stars: HeroStars;
  tooltips: SunKudosCopy["card"]["starTooltips"];
}) {
  const tooltipId = useId();
  if (stars === 0) return null;
  return (
    <span
      tabIndex={0}
      aria-describedby={tooltipId}
      className="group/stars relative inline-flex shrink-0 items-center gap-0.5 rounded text-[#FFEA9E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E]"
    >
      {Array.from({ length: stars }, (_, i) => (
        <StarIcon key={i} />
      ))}
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-lg bg-[#00101A] px-3 py-2 text-left text-xs leading-4 font-bold text-white opacity-0 shadow-lg transition-opacity group-hover/stars:visible group-hover/stars:opacity-100 group-focus-visible/stars:visible group-focus-visible/stars:opacity-100 motion-reduce:transition-none"
      >
        {tooltips[stars - 1]}
      </span>
    </span>
  );
}
