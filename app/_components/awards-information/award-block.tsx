import Image from "next/image";
import { DiamondIcon, LicenseIcon, TargetIcon } from "./awards-information-icons";
import type { AwardBlockLabels, AwardBlockProps, AwardPrizeView } from "./awards-information-types";

const RULE = "h-px border-0 bg-[#2E3940]";
const SECTION_LABEL = "text-xl leading-8 font-bold text-[#FFEA9E] md:text-2xl";

function PrizeRow({ prize, label }: { prize: AwardPrizeView; label: string }) {
  return (
    // mm:I313:8467;214:2541 (Frame 443)
    <div className="flex flex-col gap-4">
      {/* mm:I313:8467;214:2542 */}
      <div className="flex items-center gap-4">
        {/* mm:I313:8467;214:2543 — MM_MEDIA_License */}
        <LicenseIcon className="shrink-0 text-white" />
        {/* mm:I313:8467;214:2544 */}
        <p className={SECTION_LABEL}>{label}</p>
      </div>
      {/* mm:I313:8467;214:2546 */}
      <p className="text-3xl leading-[44px] font-bold md:text-4xl">{prize.amount}</p>
      {prize.note !== null && (
        // mm:I313:8467;214:2547
        <p className="text-sm leading-5 font-bold tracking-[0.1px]">{prize.note}</p>
      )}
    </div>
  );
}

function PrizeSeparator({ label }: { label: string }) {
  return (
    // mm:313:8498 (Frame 524) — "Hoặc" + rule between the two prizes
    <div className="flex items-center gap-2">
      {/* mm:313:8499 */}
      <span className="text-sm leading-5 font-bold tracking-[0.1px] text-[#2E3940]">{label}</span>
      {/* mm:313:8500 */}
      <hr className={`${RULE} flex-1`} />
    </div>
  );
}

function Prizes({ prizes, labels }: { prizes: AwardPrizeView[]; labels: AwardBlockLabels }) {
  return (
    <>
      {prizes.map((prize, index) => (
        <div key={index} className="flex flex-col gap-8">
          {index > 0 && <PrizeSeparator label={labels.or} />}
          <PrizeRow prize={prize} label={labels.prize} />
        </div>
      ))}
    </>
  );
}

export function AwardBlock({ award, labels, isLast }: AwardBlockProps) {
  const imageFirst = award.imageSide === "left";
  return (
    // mm:313:8467 (D.1 … D.6) — anchor target of the nav; scroll-mt clears the fixed header (+ tab bar below lg)
    <section id={award.slug} className="flex scroll-mt-36 flex-col gap-10 md:gap-20 lg:scroll-mt-24">
      {/* mm:I313:8467;214:2803 (Frame 506) — row from lg; D.2 / D.4 / D.6 put the picture on the right */}
      <div className={`flex flex-col gap-6 lg:flex-row lg:gap-10 ${imageFirst ? "" : "lg:flex-row-reverse"}`}>
        {/* mm:I313:8467;214:2525 — thumbnail instance (background + award-name artwork pre-composited, see public/home/awards) */}
        <div className="h-fit w-full max-w-[336px] shrink-0 rounded-3xl border border-[#FFEA9E] shadow-[0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287]">
          {/* mm_media_Award-Thumb-Background and mm_media_Award-Name-*: */}
          {/* mm:I313:8467;214:2525;81:2442 */}
          {/* mm:I313:8467;214:2525;214:666 */}
          <Image
            src={award.imageSrc}
            alt=""
            width={336}
            height={336}
            sizes="336px"
            className="aspect-square h-auto w-full rounded-3xl"
          />
        </div>
        {/* mm:I313:8467;214:2526 (Content) */}
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          {/* mm:I313:8467;214:2527 */}
          <div className="flex flex-col gap-6">
            {/* mm:I313:8467;214:2528 */}
            <div className="flex items-center gap-4">
              {/* mm:I313:8467;214:2529 — MM_MEDIA_Target */}
              <TargetIcon className="shrink-0 text-white" />
              {/* mm:I313:8467;214:2530 */}
              <h2 className={SECTION_LABEL}>{award.title}</h2>
            </div>
            {/* mm:I313:8467;214:2531 */}
            <p className="text-justify text-base leading-6 font-bold tracking-[0.5px] whitespace-pre-line">
              {award.description}
            </p>
          </div>
          {/* mm:I313:8467;214:2532 */}
          <hr className={RULE} />
          {/* mm:I313:8467;214:2534 (Frame 443) — quantity row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {/* mm:I313:8467;214:2535 — MM_MEDIA_Diamond */}
            <DiamondIcon className="shrink-0 text-white" />
            {/* mm:I313:8467;214:2536 */}
            <p className={SECTION_LABEL}>{labels.quantity}</p>
            {/* mm:I313:8467;214:3552 (Số lượng) */}
            <p className="flex items-center gap-2">
              {/* mm:I313:8467;214:2538 */}
              <span className="text-3xl leading-[44px] font-bold md:text-4xl">{award.quantity}</span>
              {/* mm:I313:8467;214:3532 — Figma sets this text in a 60px box, so it wraps over several lines */}
              <span className="w-[60px] text-sm leading-5 font-bold tracking-[0.1px] break-words">{award.unit}</span>
            </p>
          </div>
          {/* mm:I313:8467;214:2539 */}
          <hr className={RULE} />
          <Prizes prizes={award.prizes} labels={labels} />
        </div>
      </div>
      {/* mm:I313:8467;214:2771 (Rectangle 14) — none under the last block */}
      {!isLast && <hr className={RULE} />}
    </section>
  );
}
