import { useId, type FormEvent, type KeyboardEvent } from "react";
import { montserrat } from "@/app/_components/saa-fonts";
import { WriteKudosAnonymousField } from "./write-kudos-anonymous-field";
import { WriteKudosEditor } from "./write-kudos-editor";
import { WriteKudosFooter } from "./write-kudos-footer";
import { WriteKudosHashtagField } from "./write-kudos-hashtag-field";
import { WriteKudosImageField } from "./write-kudos-image-field";
import type { WriteKudosModalViewProps } from "./write-kudos-modal-types";
import { WriteKudosRecipientField } from "./write-kudos-recipient-field";
import { WriteKudosTitleField } from "./write-kudos-title-field";

/**
 * "Viết Kudo" dialog (MoMorph ihQ26W78P2 / 520:11602): 80% ink mask, 752px cream panel,
 * 24px radius, 40px padding, 32px gaps. Pure and controlled — every value and callback comes
 * in through props. Focus trapping, scroll lock and restoring focus are the caller's job; the
 * view only closes on Escape when no inner popup already handled the key.
 */
export function WriteKudosModalView({
  labels,
  recipient,
  title,
  body,
  bodyTextareaRef,
  hashtags,
  images,
  anonymous,
  errors,
  canSubmit,
  submitting,
  onSubmit,
  onCancel,
}: WriteKudosModalViewProps) {
  const titleId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit && !submitting) onSubmit();
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && !event.defaultPrevented) onCancel();
  };

  return (
    // mm:520:11646 — Mask
    <div
      className={`${montserrat.variable} fixed inset-0 z-50 overflow-y-auto bg-[#00101A]/80 font-[family-name:var(--font-login-montserrat)]`}
      onKeyDown={handleKeyDown}
    >
      <div className="flex min-h-full items-start justify-center p-2.5 sm:items-center">
        {/* mm:520:11647 — Viết KUDO */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="w-full max-w-[752px] rounded-3xl bg-[#FFF8E1] p-5 text-[#00101A] sm:p-10"
        >
          <form noValidate onSubmit={handleSubmit} className="flex w-full flex-col items-start gap-8">
            {/* mm:I520:11647;520:9870 — mms_A_title */}
            <h2 id={titleId} className="w-full text-center text-[32px] leading-10 font-bold text-[#00101A]">
              {labels.title}
            </h2>
            <WriteKudosRecipientField labels={labels} recipient={recipient} errors={errors} />
            <WriteKudosTitleField labels={labels} title={title} errors={errors} />
            {/* mm:I520:11647;520:9874 — Content (editor, hashtags, images) */}
            <div className="flex w-full flex-col gap-6">
              <WriteKudosEditor labels={labels} body={body} textareaRef={bodyTextareaRef} errors={errors} />
              <WriteKudosHashtagField labels={labels} hashtags={hashtags} errors={errors} />
              <WriteKudosImageField labels={labels} images={images} errors={errors} />
            </div>
            <WriteKudosAnonymousField labels={labels} anonymous={anonymous} errors={errors} />
            <WriteKudosFooter
              cancelLabel={labels.cancel}
              sendLabel={labels.send}
              canSend={canSubmit}
              submitting={submitting}
              onCancel={onCancel}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
