import Image from "next/image";
import type { RootFurtherSectionProps } from "../site/site-types";

// Figma lays the essay out as three paragraphs, the quote, then two more.
const QUOTE_AFTER_PARAGRAPH = 3;

const PARAGRAPH = "text-base leading-8 font-bold text-justify md:text-2xl";

export function RootFurtherSection({ copy }: RootFurtherSectionProps) {
  // Entries may carry several lines each; flatten so the quote lands in the same place.
  const lines = copy.paragraphs.flatMap((entry) => entry.split("\n")).filter(Boolean);
  const before = lines.slice(0, QUOTE_AFTER_PARAGRAPH);
  const after = lines.slice(QUOTE_AFTER_PARAGRAPH);
  return (
    // mm:3204:10152
    <section className="relative z-10 px-4 pb-[120px] md:px-12 xl:px-36">
      <div className="mx-auto flex w-full max-w-[1152px] flex-col items-center gap-8 rounded-lg md:px-[104px]">
        {/* mm:3204:10153 */}
        <div aria-hidden="true" className="flex flex-col items-center">
          {/* mm:3204:10155 */}
          <Image src="/home/root-text.png" alt="" width={189} height={67} className="h-auto w-[189px]" />
          {/* mm:3204:10154 */}
          <Image src="/home/further-text.png" alt="" width={290} height={67} className="h-auto w-[290px]" />
        </div>
        {/* mm:5001:14827 */}
        <div className="flex flex-col">
          {before.map((text, index) => (
            <p key={`a${index}`} className={PARAGRAPH}>
              {text}
            </p>
          ))}
          {/* mm:3204:10161 */}
          <blockquote className="my-8 text-center text-base leading-8 font-bold whitespace-pre-line md:text-xl">
            {copy.quote}
          </blockquote>
          {after.map((text, index) => (
            <p key={`b${index}`} className={PARAGRAPH}>
              {text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
