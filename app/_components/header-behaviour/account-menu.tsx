"use client";

import { useId } from "react";
import { AccountMenuView } from "@/app/_components/site/account-menu-view";
import type { AccountMenuViewProps } from "@/app/_components/site/site-types";
import { useMenuDisclosure } from "@/lib/ui/use-menu-disclosure";

export type AccountMenuProps = Pick<AccountMenuViewProps, "triggerLabel" | "items" | "signOut">;

/**
 * Signed-in account button + dropdown (F003 A2). Owns the open/close
 * behaviour; the markup is Track A's stateless AccountMenuView. `items` is
 * already role-filtered on the server, so the role itself never reaches the
 * browser; `signOut.action` is the Server Action passed through as a prop.
 */
export function AccountMenu({ triggerLabel, items, signOut }: AccountMenuProps) {
  const menuId = useId();
  const { open, triggerRef, menuRef, toggle, onMenuKeyDown } = useMenuDisclosure();

  return (
    <AccountMenuView
      open={open}
      menuId={menuId}
      triggerLabel={triggerLabel}
      triggerRef={triggerRef}
      menuRef={menuRef}
      onTriggerClick={toggle}
      onMenuKeyDown={onMenuKeyDown}
      items={items}
      signOut={signOut}
    />
  );
}
