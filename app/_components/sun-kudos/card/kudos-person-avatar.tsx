import Image from "next/image";

// Avatar sources (F006 clarifications): a local `/...` path goes through
// next/image; a Google `https://` URL is hotlinked with a plain <img> (no
// remotePatterns configured); no avatar renders the person's initials.
const CLASS = "size-16 rounded-full border-[1.869px] border-white bg-[#EEE] object-cover";

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function KudosPersonAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl && avatarUrl.startsWith("/") && !avatarUrl.startsWith("//")) {
    // mm:I3127:21871;256:4858;256:4734
    return <Image src={avatarUrl} alt="" width={64} height={64} className={CLASS} />;
  }
  if (avatarUrl && avatarUrl.startsWith("https://")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote avatar hotlinked on purpose (no remotePatterns)
      <img
        src={avatarUrl}
        alt=""
        width={64}
        height={64}
        referrerPolicy="no-referrer"
        loading="lazy"
        className={CLASS}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex size-16 items-center justify-center rounded-full border-[1.869px] border-white bg-[#EEE] text-xl leading-8 font-bold text-[#00101A]"
    >
      {initialsOf(name)}
    </span>
  );
}
