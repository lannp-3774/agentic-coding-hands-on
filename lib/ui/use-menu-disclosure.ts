"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";

export type MenuDisclosure = {
  open: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  menuRef: RefObject<HTMLDivElement | null>;
  toggle: () => void;
  onMenuKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
};

/**
 * Open/close state for a button + popup menu (disclosure pattern, F003
 * FR-401..FR-404, SM-001):
 * - the trigger toggles; Enter/Space come free from the native <button>;
 * - a pointerdown outside trigger + menu closes;
 * - focus moving outside trigger + menu (Tab / Shift+Tab out) closes;
 * - Esc closes and returns focus to the trigger, wherever focus is while open
 *   (after a mouse click focus is still on the trigger, not in the menu).
 * No arrow-key roving: items follow the Tab order.
 */
export function useMenuDisclosure(): MenuDisclosure {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeAndFocusTrigger = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const isInside = (target: EventTarget | null) =>
      target instanceof Node &&
      Boolean(menuRef.current?.contains(target) || triggerRef.current?.contains(target));

    const closeIfOutside = (event: Event) => {
      if (!isInside(event.target)) setOpen(false);
    };

    // Covers Esc while focus sits on the trigger or the page; inside the menu
    // onMenuKeyDown runs first and marks the event handled.
    const onDocumentKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      closeAndFocusTrigger();
    };

    document.addEventListener("pointerdown", closeIfOutside);
    document.addEventListener("focusin", closeIfOutside);
    document.addEventListener("keydown", onDocumentKeyDown);
    return () => {
      document.removeEventListener("pointerdown", closeIfOutside);
      document.removeEventListener("focusin", closeIfOutside);
      document.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, [open, closeAndFocusTrigger]);

  const toggle = useCallback(() => setOpen((value) => !value), []);

  const onMenuKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeAndFocusTrigger();
    },
    [closeAndFocusTrigger],
  );

  return { open, triggerRef, menuRef, toggle, onMenuKeyDown };
}
