import Link from "next/link";
import { memo } from "react";
import type { SpotlightNode } from "@/lib/kudos/spotlight-types";
import type { SpotlightNodeHandlers } from "./spotlight-view-types";

export const SPOTLIGHT_TOOLTIP_ID = "spotlight-tooltip";

const NODE_BASE =
  "absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-bold leading-none tracking-[0.03em] transition-opacity duration-200 motion-reduce:transition-none hover:text-[#FFEA9E] focus-visible:text-[#FFEA9E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E]";
const NODE_NORMAL = "text-white";
// Matched nodes stay at full opacity and glow; the rest dim (DEC-002).
const NODE_MATCHED = "text-[#FFEA9E] [text-shadow:0_0_8px_rgba(255,234,158,0.6)]";
const NODE_DIMMED = "text-white opacity-30";

type SpotlightNodesLayerProps = {
  nodes: SpotlightNode[];
  matchIds: Set<string> | null;
  /** Node whose tooltip is open, to point `aria-describedby` at it. */
  tooltipNodeId: string | null;
  handlers: SpotlightNodeHandlers;
};

/**
 * One real `<a>` per kudos (F008 A7): Tab, Enter and screen readers work, and the
 * href is chosen server-side. `x`/`y` are the node's centre inside the board box.
 * Memoised so a drag (new transform only) does not re-render up to 300 links.
 */
export const SpotlightNodesLayer = memo(function SpotlightNodesLayer({
  nodes,
  matchIds,
  tooltipNodeId,
  handlers,
}: SpotlightNodesLayerProps) {
  return (
    <>
      {nodes.map((node) => {
        const state =
          matchIds === null ? NODE_NORMAL : matchIds.has(node.kudosId) ? NODE_MATCHED : NODE_DIMMED;
        return (
          // mm:2940:14186 (name node)
          <Link
            key={node.kudosId}
            href={node.href}
            prefetch={false}
            draggable={false}
            aria-describedby={tooltipNodeId === node.kudosId ? SPOTLIGHT_TOOLTIP_ID : undefined}
            className={`${NODE_BASE} ${state}`}
            style={{ left: node.x, top: node.y, fontSize: node.size }}
            onPointerEnter={(event) => handlers.onPointerEnter(node, event)}
            onPointerLeave={(event) => handlers.onPointerLeave(node, event)}
            onFocus={(event) => handlers.onFocus(node, event)}
            onBlur={(event) => handlers.onBlur(node, event)}
            onClickCapture={handlers.onClickCapture}
          >
            {node.name}
          </Link>
        );
      })}
    </>
  );
});
