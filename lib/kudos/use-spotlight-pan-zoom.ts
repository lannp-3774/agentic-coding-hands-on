"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent, type RefObject } from "react";
import type { SpotlightTransform } from "@/app/_components/sun-kudos/spotlight/spotlight-view-types";
import { SPOTLIGHT_ZOOM_MAX, SPOTLIGHT_ZOOM_MIN } from "./kudos-constants";

// Pan/Zoom of the Spotlight board (F008 A4/A5: BR-007, SM-001, ALG-003). The
// transform is `translate(x, y) scale(k)` on a layer whose box is centred in the
// viewport, so cursor maths first moves the cursor into that layer's box.
// On narrow screens the board sits in a stage scaled by `base` < 1 (SpotlightBoardStage):
// maths here is in board pixels, client-pixel inputs (cursor, drag, keys) are divided by `base`.
// Nothing animates (no CSS transition), so prefers-reduced-motion needs no branch.

const ZOOM_SPEED = 0.0015;
const MAX_WHEEL_DELTA = 300;
const KEY_PAN_STEP_PX = 40;
const KEY_ZOOM_FACTOR = 1.2;
/** Movement before a press becomes a drag; also the click-cancel threshold (SC-010). */
const DRAG_THRESHOLD_PX = 3;
/** The board may be dragged away, but this much of it always stays in view. */
const MIN_VISIBLE_PX = 80;
const FOCUS_MARGIN_PX = 24;

type Size = { width: number; height: number };
type Rect = { left: number; right: number; top: number; bottom: number };

export const clampZoom = (k: number) => Math.min(SPOTLIGHT_ZOOM_MAX, Math.max(SPOTLIGHT_ZOOM_MIN, k));

/** ALG-003: scale by `factor` (k clamped to [0.5, 4]) keeping the point under (cx, cy) fixed. */
export function zoomAround(t: SpotlightTransform, cx: number, cy: number, factor: number): SpotlightTransform {
  const k = clampZoom(t.k * factor);
  const ratio = k / t.k;
  return { x: cx - (cx - t.x) * ratio, y: cy - (cy - t.y) * ratio, k };
}

/** Keeps at least `minVisible` of the board inside a viewport of `view` (both in board pixels). */
export function clampTransform(
  t: SpotlightTransform,
  view: Size,
  board: Size,
  minVisible = MIN_VISIBLE_PX,
): SpotlightTransform {
  const layerLeft = (view.width - board.width) / 2;
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  return {
    k: t.k,
    x: clamp(t.x, minVisible - layerLeft - board.width * t.k, view.width - minVisible - layerLeft),
    y: clamp(t.y, minVisible - board.height * t.k, view.height - minVisible),
  };
}

/** Smallest shift that brings `node` inside `view` (inset by `margin`); 0 when already inside. */
export function shiftIntoView(node: Rect, view: Rect, margin: number): { dx: number; dy: number } {
  const axis = (lo: number, hi: number, vLo: number, vHi: number) =>
    lo < vLo + margin ? vLo + margin - lo : hi > vHi - margin ? vHi - margin - hi : 0;
  return {
    dx: axis(node.left, node.right, view.left, view.right),
    dy: axis(node.top, node.bottom, view.top, view.bottom),
  };
}

export type SpotlightPanZoom = {
  transform: SpotlightTransform;
  panZoomOn: boolean;
  toggle: () => void;
  /** Attach to the `role="group"` viewport that receives drag, wheel and keys. */
  viewportRef: RefObject<HTMLDivElement | null>;
  /** Pass as the nodes' `onClickCapture`: cancels the click that ends a drag. */
  nodeClickCapture: (event: MouseEvent<HTMLAnchorElement>) => void;
};

type Drag = { id: number; lastX: number; lastY: number; startX: number; startY: number; active: boolean };

/**
 * Off by default (SM-001). While on: pointer drag pans (capture starts only after
 * the threshold, so a plain click still reaches the node link), a non-passive native
 * wheel listener zooms around the cursor (React's `onWheel` cannot `preventDefault`),
 * arrows pan and `+`/`-` zoom. Focus moving to a node always brings it into view
 * (FR-407). When off, wheel and drag are not intercepted, so the page scrolls.
 */
