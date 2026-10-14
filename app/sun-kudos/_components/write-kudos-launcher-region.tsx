import { WriteKudosLauncher } from "@/app/_components/write-kudos-behaviour/write-kudos-launcher";
import type { WriteKudosHashtagOption } from "@/app/_components/write-kudos/write-kudos-modal-types";
import type { Locale } from "@/lib/i18n/locales";
import { writeKudosCopy } from "@/lib/i18n/write-kudos-copy";
import { getHashtagRowsPerRequest } from "@/lib/kudos/get-hashtag-rows-per-request";
import { isHashtagRow, keepValid } from "@/lib/kudos/kudos-card-mapping";
import type { KudosViewer } from "./sun-kudos-content";

type WriteKudosLauncherRegionProps = {
  viewer: Promise<KudosViewer>;
  locale: Locale;
  /** `sunKudos.banner.sendPlaceholder`. */
  label: string;
};

/** The hashtags the picker offers, in `sort_order`; a failed read leaves it empty (Gửi stays off). */
async function readHashtagOptions(): Promise<WriteKudosHashtagOption[]> {
  const result = await getHashtagRowsPerRequest();
  if (result.status === "error") {
    console.error(`[write-kudos] hashtag list failed: ${result.reason}`);
    return [];
  }
  return keepValid(result.rows, isHashtagRow, "hashtag").map(({ slug, label }) => ({ slug, label }));
}

/**
 * Send bar button of /sun-kudos (A.1). Reads the viewer and, for a signed-in user, the
 * hashtag list, so it renders inside its own <Suspense> with the inert button as fallback.
 * Request-time read.
 */
export async function WriteKudosLauncherRegion({ viewer, locale, label }: WriteKudosLauncherRegionProps) {
  const { signedIn, viewerSunnerId } = await viewer;
  const hashtagOptions = signedIn ? await readHashtagOptions() : [];
  return (
    <WriteKudosLauncher
      label={label}
      signedIn={signedIn}
      viewerSunnerId={viewerSunnerId}
      hashtagOptions={hashtagOptions}
      copy={writeKudosCopy[locale]}
    />
  );
}
