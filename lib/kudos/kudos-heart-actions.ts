"use server";

import { unstable_rethrow } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";

/**
 * Outcome of a like/unlike (F007 A1/A2). `ok` carries the state to reconcile
 * with: `liked` is the caller's intent (now true in the DB) and `likeCount` is
 * re-read from `kudos.like_count`. Every other status means "nothing changed
 * for you": the client reverts; `unauthenticated` (no session: the client
 * starts a guest session before liking, so only a lost session lands here)
 * re-renders the page as a guest.
 */
export type HeartActionResult =
  | { status: "ok"; liked: boolean; likeCount: number }
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | { status: "error" };

type HeartIntent = "like" | "unlike";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Postgres SQLSTATEs raised by `kudos_likes` (migration create_kudos_likes).
/** PK (kudos_id, user_id): this account already likes the kudos (BR-001). */
const UNIQUE_VIOLATION = "23505";
/** `kudos_likes_before_insert`: liker is the kudos sender, or has no Sunner (BR-002). */
const CHECK_VIOLATION = "23514";

/**
 * Likes a kudos for the signed-in viewer (A1: FR-001, FR-602, BR-001, BR-006).
 * Intent, not toggle: liking an already-liked kudos is a no-op `ok`.
 */
export async function likeKudos(kudosId: string): Promise<HeartActionResult> {
  return writeHeart("like", kudosId);
}

/**
 * Takes back the viewer's like (A2: FR-402, FR-602, BR-004, BR-006).
 * Unliking a kudos the viewer never liked deletes nothing and is `ok`.
 */
export async function unlikeKudos(kudosId: string): Promise<HeartActionResult> {
  return writeHeart("unlike", kudosId);
}

/**
 * Public POST endpoint, so nothing from the client is trusted: the id is
 * shape-checked, the user comes from verified claims (`getCurrentUser`, fails
 * closed to guest; an anonymous guest likes through its guest Sunner like any
 * account), and the write uses the user's own cookie client so RLS
 * (`user_id = auth.uid()`) and the triggers decide everything else — weight,
 * self-like, counters. Never throws to the client; logs codes only.
 */
async function writeHeart(intent: HeartIntent, kudosId: string): Promise<HeartActionResult> {
  if (typeof kudosId !== "string" || !UUID_PATTERN.test(kudosId)) {
    console.warn(`[kudos-hearts] ${intent} rejected: kudos id is not a uuid`);
    return { status: "error" };
  }

  try {
    const user = await getCurrentUser();
    if (!user) return { status: "unauthenticated" };

    const supabase = await createClient();
    const { error } =
      intent === "like"
        ? await supabase.from("kudos_likes").insert({ kudos_id: kudosId, user_id: user.id })
        : await supabase.from("kudos_likes").delete().eq("kudos_id", kudosId).eq("user_id", user.id);

    // A duplicate like means the row already exists: the intent holds (BR-006).
    if (error && !(intent === "like" && error.code === UNIQUE_VIOLATION)) {
      console.error(`[kudos-hearts] ${intent} write failed: ${error.code || "?"}`);
      return { status: error.code === CHECK_VIOLATION ? "forbidden" : "error" };
    }

    const likeCount = await readLikeCount(supabase, kudosId, intent);
    if (likeCount === null) return { status: "error" };
    return { status: "ok", liked: intent === "like", likeCount };
  } catch (cause) {
    unstable_rethrow(cause);
    console.error(`[kudos-hearts] ${intent} threw: ${cause instanceof Error ? cause.name : typeof cause}`);
    return { status: "error" };
  }
}

type ServerClient = Awaited<ReturnType<typeof createClient>>;

/** Fresh `kudos.like_count` after the write, or null when it cannot be read. */
async function readLikeCount(
  supabase: ServerClient,
  kudosId: string,
  intent: HeartIntent,
): Promise<number | null> {
  const { data, error } = await supabase
    .from("kudos")
    .select("like_count")
    .eq("id", kudosId)
    .maybeSingle();
  if (error) {
    console.error(`[kudos-hearts] ${intent} count read failed: ${error.code || "?"}`);
    return null;
  }

  // No row: the kudos is gone (an unlike of a deleted kudos deletes nothing).
  const count: unknown = data?.like_count;
  if (typeof count !== "number" || !Number.isInteger(count) || count < 0) {
    console.error(`[kudos-hearts] ${intent} count read returned no valid like_count`);
    return null;
  }
  return count;
}
