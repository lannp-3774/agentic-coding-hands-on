import { HeartIcon } from "./card-icons";

export type KudosHeartViewProps = {
  count: number;
  /** Red heart + aria-pressed when the viewer already liked this kudos. */
  liked: boolean;
  /** Sender's own kudos (and any state where liking is not allowed). */
  disabled: boolean;
  /** A like request is in flight (behaviour wired by the heart-button phase). */
  pending?: boolean;
  /** Accessible name of the button (copy.card.heart). */
  label: string;
  onClick?: () => void;
};

/** Heart count as in Figma: dot as thousands separator ("1.000"). Not ICU: stable across runtimes. */
export function formatHeartCount(count: number): string {
  return String(Math.max(0, Math.trunc(count))).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Stateless heart view (F007 FR-201..203): gray = not liked, red = liked. The
// only button[aria-pressed] of a card; the like behaviour lives in the client
// wrapper that renders this view.
export function KudosHeartView({ count, liked, disabled, pending = false, label, onClick }: KudosHeartViewProps) {
  return (
    // mm:I3127:21871;256:5175
    <button
      type="button"
      aria-pressed={liked}
      aria-label={label}
      aria-busy={pending || undefined}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1 rounded text-[#00101A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00101A] disabled:cursor-not-allowed enabled:cursor-pointer"
    >
      {/* mm:I3127:21871;256:5174 */}
      <span className="text-2xl leading-8 font-bold">{formatHeartCount(count)}</span>
      {/* mm:I3127:21871;256:5171 */}
      <HeartIcon
        width={32}
        height={32}
        className={`${liked ? "text-[#D4271D]" : "text-[#999]"} ${pending ? "animate-pulse motion-reduce:animate-none" : ""}`}
      />
    </button>
  );
}
