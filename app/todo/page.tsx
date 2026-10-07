import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { HtmlLangSync } from "@/app/_components/html-lang";
import { montserrat } from "@/app/_components/saa-fonts";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

// Static shell: the session and locale cookies are read inside <Suspense>
// (cacheComponents), so nothing request-specific blocks the prerender.
export default function TodoPage() {
  return (
    <main
      className={`${montserrat.className} flex min-h-screen flex-col items-center justify-center bg-[#00101A] px-4 text-white`}
    >
      <Suspense fallback={null}>
        <TodoContent />
      </Suspense>
    </main>
  );
}

async function TodoContent() {
  // The session check must run per request: getClaims() reads the clock,
  // which cacheComponents rejects during prerendering.
  await connection();
  // Defence in depth (BR-007): proxy.ts already gates /todo, but proxy is
  // skipped for POSTs and can be removed — never rely on it alone.
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/login");
  }

  const email = data.claims.email;
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="flex flex-col items-center gap-6">
      <HtmlLangSync locale={locale} />
      {email ? <p className="text-xl">{email}</p> : null}
      <form action={signOut}>
        <button
          type="submit"
          className="cursor-pointer rounded-lg bg-[#FFEA9E] px-6 py-3 text-base text-[#00101A] transition-colors hover:bg-[#ffe27a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {dict.todo.logout}
        </button>
      </form>
    </div>
  );
}
