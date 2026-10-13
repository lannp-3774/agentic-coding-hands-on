// Spotlight board contracts (F008). Labels are built server-side so the client
// never converts time zones.

/** One name on the board: one node per kudos. */
export type SpotlightNode = {
  kudosId: string;
  /** Receiver name. */
  name: string;
  /** `HH:mm - MM/DD/YYYY` (tooltip). */
  timeLabel: string;
  /** Detail link, or `/login` for guests. */
  href: string;
  x: number;
  y: number;
  /** Font size in px, from the receiver's kudos count. */
  size: number;
};

/** One line of the latest-kudos ticker; newest first. */
export type SpotlightTickerLine = {
  kudosId: string;
  /** `hh:mmAM|PM`. */
  time12h: string;
  name: string;
};

export type SpotlightData = {
  /** Real total of kudos, not capped by the node limit. */
  total: number;
  nodes: SpotlightNode[];
  ticker: SpotlightTickerLine[];
};
