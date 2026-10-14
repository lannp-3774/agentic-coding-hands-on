import type { ReactNode } from "react";
import type { KudosBlock, KudosInline } from "@/lib/kudos/write-kudos-types";

// Card body (F010): the server-parsed Markdown subset rendered as React
// elements only, never as HTML. Hrefs arrive pre-validated (http/https); the
// link still opts out of referrer/opener/SEO. Typography is inherited from the
// caller's wrapper (which also owns the line clamp), so a single plain-text
// paragraph looks exactly like the former `{card.body}` text.

// The card's stretched detail link sits on ::after; body links rise above it.
const LINK = "relative z-10 underline underline-offset-2 hover:text-[#998C5F]";
const BLOCK_GAP = "[&:not(:first-child)]:mt-2";

function renderInlines(nodes: KudosInline[]): ReactNode[] {
  return nodes.map((node, index) => {
    switch (node.kind) {
      case "text":
        return node.text;
      case "bold":
        return <strong key={index}>{renderInlines(node.children)}</strong>;
      case "italic":
        return <em key={index}>{renderInlines(node.children)}</em>;
      case "strike":
        return <s key={index}>{renderInlines(node.children)}</s>;
      case "link":
        return (
          <a key={index} href={node.href} target="_blank" rel="noopener noreferrer nofollow" className={LINK}>
            {renderInlines(node.children)}
          </a>
        );
    }
  });
}

function renderBlock(block: KudosBlock, index: number): ReactNode {
  switch (block.kind) {
    case "paragraph":
      return (
        <p key={index} className={BLOCK_GAP}>
          {renderInlines(block.children)}
        </p>
      );
    case "quote":
      return (
        <blockquote key={index} className={`border-l-4 border-[#998C5F] pl-3 ${BLOCK_GAP}`}>
          {renderInlines(block.children)}
        </blockquote>
      );
    case "orderedList":
      return (
        <ol key={index} className={`list-decimal pl-6 ${BLOCK_GAP}`}>
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInlines(item)}</li>
          ))}
        </ol>
      );
  }
}

export type KudosRichBodyProps = {
  blocks: KudosBlock[];
  /** Typography and line clamp, applied to the element that directly holds the text. */
  className?: string;
};

// A single paragraph (every plain-text body) is the clamped element itself, as the
// former `<p>{card.body}</p>` was; any other shape sits in a clamped wrapper.
export function KudosRichBody({ blocks, className }: KudosRichBodyProps) {
  if (blocks.length === 1 && blocks[0].kind === "paragraph") {
    return <p className={className}>{renderInlines(blocks[0].children)}</p>;
  }
  return <div className={className}>{blocks.map(renderBlock)}</div>;
}
