import type { SVGProps } from "react";

// Inline icons of the Sun* Kudos board frames (F006). Paths come from the Figma
// export of MM_MEDIA_Left / MM_MEDIA_Right; fill is `currentColor` so the parent
// sets the colour (white in the design).

type IconProps = SVGProps<SVGSVGElement>;

/** Chevron pointing left: previous slide (B.2.1, B.5.1). */
export function IconChevronLeft(props: IconProps) {
  return (
    // mm:I2940:13470;186:1420
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" {...props}>
      <path d="M15.41 16.58L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.58Z" fill="currentColor" />
    </svg>
  );
}

/** Chevron pointing right: next slide (B.2.2, B.5.3). */
export function IconChevronRight(props: IconProps) {
  return (
    // mm:I2940:13468;186:1420
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M8.57959 16.4777L13.1596 11.8977L8.57959 7.3077L9.98959 5.89771L15.9896 11.8977L9.98959 17.8977L8.57959 16.4777Z"
        fill="currentColor"
      />
    </svg>
  );
}
