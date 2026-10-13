import { SpotlightPanZoomIcon } from "./spotlight-icons";

type SpotlightPanZoomButtonProps = {
  label: string;
  pressed: boolean;
  disabled?: boolean;
  /** Compact layout: in the page flow at full size (44px target) instead of pinned on the board. */
  flow?: boolean;
  onToggle?: () => void;
};

/** mm:3007:17479 (B.7.2) Pan/Zoom toggle, bottom-right, with a "Pan/Zoom" hover tooltip. */
export function SpotlightPanZoomButton({
  label,
  pressed,
  disabled = false,
  flow = false,
  onToggle,
}: SpotlightPanZoomButtonProps) {
  return (
    // mm:3007:17479
    <div className={`group z-10 ${flow ? "relative shrink-0" : "absolute right-[38px] bottom-[47px]"}`}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={pressed}
        disabled={disabled}
        onClick={onToggle}
        className={`flex ${flow ? "size-11" : "size-[30px]"} cursor-pointer items-center justify-center rounded-md border transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] disabled:cursor-not-allowed disabled:opacity-50 ${
          pressed
            ? "border-[#998C5F] bg-[#FFEA9E]/20 text-[#FFEA9E]"
            : "border-transparent text-white hover:text-[#FFEA9E]"
        }`}
      >
        <SpotlightPanZoomIcon />
      </button>
      {/* Visual hint only: the button's own aria-label already names it. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-full mb-1 rounded border border-[#998C5F] bg-[#00101A] px-2 py-1 text-sm leading-5 font-medium whitespace-nowrap md:text-xs md:leading-4 text-white opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none"
      >
        {label}
      </span>
    </div>
  );
}
