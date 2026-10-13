import Image from "next/image";

// mm:I2940:13516;256:7460 — MM_MEDIA_Avatar, 64px circle, 1.869px white border.
// Local path -> next/image; https -> plain <img> (host not configured for
// next/image); anything else -> first letter of the name.
const FRAME =
  "box-border block size-16 shrink-0 rounded-full border-[1.869px] border-white object-cover";

type Props = { name: string; avatarUrl: string | null };

export function GiftRecipientAvatar({ name, avatarUrl }: Props) {
  if (avatarUrl?.startsWith("/") && !avatarUrl.startsWith("//")) {
    return <Image src={avatarUrl} alt="" width={64} height={64} className={FRAME} />;
  }
  if (avatarUrl?.startsWith("https://")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote host, see above
      <img src={avatarUrl} alt="" width={64} height={64} referrerPolicy="no-referrer" className={FRAME} />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`${FRAME} flex items-center justify-center bg-[#2E3940] text-[22px] leading-none font-bold text-[#FFEA9E]`}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
