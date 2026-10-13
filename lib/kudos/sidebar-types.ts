// Personal sidebar contracts (F009).

export type PersonalStats = {
  received: number;
  sent: number;
  /** Hearts earned as a kudos sender. */
  hearts: number;
  boxesOpened: number;
  boxesUnopened: number;
};

/** Guest sees a login prompt; `unavailable` renders "—" for every value. */
export type PersonalStatsResult =
  | { status: "guest" }
  | { status: "ok"; stats: PersonalStats }
  | { status: "unavailable" };

/** One row of "10 SUNNER NHẬN QUÀ MỚI NHẤT": one per opened box. */
export type GiftRecipient = {
  boxId: string;
  sunnerId: string;
  name: string;
  avatarUrl: string | null;
  giftName: string;
  /** Profile link, or `/login` for guests. */
  href: string;
};
