import { Suspense } from "react";
import { HtmlLangSync } from "@/app/_components/html-lang";
import { AccountBellRegion, AccountRegion } from "@/app/_components/header-behaviour/account-region";
import { SamePageScrollTop } from "@/app/_components/header-behaviour/same-page-scroll-top";
import { LanguageSelector } from "@/app/_components/site/language-selector";
import { SiteFooter } from "@/app/_components/site/site-footer";
import { SiteHeader } from "@/app/_components/site/site-header";
import { KudosHeartProvider } from "@/lib/kudos/kudos-heart-store";
import { KudosToastProvider } from "@/app/_components/sun-kudos-behaviour/kudos-toast";
import { KudosBanner } from "@/app/_components/sun-kudos/banner/kudos-banner";
import { KudosSectionHeading } from "@/app/_components/sun-kudos/banner/kudos-section-heading";
import { KudosSendBar } from "@/app/_components/sun-kudos/banner/kudos-send-bar";
import { KudosSendButton } from "@/app/_components/sun-kudos/banner/kudos-send-button";
import { FeedSkeleton, FilterBarSkeleton, HighlightSkeleton } from "@/app/_components/sun-kudos/board/board-skeletons";
import { SunKudosBoardLayout } from "@/app/_components/sun-kudos/board/sun-kudos-board-layout";
import { setLocale } from "@/lib/i18n/actions";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { parseKudosFilters } from "@/lib/kudos/kudos-filters";
import { getViewerSunnerId } from "@/lib/kudos/get-viewer-sunner-id";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { KudosFeedLoader } from "./kudos-feed-loader";
import { KudosFilterOptionsLoader } from "./kudos-filter-options-loader";
import { KudosHighlightLoader } from "./kudos-highlight-loader";
import { KudosSidebar } from "./kudos-sidebar";
import { SpotlightSection } from "./spotlight-section";
import { WriteKudosLauncherRegion } from "./write-kudos-launcher-region";

/** Who is looking at the board: link targets (guest -> /login) and the sender flag. */
export type KudosViewer = { signedIn: boolean; viewerSunnerId: string | null };

export type SunKudosSearchParams = Record<string, string | string[] | undefined>;

// One Highlight and one All Kudos block per page, so fixed ids are enough.
const HIGHLIGHT_HEADING_ID = "highlight-kudos-heading";
const FEED_HEADING_ID = "all-kudos-heading";

/** Session + own Sunner, both fail closed (guest / no sender flag). Never rejects. */
async function readViewer(): Promise<KudosViewer> {
  const [user, viewerSunnerId] = await Promise.all([getCurrentUser(), getViewerSunnerId()]);
  return { signedIn: user !== null, viewerSunnerId };
}

/**
 * /sun-kudos body (F006 A1). Reads the locale cookie and the URL filters, so it
 * renders inside the page's <Suspense>; every DB or session read below sits in
 * its own boundary with a same-size skeleton. The viewer is read once and handed
 * to the Highlight and All Kudos loaders as a promise, so the header and banner
 * do not wait for it. A filter change remounts only the carousel (back to 1/n)
 * and the list (pages dropped) via `key`; the heart store stays mounted and takes
 * the fresh server counts through each card's seed, so Spotlight keeps its state.
 */
export async function SunKudosContent({ searchParams }: { searchParams: Promise<SunKudosSearchParams> }) {
  const [locale, params] = await Promise.all([getLocale(), searchParams]);
  const { home, sunKudos } = getDictionary(locale);
  const filters = parseKudosFilters(params);
  const viewer = readViewer();

  return (
    <>
      <HtmlLangSync locale={locale} />
      <SamePageScrollTop />
      <SiteHeader
        nav={home.nav}
        currentPage="kudos"
        bellSlot={<AccountBellRegion locale={locale} />}
        languageSlot={<LanguageSelector currentLocale={locale} onSelect={setLocale} />}
        accountSlot={<AccountRegion locale={locale} />}
      />
      <main>
        <KudosToastProvider>
          <KudosHeartProvider>
            <SunKudosBoardLayout
              banner={
                <>
                  <KudosBanner title={sunKudos.banner.title} />
                  <KudosSendBar
                    placeholder={sunKudos.banner.sendPlaceholder}
                    searchProfileLabel={sunKudos.banner.searchProfile}
                    sendButton={
                      <Suspense fallback={<KudosSendButton label={sunKudos.banner.sendPlaceholder} />}>
                        <WriteKudosLauncherRegion
                          viewer={viewer}
                          locale={locale}
                          label={sunKudos.banner.sendPlaceholder}
                        />
                      </Suspense>
                    }
                  />
                </>
              }
              highlight={
                <section aria-labelledby={HIGHLIGHT_HEADING_ID} className="flex flex-col gap-10">
                  <KudosSectionHeading
                    id={HIGHLIGHT_HEADING_ID}
                    eyebrow={sunKudos.eyebrow}
                    title={sunKudos.highlight.title}
                    actions={
                      <Suspense fallback={<FilterBarSkeleton />}>
                        <KudosFilterOptionsLoader filters={filters} copy={sunKudos.filters} />
                      </Suspense>
                    }
                  />
                  <Suspense fallback={<HighlightSkeleton />}>
                    <KudosHighlightLoader filters={filters} viewer={viewer} copy={sunKudos} />
                  </Suspense>
                </section>
              }
              spotlight={
                <SpotlightSection copy={sunKudos.spotlight} eyebrow={sunKudos.eyebrow} emptyMessage={sunKudos.feed.empty} />
              }
              feedLabelledBy={FEED_HEADING_ID}
              feedHeader={<KudosSectionHeading id={FEED_HEADING_ID} eyebrow={sunKudos.eyebrow} title={sunKudos.feed.title} />}
              feed={
                <Suspense fallback={<FeedSkeleton />}>
                  <KudosFeedLoader filters={filters} viewer={viewer} copy={sunKudos} />
                </Suspense>
              }
              sidebar={<KudosSidebar copy={sunKudos.sidebar} />}
            />
          </KudosHeartProvider>
        </KudosToastProvider>
      </main>
      <SiteFooter nav={home.nav} currentPage="kudos" copyright={home.footer.copyright} />
    </>
  );
}
