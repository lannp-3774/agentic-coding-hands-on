import { Suspense } from "react";
import { SaaPageShell } from "@/app/_components/site/saa-page-shell";
import { AwardsInformationContent } from "./_components/awards-information-content";

// Static shell: the locale cookie, session and DB reads all happen inside
// <Suspense> children so cacheComponents can prerender this page.
export default function AwardsInformationPage() {
  return (
    <SaaPageShell>
      <Suspense fallback={<div className="min-h-screen w-full bg-[#00101A]" />}>
        <AwardsInformationContent />
      </Suspense>
    </SaaPageShell>
  );
}
