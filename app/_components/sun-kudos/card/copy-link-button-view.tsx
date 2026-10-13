import { LinkIcon } from "./card-icons";

export type CopyLinkButtonViewProps = {
  /** Visible label and accessible name (copy.card.copyLink). */
  label: string;
  onClick?: () => void;
};

// Stateless "Copy Link" button (C.4.2): the clipboard + toast behaviour is wired
// by the client wrapper that renders this view.
export function CopyLinkButtonView({ label, onClick }: CopyLinkButtonViewProps) {
  return (
    // mm:I3127:21871;256:5216
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-14 cursor-pointer items-center gap-1 rounded p-4 text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] transition-colors duration-200 hover:bg-[#FFEA9E]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00101A] motion-reduce:transition-none"
    >
      {/* mm:I3127:21871;256:5216;186:1439 */}
      <span>{label}</span>
      {/* mm:I3127:21871;256:5216;186:1441 */}
      <LinkIcon />
    </button>
  );
}
