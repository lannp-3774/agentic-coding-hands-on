import Link from "next/link";
import { BellIcon } from "./site-icons";
import type { GuestLoginLinkProps, NotificationBellProps } from "./site-types";

const ICON_BUTTON =
  "flex h-10 w-10 cursor-pointer items-center justify-center rounded text-white transition-colors duration-200 hover:bg-[#FFEA9E]/10 focus-visible:bg-[#FFEA9E]/10 focus-visible:outline-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none";

/** Placeholder with the same 96x40 footprint as the real slot content; no text. */
export function AccountSlotSkeleton() {
  return <div aria-hidden="true" className="h-10 w-24 animate-pulse rounded bg-white/5 motion-reduce:animate-none" />;
}

/** Guest state: "Login" text button linking to /login. */
export function GuestLoginLink({ label }: GuestLoginLinkProps) {
  return (
    <Link
      href="/login"
      className="inline-flex h-10 items-center justify-center rounded border border-[#998C5F] px-3 text-sm leading-5 font-bold tracking-[0.1px] whitespace-nowrap text-white transition-colors duration-200 hover:bg-[#FFEA9E]/10 focus-visible:bg-[#FFEA9E]/10 focus-visible:outline-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none"
    >
      {label}
    </Link>
  );
}

/** Signed-in bell: UI only (no badge, no panel, no handler). */
export function NotificationBell({ label }: NotificationBellProps) {
  return (
    // mm:I2167:9091;186:2101
    <button type="button" aria-label={label} className={ICON_BUTTON}>
      <BellIcon />
    </button>
  );
}
