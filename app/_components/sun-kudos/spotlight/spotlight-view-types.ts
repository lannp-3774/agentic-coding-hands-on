import type { MouseEvent, RefObject, SyntheticEvent } from "react";
import type { SpotlightNode, SpotlightTickerLine } from "@/lib/kudos/spotlight-types";
import type { SunKudosCopy } from "@/lib/i18n/sun-kudos-copy-types";

// Props of the stateless Spotlight views (F008). Gesture, search and tooltip
// state live in the client wrapper; these views only draw what they are given.

export type SpotlightCopy = SunKudosCopy["spotlight"];

/** mm:2940:14174 (B.7) frame size; node `x`/`y` are measured inside this box. */
export const SPOTLIGHT_BOARD_WIDTH = 1157;
export const SPOTLIGHT_BOARD_HEIGHT = 548;

/** Pan/zoom state of the node layer: `translate(x, y) scale(k)`, origin 0 0. */
export type SpotlightTransform = { x: number; y: number; k: number };

/** Shared tooltip: viewport (fixed) coordinates of the hovered node's top centre. */
export type SpotlightTooltipState = {
  node: SpotlightNode;
  left: number;
  top: number;
};

export type SpotlightSearchState = {
  value: string;
  /** Validation error shown with `role="alert"`; null when none. */
  error: string | null;
  /** Result message ("{n} kết quả" / "Không tìm thấy"); null when none. */
  status: string | null;
  disabled: boolean;
};

type NodeEvent = SyntheticEvent<HTMLAnchorElement>;

/** Handlers attached to every node link; `node` identifies which one fired. */
export type SpotlightNodeHandlers = {
  onPointerEnter: (node: SpotlightNode, event: NodeEvent) => void;
  onPointerLeave: (node: SpotlightNode, event: NodeEvent) => void;
  onFocus: (node: SpotlightNode, event: NodeEvent) => void;
  onBlur: (node: SpotlightNode, event: NodeEvent) => void;
  /** Capture phase: lets the pan hook cancel a click that ended a drag. */
  onClickCapture: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export type SpotlightBoardViewProps = {
  /** Below md: total, search and Pan/Zoom above the board and the ticker below it, all at full size. */
  compact: boolean;
  /** Real total of kudos, not capped by the node limit. */
  total: number;
  nodes: SpotlightNode[];
  transform: SpotlightTransform;
  panZoomOn: boolean;
  /** Ids of matching nodes after a search; null = no active highlight. */
  matchIds: Set<string> | null;
  tooltip: SpotlightTooltipState | null;
  /** Newest first, at most 5. */
  ticker: SpotlightTickerLine[];
  search: SpotlightSearchState;
  /** Attached to the `role="group"` viewport that receives drag and wheel. */
  viewportRef: RefObject<HTMLDivElement | null>;
  onTogglePanZoom: () => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  nodeHandlers: SpotlightNodeHandlers;
  copy: SpotlightCopy;
};
