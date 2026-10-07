"use client";

import { useEffect } from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES } from "@/lib/i18n/locales";

// Runs while the HTML is parsed (hard load): sets <html lang> from the
// locale cookie before first paint, without the root layout reading
// cookies (which would block every route under cacheComponents).
// The script stays self-contained: the constants are inlined as JSON literals.
const SET_LANG_SCRIPT = `(function(){try{var n=${JSON.stringify(`${LOCALE_COOKIE}=`)},v=null,c=document.cookie.split("; ");for(var i=0;i<c.length&&v===null;i++){if(c[i].indexOf(n)===0)v=decodeURIComponent(c[i].slice(n.length))}document.documentElement.lang=${JSON.stringify(LOCALES)}.indexOf(v)>-1?v:${JSON.stringify(DEFAULT_LOCALE)}}catch(e){}})()`;

// Server renders type="text/javascript" so the script executes; the client
// renders "text/plain" to avoid React's dev warning about <script> tags.
function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function HtmlLangScript() {
  return <InlineScript html={SET_LANG_SCRIPT} />;
}

// Soft navigations (e.g. after the setLocale action refreshes the tree) do not
// re-run the inline script, so keep <html lang> in sync from the resolved locale.
export function HtmlLangSync({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
