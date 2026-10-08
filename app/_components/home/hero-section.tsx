import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "../site/site-icons";
import type { HeroSectionProps } from "../site/site-types";

// Both CTAs share one hover/focus treatment (glow + lift).
const CTA =
  "inline-flex items-center gap-2 rounded-lg px-6 py-4 text-lg leading-7 font-bold transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_12px_#FAE287] focus-visible:-translate-y-0.5 focus-visible:shadow-[0_0_12px_#FAE287] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none md:text-[22px] md:leading-7";

export function HeroSection({ copy, countdownSlot, eventInfo }: HeroSectionProps) {
  return (
    // mm:2167:9030
    <section className="relative z-0 px-4 pt-28 pb-16 md:px-12 md:pt-[184px] md:pb-[102px] xl:px-36">
      {/* mm:2167:9028 — key visual */}
      <Image
        src="/home/key-visual.png"
        alt=""
        width={1512}
        height={1392}
        priority
        sizes="100vw"
        className="pointer-events-none absolute top-0 left-0 -z-20 h-[1392px] w-full object-cover object-top"
      />
      {/* mm:2167:9029 — dark overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 -z-10 h-[1480px] w-full bg-[linear-gradient(12deg,#00101A_23.7%,rgba(0,18,29,0.46)_38.34%,rgba(0,19,32,0)_48.92%)]"
      />
      {/* mm:2167:9031 */}
      <div className="mx-auto flex w-full max-w-[1224px] flex-col items-start gap-10">
        {/* mm:2167:9032 */}
        <h1>
          {/* mm:2788:12911 */}
          <Image
            src="/home/root-further-logo.png"
            alt=""
            width={451}
            height={200}
            priority
            className="h-auto w-[min(451px,70vw)]"
          />
          <span className="sr-only">{copy.title}</span>
        </h1>
        {/* mm:2167:9034 */}
        <div className="flex flex-col gap-4">
          {countdownSlot}
          {/* mm:2167:9053 */}
          <div className="flex flex-col gap-4">
            {/* mm:2167:9054 */}
            <div className="flex flex-wrap gap-x-[60px] gap-y-2">
              {/* mm:2167:9055 */}
              <p className="flex items-center gap-1">
                <span className="text-base leading-6 font-bold tracking-[0.15px]">{eventInfo.timeLabel}</span>
                <span className="text-2xl leading-8 font-bold text-[#FFEA9E]">{eventInfo.timeValue}</span>
              </p>
              {/* mm:2167:9058 */}
              <p className="flex items-center gap-1">
                <span className="text-base leading-6 font-bold tracking-[0.15px]">{eventInfo.venueLabel}</span>
                <span className="text-2xl leading-8 font-bold text-[#FFEA9E]">{eventInfo.venueValue}</span>
              </p>
            </div>
            {/* mm:2167:9061 */}
            <p className="text-base leading-6 font-bold tracking-[0.5px]">{eventInfo.livestream}</p>
          </div>
        </div>
        {/* mm:2167:9062 */}
        <div className="flex flex-wrap gap-4 md:gap-10">
          {/* mm:2167:9063 */}
          <Link href="/awards-information" className={`${CTA} bg-[#FFEA9E] text-[#00101A]`}>
            {copy.aboutAwards}
            <ArrowUpRightIcon />
          </Link>
          {/* mm:2167:9064 */}
          <Link
            href="/sun-kudos"
            className={`${CTA} border border-[#998C5F] bg-[#FFEA9E]/10 text-white`}
          >
            {copy.aboutKudos}
            <ArrowUpRightIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
