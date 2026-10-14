import Image from "next/image";
import type { SunnerOption } from "@/lib/kudos/write-kudos-types";

type WriteKudosSunnerListboxProps = {
  /** Listbox id; each option is `${id}-option-${index}` (for aria-activedescendant). */
  id: string;
  label: string;
  options: SunnerOption[];
  activeIndex: number;
  onSelect: (option: SunnerOption) => void;
  className?: string;
};

export function sunnerOptionId(listId: string, index: number): string {
  return `${listId}-option-${index}`;
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function SunnerAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const local = avatarUrl && avatarUrl.startsWith("/") && !avatarUrl.startsWith("//");
  if (local) {
    return <Image src={avatarUrl} alt="" width={32} height={32} className="size-8 shrink-0 rounded-full bg-[#EEE] object-cover" />;
  }
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#EEE] text-xs leading-4 font-bold text-[#00101A]"
    >
      {initialsOf(name)}
    </span>
  );
}

/**
 * Suggestion list for the recipient search (B) and the "@" mentions (D): avatar or initials,
 * name, department. Options keep the input focused (mousedown is not allowed to blur it).
 */
export function WriteKudosSunnerListbox({ id, label, options, activeIndex, onSelect, className = "" }: WriteKudosSunnerListboxProps) {
  return (
    <ul
      id={id}
      role="listbox"
      aria-label={label}
      className={`absolute z-20 max-h-60 w-full overflow-y-auto rounded-lg border border-[#998C5F] bg-white py-1 shadow-lg ${className}`}
    >
      {options.map((option, index) => (
        <li
          key={option.id}
          id={sunnerOptionId(id, index)}
          role="option"
          aria-selected={index === activeIndex}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(option)}
          className={`flex cursor-pointer items-center gap-3 px-4 py-2 text-[#00101A] hover:bg-[#FFEA9E]/40 ${index === activeIndex ? "bg-[#FFEA9E]/40" : ""}`}
        >
          <SunnerAvatar name={option.name} avatarUrl={option.avatarUrl} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-base leading-6 font-bold">{option.name}</span>
            {option.department ? <span className="truncate text-xs leading-4 font-bold text-[#999]">{option.department}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
