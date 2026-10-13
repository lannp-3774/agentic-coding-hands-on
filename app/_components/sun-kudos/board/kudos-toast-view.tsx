import type { KudosToastViewProps } from "./board-types";

const TONE = {
  success: "bg-[#FFEA9E] text-[#00101A]",
  error: "border border-[#FFB4AB] bg-[#00070C] text-[#FFB4AB]",
} as const;

/**
 * Small notice fixed at the bottom of the screen (R9). The `role="status"` element
 * stays mounted so screen readers announce the message when it appears; it has no
 * size while empty. The caller owns the 3 second auto-dismiss.
 */
export function KudosToastView({ tone, message, visible }: KudosToastViewProps) {
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      {visible ? (
        <p
          className={`max-w-full rounded-lg px-6 py-4 text-center text-base leading-6 font-bold tracking-[0.15px] shadow-lg ${TONE[tone]}`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
