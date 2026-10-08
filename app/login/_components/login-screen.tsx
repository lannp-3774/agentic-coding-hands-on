import Image from "next/image";
import { GoogleButton } from "./google-button";
import { LanguageSelector } from "@/app/_components/site/language-selector";
import { montserrat, montserratAlternates } from "@/app/_components/saa-fonts";
import type { Locale } from "@/lib/i18n/locales";
import type {
  LoginCopy,
  SelectLocaleAction,
  SignInAction,
} from "./login-types";

type LoginScreenProps = {
  locale: Locale;
  copy: LoginCopy;
  signInAction: SignInAction;
  onSelectLocale: SelectLocaleAction;
  showInitialError: boolean;
};

export function LoginScreen({
  locale,
  copy,
  signInAction,
  onSelectLocale,
  showInitialError,
}: LoginScreenProps) {
  return (
    // mm:662:14387
    <div
      className={`${montserrat.variable} ${montserratAlternates.variable} relative min-h-screen w-full overflow-hidden bg-[#00101A] font-[family-name:var(--font-login-montserrat)] text-white`}
    >
      {/* mm:662:14388 — key visual (waves artwork) */}
      <Image
        src="/login/key-visual.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* mm:662:14392 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,#00101A_0%,#00101A_25.41%,rgba(0,16,26,0)_100%)]"
      />

      {/* mm:662:14391 */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between bg-[#0B0F12]/80 px-4 md:h-20 md:px-12 lg:px-36">
        {/* mm:I662:14391;178:1033;178:1030 */}
        <Image
          src="/login/logo.png"
          alt="Sun* Annual Awards 2025"
          width={52}
          height={48}
          priority
          className="h-auto w-10 md:w-[52px]"
        />
        <LanguageSelector currentLocale={locale} onSelect={onSelectLocale} />
      </header>

      {/* mm:662:14393 */}
      <main className="relative z-10 flex min-h-screen flex-col justify-center px-4 pt-16 pb-16 md:px-12 md:pt-[88px] md:pb-[91px] lg:px-36">
        <div className="flex flex-col items-start gap-10 md:gap-20">
          {/* mm:662:14395 */}
          <h1>
            {/* mm:2939:9548 */}
            <Image
              src="/login/root-further-title.png"
              alt=""
              width={451}
              height={200}
              priority
              className="h-auto w-[min(451px,70vw)]"
            />
            <span className="sr-only">{copy.title}</span>
          </h1>
          {/* mm:662:14755 */}
          <div className="flex flex-col items-start gap-6 pl-4">
            {/* mm:662:14753 */}
            <div className="max-w-[480px] text-base leading-8 font-bold tracking-[0.5px] select-none md:text-xl md:leading-10">
              <p>{copy.intro1}</p>
              <p>{copy.intro2}</p>
            </div>
            <GoogleButton
              action={signInAction}
              label={copy.loginButton}
              errorMessage={copy.loginFailed}
              showInitialError={showInitialError}
            />
          </div>
        </div>
      </main>

      {/* mm:662:14390 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[-20.2%] h-[106.7%] bg-[linear-gradient(0deg,#00101A_22.48%,rgba(0,19,32,0)_51.74%)]"
      />

      {/* mm:662:14447 */}
      <footer className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-center border-t border-[#2E3940] px-4 md:h-[91px] md:px-[90px]">
        {/* mm:I662:14447;342:1413 */}
        <p className="text-center font-[family-name:var(--font-login-montserrat-alternates)] text-xs leading-6 font-bold sm:text-base">
          {copy.footer}
        </p>
      </footer>
    </div>
  );
}
