"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SpotlightBoardView } from "@/app/_components/sun-kudos/spotlight/spotlight-board-view";
import {
  SPOTLIGHT_BOARD_HEIGHT,
  SPOTLIGHT_BOARD_WIDTH,
  type SpotlightCopy,
  type SpotlightNodeHandlers,
  type SpotlightTooltipState,
  type SpotlightTransform,
} from "@/app/_components/sun-kudos/spotlight/spotlight-view-types";
import type { SpotlightNode, SpotlightTickerLine } from "@/lib/kudos/spotlight-types";
import { useSpotlightCompactLayout } from "@/app/_components/sun-kudos/spotlight/use-spotlight-compact-layout";
import { useSpotlightPanZoom } from "@/lib/kudos/use-spotlight-pan-zoom";
import { useSpotlightSearch } from "@/lib/kudos/use-spotlight-search";

type SpotlightBoardProps = {
  /** Real total of kudos, not capped by the node limit. */
  total: number;
  /** Laid out, with `href` already chosen for the viewer. Never empty here. */
  nodes: SpotlightNode[];
  ticker: SpotlightTickerLine[];
  copy: SpotlightCopy;
};

/** Half of the widest tooltip we expect; keeps its centre far enough from the viewport edge. */
const TOOLTIP_EDGE_PX = 96;
/** Room for the tooltip box above its anchor (it is drawn above the node's top). */
const TOOLTIP_TOP_PX = 64;

/** An open tooltip, tied to the pan/zoom transform it was measured under. */
type OpenTooltip = { tooltip: SpotlightTooltipState; transform: SpotlightTransform };

/**
 * Client side of the Spotlight (F008 A3-A6): search, Pan/Zoom and the single shared
 * tooltip. Everything deterministic (data, layout, hrefs) arrives as props from the
 * server section; this only owns interaction state and feeds the stateless view.
 */
export function SpotlightBoard({ total, nodes, ticker, copy }: SpotlightBoardProps) {
  const search = useSpotlightSearch(nodes, copy);
  const compact = useSpotlightCompactLayout();
  const panZoom = useSpotlightPanZoom({ width: SPOTLIGHT_BOARD_WIDTH, height: SPOTLIGHT_BOARD_HEIGHT });
  const { transform, nodeClickCapture } = panZoom;
  const [open, setOpen] = useState<OpenTooltip | null>(null);
  // Latest transform for `show`, so the handlers (and the memoised node layer) stay
  // stable while the board is dragged.
  const transformRef = useRef(transform);
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  // Hover and keyboard focus share one tooltip. Fixed coordinates are read from the
  // node's rect, so zoom and pan are already accounted for.
  const show = useCallback((node: SpotlightNode, element: HTMLAnchorElement) => {
    const rect = element.getBoundingClientRect();
    const left = Math.min(Math.max(rect.left + rect.width / 2, TOOLTIP_EDGE_PX), window.innerWidth - TOOLTIP_EDGE_PX);
    const top = Math.max(rect.top, TOOLTIP_TOP_PX);
    setOpen({ tooltip: { node, left, top }, transform: transformRef.current });
  }, []);
  const hide = useCallback(() => setOpen(null), []);

  const nodeHandlers = useMemo<SpotlightNodeHandlers>(
    () => ({
      onPointerEnter: (node, event) => show(node, event.currentTarget),
      onFocus: (node, event) => show(node, event.currentTarget),
      onPointerLeave: hide,
      onBlur: hide,
      onClickCapture: nodeClickCapture,
    }),
    [show, hide, nodeClickCapture],
  );

  // Esc closes the tooltip without moving focus.
  const isOpen = open !== null;
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // A pan or zoom moves the nodes under a fixed tooltip, so a stale one is not drawn.
  const tooltip = open !== null && open.transform === transform ? open.tooltip : null;

  return (
    <SpotlightBoardView
      compact={compact}
      total={total}
      nodes={nodes}
      transform={transform}
      panZoomOn={panZoom.panZoomOn}
      matchIds={search.matchIds}
      tooltip={tooltip}
      ticker={ticker}
      search={{ value: search.value, error: search.error, status: search.status, disabled: nodes.length === 0 }}
      viewportRef={panZoom.viewportRef}
      onTogglePanZoom={panZoom.toggle}
      onSearchChange={search.onChange}
      onSearchSubmit={search.onSubmit}
      nodeHandlers={nodeHandlers}
      copy={copy}
    />
  );
}
