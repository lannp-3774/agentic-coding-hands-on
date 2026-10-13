import { heroTierOf } from "./hero-tier";
import type { HeroTier } from "./kudos-card-types";
import type { SpotlightNodeDraft } from "./spotlight-mapping";
import type { SpotlightNode } from "./spotlight-types";

// Deterministic layout of the Spotlight names (F008 ALG-001, BR-003): a
// golden-angle (phyllotaxis) sweep over an ellipse that fills the whole board,
// skipping the board's own UI zones and rejecting spots that would cover an
// already placed name. No randomness: the same drafts always give the same
// coordinates, so the server-rendered HTML and the hydrated tree agree.
// Pure, no framework imports.

/** A laid-out node; the caller adds `href` once it knows whether the viewer is signed in. */
export type PositionedSpotlightNode = Omit<SpotlightNode, "href">;

type Box = { left: number; top: number; right: number; bottom: number };

const GOLDEN_ANGLE = (137.508 * Math.PI) / 180;
/** Keeps every name box off the frame edge. */
const EDGE_MARGIN = 10;
/** Empty gap kept around the board's UI zones and between two names (first pass). */
const ZONE_MARGIN = 10;
const NAME_GAP = 3;
/** Rough bold Montserrat advance per character, in em (incl. 0.03em tracking). */
const CHAR_WIDTH_EM = 0.62;
const LINE_HEIGHT_EM = 1.1;
/** Candidate spots per name; more spots means a better chance to dodge a collision. */
const CANDIDATES_PER_NODE = 10;
const MIN_CANDIDATES = 120;
const GRID_CELL = 64;
/** Blocked spots tried before giving up on a free one; keeps a crowded board fast. */
const FALLBACK_SPOTS = 300;
/** Share of the free board area the names may fill before every font shrinks. */
const TARGET_FILL = 0.4;
/** Smallest shrink: the Figma sizes themselves (FONT_BY_TIER is Figma x 1.6). */
const MIN_FONT_SCALE = 1 / 1.6;

/**
 * UI zones inside the 1157x548 board (mm:2940:14174 / contracts § Phase 05):
 * total label top-centre, search pill, Pan/Zoom toggle, 5-line ticker.
 */
const RESERVED_ZONES: Box[] = [
  { left: 470, top: 14, right: 687, bottom: 58 },
  { left: 25, top: 26, right: 244, bottom: 65 },
  { left: 1089, top: 471, right: 1119, bottom: 501 },
  { left: 49, top: 410, right: 620, bottom: 524 },
];

/**
 * Name font size in px by the receiver's hero tier. The Figma word cloud uses four
 * sizes, 6.66 / 7.94 / 10.2 / 11.34 px (mm:2940:14186 and siblings); they are
 * scaled by 1.6 so the names stay legible in a browser, keeping the same ratios.
 */
const FONT_BY_TIER: Record<HeroTier, number> = { new: 11, rising: 13, super: 16, legend: 18 };

const round1 = (value: number) => Math.round(value * 10) / 10;
const round2 = (value: number) => Math.round(value * 100) / 100;

const overlaps = (a: Box, b: Box, gap: number) =>
  a.left < b.right + gap && a.right + gap > b.left && a.top < b.bottom + gap && a.bottom + gap > b.top;

const boxArea = (box: Box) => (box.right - box.left) * (box.bottom - box.top);

const nameWidth = (name: string, size: number) => name.length * size * CHAR_WIDTH_EM;

const overlapArea = (a: Box, b: Box) =>
  Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
  Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

/**
 * 1 while the names fit the free board at their full size; above that every font
 * shrinks together (never below the Figma sizes) so a 300-name board still packs.
 */
function fontScaleFor(sorted: SpotlightNodeDraft[], board: { width: number; height: number }) {
  const free = board.width * board.height - RESERVED_ZONES.reduce((sum, zone) => sum + boxArea(zone), 0);
  const wanted = sorted.reduce((sum, node) => {
    const size = FONT_BY_TIER[heroTierOf(node.receivedCount).tier];
    return sum + (nameWidth(node.name, size) + NAME_GAP) * (size * LINE_HEIGHT_EM + NAME_GAP);
  }, 0);
  return wanted === 0 ? 1 : Math.min(1, Math.max(MIN_FONT_SCALE, Math.sqrt((TARGET_FILL * free) / wanted)));
}

/** Placed name boxes bucketed in a coarse grid, so a lookup only meets its neighbours. */
class BoxGrid {
  private cells = new Map<number, Box[]>();

  private keysOf(box: Box, gap: number): number[] {
    const keys: number[] = [];
    const rowStride = 1000;
    for (let col = Math.floor((box.left - gap) / GRID_CELL); col <= Math.floor((box.right + gap) / GRID_CELL); col++) {
      for (let row = Math.floor((box.top - gap) / GRID_CELL); row <= Math.floor((box.bottom + gap) / GRID_CELL); row++) {
        keys.push(col * rowStride + row);
      }
    }
    return keys;
  }

