import type { Locale } from "./locales";
import type { SunKudosCopy } from "./sun-kudos-copy-types";

// Sun* Kudos Live board (/sun-kudos) copy for the Spotlight board (B.6-B.7) and
// the personal sidebar (D.1, D.3); the rest of the page is in
// `sun-kudos-copy.ts`. Source: MoMorph frame MaZUn5xHXZ + clarifications
// (provisional search errors, guest prompt). Only UI labels are translated;
// Sunner names and gift names stay as stored (F002 rule). "SPOTLIGHT BOARD",
// "KUDOS" and "Pan/Zoom" are Figma labels kept as-is in EN. The empty Spotlight
// message reuses sunKudos.feed.empty.

export type SunKudosPanelsCopy = Pick<SunKudosCopy, "spotlight" | "sidebar">;

export const sunKudosPanelsCopy = {
  vi: {
    spotlight: {
      title: "SPOTLIGHT BOARD",
      kudosSuffix: "KUDOS",
      searchPlaceholder: "Tìm kiếm",
      searchRequired: "Vui lòng nhập từ khoá.",
      searchTooLong: "Từ khoá tối đa 100 ký tự.",
      noMatch: "Không tìm thấy",
      matchCount: "{n} kết quả",
      panZoom: "Pan/Zoom",
      tickerSuffix: "đã nhận được một Kudos mới",
    },
    sidebar: {
      received: "Số Kudos bạn nhận được:",
      sent: "Số Kudos bạn đã gửi:",
      hearts: "Số tim bạn nhận được:",
      boxesOpened: "Số Secret Box bạn đã mở:",
      boxesUnopened: "Số Secret Box chưa mở:",
      openBox: "Mở Secret Box",
      loginPrompt: "Đăng nhập để xem thống kê Kudos của bạn",
      loginButton: "Đăng nhập",
      giftTitle: "10 SUNNER NHẬN QUÀ MỚI NHẤT",
      giftLine: "Nhận được 1 {gift}",
      empty: "Chưa có dữ liệu",
    },
  },
  en: {
    spotlight: {
      title: "SPOTLIGHT BOARD",
      kudosSuffix: "KUDOS",
      searchPlaceholder: "Search",
      searchRequired: "Please enter a search term.",
      searchTooLong: "Use at most 100 characters.",
      noMatch: "Not found",
      matchCount: "{n} results",
      panZoom: "Pan/Zoom",
      tickerSuffix: "received a new Kudos",
    },
    sidebar: {
      received: "Kudos you received:",
      sent: "Kudos you sent:",
      hearts: "Hearts you received:",
      boxesOpened: "Secret Boxes you opened:",
      boxesUnopened: "Secret Boxes unopened:",
      openBox: "Open Secret Box",
      loginPrompt: "Log in to see your Kudos stats",
      loginButton: "Login",
      giftTitle: "10 LATEST SUNNERS TO RECEIVE GIFTS",
      giftLine: "Received 1 {gift}",
      empty: "No data yet",
    },
  },
} satisfies Record<Locale, SunKudosPanelsCopy>;
