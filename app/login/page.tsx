import { Suspense } from "react";
import { HtmlLangSync } from "../_components/html-lang";
import { getDictionary } from "@/lib/i18n/dictionary";
import { setLocale } from "@/lib/i18n/actions";
import { getLocale } from "@/lib/i18n/get-locale";
import { signInWithGoogle } from "./actions";
import { LoginScreen } from "./_components/login-screen";

// Error codes the callback route may append to /login (BR-003). Anything else
// is ignored so query text is never reflected into the page.
const ALERT_ERRORS = ["cancelled", "failed"];

// Static shell: request-time data (searchParams, cookies) is read inside the
// Suspense boundary so cacheComponents can prerender the surrounding page.
export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-[#00101A]" />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginContent({
  searchParams,
}: {
  searchParams: PageProps<"/login">["searchParams"];
}) {
  const [{ error }, locale] = await Promise.all([searchParams, getLocale()]);
  const showInitialError =
    typeof error === "string" && ALERT_ERRORS.includes(error);

  return (
    <>
      <HtmlLangSync locale={locale} />
      <LoginScreen
        locale={locale}
        copy={getDictionary(locale).login}
        signInAction={signInWithGoogle}
        onSelectLocale={setLocale}
        showInitialError={showInitialError}
      />
    </>
  );
}
