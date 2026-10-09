"use client";

import { CountdownPrelaunchView } from "@/app/_components/countdown-prelaunch/countdown-prelaunch-view";
import { usePrelaunchCountdown } from "@/lib/countdown/use-prelaunch-countdown";

type PrelaunchCountdownLiveProps = {
  targetMs: number | null;
  serverNowMs: number;
  title: string;
  labels: { days: string; hours: string; minutes: string };
};

/** Client seam: ticks on server time and redirects to `/` at 0 (A5). */
export function PrelaunchCountdownLive({
  targetMs,
  serverNowMs,
  title,
  labels,
}: PrelaunchCountdownLiveProps) {
  const values = usePrelaunchCountdown(targetMs, serverNowMs);
  return <CountdownPrelaunchView title={title} values={values} labels={labels} />;
}
