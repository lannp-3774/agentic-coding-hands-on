"use client";

import Image from "next/image";
import { startTransition, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { SelectLocale } from "./site-types";

type LanguageSelectorProps = {
  currentLocale: Locale;
  onSelect: SelectLocale;
};

const OPTIONS: { locale: Locale; code: string; flag: string }[] = [
  { locale: "vi", code: "VN", flag: "/login/flag-vn.svg" },
  { locale: "en", code: "EN", flag: "/login/flag-gb.svg" },
];

// Accessible-name prefix for the trigger; the visible text stays "VN"/"EN".
const TRIGGER_LABEL: Record<Locale, string> = {
  vi: "Ngôn ngữ",
  en: "Language",
};

export function LanguageSelector({
  currentLocale,
  onSelect,
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const current = OPTIONS.find((o) => o.locale === currentLocale) ?? OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const select = (locale: Locale) => {
    close();
    if (locale === currentLocale) return;
    startTransition(async () => {
      try {
        await onSelect(locale);
      } catch (error) {
        // Keep the current locale; never let a failed switch reach the error boundary.
        console.error("[language] switch failed", error);
      }
    });
  };

  const onMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "Tab") {
      // Focus leaves the menu: close without pulling focus back to the trigger.
      setOpen(false);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    );
    const index = items.indexOf(document.activeElement as HTMLElement);
    const step = event.key === "ArrowDown" ? 1 : -1;
    items[(index + step + items.length) % items.length]?.focus();
  };

  return (
    // mm:I662:14391;186:1601
    <div ref={rootRef} className="relative">
      {/* mm:I662:14391;186:1696;186:1821 */}
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${TRIGGER_LABEL[currentLocale]}: ${current.code}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 min-w-[92px] cursor-pointer items-center justify-between gap-0.5 rounded bg-transparent px-3 text-white transition-colors duration-200 hover:bg-[#FFEA9E]/20 focus-visible:outline-2 focus-visible:outline-[#FFEA9E] md:min-w-[108px] md:px-4"
      >
        <span className="flex items-center gap-1">
          {/* mm:I662:14391;186:1696;186:1821;186:1709 */}
          {/* mm:I2167:9091;186:1696;186:1821;186:1709;178:1010 */}
          <Image src={current.flag} alt="" width={24} height={24} />
          {/* mm:I662:14391;186:1696;186:1821;186:1439 */}
          <span className="text-base leading-6 font-bold tracking-[0.15px]">
            {current.code}
          </span>
        </span>
        {/* mm:I662:14391;186:1696;186:1821;186:1441 */}
        {/* mm:I2167:9091;186:1696;186:1821;186:1441 */}
        <svg
          aria-hidden="true"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        >
          <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
        </svg>
      </button>

      {open ? (
        // mm:525:11713
        <div
          role="menu"
          onKeyDown={onMenuKeyDown}
          className="absolute top-full right-0 z-40 mt-1 flex flex-col rounded-lg border border-[#998C5F] bg-[#00070C] p-1.5"
        >
          {OPTIONS.map((option) => {
            const selected = option.locale === currentLocale;
            return (
              <button
                key={option.locale}
                type="button"
                role="menuitem"
                autoFocus={selected}
                onClick={() => select(option.locale)}
                className={`flex h-14 w-[110px] cursor-pointer items-center justify-center gap-1 rounded-sm text-white transition-colors duration-200 hover:bg-[#FFEA9E]/20 focus-visible:bg-[#FFEA9E]/20 focus-visible:outline-none ${selected ? "bg-[#FFEA9E]/20" : ""}`}
              >
                <Image src={option.flag} alt="" width={24} height={24} />
                <span className="text-base leading-6 font-bold tracking-[0.15px]">
                  {option.code}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
