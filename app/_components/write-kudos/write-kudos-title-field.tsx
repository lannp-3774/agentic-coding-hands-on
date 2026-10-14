import { useId } from "react";
import type { WriteKudosFieldErrors } from "@/lib/kudos/write-kudos-types";
import { FieldError, FieldLabel, INPUT_TEXT_CLASS, controlBorder, lengthFieldError } from "./write-kudos-field-parts";
import type { WriteKudosModalLabels, WriteKudosTitleProps } from "./write-kudos-modal-types";

type Props = {
  labels: WriteKudosModalLabels;
  title: WriteKudosTitleProps;
  errors: WriteKudosFieldErrors;
};

/** "Danh hiệu *" label, text input and the two helper lines (Figma Frame 552). */
export function WriteKudosTitleField({ labels, title, errors }: Props) {
  const id = useId();
  const inputId = `${id}-input`;
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const code = errors.title;

  return (
    // mm:I520:11647;1688:10448 — Frame 552
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
      {/* mm:I520:11647;1688:10436 — Title (vertically centred on the 56px input) */}
      <FieldLabel htmlFor={inputId} required className="sm:mt-3.5 sm:w-[142px]">
        {labels.titleFieldLabel}
      </FieldLabel>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* mm:I520:11647;1688:10437 — Button (text field) */}
        <div className={`flex h-14 items-center rounded-lg border bg-white px-6 ${controlBorder(Boolean(code))}`}>
          <input
            id={inputId}
            type="text"
            autoComplete="off"
            aria-invalid={code ? true : undefined}
            aria-describedby={code ? `${helperId} ${errorId}` : helperId}
            placeholder={labels.titleFieldPlaceholder}
            value={title.value}
            onChange={(event) => title.onChange(event.target.value)}
            onBlur={title.onBlur}
            className={INPUT_TEXT_CLASS}
          />
        </div>
        {/* mm:I520:11647;1688:10447 — helper lines */}
        {/* Figma's Frame 552 is 104px tall while its two-line helper runs 6px past it, so the block below starts 26px after the text. */}
        <p id={helperId} className="sm:-mb-1.5 text-base leading-6 font-bold tracking-[0.15px] whitespace-pre-line text-[#999]">
          {labels.titleFieldHelper}
        </p>
        <FieldError id={errorId} message={lengthFieldError(labels, "title", code)} />
      </div>
    </div>
  );
}
