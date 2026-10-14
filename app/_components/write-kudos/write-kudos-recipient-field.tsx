import { useId } from "react";
import type { WriteKudosFieldErrors } from "@/lib/kudos/write-kudos-types";
import { FieldError, FieldLabel, INPUT_TEXT_CLASS, controlBorder } from "./write-kudos-field-parts";
import { WriteKudosChevronDownIcon } from "./write-kudos-icons";
import type { WriteKudosModalLabels, WriteKudosRecipientProps } from "./write-kudos-modal-types";
import { WriteKudosSunnerListbox, sunnerOptionId } from "./write-kudos-sunner-listbox";

type Props = {
  labels: WriteKudosModalLabels;
  recipient: WriteKudosRecipientProps;
  errors: WriteKudosFieldErrors;
};

/** B — "Người nhận *" label + search combobox with the suggestion listbox. */
export function WriteKudosRecipientField({ labels, recipient, errors }: Props) {
  const id = useId();
  const inputId = `${id}-input`;
  const listId = `${id}-list`;
  const errorId = `${id}-error`;
  const code = errors.recipient;
  const hasOptions = recipient.open && recipient.options.length > 0;
  const activeId = hasOptions && recipient.activeIndex >= 0 ? sunnerOptionId(listId, recipient.activeIndex) : undefined;

  return (
    // mm:I520:11647;520:9871 — mms_B_Chọn người nhận
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      {/* mm:I520:11647;520:9872 — mms_B.1_Title */}
      <FieldLabel htmlFor={inputId} required className="sm:w-[146px]">
        {labels.recipientLabel}
      </FieldLabel>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="relative">
          {/* mm:I520:11647;520:9873 — mms_B.2_Search */}
          <div className={`flex h-14 items-center justify-between gap-2 rounded-lg border bg-white px-6 ${controlBorder(Boolean(code))}`}>
            <input
              id={inputId}
              type="text"
              role="combobox"
              autoComplete="off"
              aria-expanded={recipient.open}
              aria-controls={hasOptions ? listId : undefined}
              aria-autocomplete="list"
              aria-activedescendant={activeId}
              aria-invalid={code ? true : undefined}
              aria-describedby={code ? errorId : undefined}
              placeholder={labels.recipientPlaceholder}
              value={recipient.value}
              onChange={(event) => recipient.onChange(event.target.value)}
              onFocus={recipient.onFocus}
              onBlur={recipient.onBlur}
              onKeyDown={recipient.onKeyDown}
              className={INPUT_TEXT_CLASS}
            />
            {/* mm:I520:11647;520:9873;186:2761 — MM_MEDIA_Down */}
            <WriteKudosChevronDownIcon className="pointer-events-none shrink-0 text-[#00101A]" />
          </div>
          {hasOptions ? (
            <WriteKudosSunnerListbox
              id={listId}
              label={labels.recipientListLabel}
              options={recipient.options}
              activeIndex={recipient.activeIndex}
              onSelect={recipient.onSelect}
              className="top-full left-0 mt-1"
            />
          ) : null}
          {recipient.open && recipient.options.length === 0 ? (
            <div className="absolute top-full left-0 z-20 mt-1 w-full rounded-lg border border-[#998C5F] bg-white px-6 py-4 text-base leading-6 font-bold text-[#999] shadow-lg">
              {labels.recipientNoResults}
            </div>
          ) : null}
        </div>
        <FieldError id={errorId} message={code ? labels.errors[code] : null} />
      </div>
    </div>
  );
}
