import { Suspense } from "react";
import { HtmlLangSync } from "@/app/_components/html-lang";
import { AccountBellRegion, AccountRegion } from "@/app/_components/header-behaviour/account-region";
import { SamePageScrollTop } from "@/app/_components/header-behaviour/same-page-scroll-top";
import { LanguageSelector } from "@/app/_components/site/language-selector";
import { SiteFooter } from "@/app/_components/site/site-footer";
import { SiteHeader } from "@/app/_components/site/site-header";
import { parseCountdownTarget } from "@/lib/countdown/parse-countdown-target";
import { getAwards } from "@/lib/awards/get-awards";
import { setLocale } from "@/lib/i18n/actions";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import type { Locale } from "@/lib/i18n/locales";
import { AwardsGrid, AwardsGridSkeleton } from "./awards-grid";
import { AwardsSection } from "./awards-section";
import { LiveCountdown } from "./countdown";
import { HeroSection } from "./hero-section";
import { KudosSection } from "./kudos-section";
import { RootFurtherSection } from "./root-further-section";
import { WidgetButton } from "./widget-button";

/**
 * Homepage body. Reads the locale cookie, so it renders inside the page's
 * <Suspense>; the account regions and the awards grid add their own boundaries
 * (session / DB) so slow auth or data never blocks the hero.
 */
export async function HomeContent() {
  const locale = await getLocale();
  const { home } = getDictionary(locale);
  // Server-only env; the client countdown receives just the parsed number.
  const targetMs = parseCountdownTarget(process.env.SAA_COUNTDOWN_TARGET);

  return (
    <>
      <HtmlLangSync locale={locale} />
      <SamePageScrollTop />
      <SiteHeader
        nav={home.nav}
        bellSlot={<AccountBellRegion locale={locale} />}
        languageSlot={<LanguageSelector currentLocale={locale} onSelect={setLocale} />}
        accountSlot={<AccountRegion locale={locale} />}
      />
      <main>
        <HeroSection
          copy={home.hero}
          eventInfo={home.eventInfo}
          countdownSlot={<LiveCountdown targetMs={targetMs} labels={home.countdown} />}
        />
        <RootFurtherSection copy={home.rootFurther} />
        <AwardsSection copy={{ eyebrow: home.awards.eyebrow, title: home.awards.title }}>
          <Suspense fallback={<AwardsGridSkeleton />}>
            <AwardsGridLoader locale={locale} />
          </Suspense>
        </AwardsSection>
        <KudosSection copy={home.kudos} />
      </main>
      <WidgetButton label={home.widget.label} />
      <SiteFooter nav={home.nav} copyright={home.footer.copyright} />
    </>
  );
}

async function AwardsGridLoader({ locale }: { locale: Locale }) {
  const { home } = getDictionary(locale);
  const awards = await getAwards(locale);
  return <AwardsGrid awards={awards} detailsLabel={home.awards.details} emptyMessage={home.awards.empty} />;
}
