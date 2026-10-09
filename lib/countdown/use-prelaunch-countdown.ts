"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { CountdownValues } from "./countdown-math";
import { COUNTDOWN_PLACEHOLDER, useCountdown } from "./use-countdown";

// BR-004: constant destination, nothing read from the URL.
const HOME_PATH = "/";

// The offset is client-only: the server snapshot is 0, so the server render
// never reads the clock (ALG-003, cacheComponents). The tiles show the `--`
// placeholder until hydration either way, so 0 is never displayed.
const subscribeNever = () => () => {};
const getServerOffset = () => 0;

/**
 * F005 A5: the /countdown countdown, counted on server time, that moves the
 * viewer to `/` once it reaches 0.
 *
 * - ALG-003 / BR-008: `clockOffsetMs = serverNowMs - Date.now()` is measured
 *   once on the client, then every clock read is `Date.now() + clockOffsetMs`.
 *   `serverNowMs` is captured before the page reaches the browser, so the page
 *   lags the server and never reaches `/` while the gate is still locked.
 * - BR-007: `router.replace("/")` at most once per server render (replace, so
 *   Back does not return here). Cache Components keeps this component's
 *   state and refs (Activity) when a navigation renders /countdown again, so
 *   the offset and the once-flag both follow `serverNowMs`: a fresh render
 *   re-measures and may redirect once more, a re-shown one does not.
 * - BR-002: a `null` target counts as reached.
 */
export function usePrelaunchCountdown(
  targetMs: number | null,
  serverNowMs: number,
): CountdownValues {
  const readOffset = useMemo(() => createOffsetReader(serverNowMs), [serverNowMs]);
  const clockOffsetMs = useSyncExternalStore(subscribeNever, readOffset, getServerOffset);
  const { values, showComingSoon } = useCountdown(targetMs, clockOffsetMs);
  // DEC-003: reached only once hydrated (no `--`) and nothing is left.
  const reached = values[0] !== COUNTDOWN_PLACEHOLDER && !showComingSoon;

  const router = useRouter();
  const redirectedForRef = useRef<number | null>(null);
  useEffect(() => {
    if (!reached || redirectedForRef.current === serverNowMs) return;
    redirectedForRef.current = serverNowMs;
    router.replace(HOME_PATH);
  }, [reached, serverNowMs, router]);

  return values;
}

/**
 * Measures the offset on the first read and returns that same number after,
 * as `useSyncExternalStore` requires. If React ever drops the memoized reader,
 * a later re-measure only makes the page lag more (the safe direction).
 */
function createOffsetReader(serverNowMs: number): () => number {
  let offsetMs: number | undefined;
  return () => (offsetMs ??= serverNowMs - Date.now());
}
