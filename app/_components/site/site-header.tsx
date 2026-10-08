import Image from "next/image";
import Link from "next/link";
import type { SiteHeaderProps } from "./site-types";

const NAV_LINK =
  "inline-flex items-center rounded-sm p-4 text-sm leading-5 font-bold tracking-[0.1px] text-white transition-colors duration-200 hover:bg-[#FFEA9E]/10 focus-visible:bg-[#FFEA9E]/10 focus-visible:outline-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none";
// Selected state: yellow text with glow + 1px underline.
const NAV_LINK_SELECTED =
  "border-b border-[#FFEA9E] text-[#FFEA9E] [text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287]";

export function SiteHeader({ nav, bellSlot, languageSlot, accountSlot }: SiteHeaderProps) {
  return (
    // mm:2167:9091
    <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between bg-[#101417]/80 px-4 md:h-20 md:px-12 xl:px-36">
      {/* mm:I2167:9091;186:2166 */}
      <div className="flex items-center gap-6 xl:gap-16">
        {/* mm:I2167:9091;178:1033 */}
        <Link href="/" className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-[#FFEA9E]">
          {/* mm:I2167:9091;178:1033;178:1030 */}
          <Image
            src="/home/logo.png"
            alt="Sun* Annual Awards 2025"
            width={52}
            height={48}
            priority
            className="h-auto w-10 md:w-[52px]"
          />
        </Link>
        {/* mm:I2167:9091;178:653 */}
        <nav className="hidden items-center gap-6 lg:flex">
          {/* mm:I2167:9091;186:1579 */}
          <Link href="/" aria-current="page" className={`${NAV_LINK} ${NAV_LINK_SELECTED}`}>
            {nav.about}
          </Link>
          {/* mm:I2167:9091;186:1587 */}
          <Link href="/awards-information" className={NAV_LINK}>
            {nav.awards}
          </Link>
          {/* mm:I2167:9091;186:1593 */}
          <Link href="/sun-kudos" className={NAV_LINK}>
            {nav.kudos}
          </Link>
        </nav>
      </div>
      {/* mm:I2167:9091;186:1601 */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Figma order: bell (signed-in only), language selector, account slot. */}
        {bellSlot}
        {languageSlot}
        {/* Fixed footprint so swapping skeleton / guest / signed-in never shifts the header. */}
        <div className="flex h-10 w-24 shrink-0 items-center justify-end">{accountSlot}</div>
      </div>
    </header>
  );
}
