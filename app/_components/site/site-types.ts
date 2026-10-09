import type { KeyboardEventHandler, ReactNode, Ref } from "react";

// Prop contracts for the shared site chrome (header/footer/account region) and
// the homepage sections. Presentational only: every string arrives via props.

export type SelectLocale = (locale: "vi" | "en") => Promise<void>;

export type SiteNavCopy = {
  about: string;
  awards: string;
  kudos: string;
  standards: string;
};

// Which nav link is the current page. Optional; the header defaults to "about", the footer to none.
export type SitePage = "about" | "awards";

export type SiteHeaderProps = {
  nav: Pick<SiteNavCopy, "about" | "awards" | "kudos">;
  currentPage?: SitePage;
  // Rendered left of the language selector (Figma: bell, language, account); signed-in only.
  bellSlot?: ReactNode;
  languageSlot: ReactNode;
  accountSlot: ReactNode;
};

export type SiteFooterProps = {
  nav: SiteNavCopy;
  currentPage?: SitePage;
  copyright: string;
};

export type GuestLoginLinkProps = { label: string };
export type NotificationBellProps = { label: string };

export type AccountMenuItem = {
  key: "profile" | "admin";
  label: string;
  href: string;
};

export type AccountMenuViewProps = {
  open: boolean;
  menuId: string;
  triggerLabel: string;
  triggerRef: Ref<HTMLButtonElement>;
  menuRef: Ref<HTMLDivElement>;
  onTriggerClick: () => void;
  onMenuKeyDown: KeyboardEventHandler<HTMLDivElement>;
  items: AccountMenuItem[];
  signOut: { label: string; action: () => Promise<void> };
};

export type HeroEventInfo = {
  timeLabel: string;
  timeValue: string;
  venueLabel: string;
  venueValue: string;
  livestream: string;
};

export type HeroSectionProps = {
  copy: { title: string; aboutAwards: string; aboutKudos: string };
  countdownSlot: ReactNode;
  eventInfo: HeroEventInfo;
};

export type CountdownTilesProps = {
  // [days, hours, minutes], already formatted (e.g. "05", "--", "123").
  values: [string, string, string];
  showComingSoon: boolean;
  labels: {
    comingSoon: string;
    days: string;
    hours: string;
    minutes: string;
  };
};

export type RootFurtherSectionProps = {
  copy: { paragraphs: string[]; quote: string };
};

export type KudosSectionProps = {
  copy: { eyebrow: string; title: string; body: string; details: string };
};

export type WidgetButtonProps = { label: string };

export type AwardsSectionProps = {
  copy: { eyebrow: string; title: string };
  children: ReactNode;
};

export type AwardCardData = {
  key: string;
  title: string;
  description: string;
  imageSrc: string;
  href: string;
};

export type AwardsGridProps = {
  awards: AwardCardData[];
  detailsLabel: string;
  emptyMessage: string;
};
