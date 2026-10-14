"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WriteKudosHashtagOption } from "@/app/_components/write-kudos/write-kudos-modal-types";
import { KudosSendButton } from "@/app/_components/sun-kudos/banner/kudos-send-button";
import type { WriteKudosCopy } from "@/lib/i18n/write-kudos-copy-types";
import { WriteKudosModal } from "./write-kudos-modal";

export type WriteKudosLauncherProps = {
  /** Send bar text; also the button's accessible name (`sunKudos.banner.sendPlaceholder`). */
  label: string;
  signedIn: boolean;
  viewerSunnerId: string | null;
  hashtagOptions: WriteKudosHashtagOption[];
  copy: WriteKudosCopy;
};

/**
 * Send bar button (A.1) that opens the "Viết Kudo" modal. A guest is sent to /login
 * instead (ID-1). Must sit under <KudosToastProvider>.
 */
export function WriteKudosLauncher({ label, signedIn, viewerSunnerId, hashtagOptions, copy }: WriteKudosLauncherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <KudosSendButton label={label} onClick={() => (signedIn ? setOpen(true) : router.push("/login"))} />
      {open ? (
        <WriteKudosModal
          copy={copy}
          hashtagOptions={hashtagOptions}
          viewerSunnerId={viewerSunnerId}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
