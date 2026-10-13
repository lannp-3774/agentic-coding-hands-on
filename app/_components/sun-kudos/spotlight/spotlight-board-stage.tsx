"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { SPOTLIGHT_BOARD_HEIGHT, SPOTLIGHT_BOARD_WIDTH } from "./spotlight-view-types";

/** Frame inner width at the board's natural size: 1157px box minus its two 1px borders. */
const NATURAL_INNER_WIDTH = SPOTLIGHT_BOARD_WIDTH - 2;

/**
 * Scale-to-fit stage (F008, narrow screens). Everything the board draws (names, label,
 * search pill, ticker, Pan/Zoom) lives in board pixels, the coordinates the layout and its
 * reserved zones were computed in. At the natural width the stage just fills the frame
 * (no transform, so desktop is untouched); below it the stage keeps its 1157x548 size and
 * one uniform `scale()` shrinks it to the frame, so every zone stays where the layout
 * left room for it. The frame's aspect ratio gives it the matching height. Measured, not
 * a media query, because the section padding changes by breakpoint. No transition.
 * In the compact layout (below md) the controls are not in here: only the name cloud is.
 */
export function SpotlightBoardStage({ children }: { children?: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => {
      const width = host.clientWidth;
      setScale(width === 0 || width >= NATURAL_INNER_WIDTH ? 1 : width / SPOTLIGHT_BOARD_WIDTH);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} className="absolute inset-0">
      {scale === 1 ? (
        <div className="absolute inset-0">{children}</div>
      ) : (
        <div
          className="absolute top-0 left-1/2"
          style={{
            width: SPOTLIGHT_BOARD_WIDTH,
            height: SPOTLIGHT_BOARD_HEIGHT,
            marginLeft: -SPOTLIGHT_BOARD_WIDTH / 2,
            transformOrigin: "50% 0",
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