  add(box: Box) {
    for (const key of this.keysOf(box, 0)) {
      const cell = this.cells.get(key);
      if (cell) cell.push(box);
      else this.cells.set(key, [box]);
    }
  }

  /** Boxes within `gap` of `box` (a box can repeat across cells; harmless for the callers). */
  near(box: Box, gap: number): Box[] {
    return this.keysOf(box, gap).flatMap((key) => this.cells.get(key) ?? []);
  }
}

/** Board too full: the zone-free spot that hides the least of the names already placed. */
function leastCovering(spots: Box[], placed: BoxGrid): Box | undefined {
  let best: Box | undefined;
  let bestArea = Infinity;
  for (const spot of spots) {
    const area = new Set(placed.near(spot, 0)).values();
    let sum = 0;
    for (const other of area) sum += overlapArea(spot, other);
    if (sum < bestArea) {
      best = spot;
      bestArea = sum;
    }
  }
  return best;
}

/** Stable order: most kudos received first, then newest `seq`, then id (total order). */
function compareDrafts(a: SpotlightNodeDraft, b: SpotlightNodeDraft) {
  if (a.receivedCount !== b.receivedCount) return b.receivedCount - a.receivedCount;
  if (a.seq !== b.seq) return b.seq - a.seq;
  return a.kudosId < b.kudosId ? -1 : a.kudosId > b.kudosId ? 1 : 0;
}

/**
 * Candidate `k` of `total` sits at radius `sqrt(k / total)` of the ellipse and
 * angle `k * 137.508deg`: neighbours in the sequence land far apart, and the whole
 * sequence covers the ellipse evenly.
 */
function candidateCentre(k: number, total: number, board: { width: number; height: number }) {
  const radius = Math.sqrt(k / total);
  const angle = k * GOLDEN_ANGLE;
  return {
    x: board.width / 2 + (board.width / 2 - EDGE_MARGIN) * radius * Math.cos(angle),
    y: board.height / 2 + (board.height / 2 - EDGE_MARGIN) * radius * Math.sin(angle),
  };
}

/**
 * Name `i` of `n` starts its search at candidate `i * total / n`, so the sorted
 * names fan out from the middle (most received) to the edge over the whole board,
 * even when one receiver owns most kudos. From there it takes the first spot whose
 * box clears the UI zones and every earlier name; when the board is too full it
 * takes the zone-free spot that covers the least of the names already placed.
 * `x`/`y` are node centres in px inside the `width` x `height` board, origin top-left.
 */
export function layoutSpotlightNodes(
  nodes: SpotlightNodeDraft[],
  board: { width: number; height: number },
): PositionedSpotlightNode[] {
  const sorted = [...nodes].sort(compareDrafts);
  const fontScale = fontScaleFor(sorted, board);
  const total = Math.max(MIN_CANDIDATES, sorted.length * CANDIDATES_PER_NODE);
  const placed = new BoxGrid();

  return sorted.map((node, i) => {
    const size = round1(FONT_BY_TIER[heroTierOf(node.receivedCount).tier] * fontScale);
    const halfW = Math.min(nameWidth(node.name, size) / 2, board.width / 2 - EDGE_MARGIN);
    const halfH = (size * LINE_HEIGHT_EM) / 2;
    const boxAt = (c: { x: number; y: number }): Box => {
      const x = Math.min(Math.max(c.x, EDGE_MARGIN + halfW), board.width - EDGE_MARGIN - halfW);
      const y = Math.min(Math.max(c.y, EDGE_MARGIN + halfH), board.height - EDGE_MARGIN - halfH);
      return { left: x - halfW, right: x + halfW, top: y - halfH, bottom: y + halfH };
    };

    const start = Math.floor((i * total) / sorted.length);
    let box: Box | undefined;
    const fallback: Box[] = [];
    for (let step = 0; step < total && !box && fallback.length < FALLBACK_SPOTS; step++) {
      const spot = boxAt(candidateCentre((start + step) % total, total, board));
      if (RESERVED_ZONES.some((zone) => overlaps(spot, zone, ZONE_MARGIN))) continue;
      if (!placed.near(spot, NAME_GAP).some((other) => overlaps(spot, other, NAME_GAP))) box = spot;
      else fallback.push(spot);
    }
    box ??= leastCovering(fallback, placed) ?? boxAt(candidateCentre(start, total, board));
    placed.add(box);

    return {
      kudosId: node.kudosId,
      name: node.name,
      timeLabel: node.timeLabel,
      x: round2((box.left + box.right) / 2),
      y: round2((box.top + box.bottom) / 2),
      size,
    };
  });
}
