import type { ReactNode } from "react";
import Link from "next/link";
import type { KudosCard, KudosCardLinks } from "@/lib/kudos/kudos-card-types";
import type { SunKudosCopy } from "@/lib/i18n/sun-kudos-copy-types";
import { ArrowUpRightIcon } from "../../site/site-icons";
import { PenIcon, SendIcon } from "./card-icons";
import { KudosCardGallery } from "./kudos-card-gallery";
import { KudosCardHashtags } from "./kudos-card-hashtags";
import { KudosAnonymousSenderBlock } from "./kudos-anonymous-sender-block";
import { KudosPersonBlock } from "./kudos-person-block";
import { KudosRichBody } from "./kudos-rich-body";

export type KudosCardVariant = "highlight" | "feed";

/** Card labels plus the anonymous-sender default (integration adds it to `SunKudosCopy["card"]`). */
export type KudosCardCopy = SunKudosCopy["card"] & { anonymousSender?: string };

// Shown when the copy has no `anonymousSender` yet and the sender typed no alias.
const DEFAULT_ANONYMOUS_SENDER = "Người gửi ẩn danh";

export type KudosCardViewProps = {
  /** highlight: 3-line body, "Xem chi tiết", no gallery. feed: 5-line body, gallery, no "Xem chi tiết". */
  variant: KudosCardVariant;
  card: KudosCard;
  links: KudosCardLinks;
  copy: KudosCardCopy;
  /** Rendered inside the actions row (left): the stateful heart button. */
  heartSlot: ReactNode;
  /** Rendered inside the actions row (right): the stateful Copy Link button. */
  copyLinkSlot: ReactNode;
};

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00101A]";
// The feed's stretched link is empty, so its focus ring is drawn on the ::after that covers the card.
const FOCUS_STRETCH =
  "focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-[#00101A]";
// One stretched link per card (::after covers the article); every other control is relative z-10.
const STRETCH = "after:absolute after:inset-0";

const ROOT: Record<KudosCardVariant, string> = {
  highlight: "max-w-[528px] rounded-2xl border-4 border-[#FFEA9E] px-6 pt-6 pb-4", // mm:2940:13465
  feed: "max-w-[680px] rounded-3xl px-10 pt-10 pb-4", // mm:3127:21871
};

// Kudos card (F006 FR-207, FR-211..214, BR-003, BR-007). Stateless: hrefs, copy
// and the interactive slots come from the caller.
export function KudosCardView({ variant, card, links, copy, heartSlot, copyLinkSlot }: KudosCardViewProps) {
  const isFeed = variant === "feed";
  const heroLabels = copy.heroLabels;
  return (
    <article className={`relative flex w-full flex-col gap-4 bg-[#FFF8E1] text-[#00101A] ${ROOT[variant]}`}>
      {/* mm:I3127:21871;256:4857 */}
      <div className="flex items-start justify-between gap-6">
        {card.sender ? (
          <KudosPersonBlock
            person={card.sender}
            href={links.senderHref}
            heroLabel={heroLabels[card.sender.tier]}
            starTooltips={copy.starTooltips}
          />
        ) : (
          <KudosAnonymousSenderBlock alias={card.senderAlias ?? copy.anonymousSender ?? DEFAULT_ANONYMOUS_SENDER} />
        )}
        {/* mm:I3127:21871;256:5161 */}
        <div aria-hidden="true" className="flex shrink-0 py-4">
          {/* mm:I3127:21871;256:5147 */}
          <SendIcon width={32} height={32} />
        </div>
        <KudosPersonBlock
          person={card.receiver}
          href={links.receiverHref}
          heroLabel={heroLabels[card.receiver.tier]}
          starTooltips={copy.starTooltips}
        />
      </div>
      {/* mm:I3127:21871;256:5192 */}
      <hr className="h-px w-full border-0 bg-[#FFEA9E]" />
      {/* mm:I3127:21871;256:5645 */}
      <div className="flex flex-col gap-4">
        {/* mm:I3127:21871;256:5229 */}
        <p className="text-base leading-6 font-bold tracking-[0.5px] text-[#999]">{card.timeLabel}</p>
        {card.title ? (
          // mm:I3127:21871;2234:33038
          <div className="relative flex min-h-8 items-center justify-center">
            {/* mm:I3127:21871;2234:33039 */}
            {links.titleHref ? (
              <Link
                href={links.titleHref}
                replace
                scroll={false}
                className={`relative z-10 text-center text-base leading-6 font-bold tracking-[0.5px] hover:underline ${FOCUS}`}
              >
                {card.title}
              </Link>
            ) : (
              <span className="text-center text-base leading-6 font-bold tracking-[0.5px]">{card.title}</span>
            )}
            {isFeed ? (
              // mm:I3127:21871;2234:33040
              <PenIcon aria-hidden="true" width={32} height={32} className="absolute right-0" />
            ) : null}
          </div>
        ) : null}
        {/* mm:I3127:21871;662:11382 */}
        <div className="rounded-xl border border-[#FFEA9E] bg-[#FFEA9E]/40 px-6 py-4">
          {/* mm:I3127:21871;256:5156 */}
          {/* Body links must be real <a>, so the feed's stretched detail link is a sibling, not the wrapper. */}
          {isFeed ? (
            <Link href={links.detailHref} aria-label={copy.viewDetail} className={`${STRETCH} ${FOCUS_STRETCH}`} />
          ) : null}
          <KudosRichBody
            blocks={card.bodyBlocks}
            className={`${isFeed ? "line-clamp-5" : "line-clamp-3"} text-justify text-xl leading-8 font-bold whitespace-pre-line`}
          />
        </div>
        {isFeed ? <KudosCardGallery images={card.images} /> : null}
        <KudosCardHashtags hashtags={card.hashtags} hrefs={links.hashtagHrefs} />
      </div>
      {/* mm:I3127:21871;256:7496 */}
      <hr className="h-px w-full border-0 bg-[#FFEA9E]" />
      {/* mm:I3127:21871;256:5194 */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <div className="relative z-10">{heartSlot}</div>
        {/* Narrow cards: the two actions drop to their own row as whole buttons (labels never wrap). */}
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2 [&_a]:whitespace-nowrap [&_button]:whitespace-nowrap max-sm:[&_button]:px-2">
          <div className="relative z-10">{copyLinkSlot}</div>
          {isFeed ? null : (
            // mm:2940:13465;335:9663
            <Link
              href={links.detailHref}
              className={`inline-flex h-14 items-center gap-1 rounded p-4 max-sm:px-2 text-base leading-6 font-bold tracking-[0.15px] transition-colors duration-200 hover:bg-[#FFEA9E]/40 motion-reduce:transition-none ${STRETCH} ${FOCUS}`}
            >
              <span>{copy.viewDetail}</span>
              <ArrowUpRightIcon />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
