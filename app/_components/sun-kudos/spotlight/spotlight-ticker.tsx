import type { SpotlightTickerLine } from "@/lib/kudos/spotlight-types";

// Newest line on top at full strength, older lines fade out (Figma fades 1 -> 0.1).
const LINE_OPACITY = ["opacity-100", "opacity-70", "opacity-50", "opacity-30", "opacity-10"];

type SpotlightTickerProps = {
  lines: SpotlightTickerLine[];
  /** Sentence after the name, "đã nhận được một Kudos mới". */
  suffix: string;
  /** Compact layout: below the board, full width, lines wrap instead of being cut. */
  flow?: boolean;
};

/**
 * Bottom-left latest-kudos strip (up to 5 lines, newest first). Static: read once
 * at page load, never animated, and `aria-live="off"` so it is not announced.
 */
export function SpotlightTicker({ lines, suffix, flow = false }: SpotlightTickerProps) {
  if (lines.length === 0) return null;
  return (
    // mm:2940:14230 .. 3004:15995 (08:30PM <name> đã nhận được một Kudos mới)
    <ul
      aria-live="off"
      className={`pointer-events-none z-10 flex flex-col ${
        flow ? "px-2" : "absolute bottom-6 left-[49px] max-w-[calc(100%-120px)]"
      }`}
    >
      {lines.map((line, index) => (
        <li
          key={line.kudosId}
          className={`${flow ? "" : "truncate"} text-sm leading-[19px] font-bold tracking-[0.1px] text-white ${LINE_OPACITY[index] ?? "opacity-10"}`}
        >
          {/* Run styles measured on the Figma render: time #999, name 16px, sentence 14px (all 700). The sentence
              stays a bare text node so the whole line is still one text match. */}
          <span className="text-[#999]">{line.time12h}</span> <span className="text-base">{line.name}</span> {suffix}
        </li>
      ))}
    </ul>
  );
}
