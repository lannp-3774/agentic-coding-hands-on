import { Suspense } from "react";
import { AccountSlotSkeleton, GuestLoginLink, NotificationBell } from "@/app/_components/site/account-slot-parts";
import type { AccountMenuItem } from "@/app/_components/site/site-types";
import { signOut } from "@/lib/auth/actions";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";
import { getCurrentUser, type UserRole } from "@/lib/supabase/current-user";
import { AccountMenu } from "./account-menu";

type RegionProps = { locale: Locale };

/**
 * Header right side for F003 (A1, DEC-001), split in two because the bell sits
 * left of the language selector and the account control right of it:
 *   <SiteHeader bellSlot={<AccountBellRegion locale />} accountSlot={<AccountRegion locale />} />
 *
 * Both read the session through `getCurrentUser()`, which is wrapped in
 * React `cache()`: one claims + role lookup per request, shared by both.
 * Each carries its own <Suspense> so the session read never blocks the page
 * and a signed-in user never sees a "Login" flash (FR-205).
 */

/** Signed-in only: the notification bell (UI only, FR-201/FR-202). Guests get nothing. */
export function AccountBellRegion({ locale }: RegionProps) {
  return (
    // No placeholder: the header's right group is right-aligned, so the bell
    // appearing grows it leftwards without moving the language selector.
    <Suspense fallback={null}>
      <SignedInBell locale={locale} />
    </Suspense>
  );
}

/** Guest: "Login" link to /login. Signed in: account button + menu (FR-101, FR-201, FR-203). */
export function AccountRegion({ locale }: RegionProps) {
  return (
    // Same 96x40 footprint as the resolved content, never the guest link.
    <Suspense fallback={<AccountSlotSkeleton />}>
      <AccountControl locale={locale} />
    </Suspense>
  );
}

async function SignedInBell({ locale }: RegionProps) {
  const user = await getCurrentUser();
  if (!user) return null;
  return <NotificationBell label={getDictionary(locale).accountMenu.notifications} />;
}

async function AccountControl({ locale }: RegionProps) {
  const user = await getCurrentUser();
  const copy = getDictionary(locale).accountMenu;
  if (!user) return <GuestLoginLink label={copy.login} />;

  return (
    <AccountMenu
      triggerLabel={copy.account}
      items={accountMenuItems(user.role, copy)}
      signOut={{ label: copy.signOut, action: signOut }}
    />
  );
}

/**
 * BR-003: the admin entry is listed only for a role read as exactly "admin"
 * (getCurrentUser already fails closed to "user"). Hiding it is UX only —
 * /admin must re-check the role server-side when it is built (BR-004).
 */
function accountMenuItems(role: UserRole, copy: Dictionary["accountMenu"]): AccountMenuItem[] {
  const items: AccountMenuItem[] = [{ key: "profile", label: copy.profile, href: "/profile" }];
  if (role === "admin") items.push({ key: "admin", label: copy.admin, href: "/admin" });
  return items;
}
