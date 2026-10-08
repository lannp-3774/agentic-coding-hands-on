import Image from "next/image";
import { PenIcon } from "../site/site-icons";
import type { WidgetButtonProps } from "../site/site-types";

/** Fixed bottom-right pill. Visual only: no action, no menu. */
export function WidgetButton({ label }: WidgetButtonProps) {
  return (
    // mm:5022:15169
    <button
      type="button"
      aria-label={label}
      className="fixed right-4 bottom-6 z-40 flex h-16 cursor-pointer items-center gap-2 rounded-full bg-[#FFEA9E] p-4 text-[#00101A] shadow-[0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_4px_rgba(0,0,0,0.25),0_0_16px_#FAE287] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none md:right-[19px]"
    >
      <span className="sr-only">{label}</span>
      {/* mm:I5022:15169;214:3839;186:1935 */}
      <span aria-hidden="true" className="flex items-center gap-2">
        {/* mm:I5022:15169;214:3839;186:1763 */}
        <PenIcon />
        <span className="text-2xl leading-8 font-bold">/</span>
      </span>
      {/* mm:I5022:15169;214:3839;186:1766;214:3762 */}
      <Image src="/home/widget-kudos-logo.svg" alt="" width={20} height={19} aria-hidden="true" />
    </button>
  );
}
