import Link from "next/link";
import type { GiftRecipient } from "@/lib/kudos/sidebar-types";
import { GiftRecipientAvatar } from "./gift-recipient-avatar";
import { SIDEBAR_CARD } from "./sidebar-styles";

type Props = {
  title: string;
  rows: GiftRecipient[];
  /** "Nhận được 1 {gift}". */
  lineTemplate: string;
  emptyMessage: string;
};

// mm:2940:13510 — D.3 gift list box, padding 24px 16px 24px 24px.
export function GiftRecipientsView({ title, rows, lineTemplate, emptyMessage }: Props) {
  return (
    <section className={`${SIDEBAR_CARD} flex flex-col items-center gap-4 py-6 pr-4 pl-6`}>
      {/* mm:2940:13513 — D.3.1 title, 22px bold #FFEA9E, centred */}
      <h2 className="m-0 w-full text-center text-[22px] leading-7 font-bold text-balance text-[#FFEA9E]">
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="m-0 w-full py-8 text-center text-base leading-6 font-bold text-white">
          {emptyMessage}
        </p>
      ) : (
        // mm:2940:13514 — list scrolls on its own: 5 rows (64px, 16px gap) visible, 2px #999 thumb
        <ul className="m-0 flex max-h-96 w-full list-none flex-col gap-4 overflow-y-auto p-0 pr-4 [scrollbar-color:#999_transparent] [scrollbar-width:thin]">
          {rows.map((row) => (
            // mm:2940:13516 .. 2940:13520 — D.3.2..D.3.6 recipient row
            <li key={row.boxId}>
              <Link
                href={row.href}
                className="flex h-16 items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E]"
              >
                <GiftRecipientAvatar name={row.name} avatarUrl={row.avatarUrl} />
                {/* mm:I2940:13516;256:7461 */}
                <span className="flex min-w-0 flex-col gap-0.5">
                  {/* mm:I2940:13516;256:7462 — Name */}
                  <span className="truncate text-[22px] leading-7 font-bold text-[#FFEA9E]">
                    {row.name}
                  </span>
                  {/* mm:I2940:13516;256:7472 — "Nhận được 1 <gift>" */}
                  <span className="truncate text-base leading-6 font-bold tracking-[0.15px] text-white">
                    {lineTemplate.replace("{gift}", row.giftName)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
