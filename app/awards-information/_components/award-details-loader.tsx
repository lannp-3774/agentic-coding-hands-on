import { AwardBlock } from "@/app/_components/awards-information/award-block";
import { AwardDetailsLayout } from "@/app/_components/awards-information/award-details-layout";
import { AwardDetailsEmpty } from "@/app/_components/awards-information/award-details-states";
import { AwardsNav } from "@/app/_components/awards-nav-behaviour/awards-nav";
import { getAwardDetails } from "@/lib/awards/get-award-details";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";

/**
 * Award blocks + left nav. An empty or unreadable awards table (getAwardDetails
 * returns []) shows the short message and no nav; the title and Kudos stay.
 */
export async function AwardDetailsLoader({ locale }: { locale: Locale }) {
  const { home, awardsInformation } = getDictionary(locale);
  const awards = await getAwardDetails(locale);

  if (awards.length === 0) {
    return (
      <div className="relative z-10 px-4 pb-12 md:px-12 md:pb-[120px] xl:px-36">
        <div className="mx-auto w-full max-w-[1152px]">
          <AwardDetailsEmpty message={home.awards.empty} />
        </div>
      </div>
    );
  }

  return (
    <AwardDetailsLayout
      nav={
        <AwardsNav
          ariaLabel={awardsInformation.navAriaLabel}
          items={awards.map(({ slug, navLabel }) => ({ slug, label: navLabel }))}
        />
      }
    >
      {awards.map((award, index) => (
        <AwardBlock
          key={award.slug}
          award={award}
          labels={awardsInformation.labels}
          isLast={index === awards.length - 1}
        />
      ))}
    </AwardDetailsLayout>
  );
}
