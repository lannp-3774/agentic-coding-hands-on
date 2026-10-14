import type { WriteKudosErrorCode } from "@/lib/kudos/write-kudos-types";

// Shape of the "Viết Kudo" modal copy (F010, MoMorph ihQ26W78P2), one value per
// locale in `write-kudos-copy.ts`. Strings only (templates, no functions) so the
// object crosses the server/client boundary. Templates use `{label}`, `{n}` and
// `{max}`, filled per field by the labels builder. Accessible names here are the selector contract's
// locators (plans/261013-1628-write-kudos-modal/selector-contract.md).

export type WriteKudosCopy = {
  /** Dialog title and accessible name. */
  title: string;
  recipient: {
    label: string;
    placeholder: string;
    /** Name of the suggestions listbox. */
    listLabel: string;
    noResults: string;
  };
  titleField: {
    label: string;
    placeholder: string;
    /** Helper lines under the field (Figma). */
    helper: [string, string];
  };
  toolbar: {
    /** Name of the toolbar group. */
    label: string;
    bold: string;
    italic: string;
    strike: string;
    orderedList: string;
    link: string;
    quote: string;
    /** `window.prompt` text of the link button. */
    linkPrompt: string;
    communityStandards: string;
  };
  body: {
    /** Accessible name of the textarea (the placeholder is not a label). */
    label: string;
    placeholder: string;
    hint: string;
    /** Name of the @mention suggestions listbox. */
    mentionListLabel: string;
  };
  hashtags: {
    label: string;
    add: string;
    maxNote: string;
    listLabel: string;
    /** Chip remove button, "Xóa {label}" (contract: /^X(oá|óa)\b/ needs "Xóa"). */
    remove: string;
  };
  images: {
    label: string;
    add: string;
    maxNote: string;
    /** Thumbnail alt, "{n}" = position from 1. */
    thumbnailAlt: string;
    /** Thumbnail remove button, "Xóa ảnh {n}". */
    remove: string;
    uploading: string;
  };
  anonymous: {
    checkbox: string;
    nameLabel: string;
    namePlaceholder: string;
    /** Card alias when the anonymous name is empty. */
    defaultAlias: string;
    /** Under the checkbox when a guest (not logged in) must send anonymously. */
    lockedHint: string;
  };
  actions: { cancel: string; submit: string; sending: string };
  /** Field errors by code; `tooLong` takes `{max}`. */
  errors: Record<WriteKudosErrorCode, string>;
  toast: {
    sent: string;
    failed: string;
    noSunner: string;
    /** A guest's anonymous session could not be started, so the dialog did not open. */
    guestSessionFailed: string;
  };
};
