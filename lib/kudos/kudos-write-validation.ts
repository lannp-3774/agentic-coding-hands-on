import { HASHTAG_SLUG_PATTERN } from "./kudos-filters";
import { isKudosImageApiPath, KUDOS_IMAGE_MAX_BYTES } from "./kudos-image-files";
import type {
  SendKudosInput,
  WriteKudosErrorCode,
  WriteKudosField,
  WriteKudosFieldErrors,
} from "./write-kudos-types";

// Validation of the "Viết Kudo" form (F010 clarifications, plan.md B2). Pure and
// import-safe on both sides: the modal shows these errors as the user types, and
// `sendKudos` re-runs them before calling create_kudos, which enforces the same
// limits again (the DB is the authority). Lengths count Unicode code points, like
// Postgres char_length; text is trimmed of any whitespace, newlines included.

export const WRITE_KUDOS_LIMITS = {
  titleMax: 50,
  bodyMax: 2000,
  hashtagsMax: 5,
  imagesMax: 5,
  anonymousNameMax: 50,
  imageMaxBytes: KUDOS_IMAGE_MAX_BYTES,
} as const;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const IMAGE_FILE_TYPES = new Set(["image/jpeg", "image/png"]);
const IMAGE_FILE_NAME = /\.(jpe?g|png)$/i;

/** Length in Unicode code points (an emoji counts 1, as in Postgres). */
export const charCount = (value: string): number => [...value].length;

function textError(value: string, max: number): WriteKudosErrorCode | null {
  const trimmed = value.trim();
  if (trimmed === "") return "required";
  return charCount(trimmed) > max ? "tooLong" : null;
}

/** Recipient: a Sunner id; never the sender (when the viewer's Sunner id is known). */
export function validateRecipient(recipientId: string, viewerSunnerId: string | null = null): WriteKudosErrorCode | null {
  if (!UUID_PATTERN.test(recipientId)) return "required";
  return viewerSunnerId !== null && recipientId.toLowerCase() === viewerSunnerId.toLowerCase() ? "selfRecipient" : null;
}

/** Danh hiệu: 1-50 characters after trimming. */
export const validateTitle = (title: string) => textError(title, WRITE_KUDOS_LIMITS.titleMax);

/** Message (Markdown source): 1-2000 characters after trimming. */
export const validateBody = (body: string) => textError(body, WRITE_KUDOS_LIMITS.bodyMax);

/** Hashtags: 1-5 distinct slugs from the list (duplicates are ignored, as in the DB). */
export function validateHashtags(slugs: readonly string[]): WriteKudosErrorCode | null {
  const distinct = new Set(slugs);
  if (distinct.size === 0 || ![...distinct].every((slug) => HASHTAG_SLUG_PATTERN.test(slug))) return "required";
  return distinct.size > WRITE_KUDOS_LIMITS.hashtagsMax ? "maxHashtags" : null;
}

/**
 * Uploaded image paths: at most 5, each a distinct `/api/kudos/images/<uuid>.<jpg|png>`.
 * Only create_kudos can tell whether the object exists, is the caller's and is unattached.
 */
export function validateImagePaths(paths: readonly string[]): WriteKudosErrorCode | null {
  if (paths.length > WRITE_KUDOS_LIMITS.imagesMax) return "maxImages";
  const valid = paths.every(isKudosImageApiPath) && new Set(paths).size === paths.length;
  return valid ? null : "uploadFailed";
}

/** Optional alias, only checked when sending anonymously: at most 50 characters. */
export function validateAnonymousName(isAnonymous: boolean, name: string): WriteKudosErrorCode | null {
  return isAnonymous && charCount(name.trim()) > WRITE_KUDOS_LIMITS.anonymousNameMax ? "tooLong" : null;
}

/**
 * A picked file, before upload: jpg/png by MIME type or extension, at most 5 MiB.
 * UX only; the upload route decides by the file's magic bytes.
 */
export function validateImageFile(file: { size: number; type: string; name: string }): WriteKudosErrorCode | null {
  const looksLikeImage = IMAGE_FILE_TYPES.has(file.type) || (file.type === "" && IMAGE_FILE_NAME.test(file.name));
  if (!looksLikeImage) return "invalidFileType";
  return file.size > WRITE_KUDOS_LIMITS.imageMaxBytes ? "fileTooLarge" : null;
}

/** Every field error of a submission; `{}` means valid. */
export function validateSendKudos(
  input: SendKudosInput,
  options: { viewerSunnerId?: string | null } = {},
): WriteKudosFieldErrors {
  const checks: [WriteKudosField, WriteKudosErrorCode | null][] = [
    ["recipient", validateRecipient(input.recipientId, options.viewerSunnerId ?? null)],
    ["title", validateTitle(input.title)],
    ["body", validateBody(input.body)],
    ["hashtags", validateHashtags(input.hashtagSlugs)],
    ["images", validateImagePaths(input.imagePaths)],
    ["anonymousName", validateAnonymousName(input.isAnonymous, input.anonymousName)],
  ];
  const errors: WriteKudosFieldErrors = {};
  for (const [field, code] of checks) if (code) errors[field] = code;
  return errors;
}

export const hasFieldErrors = (errors: WriteKudosFieldErrors): boolean => Object.keys(errors).length > 0;

const isString = (v: unknown): v is string => typeof v === "string";
const isStringList = (v: unknown, max: number): v is string[] =>
  Array.isArray(v) && v.length <= max && v.every(isString);

/**
 * Shape guard for untrusted input (the Server Action body). Lists are capped
 * generously so an absurd payload is refused before any validation work.
 */
export function isSendKudosInput(value: unknown): value is SendKudosInput {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return isString(v.recipientId) && isString(v.title) && isString(v.body) &&
    isString(v.anonymousName) && typeof v.isAnonymous === "boolean" &&
    isStringList(v.hashtagSlugs, 50) && isStringList(v.imagePaths, 50) &&
    v.title.length <= 10_000 && v.body.length <= 50_000 && v.anonymousName.length <= 10_000;
}
