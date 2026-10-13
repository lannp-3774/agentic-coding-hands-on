import type { HeroStars, HeroTier } from "./kudos-card-types";

// Hero rank from kudos received (F006 BR-003). Computed when mapping a card,
// never stored.

/** 0-9 New (0 stars), 10-19 Rising (1), 20-49 Super (2), 50+ Legend (3). */
export function heroTierOf(receivedCount: number): { tier: HeroTier; stars: HeroStars } {
  if (receivedCount >= 50) return { tier: "legend", stars: 3 };
  if (receivedCount >= 20) return { tier: "super", stars: 2 };
  if (receivedCount >= 10) return { tier: "rising", stars: 1 };
  // Also covers negative / NaN from a malformed row: lowest rank.
  return { tier: "new", stars: 0 };
}