export function useSpotlightPanZoom(board: Size): SpotlightPanZoom {
  const { width: boardWidth, height: boardHeight } = board;
  const [transform, setTransform] = useState<SpotlightTransform>({ x: 0, y: 0, k: 1 });
  const [panZoomOn, setPanZoomOn] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragMovedRef = useRef(false);

  const toggle = useCallback(() => setPanZoomOn((on) => !on), []);

  const nodeClickCapture = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    if (!dragMovedRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const boardSize = { width: boardWidth, height: boardHeight };
    let drag: Drag | null = null;

    // The viewport as measured now: client rect, base scale of the stage around it (1 when
    // not shrunk; `offsetWidth` ignores transforms), and its size in board pixels.
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const base = el.offsetWidth > 0 ? rect.width / el.offsetWidth : 1;
      const view = { width: el.offsetWidth, height: el.offsetHeight };
      return { rect, base, view, layerLeft: (view.width - boardWidth) / 2 };
    };
    // `change` runs on the latest state and is clamped against the viewport as measured now.
    const apply = (change: (t: SpotlightTransform, m: ReturnType<typeof measure>) => SpotlightTransform) => {
      const m = measure();
      setTransform((t) => clampTransform(change(t, m), m.view, boardSize, MIN_VISIBLE_PX / m.base));
    };

    const onFocusIn = (event: FocusEvent) => {
      if (!(event.target instanceof HTMLElement) || event.target === el) return;
      const { dx, dy } = shiftIntoView(event.target.getBoundingClientRect(), el.getBoundingClientRect(), FOCUS_MARGIN_PX);
      if (dx !== 0 || dy !== 0) apply((t, { base }) => ({ ...t, x: t.x + dx / base, y: t.y + dy / base }));
    };
    el.addEventListener("focusin", onFocusIn);
    if (!panZoomOn) return () => el.removeEventListener("focusin", onFocusIn);

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !event.isPrimary) return;
      dragMovedRef.current = false;
      drag = { id: event.pointerId, lastX: event.clientX, lastY: event.clientY, startX: event.clientX, startY: event.clientY, active: false };
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      if (!drag.active) {
        if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) <= DRAG_THRESHOLD_PX) return;
        drag.active = true;
        dragMovedRef.current = true;
        window.getSelection()?.removeAllRanges(); // no text selection while dragging
        try {
          el.setPointerCapture(event.pointerId);
        } catch {
          // Pointer already gone: the drag simply ends on the next pointerup.
        }
      }
      const dx = event.clientX - drag.lastX;
      const dy = event.clientY - drag.lastY;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      apply((t, { base }) => ({ ...t, x: t.x + dx / base, y: t.y + dy / base }));
    };
    const onPointerEnd = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      if (drag.active && el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
      // The click that ends a drag fires right after pointerup; clear the flag after it.
      if (drag.active) window.setTimeout(() => (dragMovedRef.current = false), 0);
      drag = null;
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const lineHeight = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? el.getBoundingClientRect().height : 1;
      const delta = Math.max(-MAX_WHEEL_DELTA, Math.min(MAX_WHEEL_DELTA, event.deltaY * lineHeight));
      const factor = Math.exp(-delta * ZOOM_SPEED);
      apply((t, { rect, base, layerLeft }) =>
        zoomAround(t, (event.clientX - rect.left) / base - layerLeft, (event.clientY - rect.top) / base, factor),
      );
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const pan: Record<string, [number, number]> = {
        ArrowLeft: [KEY_PAN_STEP_PX, 0],
        ArrowRight: [-KEY_PAN_STEP_PX, 0],
        ArrowUp: [0, KEY_PAN_STEP_PX],
        ArrowDown: [0, -KEY_PAN_STEP_PX],
      };
      const zoom = event.key === "+" || event.key === "=" ? KEY_ZOOM_FACTOR : event.key === "-" || event.key === "_" ? 1 / KEY_ZOOM_FACTOR : 0;
      const step = pan[event.key];
      if (!step && !zoom) return;
      event.preventDefault();
      if (step) apply((t, { base }) => ({ ...t, x: t.x + step[0] / base, y: t.y + step[1] / base }));
      else apply((t, { view }) => zoomAround(t, boardWidth / 2, view.height / 2, zoom));
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerEnd);
    el.addEventListener("pointercancel", onPointerEnd);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("keydown", onKeyDown);
    return () => {
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerEnd);
      el.removeEventListener("pointercancel", onPointerEnd);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("keydown", onKeyDown);
      drag = null;
    };
  }, [panZoomOn, boardWidth, boardHeight]);

  return { transform, panZoomOn, toggle, viewportRef, nodeClickCapture };
}
