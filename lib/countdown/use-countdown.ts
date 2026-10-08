"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  minutesLeft,
  msUntilNextChange,
  toCountdownValues,
  type CountdownValues,
} from "./countdown-math";

export type CountdownState = {
  values: CountdownValues;
  showComingSoon: boolean;
};

// Server render and hydration use this snapshot instead of the clock, so the
// prerender (cacheComponents) never reads the current time and the markup
// never mismatches. The real value replaces it right after hydration.
const PLACEHOLDER_MINUTES = -1;
const PLACEHOLDER_STATE: CountdownState = {
  values: ["--", "--", "--"],
  showComingSoon: false,
};

const getServerSnapshot = () => PLACEHOLDER_MINUTES;

/**
 * Live countdown to `targetMs` (F002 A2, DEC-001). Shows the `--` placeholder
 * until hydrated, then whole minutes left (rounded up) as [days, hours,
 * minutes]. "Coming soon" shows only while the target is still ahead; a
 * `null` target counts as reached (00 00 00, hidden).
 *
 * Reads the clock through `Date.now()`/`setTimeout` only, so a faked clock
 * (Playwright `page.clock`) drives it exactly like real time.
 */
export function useCountdown(targetMs: number | null): CountdownState {
  const subscribe = useCallback(
    (notify: () => void) => subscribeToMinuteTicks(targetMs, notify),
    [targetMs],
  );
  const getSnapshot = useCallback(() => minutesLeft(targetMs, Date.now()), [targetMs]);

  const minutes = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (minutes === PLACEHOLDER_MINUTES) return PLACEHOLDER_STATE;
  return { values: toCountdownValues(minutes), showComingSoon: minutes > 0 };
}

/**
 * Notifies exactly when the minute count changes. Every tick re-measures from
 * `Date.now()` (throttled background tabs catch up on the next tick), and the
 * chain stops once the target is reached. Returning to a hidden tab re-reads
 * the clock at once instead of waiting for a throttled timer.
 */
function subscribeToMinuteTicks(targetMs: number | null, notify: () => void): () => void {
  if (targetMs === null) return () => {};
  let timer: ReturnType<typeof setTimeout> | undefined;

  const schedule = () => {
    const delay = msUntilNextChange(targetMs, Date.now());
    if (delay === null) return;
    timer = setTimeout(() => {
      notify();
      schedule();
    }, delay);
  };

  const resync = () => {
    if (document.visibilityState !== "visible") return;
    clearTimeout(timer);
    notify();
    schedule();
  };

  schedule();
  document.addEventListener("visibilitychange", resync);
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", resync);
  };
}
