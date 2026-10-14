import Link from "next/link";
import { useId, type ComponentType, type Ref, type SVGProps } from "react";
import type { MarkdownFormat, WriteKudosFieldErrors } from "@/lib/kudos/write-kudos-types";
import { FieldError, lengthFieldError } from "./write-kudos-field-parts";
import {
  WriteKudosBoldIcon,
  WriteKudosItalicIcon,
  WriteKudosLinkIcon,
  WriteKudosNumberListIcon,
  WriteKudosQuoteIcon,
  WriteKudosStrikethroughIcon,
} from "./write-kudos-icons";
import type { WriteKudosBodyProps, WriteKudosModalLabels } from "./write-kudos-modal-types";
import { WriteKudosSunnerListbox, sunnerOptionId } from "./write-kudos-sunner-listbox";

type Props = {
  labels: WriteKudosModalLabels;
  body: WriteKudosBodyProps;
  textareaRef: Ref<HTMLTextAreaElement>;
  errors: WriteKudosFieldErrors;
};

// Figma C.1–C.6 in design order (mm:I520:11647;520:9881 / 662:11119 / 662:11213 / 662:10376 / 662:10507 / 662:10647).
const TOOLS: { format: MarkdownFormat; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { format: "bold", Icon: WriteKudosBoldIcon },
  { format: "italic", Icon: WriteKudosItalicIcon },
  { format: "strike", Icon: WriteKudosStrikethroughIcon },
  { format: "orderedList", Icon: WriteKudosNumberListIcon },
  { format: "link", Icon: WriteKudosLinkIcon },
  { format: "quote", Icon: WriteKudosQuoteIcon },
];

// Below `sm` the six buttons share the row (min-w-0, no side padding) and the link wraps onto its own line;
// from `sm` up they are the fixed 56x40 Figma buttons beside the link.
const TOOL_BUTTON =
  "flex h-10 min-w-0 flex-1 cursor-pointer items-center justify-center border border-[#998C5F] px-0 py-2.5 text-[#00101A] sm:w-14 sm:flex-none sm:px-4 transition-colors duration-200 hover:bg-[#FFEA9E]/40 focus-visible:bg-[#FFEA9E]/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none";

/** C toolbar + D textarea + D.1 hint (Figma "Nhập kudo"), with the "@" mention popup. */
export function WriteKudosEditor({ labels, body, textareaRef, errors }: Props) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const mentionId = `${id}-mentions`;
  const code = errors.body;
  const mentionOpen = body.mention.open && body.mention.options.length > 0;
  const activeId = mentionOpen && body.mention.activeIndex >= 0 ? sunnerOptionId(mentionId, body.mention.activeIndex) : undefined;

  return (
    // mm:I520:11647;520:9875 — Nhập kudo
    <div className="flex w-full flex-col gap-1">
      <div className="relative">
        {/* mm:I520:11647;520:9877 — mms_C_Chức năng */}
        <div role="toolbar" aria-label={labels.toolbarLabel} className="flex w-full flex-wrap items-stretch sm:h-10 sm:flex-nowrap">
          {TOOLS.map(({ format, Icon }, index) => (
            // mm:I520:11647 — mms_C.n button
            <button
              key={format}
              type="button"
              aria-label={labels.toolbar[format]}
              // keep the caret/selection in the textarea while a toolbar button is pressed
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => body.onFormat(format)}
              className={`${TOOL_BUTTON} ${index === 0 ? "rounded-tl-lg" : ""} ${index === TOOLS.length - 1 ? "rounded-tr-lg sm:rounded-tr-none" : ""}`}
            >
              <Icon />
            </button>
          ))}
          {/* mm:I520:11647;3053:11619 — "Tiêu chuẩn cộng đồng" */}
          <Link
            href="/standards"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 min-w-0 basis-full items-center justify-center border sm:flex-1 sm:rounded-tr-lg border border-[#998C5F] px-4 py-2.5 text-base leading-6 font-bold tracking-[0.15px] text-[#E46060] underline transition-colors duration-200 hover:bg-[#FFEA9E]/40 focus-visible:bg-[#FFEA9E]/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none"
          >
            {labels.communityStandards}
          </Link>
        </div>
        {/* mm:I520:11647;520:9886 — mms_D_text filed */}
        <textarea
          ref={textareaRef}
          aria-label={labels.bodyLabel}
          aria-invalid={code ? true : undefined}
          aria-describedby={code ? `${hintId} ${errorId}` : hintId}
          aria-controls={mentionOpen ? mentionId : undefined}
          aria-activedescendant={activeId}
          placeholder={labels.bodyPlaceholder.trim()}
          value={body.value}
          onChange={(event) => body.onChange(event.target.value)}
          onBlur={body.onBlur}
          onKeyDown={body.onKeyDown}
          onKeyUp={body.onSelectionChange}
          onClick={body.onSelectionChange}
          className={`block h-[200px] min-h-[120px] w-full resize-y rounded-b-lg border bg-white pr-6 pl-6 text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] outline-none placeholder:text-[#999] focus-visible:outline-2 focus-visible:-outline-offset-2 ${
            code ? "border-[#CF1322] focus-visible:outline-[#CF1322]" : "border-[#998C5F] focus-visible:outline-[#FFEA9E]"
          }`}
        />
        {mentionOpen ? (
          <WriteKudosSunnerListbox
            id={mentionId}
            label={labels.mentionListLabel}
            options={body.mention.options}
            activeIndex={body.mention.activeIndex}
            onSelect={body.mention.onSelect}
            className="top-full left-0 mt-1 max-w-80"
          />
        ) : null}
      </div>
      {/* mm:I520:11647;520:9887 — mms_D.1_Gợi ý */}
      <p id={hintId} className="text-center text-base leading-6 font-bold tracking-[0.5px] text-[#00101A]">
        {labels.mentionHint}
      </p>
      <FieldError id={errorId} message={lengthFieldError(labels, "body", code)} />
    </div>
  );
}
