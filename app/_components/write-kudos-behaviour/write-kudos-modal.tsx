"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { WriteKudosModalView } from "@/app/_components/write-kudos/write-kudos-modal-view";
import type { WriteKudosHashtagOption } from "@/app/_components/write-kudos/write-kudos-modal-types";
import { useKudosToast } from "@/app/_components/sun-kudos-behaviour/kudos-toast";
import type { WriteKudosCopy } from "@/lib/i18n/write-kudos-copy-types";
import { sendKudos } from "@/lib/kudos/send-kudos-action";
import type { SendKudosResult } from "@/lib/kudos/write-kudos-types";
import { useModalBehaviour } from "./use-modal-behaviour";
import { useWriteKudosForm } from "./use-write-kudos-form";
import { toWriteKudosLabels } from "./write-kudos-labels";

export type WriteKudosModalProps = {
  copy: WriteKudosCopy;
  hashtagOptions: WriteKudosHashtagOption[];
  /** The viewer's own Sunner (never offered as recipient), or null. */
  viewerSunnerId: string | null;
  /** A guest (not logged in): anonymous is forced on and cannot be turned off. */
  anonymousLocked: boolean;
  onClose: () => void;
};

/**
 * "Viết Kudo" dialog controller (F010). Mounted only while open, so closing it drops every
 * draft value (Hủy, Escape and a successful send alike) and deletes unsent image uploads. Gửi calls `sendKudos`: on success
 * it closes, shows the success toast and refreshes the board so the new kudos appears first. While
 * Gửi is in flight, Hủy and Escape do nothing.
 */
export function WriteKudosModal({ copy, hashtagOptions, viewerSunnerId, anonymousLocked, onClose }: WriteKudosModalProps) {
  const router = useRouter();
  const showToast = useKudosToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const onKeyDown = useModalBehaviour(containerRef);
  const [submitting, setSubmitting] = useState(false);
  const form = useWriteKudosForm({ hashtagOptions, viewerSunnerId, linkPrompt: copy.toolbar.linkPrompt, anonymousLocked });

  const submit = async () => {
    const input = form.readySubmission;
    if (!input || submitting) return;
    setSubmitting(true);
    form.showServerErrors({});

    let result: SendKudosResult;
    try {
      result = await sendKudos(input);
    } catch (error) {
      console.error("[write-kudos] send failed", error);
      result = { status: "error" };
    }

    if (result.status === "ok") {
      form.markSent();
      onClose();
      showToast("success", copy.toast.sent);
      router.refresh();
      return;
    }
    if (result.status === "unauthenticated") {
      router.push("/login");
      return;
    }
    setSubmitting(false);
    if (result.status === "invalid") form.showServerErrors(result.errors);
    else showToast("error", result.status === "noSunner" ? copy.toast.noSunner : copy.toast.failed);
  };

  return createPortal(
    <div ref={containerRef} tabIndex={-1} onKeyDown={onKeyDown} className="outline-none">
      <WriteKudosModalView
        {...form.viewProps}
        labels={toWriteKudosLabels(copy)}
        submitting={submitting}
        onSubmit={() => void submit()}
        onCancel={() => {
          // Not while Gửi is in flight: closing deletes the drafts create_kudos may be attaching.
          if (!submitting) onClose();
        }}
      />
    </div>,
    document.body,
  );
}
