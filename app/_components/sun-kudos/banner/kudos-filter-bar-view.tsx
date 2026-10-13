import Link from "next/link";
import { KudosChevronDownIcon } from "./banner-icons";
import type { KudosFilterBarViewProps, KudosFilterView } from "./kudos-banner-types";

const OPTION_BASE =
  "flex h-12 items-center rounded-sm px-4 text-base leading-6 font-bold tracking-[0.15px] whitespace-nowrap text-white transition-colors duration-200 hover:bg-[#FFEA9E]/20 focus-visible:bg-[#FFEA9E]/20 focus-visible:outline-none motion-reduce:transition-none";

function activeLabel({ options, selectedValue, buttonLabel }: KudosFilterView) {
  if (selectedValue === null) return buttonLabel;
  return options.find((option) => option.value === selectedValue)?.label ?? buttonLabel;
}

/**
 * Controlled view of the Hashtag / Phòng ban buttons and their option lists
 * (Figma B.1.1, B.1.2). Owns no state: the container decides which list is open
 * (`expanded`), what the options link to, and how focus and Esc behave. Options
 * are links (`role="option"`) so a choice is a plain, replace-style navigation.
 */
export function KudosFilterBarView({
  filters,
  onToggle,
  onClose,
  triggerRefs,
  menuRefs,
  onMenuKeyDown,
}: KudosFilterBarViewProps) {
  return (
    // mm:2940:13458 — Buttons
    <div className="flex items-center gap-2">
      {filters.map((filter, index) => {
        const { id, buttonLabel, selectedValue, options, expanded } = filter;
        const menuId = `kudos-filter-menu-${id}`;
        const alignEnd = index === filters.length - 1;
        return (
          // mm:2940:13459 (B.1.1_ButtonHashtag) / mm:2940:13460 (B.1.2_Button Phong ban)
          <div key={id} className="relative">
            <button
              ref={triggerRefs?.[id]}
              type="button"
              aria-haspopup="listbox"
              aria-expanded={expanded}
              aria-controls={expanded ? menuId : undefined}
              onClick={() => onToggle(id)}
              className="flex cursor-pointer items-center gap-2 rounded border border-[#998C5F] bg-[#FFEA9E]/10 p-4 text-base leading-6 font-bold tracking-[0.15px] text-white transition-colors duration-200 hover:bg-[#FFEA9E]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] aria-expanded:bg-[#FFEA9E]/20 motion-reduce:transition-none"
            >
              {/* mm:I2940:13459;186:2760 / mm:I2940:13460;186:2760 */}
              <span>{activeLabel(filter)}</span>
              {/* mm:I2940:13459;186:2761 / mm:I2940:13460;186:2761 — MM_MEDIA_Down */}
              <KudosChevronDownIcon
                className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
              />
            </button>
            {expanded ? (
              // Same popup look as the language menu (Figma 525:11713): the filter list has no frame of its own.
              <div
                ref={menuRefs?.[id]}
                id={menuId}
                role="listbox"
                aria-label={buttonLabel}
                onKeyDown={onMenuKeyDown}
                className={`absolute top-full z-40 mt-1 flex max-h-80 min-w-full flex-col overflow-y-auto rounded-lg border border-[#998C5F] bg-[#00070C] p-1.5 ${alignEnd ? "right-0" : "left-0"}`}
              >
                {options.map((option) => {
                  const selected = option.value === selectedValue;
                  return (
                    <Link
                      key={option.value ?? "all"}
                      href={option.href}
                      replace
                      scroll={false}
                      role="option"
                      aria-selected={selected}
                      onClick={onClose}
                      className={`${OPTION_BASE} ${selected ? "bg-[#FFEA9E]/20" : ""}`}
                    >
                      {option.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
