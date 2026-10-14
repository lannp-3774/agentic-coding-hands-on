import { useId, type FocusEvent, type KeyboardEvent } from "react";
import type { WriteKudosFieldErrors } from "@/lib/kudos/write-kudos-types";
import { FieldError, FieldLabel } from "./write-kudos-field-parts";
import { WriteKudosCloseIcon, WriteKudosPlusIcon } from "./write-kudos-icons";
import type { WriteKudosHashtagsProps, WriteKudosModalLabels } from "./write-kudos-modal-types";

type Props = {
  labels: WriteKudosModalLabels;
  hashtags: WriteKudosHashtagsProps;
  errors: WriteKudosFieldErrors;
};

/** E — "Hashtag *" label, chips, "+ Hashtag" button with its picker listbox, error/max message. */
export function WriteKudosHashtagField({ labels, hashtags, errors }: Props) {
  const id = useId();
  const labelId = `${id}-label`;
  const listId = `${id}-list`;
  const errorId = `${id}-error`;
  const atMax = hashtags.selected.length >= hashtags.max;
  const code = errors.hashtags ?? (atMax ? "maxHashtags" : undefined);
  const chosen = new Set(hashtags.selected.map((tag) => tag.slug));
  const offered = hashtags.options.filter((option) => !chosen.has(option.slug));
  const pickerOpen = hashtags.pickerOpen && !atMax;

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (hashtags.pickerOpen && !event.currentTarget.contains(event.relatedTarget)) hashtags.onPickerClose();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape" || !hashtags.pickerOpen) return;
    event.preventDefault();
    hashtags.onPickerClose();
  };

  return (
    // mm:I520:11647;520:9890 — mms_E_Frame 536
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
      {/* mm:I520:11647;520:9891 — mms_E.1_Title */}
      <FieldLabel id={labelId} required className="sm:min-h-12 sm:w-[108px]">
        {labels.hashtagLabel}
      </FieldLabel>
      {/* mm:I520:11647;662:8595 — mms_E.2_Tag Group */}
      <div role="group" aria-labelledby={labelId} aria-describedby={code ? errorId : undefined} className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          {hashtags.selected.map((tag) => (
            <span
              key={tag.slug}
              className="inline-flex h-12 items-center gap-1 rounded-lg border border-[#998C5F] bg-white pr-2 pl-3 text-base leading-6 font-bold text-[#00101A]"
            >
              #{tag.label}
              <button
                type="button"
                aria-label={`${labels.removeAction} ${tag.label}`}
                onClick={() => hashtags.onRemove(tag.slug)}
                className="flex size-6 cursor-pointer items-center justify-center rounded-full text-[#00101A] transition-colors duration-200 hover:bg-[#FFEA9E]/60 focus-visible:outline-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none"
              >
                <WriteKudosCloseIcon className="size-5" />
              </button>
            </span>
          ))}
          {/* mm:I520:11647;662:8910 — Frame 541 (add button + picker) */}
          <div className="relative" onBlur={onBlur} onKeyDown={onKeyDown}>
            {/* mm:I520:11647;662:8911 — Button */}
            <button
              type="button"
              disabled={atMax}
              aria-haspopup="listbox"
              aria-expanded={pickerOpen}
              aria-controls={pickerOpen ? listId : undefined}
              onClick={hashtags.onPickerToggle}
              className="flex h-12 cursor-pointer items-center gap-1 rounded-lg border border-[#998C5F] bg-white px-2 py-1 text-left transition-colors duration-200 hover:bg-[#FFEA9E]/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
            >
              {/* mm:I520:11647;662:8911;186:2759 — MM_MEDIA_Plus */}
              <WriteKudosPlusIcon className="shrink-0 text-[#998C5F]" />
              <span className="flex flex-col">
                <span className="text-base leading-[22px] font-bold tracking-[0.15px] text-[#00101A]">{labels.hashtagAdd}</span>
                <span className="text-[11px] leading-4 font-bold tracking-[0.5px] text-[#999]">{labels.hashtagLimitNote}</span>
              </span>
            </button>
            {pickerOpen ? (
              <ul
                id={listId}
                role="listbox"
                aria-label={labels.hashtagPickerLabel}
                className="absolute top-full left-0 z-20 mt-1 max-h-60 w-56 overflow-y-auto rounded-lg border border-[#998C5F] bg-white py-1 shadow-lg"
              >
                {offered.map((option) => (
                  <li
                    key={option.slug}
                    role="option"
                    aria-selected={false}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => hashtags.onAdd(option)}
                    className="cursor-pointer px-4 py-2 text-base leading-6 font-bold text-[#00101A] hover:bg-[#FFEA9E]/40"
                  >
                    #{option.label}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
        <FieldError id={errorId} message={code ? labels.errors[code] : null} />
      </div>
    </div>
  );
}
