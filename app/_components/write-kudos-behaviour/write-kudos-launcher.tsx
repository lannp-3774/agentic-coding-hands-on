"use client";

import { useState } from "react";
import type { WriteKudosHashtagOption } from "@/app/_components/write-kudos/write-kudos-modal-types";
import { KudosSendButton } from "@/app/_components/sun-kudos/banner/kudos-send-button";
import { useKudosToast } from "@/app/_components/sun-kudos-behaviour/kudos-toast";
import type { WriteKudosCopy } from "@/lib/i18n/write-kudos-copy-types";
import { startGuestSessionOnce } from "@/lib/supabase/start-guest-session-once";
import { WriteKudosModal } from "./write-kudos-modal";

export type WriteKudosLauncherProps = {
  /** Send bar text; also the button's accessible name (`sunKudos.banner.sendPlaceholder`). */
  label: string;
  /** A session exists (an account or an anonymous guest). */
  signedIn: boolean;
  /** Not a logged-in account (no session, or an anonymous guest): every kudos is anonymous. */
  anonymousOnly: boolean;
  viewerSunnerId: string | null;
  hashtagOptions: WriteKudosHashtagOption[];
  copy: WriteKudosCopy;
};

/**
 * Send bar button (A.1) that opens the "Viết Kudo" modal. Guests act as Anonymous (supersedes
 * ID-1 "guest -> /login"): without a session the click first starts the anonymous guest
 * session, then opens the modal with anonymous forced on. Must sit under <KudosToastProvider>.
 */
export function WriteKudosLauncher(props: WriteKudosLauncherProps) {
  const { label, signedIn, anonymousOnly, viewerSunnerId, hashtagOptions, copy } = props;
  const showToast = useKudosToast();
  const [open, setOpen] = useState(false);

  async function openModal() {
    // Next re-renders the page once the session cookies are set, so no refresh is needed here.
    if (!signedIn && (await startGuestSessionOnce()).status !== "ok") {
      showToast("error", copy.toast.guestSessionFailed);
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <KudosSendButton label={label} onClick={() => void openModal()} />
      {open ? (
        <WriteKudosModal
          copy={copy}
          hashtagOptions={hashtagOptions}
          viewerSunnerId={viewerSunnerId}
          anonymousLocked={anonymousOnly}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
