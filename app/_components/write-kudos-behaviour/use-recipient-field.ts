"use client";

import { useState, type KeyboardEvent } from "react";
import type { WriteKudosRecipientProps } from "@/app/_components/write-kudos/write-kudos-modal-types";
import type { SunnerOption } from "@/lib/kudos/write-kudos-types";
import { useSunnerSearch } from "./use-sunner-search";

export type RecipientField = {
  /** The picked Sunner, or null while the text is only a query. */
  selected: SunnerOption | null;
  /** Blurred at least once (the required error may show). */
  touched: boolean;
  markTouched: () => void;
  viewProps: WriteKudosRecipientProps;
};

/**
 * Recipient combobox state (B): free text is only a search query, the recipient is
 * the Sunner picked from the suggestions. Typing again drops the pick. The viewer's
 * own Sunner is never offered (clarifications: no kudos to yourself).
 */
export function useRecipientField(viewerSunnerId: string | null): RecipientField {
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<SunnerOption | null>(null);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [touched, setTouched] = useState(false);

  // A picked name is not a query: the list must stay closed after a pick.
  const { options, settled } = useSunnerSearch(selected ? "" : text, viewerSunnerId);
  const open = focused && !dismissed && settled;

  const select = (option: SunnerOption) => {
    setSelected(option);
    setText(option.name);
    setActiveIndex(-1);
  };

  const onChange = (value: string) => {
    setText(value);
    setSelected(null);
    setDismissed(false);
    setActiveIndex(-1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (event.key === "Escape") {
      // Consumed here, so the dialog itself stays open.
      event.preventDefault();
      setDismissed(true);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => (options.length === 0 ? -1 : (index + step + options.length) % options.length));
    } else if (event.key === "Enter" && activeIndex >= 0 && options[activeIndex]) {
      event.preventDefault();
      select(options[activeIndex]);
    }
  };

  return {
    selected,
    touched,
    markTouched: () => setTouched(true),
    viewProps: {
      value: text,
      open,
      options,
      activeIndex,
      onChange,
      onFocus: () => setFocused(true),
      onBlur: () => {
        setFocused(false);
        setTouched(true);
      },
      onKeyDown,
      onSelect: select,
    },
  };
}
