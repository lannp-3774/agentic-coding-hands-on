"use client";

import { useCountdown } from "@/lib/countdown/use-countdown";
import { CountdownTiles } from "./countdown-tiles";
import type { CountdownTilesProps } from "../site/site-types";

type LiveCountdownProps = {
  targetMs: number | null;
  labels: CountdownTilesProps["labels"];
};

/** Live hero countdown: ticks on the client, renders `--` until hydrated. */
export function LiveCountdown({ targetMs, labels }: LiveCountdownProps) {
  const { values, showComingSoon } = useCountdown(targetMs);
  return <CountdownTiles values={values} showComingSoon={showComingSoon} labels={labels} />;
}
