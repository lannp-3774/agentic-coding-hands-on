import type { SVGProps } from "react";

// Inline 24x24 icons exported from Figma (MM_MEDIA_*, saved under
// public/sun-kudos/banner/icon-*.svg); fills are currentColor so the parent
// sets the colour (white on the pills and filter buttons).
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": true,
  focusable: false,
} as const;

export function KudosPenIcon(props: IconProps) {
  return (
    // mm:I2940:13449;186:2759
    <svg {...base} {...props}>
      <path
        d="M20.8067 6.72951C21.1967 6.33951 21.1967 5.68951 20.8067 5.31951L18.4667 2.97951C18.0967 2.58951 17.4467 2.58951 17.0567 2.97951L15.2167 4.80951L18.9667 8.55951M3.09668 16.9395V20.6895H6.84668L17.9067 9.61951L14.1567 5.86951L3.09668 16.9395Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function KudosSearchIcon(props: IconProps) {
  return (
    // mm:I2940:13450;186:2759
    <svg {...base} {...props}>
      <path
        d="M9.5 3C11.2239 3 12.8772 3.68482 14.0962 4.90381C15.3152 6.12279 16 7.77609 16 9.5C16 11.11 15.41 12.59 14.44 13.73L14.71 14H15.5L20.5 19L19 20.5L14 15.5V14.71L13.73 14.44C12.59 15.41 11.11 16 9.5 16C7.77609 16 6.12279 15.3152 4.90381 14.0962C3.68482 12.8772 3 11.2239 3 9.5C3 7.77609 3.68482 6.12279 4.90381 4.90381C6.12279 3.68482 7.77609 3 9.5 3ZM9.5 5C7 5 5 7 5 9.5C5 12 7 14 9.5 14C12 14 14 12 14 9.5C14 7 12 5 9.5 5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function KudosChevronDownIcon(props: IconProps) {
  return (
    // mm:I2940:13459;186:2761 (same asset for I2940:13460;186:2761)
    <svg {...base} {...props}>
      <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
    </svg>
  );
}
