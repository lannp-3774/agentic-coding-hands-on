"use client";

import { useRef, useState, type KeyboardEvent, type RefObject } from "react";
import type { WriteKudosBodyProps } from "@/app/_components/write-kudos/write-kudos-modal-types";
import type { SunnerOption } from "@/lib/kudos/write-kudos-types";
import { useSunnerSearch } from "./use-sunner-search";

// "@" at the start of a line or after whitespace, then the text typed since (names
// have spaces, so it runs to the caret; capped so a stray "@" stops searching).
const MENTION_BEFORE_CARET = /(?:^|\s)@([^\n@]{0,40})$/;
const NOT_DISMISSED = -1;

type Trigger = { start: number; query: string };

export type BodyMentions = {
  /** Re-read the caret and the text before it; call after every edit and caret move. */
  refresh: () => void;
  keyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  viewProps: WriteKudosBodyProps["mention"];
};

/**
 * "@name" suggestions for the content textarea (D, ID-12, ID-13). Picking a Sunner
 * replaces "@query" with "@Full Name " in place (plain text, no notification). A pick
 * or Escape dismisses that "@" until the user starts another one.
 */
export function useBodyMentions(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  setBody: (value: string) => void,
): BodyMentions {
  const [trigger, setTrigger] = useState<Trigger | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dismissedStart = useRef(NOT_DISMISSED);

  const { options, settled } = useSunnerSearch(trigger?.query ?? "", null);
  const open = trigger !== null && settled && options.length > 0;

  const refresh = () => {
    const textarea = textareaRef.current;
    if (!textarea || textarea.selectionStart !== textarea.selectionEnd) return setTrigger(null);
    const caret = textarea.selectionStart;
    const match = MENTION_BEFORE_CARET.exec(textarea.value.slice(0, caret));
    const start = match ? caret - match[1].length - 1 : NOT_DISMISSED;
    if (!match || start === dismissedStart.current) {
      if (!match) dismissedStart.current = NOT_DISMISSED;
      return setTrigger(null);
    }
    if (trigger?.start === start && trigger.query === match[1]) return;
    setActiveIndex(-1);
    setTrigger({ start, query: match[1] });
  };

  const dismiss = () => {
    if (trigger) dismissedStart.current = trigger.start;
    setTrigger(null);
  };

  const select = (option: SunnerOption) => {
    const textarea = textareaRef.current;
    if (!textarea || !trigger) return;
    const text = `@${option.name} `;
    const caret = textarea.selectionStart;
    setBody(textarea.value.slice(0, trigger.start) + text + textarea.value.slice(caret));
    dismiss();
    const position = trigger.start + text.length;
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(position, position);
    });
  };

  const keyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!open) return;
    if (event.key === "Escape") {
      // Consumed here, so the dialog itself stays open.
      event.preventDefault();
      dismiss();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => (index + step + options.length) % options.length);
    } else if (event.key === "Enter" && options[activeIndex]) {
      event.preventDefault();
      select(options[activeIndex]);
    }
  };

  return { refresh, keyDown, viewProps: { open, options, activeIndex, onSelect: select } };
}
