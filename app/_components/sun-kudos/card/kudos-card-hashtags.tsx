import { Fragment } from "react";
import Link from "next/link";
import type { KudosHashtag } from "@/lib/kudos/kudos-card-types";

/** F006 BR-007: at most 5 hashtags on a card. */
export const CARD_HASHTAGS_MAX = 5;

// B.4.3 / C.3.7: one line of red (#D4271D) hashtags, cut with "..." when the
// line overflows or more than 5 exist. Chips set the Hashtag filter in the URL.
export function KudosCardHashtags({ hashtags, hrefs }: { hashtags: KudosHashtag[]; hrefs: string[] }) {
  const shown = hashtags.slice(0, CARD_HASHTAGS_MAX);
  if (shown.length === 0) return null;
  return (
    // mm:I3127:21871;256:5159
    <p className="relative z-10 line-clamp-1 w-full text-base leading-6 font-bold tracking-[0.5px] text-[#D4271D]">
      {shown.map((tag, i) => (
        <Fragment key={tag.slug}>
          {i > 0 ? " " : null}
          {hrefs[i] ? (
            <Link href={hrefs[i]} replace scroll={false} className="hover:underline focus-visible:underline">
              #{tag.label}
            </Link>
          ) : (
            <span>#{tag.label}</span>
          )}
        </Fragment>
      ))}
      {hashtags.length > CARD_HASHTAGS_MAX ? "..." : null}
    </p>
  );
}
