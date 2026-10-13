import Link from "next/link";
import type { KudosPerson } from "@/lib/kudos/kudos-card-types";
import type { SunKudosCopy } from "@/lib/i18n/sun-kudos-copy-types";
import { KudosHeroBadge } from "./kudos-hero-badge";
import { KudosPersonAvatar } from "./kudos-person-avatar";
import { KudosStarsTooltip } from "./kudos-stars-tooltip";

export type KudosPersonBlockProps = {
  person: KudosPerson;
  /** Profile href, or `/login` for guests (computed by the caller). */
  href: string;
  /** Localised hero label for `person.tier`. */
  heroLabel: string;
  starTooltips: SunKudosCopy["card"]["starTooltips"];
};

// Sender / receiver block: avatar, name, department code, hero badge + stars.
// Sits above the card's stretched detail link (relative z-10).
export function KudosPersonBlock({ person, href, heroLabel, starTooltips }: KudosPersonBlockProps) {
  return (
    // mm:I3127:21871;256:4858
    <div className="relative z-10 flex min-w-0 flex-1 flex-col items-center justify-center gap-[13px]">
      {/* mm:I3127:21871;256:4858;256:4734 */}
      <Link href={href} aria-label={person.name} className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00101A]">
        <KudosPersonAvatar name={person.name} avatarUrl={person.avatarUrl} />
      </Link>
      {/* mm:I3127:21871;256:4858;256:4737 */}
      <div className="flex w-full flex-col items-center gap-0.5">
        {/* mm:I3127:21871;256:4858;256:4735 */}
        <Link
          href={href}
          className="max-w-full truncate text-center text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00101A]"
        >
          {person.name}
        </Link>
        {/* mm:I3127:21871;256:4858;256:4741 */}
        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
          {person.department ? (
            <>
              {/* mm:I3127:21871;256:4858;256:4751 */}
              <span className="text-sm leading-5 font-bold tracking-[0.1px] text-[#999]">{person.department}</span>
              {/* mm:I3127:21871;256:4858;256:4754 */}
              <span aria-hidden="true" className="size-1 rounded-full bg-[#999] opacity-40" />
            </>
          ) : null}
          <KudosHeroBadge tier={person.tier} label={heroLabel} />
          <KudosStarsTooltip stars={person.stars} tooltips={starTooltips} />
        </div>
      </div>
    </div>
  );
}
