import { parseKudosInline } from "./kudos-markdown-inline";
import type { KudosBlock } from "./write-kudos-types";

export { applyMarkdownFormat, type MarkdownEdit } from "./kudos-markdown-format";

// Kudos body Markdown subset (F010 clarifications, plan.md B3). Blocks:
// - `> text` lines form one quote (consecutive lines merge);
// - `1. text` lines (any number) form one ordered list (consecutive lines);
// - any other non-blank lines form a paragraph; newlines inside it are kept;
// - a blank line ends the current block.
// Inline marks come from `parseKudosInline`. Raw HTML and every other syntax
// stay literal text: the result is a node tree rendered as React elements only.

const QUOTE_LINE = /^ {0,3}>\s?(.*)$/;
const LIST_LINE = /^ {0,3}\d{1,9}\.\s+(.*)$/;

type RawBlock = { kind: KudosBlock["kind"]; lines: string[] };

/** Parses a kudos body into blocks; blank or empty input gives `[]`. Never throws. */
export function parseKudosMarkdown(src: string): KudosBlock[] {
  const raw: RawBlock[] = [];
  let current: RawBlock | null = null;

  for (const line of String(src ?? "").replace(/\r\n?/g, "\n").split("\n")) {
    if (line.trim() === "") {
      current = null;
      continue;
    }
    const quote = QUOTE_LINE.exec(line);
    const item = quote ? null : LIST_LINE.exec(line);
    const kind: RawBlock["kind"] = quote ? "quote" : item ? "orderedList" : "paragraph";
    if (current === null || current.kind !== kind) {
      current = { kind, lines: [] };
      raw.push(current);
    }
    current.lines.push(quote ? quote[1] : item ? item[1] : line);
  }

  return raw.map(toBlock);
}

function toBlock({ kind, lines }: RawBlock): KudosBlock {
  if (kind === "orderedList") return { kind, items: lines.map((line) => parseKudosInline(line)) };
  return { kind, children: parseKudosInline(lines.join("\n")) };
}
