import { KudosPenIcon } from "./banner-icons";

// Both pills share the Figma "Details/SecondaryButton" look: 1px #998C5F border,
// #FFEA9E at 10%, 68px radius, 72px high (24px padding + 24px line).
export const KUDOS_PILL_CLASS =
  "flex min-h-[72px] w-full cursor-pointer items-center gap-4 rounded-[68px] border border-[#998C5F] bg-[#FFEA9E]/10 px-4 py-6 text-left text-base leading-6 font-bold tracking-[0.15px] text-white transition-colors duration-200 hover:bg-[#FFEA9E]/20 focus-visible:bg-[#FFEA9E]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none";

export type KudosSendButtonProps = {
  /** Hint text; also the button's accessible name (Figma A.1, 2940:13449). */
  label: string;
  /** Omitted: the button is inert (server-rendered default). A client launcher passes it. */
  onClick?: () => void;
};

/**
 * Send-kudos pill (A.1). Presentational with no hooks, so it renders on the
 * server as the inert default and a client launcher can import it to attach
 * `onClick` without making the banner a client component.
 */
export function KudosSendButton({ label, onClick }: KudosSendButtonProps) {
  return (
    // mm:2940:13449 — A.1_Button ghi nhận (738 of 1152)
    <button type="button" onClick={onClick} className={`${KUDOS_PILL_CLASS} md:flex-[738]`}>
      {/* mm:I2940:13449;186:2759 — MM_MEDIA_Pen */}
      <KudosPenIcon className="shrink-0" />
      {/* mm:I2940:13449;186:2760 */}
      <span>{label.trim()}</span>
    </button>
  );
}
