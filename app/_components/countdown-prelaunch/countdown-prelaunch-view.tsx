import Image from "next/image";
import { montserrat } from "@/app/_components/saa-fonts";
import { CountdownPrelaunchUnit } from "./countdown-prelaunch-unit";

export type CountdownPrelaunchViewProps = {
  title: string;
  /** Formatted [days, hours, minutes], e.g. ["03", "09", "59"] or ["--", "--", "--"]. */
  values: [string, string, string];
  labels: { days: string; hours: string; minutes: string };
};

// Presentational only: every string arrives via props, no data or clock logic.
export function CountdownPrelaunchView({ title, values, labels }: CountdownPrelaunchViewProps) {
  const units = [
    { label: labels.days, value: values[0] },
    { label: labels.hours, value: values[1] },
    { label: labels.minutes, value: values[2] },
  ];
  return (
    // mm:2268:35127
    <main
      className={`${montserrat.variable} relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[#00101A] px-4 font-[family-name:var(--font-login-montserrat)] text-white`}
    >
      {/* mm:2268:35129 — background artwork (export carries its own 50% alpha) */}
      <Image
        src="/countdown/bg-image.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover"
      />
      {/* mm:2268:35130 — dark cover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(18deg,#00101A_15.48%,rgba(0,18,29,0.46)_52.13%,rgba(0,19,32,0)_63.41%)]"
      />
      {/* mm:2268:35131 — Figma centres the block at ~41% of the frame height, hence the bottom padding */}
      <div className="relative flex flex-col items-center gap-4 pb-16 md:gap-6 lg:pb-[185px]">
        {/* mm:2268:35137 */}
        <h1 className="text-center text-xl leading-8 font-bold md:text-3xl md:leading-10 lg:text-4xl lg:leading-[48px]">
          {title}
        </h1>
        {/* mm:2268:35138 */}
        <div className="flex flex-wrap items-start justify-center gap-x-3 gap-y-4 md:gap-x-8 lg:gap-x-[60px]">
          {units.map((unit) => (
            <CountdownPrelaunchUnit key={unit.label} value={unit.value} label={unit.label} />
          ))}
        </div>
      </div>
    </main>
  );
}
