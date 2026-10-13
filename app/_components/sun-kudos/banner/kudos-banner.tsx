import Image from "next/image";
import type { KudosBannerProps } from "./kudos-banner-types";

// Brand name of the artwork (Figma "MM_MEDIA_Kudos logo"); a proper name, not translated.
const LOGO_ALT = "SAA 2025 KUDOS";

/**
 * Key visual (1440x512 under the fixed header), the page title and the
 * "SAA 2025 KUDOS" logo. Non-interactive. From md up the visual overflows the
 * content box (it ends 104px below the logo), so the send bar that follows is
 * `relative` and paints above it. On mobile the visual ends with the banner box,
 * so the send bar pills sit fully on the page background.
 */
export function KudosBanner({ title }: KudosBannerProps) {
  return (
    // mm:2940:13436
    <div className="relative z-0 px-4 pt-28 pb-8 md:px-12 md:pt-[184px] md:pb-16 xl:px-36">
      {/* mm:2940:13432 — Keyvisual (clipped to its 512px frame) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full overflow-hidden md:h-[512px]"
      >
        {/* mm:I2940:13432;2167:5141 — MM_MEDIA_KV Background */}
        <Image
          src="/sun-kudos/banner/kv-background.png"
          alt=""
          fill
          preload
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* mm:I2940:13432;1210:12612 — Cover, 1440x957 and bottom-aligned with the 512px visual
            (MoMorph reports y=445, which is the -445 offset mirrored: 957 - 512) */}
        <div className="absolute inset-x-0 bottom-0 h-[957px] bg-[linear-gradient(25deg,#00101A_14.74%,rgba(0,19,32,0)_47.8%)]" />
      </div>
      {/* mm:2940:13437 — A_KV Kudos */}
      <div className="mx-auto flex w-full max-w-[1152px] flex-col items-start gap-2.5">
        {/* mm:2940:13438 */}
        <h1 className="text-[28px] leading-9 font-bold text-[#FFEA9E] md:text-4xl md:leading-11">
          {/* mm:2940:13439 */}
          {title}
        </h1>
        {/* mm:2940:13440 — MM_MEDIA_Kudos logo (593x106) */}
        <Image
          src="/sun-kudos/banner/kudos-logo.svg"
          alt={LOGO_ALT}
          width={593}
          height={106}
          className="h-auto w-[min(593px,100%)]"
        />
      </div>
    </div>
  );
}
