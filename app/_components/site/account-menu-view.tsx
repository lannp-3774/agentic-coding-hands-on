import Link from "next/link";
import { UserIcon } from "./site-icons";
import type { AccountMenuViewProps } from "./site-types";

const MENU_ITEM =
  "flex h-14 w-full cursor-pointer items-center rounded-sm bg-transparent px-4 text-left text-base leading-6 font-bold tracking-[0.15px] whitespace-nowrap text-white transition-colors duration-200 hover:bg-[#FFEA9E]/10 hover:[text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287] focus-visible:bg-[#FFEA9E]/10 focus-visible:outline-none motion-reduce:transition-none";

/**
 * Stateless account button + dropdown. The parent owns `open`, the refs and the
 * handlers (open/close, outside click, Esc, focus return).
 */
export function AccountMenuView({
  open,
  menuId,
  triggerLabel,
  triggerRef,
  menuRef,
  onTriggerClick,
  onMenuKeyDown,
  items,
  signOut,
}: AccountMenuViewProps) {
  return (
    // mm:I2167:9091;186:1597
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={onTriggerClick}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded border border-[#998C5F] text-white transition-colors duration-200 hover:bg-[#FFEA9E]/10 focus-visible:bg-[#FFEA9E]/10 focus-visible:outline-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none"
      >
        <UserIcon />
      </button>
      {open ? (
        // mm:666:9601 (Dropdown-profile list)
        <div
          id={menuId}
          ref={menuRef}
          role="menu"
          onKeyDown={onMenuKeyDown}
          className="absolute top-full right-0 z-40 mt-2 flex min-w-[160px] flex-col rounded-lg border border-[#998C5F] bg-[#00070C] p-1.5"
        >
          {items.map((item) => (
            <Link key={item.key} href={item.href} role="menuitem" className={MENU_ITEM}>
              {item.label}
            </Link>
          ))}
          <form action={signOut.action} role="none">
            <button type="submit" role="menuitem" className={MENU_ITEM}>
              {signOut.label}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
