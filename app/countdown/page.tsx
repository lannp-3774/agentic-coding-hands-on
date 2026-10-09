import { Suspense } from "react";
import { CountdownPrelaunchContent } from "./_components/countdown-prelaunch-content";

// Static shell: the connection(), locale cookie, DB read and clock all happen
// inside the <Suspense> child, so cacheComponents prerenders only this shell and
// every request renders the content fresh (never a stale `serverNowMs`).
// No SaaPageShell: the view brings its own <main>, base colour and font variable.
export default function CountdownPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh w-full bg-[#00101A]" />}>
      <CountdownPrelaunchContent />
    </Suspense>
  );
}
