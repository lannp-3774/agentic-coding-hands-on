"use client";

import { useEffect, useState } from "react";
import { searchSunners } from "@/lib/kudos/send-kudos-action";
import type { SunnerOption } from "@/lib/kudos/write-kudos-types";

const DEBOUNCE_MS = 200;

type SearchResult = { query: string; options: SunnerOption[] };

export type SunnerSearch = {
  /** Suggestions for the current query, without `excludeId`; empty until `settled`. */
  options: SunnerOption[];
  /** The latest query has an answer (possibly empty); false while typing, debouncing or loading. */
  settled: boolean;
};

/**
 * Debounced Sunner search for the recipient field and the "@" mentions
 * (clarifications ID-8..10): the query is trimmed, blank means no search, and an
 * answer to an older query is never shown. The Server Action never throws, but a
 * transport failure is treated as "no results" too.
 */
export function useSunnerSearch(rawQuery: string, excludeId: string | null): SunnerSearch {
  const query = rawQuery.trim();
  const [result, setResult] = useState<SearchResult | null>(null);

  useEffect(() => {
    if (query === "") return;
    let stale = false;
    const timer = setTimeout(async () => {
      let options: SunnerOption[] = [];
      try {
        options = await searchSunners(query);
      } catch (error) {
        console.error("[write-kudos] sunner search failed", error);
      }
      if (!stale) setResult({ query, options });
    }, DEBOUNCE_MS);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [query]);

  if (query === "" || result === null || result.query !== query) return { options: [], settled: false };
  return { options: result.options.filter((option) => option.id !== excludeId), settled: true };
}
