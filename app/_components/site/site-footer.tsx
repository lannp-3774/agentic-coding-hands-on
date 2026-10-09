import Image from "next/image";
import Link from "next/link";
import type { SiteFooterProps } from "./site-types";

const FOOTER_LINK_BASE =
  "inline-flex items-center p-4 text-base leading-6 font-bold tracking-[0.15px] text-white transition-colors duration-200 hover:bg-[#FFEA9E]/10 hover:[text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287] focus-visible:bg-[#FFEA9E]/10 focus-visible:outline-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none";

// Selected footer link (Figma 186:1496 instance): tinted background + glow, no
// underline, square corners — unlike the header's selected style.
const FOOTER_LINK = `${FOOTER_LINK_BASE} rounded-sm`;
const FOOTER_LINK_SELECTED = `${FOOTER_LINK_BASE} rounded-none bg-[#FFEA9E]/10 [text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287]`;

// currentPage is optional with no default: omitted (homepage today) the footer
// renders exactly as before; otherwise the matching link is selected.
export function SiteFooter({ nav, currentPage, copyright }: SiteFooterProps) {
  const aboutCurrent = currentPage === "about";
  const awardsCurrent = currentPage === "awards";
  return (
    // mm:5001:14800
    <footer className="relative z-10 flex flex-col items-center justify-between gap-6 border-t border-[#2E3940] px-4 py-10 md:px-12 xl:flex-row xl:px-[90px]">
      {/* mm:I5001:14800;342:1407 */}
      <div className="flex flex-col items-center gap-6 xl:flex-row xl:gap-20">
        {/* mm:I5001:14800;342:1408 */}
        <Link href="/" className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-[#FFEA9E]">
          {/* mm:I5001:14800;342:1408;178:1030 */}
          <Image
            src="/home/logo-footer.png"
            alt="Sun* Annual Awards 2025"
            width={69}
            height={64}
            className="h-auto w-[69px]"
          />
        </Link>
        {/* mm:I5001:14800;342:1409 */}
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 xl:gap-12">
          {/* mm:I5001:14800;342:1410 */}
          <Link
            href="/"
            aria-current={aboutCurrent ? "page" : undefined}
            className={aboutCurrent ? FOOTER_LINK_SELECTED : FOOTER_LINK}
          >
            {nav.about}
          </Link>
          {/* mm:I5001:14800;342:1411 */}
          <Link
            href="/awards-information"
            aria-current={awardsCurrent ? "page" : undefined}
            className={awardsCurrent ? FOOTER_LINK_SELECTED : FOOTER_LINK}
          >
            {nav.awards}
          </Link>
          {/* mm:I5001:14800;342:1412 */}
          <Link href="/sun-kudos" className={FOOTER_LINK}>
            {nav.kudos}
          </Link>
          {/* mm:I5001:14800;1161:9487 */}
          <Link href="/standards" className={FOOTER_LINK}>
            {nav.standards}
          </Link>
        </nav>
      </div>
      {/* mm:I5001:14800;342:1413 */}
      <p className="text-center font-[family-name:var(--font-login-montserrat-alternates)] text-base leading-6 font-bold">
        {copyright}
      </p>
    </footer>
  );
}
