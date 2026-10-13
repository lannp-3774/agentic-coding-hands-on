import { KudosPenIcon, KudosSearchIcon } from "./banner-icons";
import type { KudosSendBarProps } from "./kudos-banner-types";

// Both pills share the Figma "Details/SecondaryButton" look: 1px #998C5F border,
// #FFEA9E at 10%, 68px radius, 72px high (24px padding + 24px line).
const PILL =
  "flex min-h-[72px] w-full cursor-pointer items-center gap-4 rounded-[68px] border border-[#998C5F] bg-[#FFEA9E]/10 px-4 py-6 text-left text-base leading-6 font-bold tracking-[0.15px] text-white transition-colors duration-200 hover:bg-[#FFEA9E]/20 focus-visible:bg-[#FFEA9E]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none";

/**
 * Send-kudos bar (A.1) and the "Tìm kiếm profile Sunner" pill. Both are inert
 * per D013: plain buttons, no handler, no href. `relative` so the bar paints
 * above the banner's key visual that overflows into it.
 */
export function KudosSendBar({ placeholder, searchProfileLabel }: KudosSendBarProps) {
  return (
    // mm:2940:13448 — Button chuc nang
    <div className="relative px-4 md:px-12 xl:px-36">
      <div className="mx-auto flex w-full max-w-[1152px] flex-col gap-4 md:flex-row md:gap-8">
        {/* mm:2940:13449 — A.1_Button ghi nhận (738 of 1152) */}
        <button type="button" className={`${PILL} md:flex-[738]`}>
          {/* mm:I2940:13449;186:2759 — MM_MEDIA_Pen */}
          <KudosPenIcon className="shrink-0" />
          {/* mm:I2940:13449;186:2760 */}
          <span>{placeholder.trim()}</span>
        </button>
        {/* mm:2940:13450 — Tìm kiếm sunner (381 of 1152) */}
        <button type="button" className={`${PILL} md:flex-[381]`}>
          {/* mm:I2940:13450;186:2759 — MM_MEDIA_Search */}
          <KudosSearchIcon className="shrink-0" />
          {/* mm:I2940:13450;186:2760 */}
          <span>{searchProfileLabel}</span>
        </button>
      </div>
    </div>
  );
}
