"use client";

import type { ReactNode } from "react";
import { useHighlightCarousel } from "@/lib/kudos/use-highlight-carousel";
import type { HighlightCarouselLabels } from "../sun-kudos/board/board-types";
import { HighlightCarouselView } from "../sun-kudos/board/highlight-carousel-view";

export type HighlightCarouselProps = {
  /** One card per slide, most hearts first (rendered by the Highlight loader). */
  slides: ReactNode[];
  labels: HighlightCarouselLabels;
  /** Region name (`copy.highlight.carouselLabel`); never the section title. */
  label: string;
};

/**
 * Highlight carousel state (F006 A3, FR-206, DEC-002): starts at card 1, the
 * arrows stop at both ends. The page mounts it with `key={filterKey(filters)}`,
 * so a filter change starts again at 1/n (DEC-005).
 */
export function HighlightCarousel({ slides, labels, label }: HighlightCarouselProps) {
  const { index, prev, next } = useHighlightCarousel(slides.length);
  return (
    <HighlightCarouselView slides={slides} index={index} onPrev={prev} onNext={next} labels={labels} label={label} />
  );
}
