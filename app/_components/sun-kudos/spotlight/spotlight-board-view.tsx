import { SpotlightScaledFrame } from "./spotlight-frame";
import { SpotlightNodesLayer } from "./spotlight-node-link";
import { SpotlightPanZoomButton } from "./spotlight-pan-zoom-button";
import { SpotlightSearchBox } from "./spotlight-search-box";
import { SpotlightTicker } from "./spotlight-ticker";
import { SpotlightTooltip } from "./spotlight-tooltip";
import { SpotlightTotalLabel, formatSpotlightTotal } from "./spotlight-total-label";
import { SPOTLIGHT_BOARD_HEIGHT, SPOTLIGHT_BOARD_WIDTH, type SpotlightBoardViewProps } from "./spotlight-view-types";

/**
 * mm:2940:14174 (B.7) interactive board, drawn entirely from props: the node layer
 * is one container carrying `translate(x, y) scale(k)`; label, search, Pan/Zoom
 * toggle and ticker sit above it so drag and wheel never start on them. From md up
 * they live in the frame's scale-to-fit stage (board pixels); in the compact layout
 * the total, search and Pan/Zoom form a full-size row above the frame and the ticker
 * sits below it, so only the name cloud scales. Each control exists once either way,
 * and the slots around the frame are always present so the viewport never remounts.
 * The shared tooltip is `position: fixed`, so it is rendered outside the frame: a
 * transformed ancestor would become its containing block.
 */
export function SpotlightBoardView({
  compact,
  total,
  nodes,
  transform,
  panZoomOn,
  matchIds,
  tooltip,
  ticker,
  search,
  viewportRef,
  onTogglePanZoom,
  onSearchChange,
  onSearchSubmit,
  nodeHandlers,
  copy,
}: SpotlightBoardViewProps) {
  const totalLabel = <SpotlightTotalLabel text={formatSpotlightTotal(total, copy.kudosSuffix)} flow={compact} />;
  const searchBox = (
    <SpotlightSearchBox
      search={search}
      copy={copy}
      onChange={onSearchChange}
      onSubmit={onSearchSubmit}
      flow={compact}
    />
  );
  const panZoomButton = (
    <SpotlightPanZoomButton label={copy.panZoom} pressed={panZoomOn} onToggle={onTogglePanZoom} flow={compact} />
  );
  const tickerLines = <SpotlightTicker lines={ticker} suffix={copy.tickerSuffix} flow={compact} />;

  return (
    <>
      <div className="flex flex-col gap-4">
        {compact ? (
          <div className="flex flex-col gap-3">
            {totalLabel}
            <div className="flex items-start gap-3">
              {searchBox}
              {panZoomButton}
            </div>
          </div>
        ) : null}
        <SpotlightScaledFrame>
          {/* Viewport: `overflow: clip` so focus never scrolls it against the transform. */}
          <div
            ref={viewportRef}
            role="group"
            aria-label={copy.title}
            tabIndex={-1}
            className={`absolute inset-0 overflow-clip outline-none ${panZoomOn ? "cursor-grab touch-none" : ""}`}
          >
            {/* Transformed layer; no will-change, so text stays sharp at rest. */}
            <div
              className="absolute top-0 left-1/2"
              style={{
                width: SPOTLIGHT_BOARD_WIDTH,
                height: SPOTLIGHT_BOARD_HEIGHT,
                marginLeft: -SPOTLIGHT_BOARD_WIDTH / 2,
                transformOrigin: "0 0",
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
              }}
            >
              <SpotlightNodesLayer
                nodes={nodes}
                matchIds={matchIds}
                tooltipNodeId={tooltip?.node.kudosId ?? null}
                handlers={nodeHandlers}
              />
            </div>
          </div>
          {compact ? null : (
            <>
              {totalLabel}
              {searchBox}
              {tickerLines}
              {panZoomButton}
            </>
          )}
        </SpotlightScaledFrame>
        {compact ? tickerLines : null}
      </div>
      {tooltip ? <SpotlightTooltip tooltip={tooltip} /> : null}
    </>
  );
}
