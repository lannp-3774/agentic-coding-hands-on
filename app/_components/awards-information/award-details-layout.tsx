import type { AwardDetailsLayoutProps } from "./awards-information-types";

/**
 * Two columns from `lg` (sticky nav left, awards right, 178 / 856px like the
 * 1152px Figma frame); stacked below `lg`, where the nav (sticky, horizontal
 * scroll) sits above the list. The nav is passed in so this stays presentational.
 */
export function AwardDetailsLayout({ nav, children }: AwardDetailsLayoutProps) {
  return (
    // mm:313:8458
    <div className="relative z-10 px-4 pb-12 md:px-12 md:pb-[120px] xl:px-36">
      <div className="mx-auto flex w-full max-w-[1152px] flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-20">
        {nav}
        {/* mm:313:8466 */}
        <div className="flex w-full min-w-0 flex-col gap-10 md:gap-20 lg:max-w-[856px] lg:flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
