import type { ReactNode } from "react";
import { SpotlightBoardStage } from "./spotlight-board-stage";

/** Section padding and gap shared by the loaded view and its skeleton. */
export const SPOTLIGHT_SECTION_CLASS =
  "relative z-10 flex w-full flex-col gap-12 px-4 md:px-12 xl:gap-16 xl:px-36";

const BOX = "relative shrink-0 overflow-clip border border-[#998C5F] bg-[#00101A]";

/**
 * mm:2940:14174 (B.7) bordered board box at its natural size, 1157x548 at desktop
 * width (keep in step with SPOTLIGHT_BOARD_WIDTH/HEIGHT), border-radius 47.14px.
 * Never scaled: the empty state uses it so its message stays readable on a phone.
 * The Figma background art ("Root further mo rong 1", images 24/25) is not exported
 * by MoMorph, so the box keeps the dark base the art sits on.
 */
export function SpotlightFrame({ children }: { children?: ReactNode }) {
  return (
    <div className="flex justify-center">
      <div className={`${BOX} h-[548px] w-full rounded-[47.14px] xl:w-[1157px]`}>{children}</div>
    </div>
  );
}

/**
 * The same box for the loaded board and its skeleton: below 1157px it keeps the
 * aspect ratio and the stage scales its content (the name cloud, plus the controls
 * from md up) to fit. The corner radius follows the box below md, where it is smaller.
 */
export function SpotlightScaledFrame({ children }: { children?: ReactNode }) {
  return (
    <div className="flex justify-center">
      <div
        className={`${BOX} aspect-[1157/548] w-full max-w-[1157px] rounded-[14px] md:rounded-[47.14px] xl:w-[1157px]`}
      >
        <SpotlightBoardStage>{children}</SpotlightBoardStage>
      </div>
    </div>
  );
}
