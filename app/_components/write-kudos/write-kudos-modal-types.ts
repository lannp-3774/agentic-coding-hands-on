import type { KeyboardEvent, Ref } from "react";
import type {
  MarkdownFormat,
  SunnerOption,
  WriteKudosErrorCode,
  WriteKudosFieldErrors,
  WriteKudosImage,
} from "@/lib/kudos/write-kudos-types";

/** Fields with a length cap; each one's "too long" message quotes its own limit. */
export type WriteKudosLengthField = "title" | "body" | "anonymousName";

/** Every visible or spoken string; the integration step maps VN/EN copy onto it. */
export type WriteKudosModalLabels = {
  /** Dialog title (A); also the dialog's accessible name. */
  title: string;
  recipientLabel: string;
  recipientPlaceholder: string;
  /** Accessible name of the suggestion listbox. */
  recipientListLabel: string;
  recipientNoResults: string;
  titleFieldLabel: string;
  titleFieldPlaceholder: string;
  /** Two helper lines separated by "\n". */
  titleFieldHelper: string;
  /** Accessible name of the toolbar group (C). */
  toolbarLabel: string;
  /** Accessible names of the toolbar buttons C.1–C.6. */
  toolbar: Record<MarkdownFormat, string>;
  communityStandards: string;
  /** Accessible name of the content textarea (D). */
  bodyLabel: string;
  bodyPlaceholder: string;
  /** D.1 hint under the textarea. */
  mentionHint: string;
  mentionListLabel: string;
  hashtagLabel: string;
  /** Text next to the "+" icon of the add button. */
  hashtagAdd: string;
  /** "Tối đa 5" note under the add label. */
  hashtagLimitNote: string;
  hashtagPickerLabel: string;
  imageLabel: string;
  imageAdd: string;
  imageLimitNote: string;
  /** Alt prefix of a thumbnail; the view appends its 1-based position. */
  imageAlt: string;
  /** Verb of every remove button; the view appends the chip label or image name ("Xóa Dedicated"). */
  removeAction: string;
  anonymousLabel: string;
  /** Accessible name of the optional alias textbox; must mention "ẩn danh". */
  anonymousNameLabel: string;
  anonymousNamePlaceholder: string;
  /** Under the checkbox while `anonymous.locked` (a guest must send anonymously). */
  anonymousLockedHint: string;
  cancel: string;
  send: string;
  errors: Record<WriteKudosErrorCode, string>;
  /** "Too long" per capped field (Danh hiệu 50, content 2000, alias 50); wins over `errors.tooLong`. */
  tooLong: Record<WriteKudosLengthField, string>;
};

/** One hashtag offered by the picker (public.hashtags row). */
export type WriteKudosHashtagOption = {
  slug: string;
  label: string;
};

/** Keyboard handlers (arrows, Enter, Escape for the popups) stay with the integration. */
export type InputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => void;
export type TextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => void;

export type WriteKudosRecipientProps = {
  /** Text in the search input (the picked Sunner's name after a pick). */
  value: string;
  /** Listbox visible; with no `options` it renders the "no results" row. */
  open: boolean;
  options: SunnerOption[];
  /** Highlighted option for the arrow keys; -1 for none. */
  activeIndex: number;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onKeyDown: InputKeyDown;
  onSelect: (option: SunnerOption) => void;
};

export type WriteKudosTitleProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
};

export type WriteKudosBodyProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  /** Caret/selection moved; the integration re-evaluates the "@" trigger. */
  onSelectionChange: () => void;
  onKeyDown: TextareaKeyDown;
  /** Toolbar action; the Link URL prompt (window.prompt) is the integration's job. */
  onFormat: (format: MarkdownFormat) => void;
  mention: {
    open: boolean;
    options: SunnerOption[];
    activeIndex: number;
    onSelect: (option: SunnerOption) => void;
  };
};

export type WriteKudosHashtagsProps = {
  /** All hashtags in `sort_order`; selected ones are not offered again. */
  options: WriteKudosHashtagOption[];
  selected: WriteKudosHashtagOption[];
  max: number;
  pickerOpen: boolean;
  onPickerToggle: () => void;
  /** Escape, or focus leaving the group. */
  onPickerClose: () => void;
  onAdd: (option: WriteKudosHashtagOption) => void;
  onRemove: (slug: string) => void;
};

export type WriteKudosImagesProps = {
  items: WriteKudosImage[];
  max: number;
  /** Files chosen in the native chooser (the view resets the input afterwards). */
  onFilesSelected: (files: File[]) => void;
  onRemove: (key: string) => void;
};

export type WriteKudosAnonymousProps = {
  checked: boolean;
  /** A guest (not logged in): the checkbox stays checked and disabled, with the hint. */
  locked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Alias text; the textbox only exists while `checked`. */
  name: string;
  onNameChange: (name: string) => void;
  onNameBlur: () => void;
};

export type WriteKudosModalViewProps = {
  labels: WriteKudosModalLabels;
  recipient: WriteKudosRecipientProps;
  title: WriteKudosTitleProps;
  body: WriteKudosBodyProps;
  /** Ref of the content textarea; the integration reads/writes the selection through it. Kept outside `body` so the React-compiler ref lint does not taint the whole object. */
  bodyTextareaRef: Ref<HTMLTextAreaElement>;
  hashtags: WriteKudosHashtagsProps;
  images: WriteKudosImagesProps;
  anonymous: WriteKudosAnonymousProps;
  /** One error code per field; the view renders red state + message. */
  errors: WriteKudosFieldErrors;
  /** Gửi enabled only when true (and not `submitting`). */
  canSubmit: boolean;
  /** Gửi shows a spinner and is disabled. */
  submitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
};
