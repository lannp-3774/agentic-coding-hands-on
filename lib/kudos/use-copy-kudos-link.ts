"use client";

import { useCallback, useEffect, useRef } from "react";
import { copyText } from "@/lib/ui/copy-text";
import { absoluteKudosUrl } from "./kudos-links";

/**
 * "Copy Link" for a kudos card (F006 A9, FR-401, BR-013, INT-002). `copy(id)`
 * puts the absolute detail URL on the clipboard and reports the outcome to
 * `onResult` (`true` = copied, `false` = show the error toast). The URL is
 * built and the clipboard called inside the click handler so the browser still
 * sees the user gesture.
 */
export function useCopyKudosLink(onResult: (ok: boolean) => void): (id: string) => Promise<void> {
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  return useCallback(async (id: string) => {
    const ok = await copyText(absoluteKudosUrl(window.location.origin, id));
    onResultRef.current(ok);
  }, []);
}
