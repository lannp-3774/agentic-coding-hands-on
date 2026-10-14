import { KudosSearchIcon } from "./banner-icons";
import { KUDOS_PILL_CLASS, KudosSendButton } from "./kudos-send-button";
import type { KudosSendBarProps } from "./kudos-banner-types";

/**
 * Send-kudos bar (A.1) and the "Tìm kiếm profile Sunner" pill. The search pill
 * is inert per D013 (plain button, no handler, no href). The send pill is inert
 * too unless the caller passes `sendButton` (a client launcher that opens the
 * "Viết Kudo" modal). `relative` so the bar paints above the banner's key
 * visual that overflows into it.
 */
export function KudosSendBar({ placeholder, searchProfileLabel, sendButton }: KudosSendBarProps) {
  return (
    // mm:2940:13448 — Button chuc nang
    <div className="relative px-4 md:px-12 xl:px-36">
      <div className="mx-auto flex w-full max-w-[1152px] flex-col gap-4 md:flex-row md:gap-8">
        {/* mm:2940:13449 — A.1_Button ghi nhận (738 of 1152) */}
        {sendButton ?? <KudosSendButton label={placeholder} />}
        {/* mm:2940:13450 — Tìm kiếm sunner (381 of 1152) */}
        <button type="button" className={`${KUDOS_PILL_CLASS} md:flex-[381]`}>
          {/* mm:I2940:13450;186:2759 — MM_MEDIA_Search */}
          <KudosSearchIcon className="shrink-0" />
          {/* mm:I2940:13450;186:2760 */}
          <span>{searchProfileLabel}</span>
        </button>
      </div>
    </div>
  );
}
