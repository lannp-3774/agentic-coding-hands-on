"use client";

import { useEffect, useRef, useState } from "react";
import type { WriteKudosImagesProps } from "@/app/_components/write-kudos/write-kudos-modal-types";
import { isKudosImageApiPath, type UploadKudosImageResponse } from "@/lib/kudos/kudos-image-files";
import { WRITE_KUDOS_LIMITS, validateImageFile } from "@/lib/kudos/kudos-write-validation";
import type { WriteKudosErrorCode, WriteKudosImage } from "@/lib/kudos/write-kudos-types";

const UPLOAD_URL = "/api/kudos/images";
const UPLOAD_ERRORS: readonly WriteKudosErrorCode[] = ["invalidFileType", "fileTooLarge", "uploadFailed"];

export type KudosImageUploads = {
  items: WriteKudosImage[];
  /** Paths of the uploaded images, in order. */
  readyPaths: string[];
  /** Some image is still uploading: Gửi must wait. */
  uploading: boolean;
  /** Latest refusal or failure for the Image group (role="alert"), or null. */
  error: WriteKudosErrorCode | null;
  viewProps: WriteKudosImagesProps;
  /** The kudos was sent: its images are attached now, so closing must not delete them. */
  markSent: () => void;
};

/** Uploads one file; resolves to its stored path or the reason it failed. Never rejects. */
async function uploadImage(file: File): Promise<{ path: string } | { error: WriteKudosErrorCode }> {
  try {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch(UPLOAD_URL, { method: "POST", body });
    const json = (await response.json().catch(() => null)) as UploadKudosImageResponse | null;
    if (json && "path" in json && typeof json.path === "string" && isKudosImageApiPath(json.path)) {
      return { path: json.path };
    }
    const code = json && "error" in json ? UPLOAD_ERRORS.find((known) => known === json.error) : undefined;
    return { error: code ?? "uploadFailed" };
  } catch (error) {
    console.error("[write-kudos] image upload failed", error);
    return { error: "uploadFailed" };
  }
}

/**
 * Best effort: the owner deletes an unsent upload (`DELETE /api/kudos/images/<file>`), so a
 * removed or abandoned draft does not linger. `keepalive` lets it outlive a closing page.
 * Never rejects; a failure is only logged (an attached image is refused by Storage RLS).
 */
function discardDraft(path: string): void {
  void fetch(path, { method: "DELETE", keepalive: true }).then(
    (response) => {
      if (!response.ok) console.error(`[write-kudos] draft delete failed: ${response.status}`);
    },
    (error: unknown) => console.error("[write-kudos] draft delete failed", error),
  );
}

/**
 * Image attachments (F): each accepted file (jpg/png, <= 5 MB, at most 5 in all) is
 * uploaded the moment it is picked, with an object-URL thumbnail while it uploads.
 * A refused or failed file adds no thumbnail and sets `error`. Removing an image frees
 * its slot and deletes its upload; closing the modal deletes every upload not sent.
 * Object URLs are revoked on remove and when the modal closes.
 */
export function useKudosImageUploads(): KudosImageUploads {
  const [items, setItems] = useState<WriteKudosImage[]>([]);
  const [error, setError] = useState<WriteKudosErrorCode | null>(null);
  // key -> object URL, so a URL is revoked exactly once (on remove or on close).
  const previewUrls = useRef(new Map<string, string>());
  // key -> uploaded path not sent yet: deleted on remove or on close (unless `markSent`).
  const drafts = useRef(new Map<string, string>());
  const nextKey = useRef(0);
  // Uploads run one after another: the stored order follows the pick order. `upload` never rejects.
  const queue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const urls = previewUrls.current;
    const unsent = drafts.current;
    return () => {
      for (const url of urls.values()) URL.revokeObjectURL(url);
      urls.clear();
      for (const path of unsent.values()) discardDraft(path);
      unsent.clear();
    };
  }, []);

  const drop = (key: string) => {
    const url = previewUrls.current.get(key);
    if (url) URL.revokeObjectURL(url);
    previewUrls.current.delete(key);
    setItems((current) => current.filter((image) => image.key !== key));
  };

  const upload = async (key: string, file: File) => {
    // Removed while it waited its turn: nothing to store.
    if (!previewUrls.current.has(key)) return;
    const outcome = await uploadImage(file);
    if ("error" in outcome) {
      drop(key);
      setError(outcome.error);
      return;
    }
    // Removed, or the modal closed, while it uploaded: nobody wants this draft.
    if (!previewUrls.current.has(key)) {
      discardDraft(outcome.path);
      return;
    }
    drafts.current.set(key, outcome.path);
    setItems((current) =>
      current.map((image) => (image.key === key ? { ...image, path: outcome.path, status: "ready" } : image)),
    );
  };

  const onFilesSelected = (files: File[]) => {
    let refusal: WriteKudosErrorCode | null = null;
    let count = items.length;
    const added: WriteKudosImage[] = [];
    for (const file of files) {
      const invalid = validateImageFile(file);
      if (!invalid && count >= WRITE_KUDOS_LIMITS.imagesMax) {
        refusal = "maxImages";
        break;
      }
      if (invalid) {
        refusal = invalid;
        continue;
      }
      const previewUrl = URL.createObjectURL(file);
      const key = `image-${nextKey.current++}`;
      previewUrls.current.set(key, previewUrl);
      added.push({ key, previewUrl, path: null, status: "uploading" });
      count += 1;
      queue.current = queue.current.then(() => upload(key, file));
    }
    setError(refusal);
    if (added.length > 0) setItems((current) => [...current, ...added]);
  };

  const onRemove = (key: string) => {
    setError(null);
    const path = drafts.current.get(key);
    drafts.current.delete(key);
    if (path) discardDraft(path);
    drop(key);
  };

  return {
    items,
    readyPaths: items.flatMap((image) => (image.path ? [image.path] : [])),
    uploading: items.some((image) => image.status === "uploading"),
    error,
    viewProps: { items, max: WRITE_KUDOS_LIMITS.imagesMax, onFilesSelected, onRemove },
    markSent: () => drafts.current.clear(),
  };
}
