import type { WriteKudosErrorCode } from "./write-kudos-types";

// Kudos image files (F010, plan.md B1/B2): size limit, magic-byte sniffing and the
// path shapes shared by the upload route, the image route, the validator and
// create_kudos. Pure (no Node or Next imports), so client code may import it too.
//
// One image has two names, neither of which names the uploader (an anonymous kudos must
// not be linkable to its sender through its images; ownership is Storage's owner_id):
//   Storage key  kudos/<uuid>.<jpg|png>          (bucket `images`, private)
//   App path     /api/kudos/images/<uuid>.<ext>  (kudos_images.image_path, <img src>;
//                GET serves an attached image, DELETE lets the owner drop a draft)
// The app path is a local path, so isAllowedImagePath and the DB CHECK accept it.

/** JSON body of `POST /api/kudos/images` (one multipart field `file`). */
export type UploadKudosImageResponse =
  | { path: string }
  | { error: WriteKudosErrorCode | "unauthenticated" };

/** Bucket holding the kudos images (migration create_kudos_images_storage, supabase/config.toml). */
export const KUDOS_IMAGES_BUCKET = "images";

/** 5 MiB: the bucket's file_size_limit; a bigger file is `fileTooLarge`. */
export const KUDOS_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export type KudosImageExtension = "jpg" | "png";

export const KUDOS_IMAGE_CONTENT_TYPES: Record<KudosImageExtension, string> = {
  jpg: "image/jpeg",
  png: "image/png",
};

/** Lowercase uuid, the shape of `crypto.randomUUID()`. */
const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const FILE_NAME_PATTERN = new RegExp(`^${UUID}\\.(jpg|png)$`);
const API_PATH_PREFIX = "/api/kudos/images/";
const API_PATH_PATTERN = new RegExp(`^${API_PATH_PREFIX}${UUID}\\.(jpg|png)$`);

const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const startsWith = (bytes: Uint8Array, magic: readonly number[]) =>
  bytes.length >= magic.length && magic.every((byte, i) => bytes[i] === byte);

/**
 * The real type of an image from its first bytes (JPEG `FF D8 FF`, PNG signature),
 * or null. The client's MIME type and file name are never trusted.
 */
export function sniffKudosImageType(bytes: Uint8Array): KudosImageExtension | null {
  if (startsWith(bytes, JPEG_MAGIC)) return "jpg";
  if (startsWith(bytes, PNG_MAGIC)) return "png";
  return null;
}

/** `<uuid>.<jpg|png>` with a lowercase uuid; anything else is not a kudos image. */
export function isKudosImageFileName(value: string): boolean {
  return FILE_NAME_PATTERN.test(value);
}

/** Extension of a file name already checked by `isKudosImageFileName`. */
export function kudosImageExtensionOf(fileName: string): KudosImageExtension {
  return fileName.endsWith(".png") ? "png" : "jpg";
}

/** `/api/kudos/images/<uuid>.<jpg|png>` (create_kudos checks the object is the caller's). */
export function isKudosImageApiPath(value: string): boolean {
  return API_PATH_PATTERN.test(value);
}

export function kudosImageStorageKey(fileName: string): string {
  return `kudos/${fileName}`;
}

export function kudosImageApiPath(fileName: string): string {
  return `${API_PATH_PREFIX}${fileName}`;
}
