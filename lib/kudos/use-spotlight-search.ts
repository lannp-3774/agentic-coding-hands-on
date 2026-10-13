"use client";

import { useCallback, useState } from "react";
import type { SunKudosCopy } from "@/lib/i18n/sun-kudos-copy-types";
import { evaluateSpotlightSearch } from "./spotlight-search-match";

type SearchState = {
  value: string;
  /** Validation error; null when none. */
  error: string | null;
  /** Result message ("{n} kết quả" / "Không tìm thấy"); null when none. */
  status: string | null;
  /** Ids of matching nodes; null = no active highlight. */
  matchIds: Set<string> | null;
};

const INITIAL: SearchState = { value: "", error: null, status: null, matchIds: null };

export type SpotlightSearch = SearchState & {
  onChange: (value: string) => void;
  onSubmit: () => void;
};

/**
 * Spotlight search state (F008 A3). Typing never validates; submit does
 * (empty, over 100 characters). An error keeps the current highlight; no
 * match keeps every node normal; clearing the input resets everything (FR-406).
 */
export function useSpotlightSearch(
  nodes: ReadonlyArray<{ kudosId: string; name: string }>,
  copy: SunKudosCopy["spotlight"],
): SpotlightSearch {
  const [state, setState] = useState<SearchState>(INITIAL);

  const onChange = useCallback((value: string) => {
    // A stale error would sit beside text it no longer describes.
    setState((prev) => (value.trim() === "" ? { ...INITIAL, value } : { ...prev, value, error: null }));
  }, []);

  const onSubmit = useCallback(() => {
    setState((prev) => {
      const outcome = evaluateSpotlightSearch(nodes, prev.value, copy);
      if (outcome.kind === "error") return { ...prev, error: outcome.error };
      return { ...prev, error: null, status: outcome.status, matchIds: outcome.matchIds };
    });
  }, [nodes, copy]);

  return { ...state, onChange, onSubmit };
}
