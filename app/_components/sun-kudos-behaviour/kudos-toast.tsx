"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { COPY_TOAST_MS } from "@/lib/kudos/kudos-constants";
import type { KudosToastTone } from "../sun-kudos/board/board-types";
import { KudosToastView } from "../sun-kudos/board/kudos-toast-view";

export type ShowKudosToast = (tone: KudosToastTone, message: string) => void;

type ActiveToast = { tone: KudosToastTone; message: string };

const KudosToastContext = createContext<ShowKudosToast | null>(null);

/**
 * The page's single toast (F006 A9 / F007 FR-403): Copy Link results and heart errors
 * share it. The latest message wins and restarts the auto-dismiss timer.
 */
export function KudosToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  // No state update may fire after the page unmounts.
  useEffect(() => clearTimer, [clearTimer]);

  const show = useCallback<ShowKudosToast>(
    (tone, message) => {
      clearTimer();
      setToast({ tone, message });
      timer.current = setTimeout(() => {
        timer.current = null;
        setToast(null);
      }, COPY_TOAST_MS);
    },
    [clearTimer],
  );

  return (
    <KudosToastContext value={show}>
      {children}
      <KudosToastView tone={toast?.tone ?? "success"} message={toast?.message ?? ""} visible={toast !== null} />
    </KudosToastContext>
  );
}

/** `show(tone, message)` of the page toast; must be used under <KudosToastProvider>. */
export function useKudosToast(): ShowKudosToast {
  const show = useContext(KudosToastContext);
  if (!show) throw new Error("useKudosToast must be used inside <KudosToastProvider>");
  return show;
}
