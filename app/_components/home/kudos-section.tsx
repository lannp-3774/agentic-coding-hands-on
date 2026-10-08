import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "../site/site-icons";
import type { KudosSectionProps } from "../site/site-types";

export function KudosSection({ copy }: KudosSectionProps) {
  return (
    // mm:3390:10349
    <section className="relative z-10 px-4 pb-[125px] md:px-12 xl:px-36">
      {/* mm:I3390:10349;313:8415 */}
      <div className="relative mx-auto flex min-h-[500px] w-full max-w-[1120px] flex-col justify-center gap-10 overflow-hidden rounded-2xl px-6 py-10 md:flex-row md:items-center md:justify-between md:px-16">
        {/* mm:I3390:10349;313:8416 */}
        <Image
          src="/home/kudos-bg.png"
          alt=""
          fill
          sizes="(min-width: 1120px) 1120px, 100vw"
          className="object-cover"
        />
        {/* mm:I3390:10349;313:8419 */}
        <div className="relative flex w-full max-w-[457px] flex-col gap-8">
          {/* mm:I3390:10349;313:8420 */}
          <div className="flex flex-col gap-4">
            {/* mm:I3390:10349;313:8421 */}
            <p className="text-xl leading-8 font-bold md:text-2xl">{copy.eyebrow}</p>
            {/* mm:I3390:10349;313:8422 */}
            <h2 className="text-4xl leading-tight font-bold tracking-[-0.25px] text-[#FFEA9E] md:text-[57px] md:leading-16">
              {copy.title}
            </h2>
            {/* mm:I3390:10349;313:8423 */}
            <p className="text-justify text-base leading-6 font-bold tracking-[0.5px] whitespace-pre-line">
              {copy.body}
            </p>
          </div>
          {/* mm:I3390:10349;313:8426 */}
          <Link
            href="/sun-kudos"
            className="inline-flex w-fit items-center gap-2 rounded bg-[#FFEA9E] p-4 text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_12px_#FAE287] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none"
          >
            {copy.details}
            <ArrowUpRightIcon />
          </Link>
        </div>
        {/* mm:I3390:10349;329:2948 */}
        <Image
          src="/home/kudos-logo.svg"
          alt=""
          width={364}
          height={74}
          className="relative h-auto w-[min(364px,100%)] md:shrink-0"
        />
      </div>
    </section>
  );
}
