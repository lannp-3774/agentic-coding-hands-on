"use client";

import { useRouter } from "next/navigation";
import { useKudosHeart } from "@/lib/kudos/kudos-heart-store";
import { startGuestSessionOnce } from "@/lib/supabase/start-guest-session-once";
import { KudosHeartView } from "../sun-kudos/card/kudos-heart-view";
import { useKudosToast } from "./kudos-toast";

export type KudosHeartButtonProps = {
  kudosId: string;
  /** Server values of the card (`likeCount`, `likedByMe`); register the kudos in the page store. */
  initialCount: number;
  initialLiked: boolean;
  /** The viewer sent this kudos: the button is disabled (FR-203). */
  isSender: boolean;
  /**
   * A session exists (an account or an anonymous guest). Without one, the first click starts
   * the anonymous guest session, then likes: guests act as Anonymous, never sent to /login.
   */
  signedIn: boolean;
  labels: { heart: string; failed: string };
};

/**
 * Heart of one kudos card (F007 A3, DEC-002). Optimistic state and the like/unlike
 * actions live in the page store; this wrapper adds the guest session start and the error
 * toast. A click while a request is pending is ignored by the store, so the button stays
 * enabled; clicks while the guest session starts share that one request.
 */
export function KudosHeartButton({ kudosId, initialCount, initialLiked, isSender, signedIn, labels }: KudosHeartButtonProps) {
  const router = useRouter();
  const showToast = useKudosToast();
  const { liked, count, pending, toggle } = useKudosHeart(kudosId, { liked: initialLiked, count: initialCount });

  async function handleClick() {
    if (isSender) return;
    if (!signedIn && (await startGuestSessionOnce()).status !== "ok") {
      showToast("error", labels.failed);
      return;
    }
    const result = await toggle();
    if (result.status === "ok" || result.status === "ignored") return;
    // The session is gone (expired or revoked): re-render as a guest, whose next click starts one.
    if (result.status === "unauthenticated") router.refresh();
    showToast("error", labels.failed);
  }

  return (
    <KudosHeartView
      count={count}
      liked={liked}
      disabled={isSender}
      pending={pending}
      label={labels.heart}
      onClick={() => void handleClick()}
    />
  );
}
