import { Suspense } from "react";
import { HomeContent } from "@/app/_components/home/home-content";
import { SaaPageShell } from "@/app/_components/site/saa-page-shell";

// Static shell: the locale cookie, session and DB reads all happen inside
// <Suspense> children so cacheComponents can prerender this page.
export default function HomePage() {
  return (
    <SaaPageShell>
      <Suspense fallback={<div className="min-h-screen w-full bg-[#00101A]" />}>
        <HomeContent />
      </Suspense>
    </SaaPageShell>
  );
}
