import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locales";
import type { SignInState } from "../actions";

export type LoginCopy = Dictionary["login"];

export type SignInAction = (
  state: SignInState,
  formData: FormData,
) => Promise<SignInState>;

export type SelectLocaleAction = (locale: Locale) => Promise<void>;
