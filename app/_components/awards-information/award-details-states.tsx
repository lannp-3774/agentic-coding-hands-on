import type { AwardDetailsEmptyProps } from "./awards-information-types";

/** Awards missing or unreadable: the page keeps its title and shows this short message. */
export function AwardDetailsEmpty({ message }: AwardDetailsEmptyProps) {
  return <p className="text-base leading-6 font-bold tracking-[0.5px]">{message}</p>;
}

const PULSE = "animate-pulse rounded bg-white/5 motion-reduce:animate-none";

/** Same footprint as the loaded blocks (picture + content column); carries no text. */
export function AwardDetailsSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-10 md:gap-20">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          <div className="aspect-square w-full max-w-[336px] shrink-0 animate-pulse rounded-3xl bg-white/5 motion-reduce:animate-none" />
          <div className="flex min-w-0 flex-1 flex-col gap-8">
            <div className={`h-8 w-1/2 ${PULSE}`} />
            <div className={`h-40 w-full ${PULSE}`} />
            <div className={`h-11 w-2/3 ${PULSE}`} />
            <div className={`h-28 w-full ${PULSE}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
