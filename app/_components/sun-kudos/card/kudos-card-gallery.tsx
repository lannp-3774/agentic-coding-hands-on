import Image from "next/image";

/** F006 BR-007: at most 5 attached images on an All Kudos card. */
export const CARD_GALLERY_MAX = 5;

// C.3.6: square 88px thumbnails, left aligned; each opens the original in a new tab.
export function KudosCardGallery({ images }: { images: string[] }) {
  const shown = images.slice(0, CARD_GALLERY_MAX);
  if (shown.length === 0) return null;
  return (
    // mm:I3127:21871;256:5176
    <div className="relative z-10 flex w-full flex-wrap items-center gap-4">
      {shown.map((src, i) => (
        // mm:I3127:21871;256:5177
        <a
          key={`${src}-${i}`}
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="flex size-[88px] shrink-0 items-center justify-center rounded-[18px] border border-[#998C5F] bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00101A]"
        >
          {/* mm:I3127:21871;256:5177;513:8436 */}
          <Image
            src={src}
            alt={`${i + 1}/${shown.length}`}
            width={88}
            height={88}
            className="size-[88px] rounded border border-[#FFEA9E] object-cover"
          />
        </a>
      ))}
    </div>
  );
}
