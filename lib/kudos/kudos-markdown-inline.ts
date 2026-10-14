import type { KudosInline } from "./write-kudos-types";

// Inline part of the kudos Markdown subset (F010 clarifications): **bold**,
// _italic_ / *italic*, ~~strike~~ and [text](http(s) url). Anything else, and
// every marker that does not form a valid pair, stays literal text. Produces a
// node tree only (never HTML), so the card renders it as React elements.

/** Nesting beyond this is kept as literal text (bounds recursion on hostile input). */
const MAX_DEPTH = 8;
const MAX_HREF_LENGTH = 2048;

type Match = { node: KudosInline; next: number };
type Context = { depth: number; allowLinks: boolean };

const WORD_CHAR = /[\p{L}\p{N}]/u;
const isWordChar = (ch: string | undefined) => ch !== undefined && WORD_CHAR.test(ch);
const hasEdgeSpace = (s: string) => /^\s|\s$/.test(s);

/** Parses one paragraph, quote or list item; newlines stay inside text nodes. */
export function parseKudosInline(src: string, ctx: Context = { depth: 0, allowLinks: true }): KudosInline[] {
  const nodes: KudosInline[] = [];
  let text = "";
  let i = 0;
  while (i < src.length) {
    const match = ctx.depth < MAX_DEPTH ? matchAt(src, i, ctx) : null;
    if (match) {
      if (text) nodes.push({ kind: "text", text });
      text = "";
      nodes.push(match.node);
      i = match.next;
    } else {
      text += src[i];
      i += 1;
    }
  }
  if (text) nodes.push({ kind: "text", text });
  return nodes;
}

function matchAt(src: string, i: number, ctx: Context): Match | null {
  if (src.startsWith("**", i)) return pairAt(src, i, "**", "bold", ctx);
  if (src.startsWith("~~", i)) return pairAt(src, i, "~~", "strike", ctx);
  if (src[i] === "*") return singleAt(src, i, "*", ctx);
  if (src[i] === "_") return singleAt(src, i, "_", ctx);
  if (src[i] === "[" && ctx.allowLinks) return linkAt(src, i, ctx);
  return null;
}

const inner = (ctx: Context): Context => ({ ...ctx, depth: ctx.depth + 1 });

/** `**x**` / `~~x~~`: the first closing marker wins; content may not start or end with a space. */
function pairAt(src: string, i: number, marker: string, kind: "bold" | "strike", ctx: Context): Match | null {
  const open = i + marker.length;
  const close = src.indexOf(marker, open);
  if (close <= open) return null;
  const content = src.slice(open, close);
  if (hasEdgeSpace(content)) return null;
  return { node: { kind, children: parseKudosInline(content, inner(ctx)) }, next: close + marker.length };
}

/**
 * `*x*` or `_x_` italic. Doubled markers inside are skipped (they belong to bold).
 * `_` never opens or closes inside a word, so snake_case stays text.
 */
function singleAt(src: string, i: number, marker: "*" | "_", ctx: Context): Match | null {
  if (src[i + 1] === marker) return null;
  if (marker === "_" && isWordChar(src[i - 1])) return null;
  let close = src.indexOf(marker, i + 1);
  while (close !== -1 && src[close + 1] === marker) close = src.indexOf(marker, close + 2);
  if (close <= i + 1) return null;
  if (marker === "_" && isWordChar(src[close + 1])) return null;
  const content = src.slice(i + 1, close);
  if (hasEdgeSpace(content)) return null;
  return { node: { kind: "italic", children: parseKudosInline(content, inner(ctx)) }, next: close + 1 };
}

/** `[text](url)`: non-blank text and an http(s) url, else the whole thing stays text. */
function linkAt(src: string, i: number, ctx: Context): Match | null {
  const textEnd = src.indexOf("]", i + 1);
  if (textEnd === -1 || src[textEnd + 1] !== "(") return null;
  const urlEnd = src.indexOf(")", textEnd + 2);
  if (urlEnd === -1) return null;
  const text = src.slice(i + 1, textEnd);
  const href = safeHref(src.slice(textEnd + 2, urlEnd));
  if (text.trim() === "" || href === null) return null;
  return {
    node: { kind: "link", href, children: parseKudosInline(text, { depth: ctx.depth + 1, allowLinks: false }) },
    next: urlEnd + 1,
  };
}

/** The url as written when it is an absolute http(s) URL without spaces or control chars. */
export function safeHref(raw: string): string | null {
  if (raw.length > MAX_HREF_LENGTH || /[\s\p{Cc}]/u.test(raw) || !/^https?:\/\//i.test(raw)) return null;
  try {
    const { protocol } = new URL(raw);
    return protocol === "http:" || protocol === "https:" ? raw : null;
  } catch {
    return null;
  }
}
