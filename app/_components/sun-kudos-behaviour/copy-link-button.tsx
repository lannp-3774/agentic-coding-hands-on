"use client";

import { useCopyKudosLink } from "@/lib/kudos/use-copy-kudos-link";
import { CopyLinkButtonView } from "../sun-kudos/card/copy-link-button-view";
import { useKudosToast } from "./kudos-toast";

export type CopyLinkButtonProps = {
  kudosId: string;
  /** Button text and accessible name (`copy.card.copyLink`). */
  label: string;
  /** Toast texts: `copy.toast.copied` / `copy.toast.copyFailed`. */
  messages: { copied: string; failed: string };
};

/**
 * "Copy Link" of a kudos card (F006 A9, FR-401, DEC-006): copies the absolute
 * detail URL and reports the result in the page toast. Must sit under
 * <KudosToastProvider>. Not guest-gated: the copied URL is the same for everyone.
 */
export function CopyLinkButton({ kudosId, label, messages }: CopyLinkButtonProps) {
  const showToast = useKudosToast();
  const copyLink = useCopyKudosLink((ok) => {
    if (ok) showToast("success", messages.copied);
    else showToast("error", messages.failed);
  });

  return <CopyLinkButtonView label={label} onClick={() => void copyLink(kudosId)} />;
}
