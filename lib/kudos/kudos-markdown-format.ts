import type { MarkdownFormat } from "./write-kudos-types";

// Toolbar actions of the "Viết Kudo" editor (C.1-C.6, clarifications): the
// textarea keeps Markdown markers, so each button rewrites the value around the
// selection and returns the selection to restore. Pure: the editor calls it with
// `selectionStart` / `selectionEnd` and applies the result.

/** The new textarea value and selection after one toolbar action. */
export type MarkdownEdit = { value: string; start: number; end: number };

const WRAP_MARKERS = { bold: "**", italic: "_", strike: "~~" } as const;
const QUOTE_PREFIX = /^>\s?/;
const LIST_PREFIX = /^\d{1,9}\.\s+/;

/**
 * Applies `format` to `value[start, end)`:
 * - bold / italic / strike wrap the selection (`**x**`, `_x_`, `~~x~~`), or unwrap it
 *   when it is already wrapped; an empty selection inserts the pair with the caret inside;
 * - quote / orderedList prefix every selected line (`> `, `1. `, `2. ` ...), or remove the
 *   prefixes when every non-blank line already has one; the caret's line counts when empty;
 * - link wraps the selection as `[text](href)` and selects the text; without an href the
 *   value is returned unchanged (the prompt was cancelled).
 * Out-of-range or reversed offsets are clamped and ordered first.
 */
export function applyMarkdownFormat(
  value: string,
  start: number,
  end: number,
  format: MarkdownFormat,
  href?: string,
): MarkdownEdit {
  const [s, e] = orderedSelection(value, start, end);
  switch (format) {
    case "bold":
    case "italic":
    case "strike":
      return toggleWrap(value, s, e, WRAP_MARKERS[format]);
    case "link":
      return insertLink(value, s, e, href);
    case "quote":
      return toggleLinePrefix(value, s, e, QUOTE_PREFIX, () => "> ");
    case "orderedList":
      return toggleLinePrefix(value, s, e, LIST_PREFIX, (n) => `${n}. `);
  }
}

function orderedSelection(value: string, start: number, end: number): [number, number] {
  const clamp = (n: number) => Math.min(Math.max(Number.isFinite(n) ? Math.trunc(n) : 0, 0), value.length);
  const a = clamp(start);
  const b = clamp(end);
  return a <= b ? [a, b] : [b, a];
}

function toggleWrap(value: string, s: number, e: number, marker: string): MarkdownEdit {
  const m = marker.length;
  // Markers just outside the selection: unwrap, keep the same text selected.
  if (s >= m && value.slice(s - m, s) === marker && value.slice(e, e + m) === marker) {
    return { value: value.slice(0, s - m) + value.slice(s, e) + value.slice(e + m), start: s - m, end: e - m };
  }
  // Markers selected with the text: unwrap to the inner text.
  const selected = value.slice(s, e);
  if (selected.length >= 2 * m && selected.startsWith(marker) && selected.endsWith(marker)) {
    const text = selected.slice(m, -m);
    return { value: value.slice(0, s) + text + value.slice(e), start: s, end: s + text.length };
  }
  return { value: value.slice(0, s) + marker + selected + marker + value.slice(e), start: s + m, end: e + m };
}

function insertLink(value: string, s: number, e: number, href: string | undefined): MarkdownEdit {
  const url = href?.trim();
  if (!url) return { value, start: s, end: e };
  const text = value.slice(s, e);
  return { value: `${value.slice(0, s)}[${text}](${url})${value.slice(e)}`, start: s + 1, end: s + 1 + text.length };
}

function toggleLinePrefix(
  value: string,
  s: number,
  e: number,
  prefix: RegExp,
  prefixFor: (n: number) => string,
): MarkdownEdit {
  const lineStart = s === 0 ? 0 : value.lastIndexOf("\n", s - 1) + 1;
  // A selection ending right after a newline does not include the next line.
  const lastChar = e > s && value[e - 1] === "\n" ? e - 1 : e;
  const newline = value.indexOf("\n", lastChar);
  const lineEnd = newline === -1 ? value.length : newline;

  const lines = value.slice(lineStart, lineEnd).split("\n");
  const single = lines.length === 1;
  const counted = lines.filter((line) => single || line.trim() !== "");
  const remove = counted.length > 0 && counted.every((line) => prefix.test(line));
  let n = 0;
  const next = lines.map((line) => {
    if (!single && line.trim() === "") return line;
    const bare = line.replace(prefix, "");
    n += 1;
    return remove ? bare : prefixFor(n) + bare;
  });

  const block = next.join("\n");
  const result = value.slice(0, lineStart) + block + value.slice(lineEnd);
  if (s !== e) return { value: result, start: lineStart, end: lineStart + block.length };
  // Caret: it moves with its own line's prefix change.
  const caret = Math.max(lineStart, s + next[0].length - lines[0].length);
  return { value: result, start: caret, end: caret };
}
