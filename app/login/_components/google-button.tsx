"use client";

import { useActionState, useEffect } from "react";
import type { SignInAction } from "./login-types";

type GoogleButtonProps = {
  action: SignInAction;
  label: string;
  errorMessage: string;
  showInitialError: boolean;
};

export function GoogleButton({
  action,
  label,
  errorMessage,
  showInitialError,
}: GoogleButtonProps) {
  const [state, formAction, pending] = useActionState(action, {
    error: showInitialError ? ("failed" as const) : null,
  });

  // Back/forward cache can restore the pending state after returning from Google.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* mm:662:14425 */}
      <form action={formAction}>
        {/* mm:662:14426 */}
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-[#FFEA9E] px-4 py-3 text-[#00101A] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(255,234,158,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] disabled:cursor-wait disabled:opacity-70 disabled:shadow-none md:px-6 md:py-4"
        >
          {/* mm:I662:14426;186:1568 */}
          <span className="whitespace-pre text-lg leading-7 font-bold md:text-[22px]">
            {label}
          </span>
          {pending ? <SpinnerIcon /> : <GoogleIcon />}
        </button>
      </form>
      {!pending && state.error ? (
        <p
          role="alert"
          className="max-w-[480px] pl-1 text-sm leading-6 font-bold text-[#FFB4AB] md:text-base"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function GoogleIcon() {
  return (
    // mm:I662:14426;186:1766
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0"
    >
      <path
        d="M20.8245 12.2073C20.8245 11.5955 20.7748 10.9804 20.669 10.3785H12.1799V13.8443H17.0412C16.8395 14.962 16.1913 15.9508 15.2422 16.5792V18.8279H18.1425C19.8456 17.2604 20.8245 14.9455 20.8245 12.2073Z"
        fill="#4285F4"
      />
      <path
        d="M12.1799 21.0006C14.6073 21.0006 16.6543 20.2036 18.1458 18.8279L15.2455 16.5792C14.4386 17.1281 13.3969 17.439 12.1832 17.439C9.83527 17.439 7.84445 15.8549 7.13014 13.7252H4.1373V16.0434C5.66514 19.0826 8.77703 21.0006 12.1799 21.0006Z"
        fill="#34A853"
      />
      <path
        d="M7.12684 13.7252C6.74984 12.6074 6.74984 11.3971 7.12684 10.2793V7.96112H4.13731C2.86081 10.5042 2.8608 13.5003 4.1373 16.0434L7.12684 13.7252Z"
        fill="#FBBC04"
      />
      <path
        d="M12.1799 6.56224C13.463 6.5424 14.7032 7.02523 15.6324 7.9115L18.202 5.34196C16.5749 3.81413 14.4155 2.97415 12.1799 3.00061C8.77702 3.00061 5.66515 4.91868 4.13731 7.96112L7.12684 10.2793C7.83785 8.14631 9.83196 6.56224 12.1799 6.56224Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 motion-safe:animate-spin"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
