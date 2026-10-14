"use client";

import { useEffect, useRef, type KeyboardEvent, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * What the presentational dialog leaves to its owner: focus moves into the dialog on open
 * and returns to the opener on close, the page behind does not scroll, and Tab stays inside.
 * Returns the container's keydown handler (the Tab trap). Escape is handled by the view,
 * so popups only need to `preventDefault` it.
 *
 * The dialog's own focus moves must never blur a field (a blur marks it touched and shows
 * its required error). So focus goes back to the opener only once the dialog has really left
 * the page: React StrictMode's simulated unmount (dev) keeps the DOM, and the opener is kept
 * across its re-run, when focus is already inside the dialog.
 */
export function useModalBehaviour(containerRef: RefObject<HTMLElement | null>) {
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const active = document.activeElement;
    if (active instanceof HTMLElement && !container?.contains(active)) openerRef.current = active;
    const opener = openerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    container?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.setTimeout(() => {
        if (!container?.isConnected && opener?.isConnected) opener.focus();
      }, 0);
    };
  }, [containerRef]);

  return (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    const outside = !event.currentTarget.contains(active);
    if (event.shiftKey && (active === first || outside)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || outside)) {
      event.preventDefault();
      first.focus();
    }
  };
}
