import { WriteKudosCloseIcon, WriteKudosSendIcon, WriteKudosSpinnerIcon } from "./write-kudos-icons";

type Props = {
  cancelLabel: string;
  sendLabel: string;
  /** Gửi is clickable (all required fields valid, not busy). */
  canSend: boolean;
  submitting: boolean;
  onCancel: () => void;
};

/**
 * H — Hủy (H.1) and Gửi (H.2, form submit). While `submitting`, Gửi shows a spinner and both
 * buttons are disabled. Hủy's 1px stroke is an inset ring: like the Figma stroke it does not add
 * to the 16/40 padding (146px wide).
 */
export function WriteKudosFooter({ cancelLabel, sendLabel, canSend, submitting, onCancel }: Props) {
  return (
    // mm:I520:11647;520:9905 — mms_H_Frame 538
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:gap-6">
      {/* mm:I520:11647;520:9906 — mms_H.1_Button */}
      <button
        type="button"
        onClick={onCancel}
        disabled={submitting}
        className="flex cursor-pointer items-center justify-center gap-2 rounded bg-[#FFEA9E]/10 px-10 py-4 text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] inset-ring inset-ring-[#998C5F] transition-[background-color,opacity] duration-200 hover:bg-[#FFEA9E]/30 focus-visible:bg-[#FFEA9E]/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#FFEA9E]/10 motion-reduce:transition-none"
      >
        {cancelLabel}
        {/* mm:I520:11647;520:9906;186:2761 — MM_MEDIA_Close */}
        <WriteKudosCloseIcon />
      </button>
      {/* mm:I520:11647;520:9907 — mms_H.2_Button */}
      <button
        type="submit"
        disabled={!canSend || submitting}
        aria-busy={submitting}
        className="flex h-[60px] min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#FFEA9E] p-4 text-[22px] leading-7 font-bold text-[#00101A] transition-[background-color,opacity] duration-200 hover:bg-[#FFE070] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#FFEA9E] motion-reduce:transition-none"
      >
        {sendLabel}
        {/* mm:I520:11647;520:9907;186:1766 — MM_MEDIA_Send */}
        {submitting ? <WriteKudosSpinnerIcon className="animate-spin motion-reduce:animate-none" /> : <WriteKudosSendIcon />}
      </button>
    </div>
  );
}
