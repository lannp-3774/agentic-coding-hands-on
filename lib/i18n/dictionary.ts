import type { Locale } from "./locales";

export type Dictionary = {
  login: {
    title: string;
    intro1: string;
    intro2: string;
    loginButton: string;
    loginFailed: string;
    footer: string;
  };
  todo: {
    logout: string;
  };
};

const dictionaries = {
  vi: {
    login: {
      title: "ROOT FURTHER",
      intro1: "Bắt đầu hành trình của bạn cùng SAA 2025.",
      intro2: "Đăng nhập để khám phá!",
      loginButton: "LOGIN With Google",
      loginFailed: "Đăng nhập không thành công. Vui lòng thử lại.",
      footer: "Bản quyền thuộc về Sun* © 2025",
    },
    todo: {
      logout: "Đăng xuất",
    },
  },
  en: {
    login: {
      title: "ROOT FURTHER",
      intro1: "Start your journey with SAA 2025.",
      intro2: "Log in to explore!",
      loginButton: "LOGIN With Google",
      loginFailed: "Login failed. Please try again.",
      footer: "Copyright © 2025 Sun*",
    },
    todo: {
      logout: "Log out",
    },
  },
} satisfies Record<Locale, Dictionary>;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
