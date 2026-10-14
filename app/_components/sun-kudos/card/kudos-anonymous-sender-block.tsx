// Sender block of an anonymous kudos (F010): same footprint as `KudosPersonBlock`
// but only the alias — no avatar image or initial, profile link, department,
// hero badge or stars, so nothing identifies the real sender.
export function KudosAnonymousSenderBlock({ alias }: { alias: string }) {
  return (
    // mm:I3127:21871;256:4858
    <div className="relative z-10 flex min-w-0 flex-1 flex-col items-center justify-center gap-[13px]">
      {/* mm:I3127:21871;256:4858;256:4734 — neutral placeholder in place of the avatar */}
      <span aria-hidden="true" className="size-16 rounded-full border-[1.869px] border-white bg-[#EEE]" />
      {/* mm:I3127:21871;256:4858;256:4737 */}
      <div className="flex w-full flex-col items-center gap-0.5">
        {/* mm:I3127:21871;256:4858;256:4735 */}
        <span className="max-w-full truncate text-center text-base leading-6 font-bold tracking-[0.15px] text-[#00101A]">
          {alias}
        </span>
      </div>
    </div>
  );
}
