export type CountdownPrelaunchUnitProps = {
  /** Already formatted value: "05", "--", "120". One LED tile per character. */
  value: string;
  /** Unit caption shown under the tiles (DAYS / HOURS / MINUTES). */
  label: string;
};

// Figma uses the "Digital Numbers" face, which MoMorph does not export;
// monospace stands in (same decision as the homepage countdown).
function LedTile({ char }: { char: string }) {
  return (
    // mm:2268:35141
    <span className="relative flex h-14 w-9 items-center justify-center md:h-[90px] md:w-14 lg:h-[123px] lg:w-[77px]">
      {/* mm:I2268:35141;186:2616 */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-lg border-[0.75px] border-[#FFEA9E] bg-gradient-to-b from-white to-white/10 opacity-50 backdrop-blur-[25px] lg:rounded-xl"
      />
      {/* mm:I2268:35141;186:2617 */}
      <span
        aria-hidden="true"
        className="relative font-mono text-[34px] leading-none tabular-nums md:text-[54px] lg:text-[73.7px]"
      >
        {char}
      </span>
    </span>
  );
}

export function CountdownPrelaunchUnit({ value, label }: CountdownPrelaunchUnitProps) {
  return (
    // mm:2268:35139
    <div
      role="group"
      aria-label={`${value} ${label}`}
      className="flex flex-col items-start gap-2 text-white md:gap-4 lg:gap-[21px]"
    >
      {/* mm:2268:35140 */}
      <div className="flex items-center gap-1.5 md:gap-3 lg:gap-[21px]">
        {Array.from(value).map((char, index) => (
          <LedTile key={index} char={char} />
        ))}
      </div>
      {/* mm:2268:35143 */}
      <span className="text-base leading-6 font-bold uppercase md:text-[28px] md:leading-9 lg:text-4xl lg:leading-[48px]">
        {label}
      </span>
    </div>
  );
}
