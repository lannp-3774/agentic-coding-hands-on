import { IconChevronLeft, IconChevronRight } from "./board-icons";

type CarouselArrowButtonProps = {
  direction: "prev" | "next";
  /** overlay: round 80px arrow over the faded sides (B.2.1/B.2.2); nav: 48px arrow of the pager (B.5.1/B.5.3). */
  variant: "overlay" | "nav";
  disabled: boolean;
  onClick: () => void;
  /** Accessible name; the overlay duplicates are `aria-hidden` and need none. */
  label?: string;
};

const SIZE = {
  overlay: { box: "size-20", icon: "size-[60px]" },
  nav: { box: "size-12", icon: "size-7" },
} as const;

/** Round chevron button shared by both arrow sets of the Highlight carousel. */
export function CarouselArrowButton({ direction, variant, disabled, onClick, label }: CarouselArrowButtonProps) {
  const size = SIZE[variant];
  const Icon = direction === "prev" ? IconChevronLeft : IconChevronRight;
  // The overlay arrows only repeat the pager for pointer users: out of the a11y tree and tab order.
  const decorative = variant === "overlay";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      tabIndex={decorative ? -1 : undefined}
      className={`pointer-events-auto flex ${size.box} shrink-0 items-center justify-center rounded p-2.5 text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] enabled:cursor-pointer enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40`}
    >
      <Icon className={size.icon} />
    </button>
  );
}
