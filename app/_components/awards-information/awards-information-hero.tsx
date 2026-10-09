import Image from "next/image";
import type { AwardsInformationHeroProps } from "./awards-information-types";

/**
 * Key visual (1440x547 under the fixed header) with the dark gradient and the
 * "Root Further" logo. The visual overflows this section so the title that
 * follows sits on top of it (the title carries `relative z-10`).
 */
export function AwardsInformationHero({ keyVisualAlt }: AwardsInformationHeroProps) {
  return (
    // mm:313:8449
    <section className="relative z-0 px-4 pt-28 pb-12 md:px-12 md:pt-[184px] md:pb-[120px] xl:px-36">
      {/* mm:313:8437 — key visual group; mm:2167:5138 image 20 (no MM_MEDIA export, reuses the homepage artwork) */}
      <div className="pointer-events-none absolute inset-x-0 top-16 -z-20 h-[360px] overflow-hidden md:top-20 md:h-[547px]">
        <Image
          src="/home/key-visual.png"
          alt=""
          width={1512}
          height={1392}
          priority
          sizes="100vw"
          className="h-full w-full object-cover object-[50%_60%]"
        />
      </div>
      {/* mm:313:8439 — cover gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[424px] bg-[linear-gradient(0deg,#00101A_-4.23%,rgba(0,19,32,0)_52.79%)] md:h-[627px]"
      />
      {/* mm:313:8450 */}
      <div className="mx-auto w-full max-w-[1152px]">
        {/* mm:313:8451 */}
        {/* mm:2789:12915 — MM_MEDIA_Root Further Logo (338x150, same artwork as public/home/root-further-logo.png) */}
        <Image
          src="/home/root-further-logo.png"
          alt={keyVisualAlt}
          width={451}
          height={200}
          priority
          className="h-auto w-[min(338px,70vw)]"
        />
      </div>
    </section>
  );
}
