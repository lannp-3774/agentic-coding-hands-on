import type { Locale } from "./locales";

// Awards Information page (/awards-information) chrome copy. Only UI labels are
// translated; award descriptions and the Kudos paragraph stay Vietnamese in EN
// mode. Units and notes come from the DB. The Kudos block and the empty message
// reuse the homepage copy (home.kudos / home.awards.empty), not duplicated here.
// Source: MoMorph frame zFYDgyj_pD (items 313:8454, 313:8457) + clarifications D010/D012.

export type AwardsInformationCopy = {
  eyebrow: string;
  title: string;
  keyVisualAlt: string;
  navAriaLabel: string;
  labels: { quantity: string; prize: string; or: string };
};

export const awardsInformationCopy = {
  vi: {
    eyebrow: "Sun* Annual Awards 2025",
    title: "Hệ thống giải thưởng SAA 2025",
    keyVisualAlt: "Keyvisual Sun* Annual Award 2025",
    navAriaLabel: "Danh mục giải thưởng",
    labels: {
      quantity: "Số lượng giải thưởng:",
      prize: "Giá trị giải thưởng:",
      or: "Hoặc",
    },
  },
  en: {
    eyebrow: "Sun* Annual Awards 2025",
    title: "SAA 2025 Awards System",
    keyVisualAlt: "Keyvisual Sun* Annual Award 2025",
    navAriaLabel: "Award categories",
    labels: {
      quantity: "Number of awards:",
      prize: "Prize value:",
      or: "Or",
    },
  },
} satisfies Record<Locale, AwardsInformationCopy>;
