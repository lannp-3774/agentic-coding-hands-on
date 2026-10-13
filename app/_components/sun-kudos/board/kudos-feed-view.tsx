"use client";

import { useEffect, useRef } from "react";
import { FeedLoadingRows } from "./board-skeletons";
import type { KudosFeedViewProps } from "./board-types";

/**
 * All Kudos list frame (C.2): cards, then the load-more sentinel, then the loading
 * rows or the error line with "Thử lại". The sentinel stays mounted in every state
 * so the observer's ref never changes; the hook decides when to stop (done/error).
 */
export function KudosFeedView({ children, status, sentinelRef, onRetry, labels }: KudosFeedViewProps) {
  const retryRef = useRef<HTMLButtonElement>(null);

  // Focus management (screen spec §9): the retry button takes focus when the error line appears.
  useEffect(() => {
    if (status === "error") retryRef.current?.focus();
  }, [status]);

  return (
    // mm:2940:13482
    <div aria-busy={status === "loading"} className="flex w-full flex-col gap-6">
      {children}
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      {status === "loading" ? <FeedLoadingRows /> : null}
      <div aria-live="polite">
        {status === "error" ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <p className="text-base leading-6 font-bold tracking-[0.5px] text-[#FFB4AB]">{labels.loadMoreError}</p>
            <button
              ref={retryRef}
              type="button"
              onClick={onRetry}
              className="cursor-pointer rounded-lg bg-[#FFEA9E] px-6 py-3 text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] transition-colors hover:bg-[#FFF8E1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E]"
            >
              {labels.retry}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
