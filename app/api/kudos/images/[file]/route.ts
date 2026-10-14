import { createClient as createSessionlessClient } from "@supabase/supabase-js";
import { unstable_rethrow } from "next/navigation";
import {
  KUDOS_IMAGE_CONTENT_TYPES,
  KUDOS_IMAGES_BUCKET,
  isKudosImageFileName,
  kudosImageExtensionOf,
  kudosImageStorageKey,
  sniffKudosImageType,
} from "@/lib/kudos/kudos-image-files";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/supabase-env";

// /api/kudos/images/<uuid>.<jpg|png> — one kudos image (F010, plan.md B2), Storage object
// kudos/<uuid>.<ext> in the private `images` bucket. The path never names the uploader.
//
// GET serves an attached image (one a kudos uses) to anyone: kudos are public. This keeps
// kudos_images.image_path a local path (local-only media rule, isAllowedImagePath).
//   200  the image bytes, its content type, `public, max-age=31536000, immutable`
//        (object names are random uuids and never overwritten)
//   404  malformed file name, unknown object, a draft (not attached to any kudos), or bytes
//        that are not the image type the name claims (an object uploaded around the POST route)
//   502  Storage failed for another reason
// It reads with a session-less publishable-key client (role anon; Storage RLS lets anon read
// attached images only): the response is publicly cacheable, so it must never depend on, or
// refresh and re-set, the viewer's session cookies. Never service_role.
//
// DELETE lets the signed-in owner drop a draft (a removed thumbnail, a closed modal).
//   204  deleted
//   401  guest
//   404  malformed name, or nothing deleted: unknown, another user's, or already attached
//        (Storage RLS: owner_id = auth.uid() and not referenced by kudos_images)
//   502  Storage failed
// The proxy skips this path (its matcher ignores paths with a dot): guests are never
// redirected here, and the cookie client refreshes an expired session itself.

type ImageRouteContext = { params: Promise<{ file: string }> };

const NO_STORE = { "Cache-Control": "no-store" };

const emptyResponse = (status: number) => new Response(null, { status, headers: NO_STORE });

/**
 * Storage's "object not found" only: HTTP 404, or (older storage-api) HTTP 400 whose body says
 * statusCode "404" / code NoSuchKey. Any other error, a plain 400 included (bad key, malformed
 * request), is a Storage failure and becomes 502, never a silent 404.
 */
function isNotFound(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const { status, statusCode, code } = error as { status?: unknown; statusCode?: unknown; code?: unknown };
  return status === 404 || String(statusCode) === "404" || code === "NoSuchKey";
}

const errorName = (cause: unknown) => (cause instanceof Error ? cause.name : typeof cause);

export async function GET(_request: Request, { params }: ImageRouteContext): Promise<Response> {
  const { file } = await params;
  if (!isKudosImageFileName(file)) return emptyResponse(404);

  try {
    const { url, publishableKey } = getSupabaseEnv();
    const supabase = createSessionlessClient(url, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await supabase.storage.from(KUDOS_IMAGES_BUCKET).download(kudosImageStorageKey(file));
    if (error || !data) {
      if (!error || isNotFound(error)) return emptyResponse(404);
      console.error(`[kudos-images] download failed: ${error.name} ${error.message}`);
      return emptyResponse(502);
    }

    const bytes = new Uint8Array(await data.arrayBuffer());
    const extension = kudosImageExtensionOf(file);
    if (sniffKudosImageType(bytes) !== extension) {
      console.warn("[kudos-images] refused an object whose bytes do not match its name");
      return emptyResponse(404);
    }

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": KUDOS_IMAGE_CONTENT_TYPES[extension],
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch (cause) {
    unstable_rethrow(cause);
    console.error(`[kudos-images] download threw: ${errorName(cause)}`);
    return emptyResponse(502);
  }
}

export async function DELETE(_request: Request, { params }: ImageRouteContext): Promise<Response> {
  const { file } = await params;
  if (!isKudosImageFileName(file)) return emptyResponse(404);

  try {
    const user = await getCurrentUser();
    if (!user) return emptyResponse(401);

    // The caller's own cookie client: Storage RLS decides what may go (never service_role).
    const supabase = await createClient();
    const { data, error } = await supabase.storage.from(KUDOS_IMAGES_BUCKET).remove([kudosImageStorageKey(file)]);
    if (error) {
      console.error(`[kudos-images] delete failed: ${error.name} ${error.message}`);
      return emptyResponse(502);
    }
    return emptyResponse(data && data.length > 0 ? 204 : 404);
  } catch (cause) {
    unstable_rethrow(cause);
    console.error(`[kudos-images] delete threw: ${errorName(cause)}`);
    return emptyResponse(502);
  }
}
