"use server";

import { unstable_rethrow } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { hasFieldErrors, isSendKudosInput, validateSendKudos } from "./kudos-write-validation";
import { safeAvatarUrl } from "./safe-media-path";
import type {
  SendKudosInput,
  SendKudosResult,
  SunnerOption,
  WriteKudosErrorCode,
  WriteKudosField,
  WriteKudosFieldErrors,
} from "./write-kudos-types";

// Server Actions of the "Viết Kudo" modal (F010, plan.md B2). Public POST endpoints,
// so nothing from the client is trusted: the user comes from verified claims
// (`getCurrentUser`, fails closed to guest), input is shape-checked and validated
// with the shared validator, and every write goes through create_kudos with the
// user's own cookie client (the RPC re-checks everything; never service_role).
// Neither action throws to the client (Next control-flow errors excepted); logs
// carry codes only, never input.

/** create_kudos: bad field, message '<WriteKudosField>: <WriteKudosErrorCode>'. */
const INVALID_PARAMETER = "22023";
/** create_kudos: the caller's account has no linked Sunner. */
const NO_DATA_FOUND = "P0002";

const SEARCH_LIMIT = 10;
const SEARCH_MAX_LENGTH = 100;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FIELD_ERROR_PATTERN = /^(recipient|title|body|hashtags|images|anonymousName): (\w+)$/;
const ERROR_CODES: readonly WriteKudosErrorCode[] = [
  "required", "tooLong", "selfRecipient", "maxHashtags", "maxImages", "invalidFileType", "fileTooLarge", "uploadFailed",
];

/**
 * Sends one kudos as the signed-in user's Sunner (A1); an anonymous guest sends as
 * its guest Sunner, always anonymously (create_kudos forces it). Results:
 * `ok` + the new id; `invalid` + field errors (client-side rules, or the DB's
 * 22023 field error); `unauthenticated` (no session); `noSunner` (account not linked
 * to a Sunner, P0002); `error` for anything else, including malformed input.
 * The caller refreshes the board on `ok`.
 */
export async function sendKudos(input: SendKudosInput): Promise<SendKudosResult> {
  if (!isSendKudosInput(input)) {
    console.warn("[kudos-write] sendKudos rejected: malformed input");
    return { status: "error" };
  }

  try {
    const user = await getCurrentUser();
    if (!user) return { status: "unauthenticated" };

    const errors = validateSendKudos(input);
    if (hasFieldErrors(errors)) return { status: "invalid", errors };

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("create_kudos", {
      p_receiver_id: input.recipientId,
      p_title: input.title,
      p_body: input.body,
      p_hashtag_slugs: input.hashtagSlugs,
      p_image_paths: input.imagePaths,
      p_is_anonymous: input.isAnonymous,
      p_anonymous_name: input.isAnonymous ? input.anonymousName : "",
    });
    if (error) {
      const fieldErrors = error.code === INVALID_PARAMETER ? toFieldErrors(error.message) : null;
      if (fieldErrors) return { status: "invalid", errors: fieldErrors };
      if (error.code === NO_DATA_FOUND) return { status: "noSunner" };
      console.error(`[kudos-write] create_kudos failed: ${error.code || "?"}`);
      return { status: "error" };
    }

    const kudosId: unknown = data;
    if (typeof kudosId !== "string" || !UUID_PATTERN.test(kudosId)) {
      console.error("[kudos-write] create_kudos returned no kudos id");
      return { status: "error" };
    }
    return { status: "ok", kudosId };
  } catch (cause) {
    unstable_rethrow(cause);
    console.error(`[kudos-write] sendKudos threw: ${cause instanceof Error ? cause.name : typeof cause}`);
    return { status: "error" };
  }
}

/** Maps a create_kudos 22023 message to one field error; null when it names no field. */
function toFieldErrors(message: string): WriteKudosFieldErrors | null {
  const match = FIELD_ERROR_PATTERN.exec(message);
  if (!match) return null;
  const field = match[1] as WriteKudosField;
  const code = ERROR_CODES.find((c) => c === match[2]) ?? "required";
  return { [field]: code };
}

/**
 * Recipient search and @mention suggestions (B, D; clarifications ID-8..10): Sunners
 * whose `full_name` contains the trimmed query, case-insensitively (`ilike`, with
 * `\`, `%` and `_` escaped), sorted by name, at most 10. Guest Sunners (`is_guest`,
 * the "Ẩn danh" of each anonymous guest) are never offered: they cannot receive kudos.
 * Any session may search, an anonymous guest's included; blank or over-long queries and
 * visitors without a session get `[]`, as does any failure. Reads only granted columns.
 */
export async function searchSunners(query: string): Promise<SunnerOption[]> {
  const q = typeof query === "string" ? query.trim() : "";
  if (q === "" || q.length > SEARCH_MAX_LENGTH) return [];

  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("sunners")
      .select("id,full_name,department_code,avatar_url")
      .ilike("full_name", `%${escapeLikePattern(q)}%`)
      .eq("is_guest", false)
      .order("full_name")
      .order("id")
      .limit(SEARCH_LIMIT);
    if (error) {
      console.error(`[kudos-write] sunner search failed: ${error.code || "?"}`);
      return [];
    }
    return toSunnerOptions(data);
  } catch (cause) {
    unstable_rethrow(cause);
    console.error(`[kudos-write] sunner search threw: ${cause instanceof Error ? cause.name : typeof cause}`);
    return [];
  }
}

/**
 * LIKE metacharacters as literals (Postgres' default escape character is `\`).
 * `*` is escaped too: PostgREST turns every `*` of a like pattern into `%`, so
 * an unescaped `*` would match every name (`\*` becomes a literal `%` instead).
 */
function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_*]/g, (ch) => `\\${ch}`);
}

function toSunnerOptions(rows: unknown): SunnerOption[] {
  const list: unknown[] = Array.isArray(rows) ? rows : [];
  return list.flatMap((row): SunnerOption[] => {
    if (typeof row !== "object" || row === null) return [];
    const r = row as Record<string, unknown>;
    if (typeof r.id !== "string" || !UUID_PATTERN.test(r.id)) return [];
    if (typeof r.full_name !== "string" || r.full_name.trim() === "") return [];
    const department = typeof r.department_code === "string" ? r.department_code.trim() || null : null;
    return [{ id: r.id, name: r.full_name, department, avatarUrl: safeAvatarUrl(r.avatar_url) }];
  });
}
