import { Suspense } from "react";
import { HtmlLangSync } from "@/app/_components/html-lang";
import { AccountBellRegion, AccountRegion } from "@/app/_components/header-behaviour/account-region";
import { SamePageScrollTop } from "@/app/_components/header-behaviour/same-page-scroll-top";
import { AwardDetailsSkeleton } from "@/app/_components/awards-information/award-details-states";
import { AwardsInformationHero } from "@/app/_components/awards-information/awards-information-hero";
import { AwardsInformationTitle } from "@/app/_components/awards-information/awards-information-title";
import { KudosSection } from "@/app/_components/home/kudos-section";
import { LanguageSelector } from "@/app/_components/site/language-selector";
import { SiteFooter } from "@/app/_components/site/site-footer";
import { SiteHeader } from "@/app/_components/site/site-header";
import { setLocale } from "@/lib/i18n/actions";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { AwardDetailsLoader } from "./award-details-loader";

/**
 * Awards Information body. Reads the locale cookie, so it renders inside the
 * page's <Suspense>; the account regions and the award blocks add their own
 * boundaries (session / DB) so slow auth or data never blocks the title.
 */
export async function AwardsInformationContent() {
  const locale = await getLocale();
  const { home, awardsInformation } = getDictionary(locale);

  return (
    <>
      <HtmlLangSync locale={locale} />
      <SamePageScrollTop />
      <SiteHeader
        nav={home.nav}
        currentPage="awards"
        bellSlot={<AccountBellRegion locale={locale} />}
        languageSlot={<LanguageSelector currentLocale={locale} onSelect={setLocale} />}
        accountSlot={<AccountRegion locale={locale} />}
      />
      <main>
        <AwardsInformationHero keyVisualAlt={awardsInformation.keyVisualAlt} />
        <AwardsInformationTitle eyebrow={awardsInformation.eyebrow} title={awardsInformation.title} />
        {/* Nav and blocks share this boundary: the nav's mount effect needs the sections in the DOM. */}
        <Suspense fallback={<AwardDetailsSkeleton />}>
          <AwardDetailsLoader locale={locale} />
        </Suspense>
        <KudosSection copy={home.kudos} />
      </main>
      <SiteFooter nav={home.nav} currentPage="awards" copyright={home.footer.copyright} />
    </>
  );
}
