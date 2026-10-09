import type { AwardsInformationTitleProps } from "./awards-information-types";

export function AwardsInformationTitle({ eyebrow, title }: AwardsInformationTitleProps) {
  return (
    // mm:313:8453 — z-10 keeps it above the key visual that overflows the hero
    <div className="relative z-10 px-4 pb-12 md:px-12 md:pb-[120px] xl:px-36">
      <div className="mx-auto flex w-full max-w-[1152px] flex-col gap-4">
        {/* mm:313:8454 */}
        <p className="text-center text-xl leading-8 font-bold md:text-2xl">{eyebrow}</p>
        {/* mm:313:8455 */}
        <hr className="h-px border-0 bg-[#2E3940]" />
        {/* mm:313:8456 */}
        <div className="flex items-center justify-center">
          {/* mm:313:8457 */}
          <h1 className="text-center text-4xl leading-tight font-bold tracking-[-0.25px] text-[#FFEA9E] md:text-[57px] md:leading-16">
            {title}
          </h1>
        </div>
      </div>
    </div>
  );
}
