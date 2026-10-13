import { SPOTLIGHT_TOOLTIP_ID } from "./spotlight-node-link";
import type { SpotlightTooltipState } from "./spotlight-view-types";

/**
 * Single shared tooltip (F008 A6). `position: fixed` and rendered outside the
 * transformed node layer so it never scales with the board. `left`/`top` are the
 * hovered node's top centre in viewport coordinates.
 */
export function SpotlightTooltip({ tooltip }: { tooltip: SpotlightTooltipState }) {
  return (
    <div
      id={SPOTLIGHT_TOOLTIP_ID}
      role="tooltip"
      className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded border border-[#998C5F] bg-[#00101A] px-3 py-2 text-center whitespace-nowrap text-white shadow-[0_0_8px_rgba(250,226,135,0.4)]"
      style={{ left: tooltip.left, top: tooltip.top - 8 }}
    >
      <p className="text-sm leading-5 font-bold">{tooltip.node.name}</p>
      <p className="text-xs leading-4 font-medium text-white/80">{tooltip.node.timeLabel}</p>
    </div>
  );
}
