import Image from "next/image";
import type { HeroTier } from "@/lib/kudos/kudos-card-types";

// Hero rank badge (F006 BR-003). Rising/Super/Legend are Figma exports with the
// label baked in; the label is repeated as sr-only text so it stays readable and
// translatable. New Hero has no exported art (its media node is empty), so it is
// drawn with CSS from the node styles: 0.5px #FFEA9E border, white 11.4px bold text.
const ART: Record<Exclude<HeroTier, "new">, string> = {
  rising: "/sun-kudos/card/hero-rising.png", // MM_MEDIA_Rising Hero
  super: "/sun-kudos/card/hero-super.png", // MM_MEDIA_Super Hero
  legend: "/sun-kudos/card/hero-legend.png", // MM_MEDIA_Legend Hero
};

export function KudosHeroBadge({ tier, label }: { tier: HeroTier; label: string }) {
  if (tier === "new") {
    return (
      // mm:I3127:21871;256:4858;3106:17694
      <span className="inline-flex h-[19px] w-[109px] shrink-0 items-center justify-center rounded-full border-[0.5px] border-[#FFEA9E] bg-[#092432] text-[11.4px] leading-4 font-bold tracking-[0.08px] text-white">
        {label}
      </span>
    );
  }
  return (
    // mm:I3127:21871;256:4860;3106:17694
    <span className="relative inline-block h-5 w-[110px] shrink-0">
      <Image src={ART[tier]} alt="" width={110} height={20} className="size-full" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
