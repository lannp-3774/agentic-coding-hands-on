import type { ReactNode } from "react";
import type { WriteKudosErrorCode } from "@/lib/kudos/write-kudos-types";
import type { WriteKudosLengthField, WriteKudosModalLabels } from "./write-kudos-modal-types";

// Shared look of the "Viết Kudo" fields (Figma 520:11602): Montserrat 700, ink #00101A,
// field border #998C5F, white fill, placeholder #999, required star #CF1322.
export const FIELD_LABEL_CLASS = "text-[22px] leading-7 font-bold text-[#00101A]";

/** Border + focus ring of a text control; red while it carries an error. */
export function controlBorder(hasError: boolean): string {
  return hasError
    ? "border-[#CF1322] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#CF1322]"
    : "border-[#998C5F] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#FFEA9E]";
}

/** Input text look shared by every single-line field. */
export const INPUT_TEXT_CLASS =
  "w-full min-w-0 bg-transparent text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] outline-none placeholder:text-[#999]";

export function RequiredMark() {
  return (
    // mm:I520:11647;520:9872;416:5547
    <span aria-hidden="true" className="ml-0.5 text-base leading-5 font-bold text-[#CF1322]">
      *
    </span>
  );
}

type FieldLabelProps = {
  id?: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

/** Field title (22px). A real <label> when `htmlFor` is set, otherwise a span a group names itself from. */
export function FieldLabel({ id, htmlFor, required, className = "", children }: FieldLabelProps) {
  const content = (
    <>
      {children}
      {required ? <RequiredMark /> : null}
    </>
  );
  const classes = `${FIELD_LABEL_CLASS} flex shrink-0 items-center ${className}`;
  return htmlFor ? (
    <label id={id} htmlFor={htmlFor} className={classes}>
      {content}
    </label>
  ) : (
    <span id={id} className={classes}>
      {content}
    </span>
  );
}

type FieldErrorProps = {
  id: string;
  message: string | null;
  /** Announce immediately (image refusals) instead of through aria-describedby only. */
  alert?: boolean;
};

/** Message of a capped field's error; "too long" quotes that field's own limit. */
export function lengthFieldError(
  labels: WriteKudosModalLabels,
  field: WriteKudosLengthField,
  code: WriteKudosErrorCode | undefined,
): string | null {
  if (!code) return null;
  return code === "tooLong" ? labels.tooLong[field] : labels.errors[code];
}

export function FieldError({ id, message, alert }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} role={alert ? "alert" : undefined} className="text-sm leading-5 font-bold text-[#CF1322]">
      {message}
    </p>
  );
}
