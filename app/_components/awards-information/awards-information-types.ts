import type { MouseEvent, ReactNode, Ref } from "react";

// Prop contracts for the Awards Information page body. Presentational only:
// every string arrives via props (VN/EN copy and award data are resolved upstream).

export type AwardPrizeView = {
  amount: string;
  // Line under the amount ("cho mỗi giải thưởng"); null = Figma shows none (Best Manager, MVP).
  note: string | null;
};

export type AwardDetailView = {
  slug: string;
  // Short label shown in the left nav (differs from `title` for Signature / MVP).
  navLabel: string;
  title: string;
  // Rendered with `white-space: pre-line`: "\n\n" gives the paragraph break Figma shows.
  description: string;
  quantity: string;
  unit: string;
  prizes: AwardPrizeView[];
  imageSrc: string;
  // Side of the 336x336 picture from `lg` up (Figma alternates left / right).
  imageSide: "left" | "right";
};

export type AwardBlockLabels = {
  quantity: string;
  prize: string;
  // Separator between two prizes ("Hoặc").
  or: string;
};

export type AwardsInformationHeroProps = { keyVisualAlt: string };

export type AwardsInformationTitleProps = { eyebrow: string; title: string };

export type AwardDetailsLayoutProps = {
  nav: ReactNode;
  children: ReactNode;
};

export type AwardsNavItem = { slug: string; label: string };

export type AwardsNavViewProps = {
  ariaLabel: string;
  items: AwardsNavItem[];
  activeSlug: string;
  // The <nav> itself is the horizontal scroll container below `lg`.
  navRef: Ref<HTMLElement>;
  onItemClick: (slug: string, event: MouseEvent<HTMLAnchorElement>) => void;
};

export type AwardBlockProps = {
  award: AwardDetailView;
  labels: AwardBlockLabels;
  // The last block has no bottom rule (Figma D.6).
  isLast: boolean;
};

export type AwardDetailsEmptyProps = { message: string };
