import { Suspense } from "react";
import { SaaPageShell } from "@/app/_components/site/saa-page-shell";
import { SunKudosContent, type SunKudosSearchParams } from "./_components/sun-kudos-content";

// Static shell: the URL filters, locale cookie, session and DB reads all happen
// inside <Suspense> children so cacheComponents can prerender this page.
export default function SunKudosPage({ searchParams }: { searchParams: Promise<SunKudosSearchParams> }) {
  return (
    <SaaPageShell>
      <Suspense fallback={<div className="min-h-screen w-full bg-[#00101A]" />}>
        <SunKudosContent searchParams={searchParams} />
      </Suspense>
    </SaaPageShell>
  );
}
