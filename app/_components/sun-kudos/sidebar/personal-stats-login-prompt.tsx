import Link from "next/link";
import { SIDEBAR_CARD, SIDEBAR_GOLD_BUTTON } from "./sidebar-styles";

type Props = {
  text: string;
  buttonLabel: string;
  href: "/login";
};

// Guest variant of D.1 (mm:2940:13489). Copy and layout are provisional: Figma
// has no guest frame, so it reuses the D.1 box and the D.1.8 button style.
export function PersonalStatsLoginPrompt({ text, buttonLabel, href }: Props) {
  return (
    <section className={`${SIDEBAR_CARD} flex flex-col items-center gap-4 p-6`}>
      <p className="m-0 text-center text-[22px] leading-7 font-bold text-white">{text}</p>
      {/* mm:2940:13497 button style */}
      <Link href={href} className={SIDEBAR_GOLD_BUTTON}>
        {buttonLabel}
      </Link>
    </section>
  );
}
