"use client";

import { useRef, useState, type RefObject } from "react";
import type { WriteKudosBodyProps } from "@/app/_components/write-kudos/write-kudos-modal-types";
import { applyMarkdownFormat } from "@/lib/kudos/kudos-markdown";
import type { MarkdownFormat } from "@/lib/kudos/write-kudos-types";
import { useBodyMentions } from "./use-body-mentions";

export type BodyEditor = {
  value: string;
  /** Blurred at least once (the required error may show). */
  touched: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  viewProps: WriteKudosBodyProps;
};

/**
 * Content field (C toolbar + D textarea): a plain textarea holding Markdown source.
 * Toolbar buttons rewrite the value around the selection (`applyMarkdownFormat`) and
 * restore the selection afterwards; "Link" asks for the URL with `window.prompt`.
 */
export function useBodyEditor(linkPrompt: string): BodyEditor {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const mentions = useBodyMentions(textareaRef, setValue);

  const onFormat = (format: MarkdownFormat) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    let href: string | undefined;
    if (format === "link") {
      href = window.prompt(linkPrompt)?.trim();
      if (!href) return;
    }
    const edit = applyMarkdownFormat(textarea.value, textarea.selectionStart, textarea.selectionEnd, format, href);
    setValue(edit.value);
    // The controlled value lands on the next render; the selection can only follow it.
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(edit.start, edit.end);
    });
  };

  return {
    value,
    touched,
    textareaRef,
    viewProps: {
      value,
      onChange: (next) => {
        setValue(next);
        mentions.refresh();
      },
      onBlur: () => setTouched(true),
      onSelectionChange: mentions.refresh,
      onKeyDown: mentions.keyDown,
      onFormat,
      mention: mentions.viewProps,
    },
  };
}
