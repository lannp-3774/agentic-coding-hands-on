import { randomUUID } from "node:crypto";
import { unstable_rethrow } from "next/navigation";
import {
  KUDOS_IMAGE_CONTENT_TYPES,
  KUDOS_IMAGE_MAX_BYTES,
  KUDOS_IMAGES_BUCKET,
  kudosImageApiPath,
  kudosImageStorageKey,
  sniffKudosImageType,
  type UploadKudosImageResponse,
} from "@/lib/kudos/kudos-image-files";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";

// POST /api/kudos/images — one kudos image upload (F010, plan.md B2).
// Body: multipart/form-data with exactly one field `file`.
//   200 {path: "/api/kudos/images/<uuid>.<jpg|png>"}  (a draft until create_kudos attaches it)
//   401 {error: "unauthenticated"}   guest (nothing is read or stored)
//   413 {error: "fileTooLarge"}      over 5 MiB (the bucket limit)
//   415 {error: "invalidFileType"}   not JPEG/PNG by magic bytes (MIME and name are ignored)
//   400 {error: "uploadFailed"}      not one `file` part / unreadable body
//   500 {error: "uploadFailed"}      storage write failed
// The object kudos/<uuid>.<ext> is written with the caller's own cookie client, so the
// Storage RLS policy (that name shape, owner_id = auth.uid()) is the final authority; never
// service_role. The name never carries the uploader: Storage records it in owner_id.
// The proxy runs for this path (no dot): it refreshes the session, never redirects a POST.

/** Multipart framing allowance on top of the file itself before the body is parsed. */
const MULTIPART_OVERHEAD_BYTES = 64 * 1024;

function json(body: UploadKudosImageResponse, status: number): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await getCurrentUser();
    if (!user) return json({ error: "unauthenticated" }, 401);

    // Refuse an obviously oversized body before buffering it.
    const declared = Number(request.headers.get("content-length"));
    if (declared > KUDOS_IMAGE_MAX_BYTES + MULTIPART_OVERHEAD_BYTES) return json({ error: "fileTooLarge" }, 413);

    const file = await readSingleFile(request);
    if (file === null) return json({ error: "uploadFailed" }, 400);
    if (file.size > KUDOS_IMAGE_MAX_BYTES) return json({ error: "fileTooLarge" }, 413);

    const bytes = new Uint8Array(await file.arrayBuffer());
    const extension = sniffKudosImageType(bytes);
    if (extension === null) return json({ error: "invalidFileType" }, 415);

    const fileName = `${randomUUID()}.${extension}`;
    const supabase = await createClient();
    const { error } = await supabase.storage
      .from(KUDOS_IMAGES_BUCKET)
      .upload(kudosImageStorageKey(fileName), bytes, {
        contentType: KUDOS_IMAGE_CONTENT_TYPES[extension],
        cacheControl: "31536000",
        upsert: false,
      });
    if (error) {
      console.error(`[kudos-images] upload failed: ${error.name} ${error.message}`);
      return json({ error: "uploadFailed" }, 500);
    }
    return json({ path: kudosImageApiPath(fileName) }, 200);
  } catch (cause) {
    unstable_rethrow(cause);
    console.error(`[kudos-images] upload threw: ${cause instanceof Error ? cause.name : typeof cause}`);
    return json({ error: "uploadFailed" }, 500);
  }
}

/** The one `file` part of a multipart body, or null (none, several, a string, or a bad body). */
async function readSingleFile(request: Request): Promise<File | null> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return null;
  }
  const parts = form.getAll("file");
  const [part] = parts;
  return parts.length === 1 && part instanceof File ? part : null;
}
