import type { ReactNode } from "react";
import { montserrat, montserratAlternates } from "@/app/_components/saa-fonts";

/** Page background, text colour and font variables shared by the SAA pages. */
export function SaaPageShell({ children }: { children: ReactNode }) {
  return (
    // mm:2167:9026
    <div
      className={`${montserrat.variable} ${montserratAlternates.variable} relative min-h-screen w-full overflow-x-clip bg-[#00101A] font-[family-name:var(--font-login-montserrat)] text-white`}
    >
      {children}
    </div>
  );
}
