import { Montserrat, Montserrat_Alternates } from "next/font/google";

// Figma: copy uses Montserrat 700 (award titles/descriptions use 400);
// the footer uses Montserrat Alternates 700.
export const montserrat = Montserrat({
  variable: "--font-login-montserrat",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
  display: "swap",
});

export const montserratAlternates = Montserrat_Alternates({
  variable: "--font-login-montserrat-alternates",
  subsets: ["latin", "vietnamese"],
  weight: ["700"],
  display: "swap",
});
