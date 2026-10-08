import type { CountdownTilesProps } from "../site/site-types";

// Display-only: the caller supplies already formatted values ("05", "--", "123").
// Figma uses the "Digital Numbers" face, which is not bundled; monospace stands in.
function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-2 md:gap-3.5">
      <div className="countdown-value flex gap-2 md:gap-3.5">
        {Array.from(value).map((char, index) => (
          <span key={index} className="relative flex h-16 w-10 items-center md:h-[82px] md:w-[51px] justify-center">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-lg border-[0.5px] border-[#FFEA9E] bg-gradient-to-b from-white to-white/10 opacity-50 backdrop-blur-[16.64px]"
            />
            <span className="relative font-mono text-4xl leading-none md:text-[49px] tabular-nums">{char}</span>
          </span>
        ))}
      </div>
      <span className="text-xl leading-8 font-bold md:text-2xl">{label}</span>
    </div>
  );
}

export function CountdownTiles({ values, showComingSoon, labels }: CountdownTilesProps) {
  const tiles = [
    { value: values[0], label: labels.days },
    { value: values[1], label: labels.hours },
    { value: values[2], label: labels.minutes },
  ];
  return (
    // mm:2167:9035
    <div className="flex flex-col gap-4">
      {showComingSoon ? (
        // mm:2167:9036
        <p className="text-xl leading-8 font-bold md:text-2xl">{labels.comingSoon}</p>
      ) : null}
      {/* mm:2167:9037 */}
      <div className="flex flex-wrap items-center gap-4 md:gap-10">
        {tiles.map((tile) => (
          <Tile key={tile.label} value={tile.value} label={tile.label} />
        ))}
      </div>
    </div>
  );
}
