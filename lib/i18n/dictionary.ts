import { homeCopy, type HomeCopy } from "./home-copy";
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
  home: HomeCopy & { footer: { copyright: string } };
  accountMenu: {
    login: string;
    profile: string;
    signOut: string;
    admin: string;
    // aria-labels for the header icon buttons
    notifications: string;
    account: string;
  };
};

const viLogin = {
  title: "ROOT FURTHER",
  intro1: "Bắt đầu hành trình của bạn cùng SAA 2025.",
  intro2: "Đăng nhập để khám phá!",
  loginButton: "LOGIN With Google",
  loginFailed: "Đăng nhập không thành công. Vui lòng thử lại.",
  footer: "Bản quyền thuộc về Sun* © 2025",
};

const enLogin = {
  title: "ROOT FURTHER",
  intro1: "Start your journey with SAA 2025.",
  intro2: "Log in to explore!",
  loginButton: "LOGIN With Google",
  loginFailed: "Login failed. Please try again.",
  footer: "Copyright © 2025 Sun*",
};

const dictionaries = {
  vi: {
    login: viLogin,
    // The homepage footer reuses the login footer string.
    home: { ...homeCopy.vi, footer: { copyright: viLogin.footer } },
    accountMenu: {
      login: "Đăng nhập",
      profile: "Hồ sơ",
      signOut: "Đăng xuất",
      admin: "Trang quản trị",
      notifications: "Thông báo",
      account: "Tài khoản",
    },
  },
  en: {
    login: enLogin,
    home: { ...homeCopy.en, footer: { copyright: enLogin.footer } },
    accountMenu: {
      login: "Login",
      profile: "Profile",
      signOut: "Sign out",
      admin: "Admin Dashboard",
      notifications: "Notifications",
      account: "Account",
    },
  },
} satisfies Record<Locale, Dictionary>;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
