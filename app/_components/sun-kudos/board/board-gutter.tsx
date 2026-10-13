import type { ReactNode } from "react";

type BoardGutterProps = { children: ReactNode; className?: string };

/**
 * Horizontal content frame of the feed + sidebar row: the same box as
 * KudosSectionHeading (16 / 48 / 144px side padding up to 1152px wide on the
 * 1440px design, mm:2940:13481), so the headings and the row share one edge at
 * every width. Each breakpoint sits after the previous one in the class list
 * and in the compiled CSS, so the wider step always wins.
 */
export function BoardGutter({ children, className = "" }: BoardGutterProps) {
  return <div className={`mx-auto w-full max-w-[1440px] px-4 md:px-12 xl:px-36 ${className}`}>{children}</div>;
}
