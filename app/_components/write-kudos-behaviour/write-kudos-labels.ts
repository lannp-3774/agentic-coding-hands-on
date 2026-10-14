import type { WriteKudosModalLabels } from "@/app/_components/write-kudos/write-kudos-modal-types";
import type { WriteKudosCopy } from "@/lib/i18n/write-kudos-copy-types";
import { WRITE_KUDOS_LIMITS } from "@/lib/kudos/kudos-write-validation";

/** The text of a template before its first placeholder: "Xóa {label}" -> "Xóa". */
const beforePlaceholder = (template: string): string => template.replace(/\s*\{.*$/, "");

/** The "too long" copy with its `{max}` filled in. */
const tooLongWith = (copy: WriteKudosCopy, max: number): string => copy.errors.tooLong.replace("{max}", String(max));

/**
 * Maps the locale copy onto the labels of `WriteKudosModalView`. The view owns the
 * remove names ("Xóa" + chip label or "Ảnh đính kèm 1"), so only the template's
 * leading words are passed. Each capped field quotes its own limit in `tooLong`
 * (Danh hiệu and alias 50, content 2000); the generic `errors.tooLong` is never shown.
 */
export function toWriteKudosLabels(copy: WriteKudosCopy): WriteKudosModalLabels {
  const errors = { ...copy.errors, tooLong: tooLongWith(copy, WRITE_KUDOS_LIMITS.bodyMax) };
  const tooLong = {
    title: tooLongWith(copy, WRITE_KUDOS_LIMITS.titleMax),
    body: tooLongWith(copy, WRITE_KUDOS_LIMITS.bodyMax),
    anonymousName: tooLongWith(copy, WRITE_KUDOS_LIMITS.anonymousNameMax),
  };

  return {
    title: copy.title,
    recipientLabel: copy.recipient.label,
    recipientPlaceholder: copy.recipient.placeholder,
    recipientListLabel: copy.recipient.listLabel,
    recipientNoResults: copy.recipient.noResults,
    titleFieldLabel: copy.titleField.label,
    titleFieldPlaceholder: copy.titleField.placeholder,
    titleFieldHelper: copy.titleField.helper.join("\n"),
    toolbarLabel: copy.toolbar.label,
    toolbar: {
      bold: copy.toolbar.bold,
      italic: copy.toolbar.italic,
      strike: copy.toolbar.strike,
      orderedList: copy.toolbar.orderedList,
      link: copy.toolbar.link,
      quote: copy.toolbar.quote,
    },
    communityStandards: copy.toolbar.communityStandards,
    bodyLabel: copy.body.label,
    bodyPlaceholder: copy.body.placeholder,
    mentionHint: copy.body.hint,
    mentionListLabel: copy.body.mentionListLabel,
    hashtagLabel: copy.hashtags.label,
    hashtagAdd: copy.hashtags.add,
    hashtagLimitNote: copy.hashtags.maxNote,
    hashtagPickerLabel: copy.hashtags.listLabel,
    imageLabel: copy.images.label,
    imageAdd: copy.images.add,
    imageLimitNote: copy.images.maxNote,
    imageAlt: beforePlaceholder(copy.images.thumbnailAlt),
    removeAction: beforePlaceholder(copy.hashtags.remove),
    anonymousLabel: copy.anonymous.checkbox,
    anonymousNameLabel: copy.anonymous.nameLabel,
    anonymousNamePlaceholder: copy.anonymous.namePlaceholder,
    anonymousLockedHint: copy.anonymous.lockedHint,
    cancel: copy.actions.cancel,
    send: copy.actions.submit,
    errors,
    tooLong,
  };
}
