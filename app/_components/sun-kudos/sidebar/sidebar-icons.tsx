// Inline icons for the personal sidebar (F009). Figma exports hard-code white
// fills, so the gift is redrawn with `currentColor` and takes its colour from
// the button text (code-rules 2a).

/** mm:I2940:13497;186:1766 — MM_MEDIA_Open Gift, 24x24 (Secret Box button). */
export function IconOpenGift(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M22.5 10.3698L19.76 8.77984C20 8.56984 20.23 8.29984 20.4 7.99984C21.23 6.56984 20.74 4.72984 19.3 3.89984C18.44 3.39984 17.43 3.39984 16.58 3.75984L16.59 3.74984L15.71 4.13984L15.6 3.17984L15.59 3.18984C15.5 2.27984 14.97 1.39984 14.11 0.899841C12.67 0.0748415 10.84 0.569842 10 1.99984C9.83 2.29984 9.72 2.62984 9.66 2.94984L6.91 1.36984C5.95 0.819842 4.73 1.13984 4.18 2.09984L2.68 4.69984C2.4 5.17984 2.57 5.78984 3.05 6.05984L4.78 7.05984L9 9.49984H2.5V19.4998C2.5 20.6098 3.4 21.4998 4.5 21.4998H20.5C21.61 21.4998 22.5 20.6098 22.5 19.4998V14.3698L23.23 13.0998C23.78 12.1398 23.46 10.9198 22.5 10.3698ZM16.94 5.99984C17.21 5.49984 17.83 5.35984 18.3 5.62984C18.78 5.90984 18.95 6.49984 18.67 6.99984C18.39 7.49984 17.78 7.63984 17.3 7.36984C16.83 7.08984 16.66 6.49984 16.94 5.99984ZM14.57 8.09984L21.5 12.0998L20.5 13.8298L13.57 9.82984L14.57 8.09984ZM11.5 19.4998H4.5V11.4998H11.5V19.4998ZM11.84 8.82984L4.91 4.82984L5.91 3.09984L12.84 7.09984L11.84 8.82984ZM12.11 4.36984C11.63 4.08984 11.47 3.49984 11.74 2.99984C12 2.49984 12.63 2.35984 13.11 2.62984C13.59 2.90984 13.75 3.49984 13.47 3.99984C13.2 4.49984 12.59 4.63984 12.11 4.36984ZM13.5 19.4998V12.0998L20.5 16.1398V19.4998H13.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * mm:3241:14932 — "image 35", 34x40 flame next to "Số tim bạn nhận được:".
 * Figma ships it as a raster fill the MoMorph media API cannot export, so this
 * is a two-tone vector flame in the same orange/yellow palette.
 */
export function IconFlame(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="34" height="40" viewBox="0 0 34 40" fill="none" aria-hidden="true" {...props}>
      <path
        d="M17 1C17 1 21 9 24 12C26 8 25 5 25 5C31 11 33 17 33 23C33 32 26 39 17 39C8 39 1 32 1 23C1 17 4 12 7 9C8 12 9 14 11 15C10 9 13 4 17 1Z"
        fill="#FFA726"
      />
      <path
        d="M17 16C17 16 21 22 22 26C23 25 23 24 23 24C25 27 26 30 25 32C24 35 21 37 17 37C13 37 10 34 10 30C10 27 12 25 13 23C14 24 14 25 14 25C14 21 15 18 17 16Z"
        fill="#FF7A1A"
      />
    </svg>
  );
}
