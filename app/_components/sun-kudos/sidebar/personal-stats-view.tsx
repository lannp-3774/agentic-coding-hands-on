import type { PersonalStats } from "@/lib/kudos/sidebar-types";
import type { SunKudosCopy } from "@/lib/i18n/sun-kudos-copy-types";
import { IconFlame, IconOpenGift } from "./sidebar-icons";
import { SIDEBAR_CARD, SIDEBAR_GOLD_BUTTON } from "./sidebar-styles";

type Props = {
  /** Pre-formatted values ("0", "25" or "—" when stats are unavailable). */
  values: Record<keyof PersonalStats, string>;
  copy: SunKudosCopy["sidebar"];
  /** Figma draws an "x2" badge on the flame; no spec defines it, so it is opt-in. */
  showMultiplierBadge?: boolean;
};

type RowProps = { label: string; value: string; icon?: React.ReactNode };

// mm:2940:13491 / 2940:13492 / 3241:14882 / 2940:13495 / 2940:13496 — label + value row, 40px tall.
function StatRow({ label, value, icon }: RowProps) {
  return (
    <dl className="m-0 flex min-h-10 w-full items-center justify-between gap-2">
      <dt className="flex min-w-0 items-center text-[22px] font-bold leading-7 text-white">
        {label}
        {icon}
      </dt>
      <dd className="m-0 shrink-0 text-right text-[32px] font-bold leading-10 text-[#FFEA9E]">
        {value}
      </dd>
    </dl>
  );
}

// mm:3241:14931 — flame + optional "x2" badge (17.5px bold white, 1.04px black stroke).
function HeartsFlame({ showBadge }: { showBadge: boolean }) {
  return (
    <span className="relative ml-0.5 inline-block h-10 w-[34px] shrink-0">
      <IconFlame />
      {showBadge ? (
        // mm:3241:14933 — drawn via CSS content, not a text node, so the row's
        // text stays "Số tim bạn nhận được: <n>" for assistive tech and tests.
        <span
          aria-hidden="true"
          className="absolute top-[19px] left-[3px] flex h-[17.654px] w-[27px] items-center justify-center text-center text-[17.538px] leading-[23.385px] font-bold text-white [-webkit-text-stroke:1.04px_#000] [paint-order:stroke_fill] after:content-['x2']"
        />
      ) : null}
    </span>
  );
}

export function PersonalStatsView({ values, copy, showMultiplierBadge = false }: Props) {
  return (
    // mm:2940:13489 — D.1 stats box, 24px padding
    <section className={`${SIDEBAR_CARD} p-6`}>
      {/* mm:2940:13490 — rows, 16px gap */}
      <div className="flex flex-col items-center gap-4">
        <StatRow label={copy.received} value={values.received} />
        <StatRow label={copy.sent} value={values.sent} />
        <StatRow
          label={copy.hearts}
          value={values.hearts}
          icon={<HeartsFlame showBadge={showMultiplierBadge} />}
        />
        {/* mm:2940:13494 — D.1.5 divider, 1px #2E3940 */}
        <hr className="m-0 h-px w-full border-0 bg-[#2E3940]" />
        <StatRow label={copy.boxesOpened} value={values.boxesOpened} />
        <StatRow label={copy.boxesUnopened} value={values.boxesUnopened} />
        {/* mm:2940:13497 — D.1.8 "Mở Secret Box": no handler yet (clarifications) */}
        <button type="button" className={SIDEBAR_GOLD_BUTTON}>
          {copy.openBox}
          <IconOpenGift />
        </button>
      </div>
    </section>
  );
}
