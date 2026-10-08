import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "../site/site-icons";
import type { AwardsGridProps } from "../site/site-types";

// 3 columns from lg, 2 below; fixed 336px cards spread edge to edge on desktop.
const GRID =
  "grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-[repeat(3,minmax(0,336px))] lg:justify-between lg:gap-y-20";
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E]";

// Card artwork = Figma "Award BG" + the award-name image, pre-composited into
// public/home/awards/<slug>.png (336x336). Source nodes:
// mm:I2167:9075;214:1019;81:2442 (BG, shared by all six cards)
// mm:I2167:9075;214:1019;214:666;10:951 (Top Talent name)
// mm:I2167:9076;214:1019;214:666;214:654 (Top Project name)
// mm:I2167:9077;214:1019;214:666;214:655 (Top Project Leader name)
// mm:I2167:9079;214:1019;214:666;214:656 (Best Manager name)
// mm:I2167:9080;214:1019;214:666;214:657 (Signature 2025 - Creator name)
// mm:I2167:9081;214:1019;214:666;214:653 (MVP name)
export function AwardsGrid({ awards, detailsLabel, emptyMessage }: AwardsGridProps) {
  if (awards.length === 0) {
    return <p className="text-base leading-6 font-bold tracking-[0.5px]">{emptyMessage}</p>;
  }
  return (
    // mm:5005:14974
    <ul className={GRID}>
      {awards.map((award) => (
        // mm:2167:9075
        <li key={award.key} className="group flex flex-col gap-4 transition-transform duration-200 hover:-translate-y-1 motion-reduce:transition-none md:gap-6">
          {/* mm:I2167:9075;214:1019 — image link duplicates the title link, so keep it out of the tab order */}
          <Link
            href={award.href}
            tabIndex={-1}
            aria-hidden="true"
            className="block rounded-3xl border border-[#FFEA9E] shadow-[0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287] transition-shadow duration-200 group-hover:shadow-[0_4px_4px_rgba(0,0,0,0.25),0_0_24px_#FAE287] motion-reduce:transition-none"
          >
            <Image
              src={award.imageSrc}
              alt=""
              width={336}
              height={336}
              sizes="(min-width: 1024px) 336px, 50vw"
              className="aspect-square h-auto w-full rounded-3xl"
            />
          </Link>
          {/* mm:I2167:9075;214:1020 */}
          <div className="flex flex-col gap-1">
            {/* mm:I2167:9075;214:1021 */}
            <h3 className="text-xl leading-7 font-normal text-[#FFEA9E] md:text-2xl md:leading-8">
              <Link href={award.href} className={`rounded-sm hover:underline ${FOCUS}`}>
                {award.title}
              </Link>
            </h3>
            {/* mm:I2167:9075;214:1022 */}
            <p className="line-clamp-2 text-sm leading-6 font-normal tracking-[0.5px] md:text-base">
              {award.description}
            </p>
            {/* mm:I2167:9075;214:1023 */}
            <Link
              href={award.href}
              className={`inline-flex w-fit items-center gap-1 rounded-sm py-4 text-base leading-6 font-bold tracking-[0.15px] transition-colors duration-200 hover:text-[#FFEA9E] motion-reduce:transition-none ${FOCUS}`}
            >
              {detailsLabel}
              <ArrowUpRightIcon />
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Same grid footprint while the awards load; carries no text or links. */
export function AwardsGridSkeleton() {
  return (
    <ul aria-hidden="true" className={GRID}>
      {Array.from({ length: 6 }, (_, index) => (
        <li key={index} className="flex flex-col gap-4 md:gap-6">
          <div className="aspect-square w-full animate-pulse rounded-3xl bg-white/5 motion-reduce:animate-none" />
          <div className="flex flex-col gap-2">
            <div className="h-7 w-2/3 animate-pulse rounded bg-white/5 motion-reduce:animate-none" />
            <div className="h-12 w-full animate-pulse rounded bg-white/5 motion-reduce:animate-none" />
          </div>
        </li>
      ))}
    </ul>
  );
}
