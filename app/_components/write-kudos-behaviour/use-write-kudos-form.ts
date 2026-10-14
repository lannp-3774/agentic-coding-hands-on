"use client";

import { useState } from "react";
import type {
  WriteKudosHashtagOption,
  WriteKudosModalViewProps,
} from "@/app/_components/write-kudos/write-kudos-modal-types";
import {
  WRITE_KUDOS_LIMITS,
  hasFieldErrors,
  validateAnonymousName,
  validateBody,
  validateHashtags,
  validateRecipient,
  validateTitle,
} from "@/lib/kudos/kudos-write-validation";
import type {
  SendKudosInput,
  WriteKudosErrorCode,
  WriteKudosField,
  WriteKudosFieldErrors,
} from "@/lib/kudos/write-kudos-types";
import { useBodyEditor } from "./use-body-editor";
import { useKudosImageUploads } from "./use-kudos-image-uploads";
import { useRecipientField } from "./use-recipient-field";

type FormViewProps = Omit<WriteKudosModalViewProps, "labels" | "submitting" | "onSubmit" | "onCancel">;

export type WriteKudosForm = {
  viewProps: FormViewProps;
  /** The submission, or null while a required field is invalid or an image is uploading. */
  readySubmission: SendKudosInput | null;
  /** The kudos was sent: keep its uploaded images when the modal closes. */
  markSent: () => void;
  /** Show errors the server found (the client rules passed but the DB refused). */
  showServerErrors: (errors: WriteKudosFieldErrors) => void;
};

type Options = {
  hashtagOptions: WriteKudosHashtagOption[];
  viewerSunnerId: string | null;
  linkPrompt: string;
};

/**
 * State and validation of the whole "Viết Kudo" form. Gửi is ready only when recipient,
 * Danh hiệu, content and 1-5 hashtags are valid (clarifications ID-48/56); each field
 * shows its error once touched (blur), or at once when it is too long.
 */
export function useWriteKudosForm({ hashtagOptions, viewerSunnerId, linkPrompt }: Options): WriteKudosForm {
  const recipient = useRecipientField(viewerSunnerId);
  const body = useBodyEditor(linkPrompt);
  const images = useKudosImageUploads();
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [hashtags, setHashtags] = useState<WriteKudosHashtagOption[]>([]);
  const [hashtagsTouched, setHashtagsTouched] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousName, setAnonymousName] = useState("");
  const [serverErrors, setServerErrors] = useState<WriteKudosFieldErrors>({});

  const recipientId = recipient.selected?.id ?? "";
  const hashtagSlugs = hashtags.map((tag) => tag.slug);
  const problems: WriteKudosFieldErrors = {};
  const found: [WriteKudosField, WriteKudosErrorCode | null][] = [
    ["recipient", validateRecipient(recipientId, viewerSunnerId)],
    ["title", validateTitle(title)],
    ["body", validateBody(body.value)],
    ["hashtags", validateHashtags(hashtagSlugs)],
    ["anonymousName", validateAnonymousName(isAnonymous, anonymousName)],
  ];
  for (const [field, code] of found) if (code) problems[field] = code;

  const touched: Partial<Record<WriteKudosField, boolean>> = {
    recipient: recipient.touched,
    title: titleTouched,
    body: body.touched,
    hashtags: hashtagsTouched,
    anonymousName: true,
  };
  const errors: WriteKudosFieldErrors = { ...serverErrors };
  for (const [field, code] of Object.entries(problems) as [WriteKudosField, WriteKudosErrorCode][]) {
    if (touched[field] || code === "tooLong") errors[field] = code;
  }
  if (images.error) errors.images = images.error;

  const ready = !hasFieldErrors(problems) && !images.uploading;
  const readySubmission: SendKudosInput | null = ready
    ? {
        recipientId,
        title: title.trim(),
        body: body.value.trim(),
        hashtagSlugs,
        imagePaths: images.readyPaths,
        isAnonymous,
        anonymousName: isAnonymous ? anonymousName.trim() : "",
      }
    : null;

  const addHashtag = (option: WriteKudosHashtagOption) => {
    setHashtagsTouched(true);
    setPickerOpen(false);
    setHashtags((current) =>
      current.length >= WRITE_KUDOS_LIMITS.hashtagsMax || current.some((tag) => tag.slug === option.slug)
        ? current
        : [...current, option],
    );
  };

  const showServerErrors = (next: WriteKudosFieldErrors) => {
    setServerErrors(next);
    setTitleTouched(true);
    setHashtagsTouched(true);
    recipient.markTouched();
  };

  return {
    readySubmission,
    markSent: images.markSent,
    showServerErrors,
    viewProps: {
      recipient: recipient.viewProps,
      title: { value: title, onChange: setTitle, onBlur: () => setTitleTouched(true) },
      body: body.viewProps,
      bodyTextareaRef: body.textareaRef,
      hashtags: {
        options: hashtagOptions,
        selected: hashtags,
        max: WRITE_KUDOS_LIMITS.hashtagsMax,
        pickerOpen,
        onPickerToggle: () => setPickerOpen((open) => !open),
        onPickerClose: () => setPickerOpen(false),
        onAdd: addHashtag,
        onRemove: (slug) => {
          setHashtagsTouched(true);
          setHashtags((current) => current.filter((tag) => tag.slug !== slug));
        },
      },
      images: images.viewProps,
      anonymous: {
        checked: isAnonymous,
        onCheckedChange: setIsAnonymous,
        name: anonymousName,
        onNameChange: setAnonymousName,
        onNameBlur: () => undefined,
      },
      errors,
      canSubmit: ready,
    },
  };
}
