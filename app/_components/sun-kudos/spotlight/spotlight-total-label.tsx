/** `{total} KUDOS`; accepts a bare suffix ("KUDOS") or a "{total}" template. */
export function formatSpotlightTotal(total: number, kudosSuffix: string): string {
  return kudosSuffix.includes("{total}")
    ? kudosSuffix.replace("{total}", String(total))
    : `${total} ${kudosSuffix}`;
}

/**
 * mm:3007:17482 (B.7.1) total label, centred at the top of the board. `flow` drops the
 * absolute placement for the compact layout, where it sits above the board at full size.
 */
export function SpotlightTotalLabel({ text, flow = false }: { text: string; flow?: boolean }) {
  return (
    // mm:3007:17482
    <p
      className={`pointer-events-none z-10 text-3xl leading-[44px] font-bold whitespace-nowrap text-white md:text-4xl ${
        flow ? "text-center" : "absolute top-[14px] left-1/2 -translate-x-1/2"
      }`}
    >
      {text}
    </p>
  );
}
