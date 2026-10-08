import type { AwardsSectionProps } from "../site/site-types";

export function AwardsSection({ copy, children }: AwardsSectionProps) {
  return (
    // mm:2167:9068
    <section
      role="region"
      aria-labelledby="home-awards-title"
      className="relative z-10 mx-auto flex w-full max-w-[1224px] flex-col gap-10 px-4 pb-[120px] md:gap-20 md:px-12 xl:px-0"
    >
      {/* mm:2167:9069 */}
      <header className="flex flex-col gap-4">
        {/* mm:2167:9070 */}
        <p className="text-xl leading-8 font-bold md:text-2xl">{copy.eyebrow}</p>
        {/* mm:2167:9071 */}
        <hr className="h-px border-0 bg-[#2E3940]" />
        {/* mm:2167:9072 */}
        <h2
          id="home-awards-title"
          className="text-4xl leading-tight font-bold tracking-[-0.25px] text-[#FFEA9E] md:text-[57px] md:leading-16"
        >
          {copy.title}
        </h2>
      </header>
      {children}
    </section>
  );
}
