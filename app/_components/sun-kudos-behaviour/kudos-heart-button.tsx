"use client";

import { useRouter } from "next/navigation";
import { useKudosHeart } from "@/lib/kudos/kudos-heart-store";
import { KudosHeartView } from "../sun-kudos/card/kudos-heart-view";
import { useKudosToast } from "./kudos-toast";

const LOGIN_HREF = "/login";

export type KudosHeartButtonProps = {
  kudosId: string;
  /** Server values of the card (`likeCount`, `likedByMe`); register the kudos in the page store. */
  initialCount: number;
  initialLiked: boolean;
  /** The viewer sent this kudos: the button is disabled (FR-203). */
  isSender: boolean;
  /** No session: a click goes to /login without calling the action (FR-601). */
  signedIn: boolean;
  labels: { heart: string; failed: string };
};

/**
 * Heart of one kudos card (F007 A3, DEC-002). Optimistic state and the like/unlike
 * actions live in the page store; this wrapper adds the navigation and error toast.
 * A click while a request is pending is ignored by the store, so the button stays enabled.
 */
export function KudosHeartButton({ kudosId, initialCount, initialLiked, isSender, signedIn, labels }: KudosHeartButtonProps) {
  const router = useRouter();
  const showToast = useKudosToast();
  const { liked, count, pending, toggle } = useKudosHeart(kudosId, { liked: initialLiked, count: initialCount });

  async function handleClick() {
    if (isSender) return;
    if (!signedIn) {
      router.push(LOGIN_HREF);
      return;
    }
    const result = await toggle();
    if (result.status === "unauthenticated") router.push(LOGIN_HREF);
    else if (result.status === "forbidden" || result.status === "error") showToast("error", labels.failed);
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
