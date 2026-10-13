import { SIDEBAR_CARD } from "./sidebar-styles";

// Fixed-size, text-free placeholders matching the loaded footprint so the guest
// login prompt never flashes while the session resolves (F009 FR-208).
const BAR = "rounded-lg bg-white/10";

// Loaded D.1 box: 24 + 357 + 24 padding + 2 border = 407px.
export function PersonalStatsSkeleton() {
  return (
    <div aria-hidden="true" className={`${SIDEBAR_CARD} h-[407px] animate-pulse p-6`}>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={`${BAR} h-10`} />
        ))}
        <div className={`${BAR} h-[60px]`} />
      </div>
    </div>
  );
}

// Loaded D.3 box: 24 + 456 + 24 padding + 2 border = 506px.
export function GiftRecipientsSkeleton() {
  return (
    <div aria-hidden="true" className={`${SIDEBAR_CARD} h-[506px] animate-pulse py-6 pr-4 pl-6`}>
      <div className={`${BAR} mb-4 h-14 w-full`} />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex h-16 items-center gap-2">
            <div className="size-16 shrink-0 rounded-full bg-white/10" />
            <div className={`${BAR} h-12 flex-1`} />
          </div>
        ))}
      </div>
    </div>
  );
}
