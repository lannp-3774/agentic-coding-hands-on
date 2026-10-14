import { useId } from "react";
import type { WriteKudosFieldErrors } from "@/lib/kudos/write-kudos-types";
import { FieldError, INPUT_TEXT_CLASS, controlBorder, lengthFieldError } from "./write-kudos-field-parts";
import type { WriteKudosAnonymousProps, WriteKudosModalLabels } from "./write-kudos-modal-types";

type Props = {
  labels: WriteKudosModalLabels;
  anonymous: WriteKudosAnonymousProps;
  errors: WriteKudosFieldErrors;
};

/**
 * G — "Gửi lời cám ơn và ghi nhận ẩn danh" checkbox and, while checked, the optional alias textbox.
 * `anonymous.locked` (a guest, not logged in): the checkbox stays checked and disabled, and a hint
 * under it, also its accessible description, says why.
 */
export function WriteKudosAnonymousField({ labels, anonymous, errors }: Props) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const code = errors.anonymousName;
  const { locked } = anonymous;

  return (
    // mm:I520:11647;520:14099 — mms_G_Gửi ẩn danh
    <div className="flex w-full flex-col gap-3">
      <label className={`flex items-center gap-4 ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}>
        {/* mm:I520:11647;520:14097 — Check box (24px, 4px radius, #999 border, white fill) */}
        <span className="relative size-6 shrink-0">
          <input
            type="checkbox"
            checked={anonymous.checked}
            disabled={locked}
            aria-describedby={locked ? hintId : undefined}
            onChange={(event) => anonymous.onCheckedChange(event.target.checked)}
            className="peer size-6 cursor-pointer appearance-none rounded border border-[#999] bg-white checked:border-[#998C5F] checked:bg-[#FFEA9E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] disabled:cursor-not-allowed"
          />
          {/* Stand-in tick (the Figma frame only draws the unchecked box). */}
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 24 24"
            fill="none"
            className="pointer-events-none absolute inset-0 hidden size-6 text-[#00101A] peer-checked:block"
          >
            <path d="M6 12.5L10.2 16.7L18 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        {/* mm:I520:11647;520:14095 */}
        <span className="text-[22px] leading-7 font-bold text-[#999]">{labels.anonymousLabel}</span>
      </label>
      {locked ? (
        // Not in Figma (guests act as Anonymous): the Danh hiệu helper-line look, aligned with the label.
        <p id={hintId} className="pl-10 text-base leading-6 font-bold tracking-[0.15px] text-[#999]">
          {labels.anonymousLockedHint}
        </p>
      ) : null}
      {anonymous.checked ? (
        <div className="flex flex-col gap-1 pl-10">
          <div className={`flex h-14 items-center rounded-lg border bg-white px-6 ${controlBorder(Boolean(code))}`}>
            <input
              type="text"
              autoComplete="off"
              aria-label={labels.anonymousNameLabel}
              aria-invalid={code ? true : undefined}
              aria-describedby={code ? errorId : undefined}
              placeholder={labels.anonymousNamePlaceholder}
              value={anonymous.name}
              onChange={(event) => anonymous.onNameChange(event.target.value)}
              onBlur={anonymous.onNameBlur}
              className={INPUT_TEXT_CLASS}
            />
          </div>
          <FieldError id={errorId} message={lengthFieldError(labels, "anonymousName", code)} />
        </div>
      ) : null}
    </div>
  );
}
