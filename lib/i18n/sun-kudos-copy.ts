import type { Locale } from "./locales";
import type { SunKudosCopy } from "./sun-kudos-copy-types";

// Sun* Kudos Live board (/sun-kudos) copy for the banner, Highlight, filters,
// cards, All Kudos feed and toasts; spotlight and sidebar live in
// `sun-kudos-panels-copy.ts`. Source: MoMorph frame MaZUn5xHXZ (specs A, B, C)
// + clarifications (provisional copy D020/D003). Only UI labels are translated;
// kudos content (names, titles, hashtags, bodies, departments) stays as written
// (F002 rule). The section titles and the "Sun* Annual Awards 2025" eyebrow are
// Figma labels and stay unchanged in EN, as do the hero tier names and the
// "Copy Link" / "Link copied — ready to share!" strings (verbatim in both
// locales per clarifications). The header/footer nav reuses home.nav.

export type SunKudosBoardCopy = Pick<
  SunKudosCopy,
  "banner" | "eyebrow" | "highlight" | "filters" | "card" | "feed" | "toast"
>;

const heroLabels = {
  new: "New Hero",
  rising: "Rising Hero",
  super: "Super Hero",
  legend: "Legend Hero",
} satisfies SunKudosCopy["card"]["heroLabels"];

export const sunKudosBoardCopy = {
  vi: {
    banner: {
      title: "Hệ thống ghi nhận và cảm ơn",
      sendPlaceholder: "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?",
      searchProfile: "Tìm kiếm profile Sunner",
    },
    eyebrow: "Sun* Annual Awards 2025",
    highlight: {
      title: "HIGHLIGHT KUDOS",
      prev: "Kudos trước",
      next: "Kudos sau",
      slideOf: "{n}/{total}",
      carouselLabel: "Băng chuyền Kudos nổi bật",
    },
    filters: { hashtag: "Hashtag", department: "Phòng ban", all: "Tất cả" },
    card: {
      copyLink: "Copy Link",
      viewDetail: "Xem chi tiết",
      heart: "Thả tim",
      heroLabels,
      starTooltips: [
        "Sunner đã nhận được 10 Kudos và bắt đầu lan tỏa năng lượng ấm áp đến mọi người xung quanh.",
        "Sunner đã nhận được 20 Kudos và chứng minh sức ảnh hưởng của mình qua những hành động lan tỏa tích cực mỗi ngày.",
        "Sunner đã nhận được 50 Kudos và trở thành hình mẫu của sự công nhận, sẻ chia và lan tỏa tinh thần Sun*.",
      ],
    },
    feed: {
      title: "ALL KUDOS",
      empty: "Hiện tại chưa có Kudos nào.",
      loadMoreError: "Không tải thêm được Kudos.",
      retry: "Thử lại",
    },
    toast: {
      copied: "Link copied — ready to share!",
      copyFailed: "Không sao chép được liên kết",
      heartFailed: "Không cập nhật được tim. Vui lòng thử lại.",
    },
  },
  en: {
    banner: {
      title: "A system to recognise and thank",
      sendPlaceholder: "Today, who would you like to thank and recognise?",
      searchProfile: "Search Sunner profile",
    },
    eyebrow: "Sun* Annual Awards 2025",
    highlight: {
      title: "HIGHLIGHT KUDOS",
      prev: "Previous Kudos",
      next: "Next Kudos",
      slideOf: "{n}/{total}",
      carouselLabel: "Highlighted Kudos carousel",
    },
    filters: { hashtag: "Hashtag", department: "Department", all: "All" },
    card: {
      copyLink: "Copy Link",
      viewDetail: "View details",
      heart: "Like",
      heroLabels,
      starTooltips: [
        "This Sunner has received 10 Kudos and is starting to spread warm energy to everyone around.",
        "This Sunner has received 20 Kudos and shows their influence through positive actions every day.",
        "This Sunner has received 50 Kudos and has become a role model of recognition, sharing and the Sun* spirit.",
      ],
    },
    feed: {
      title: "ALL KUDOS",
      empty: "No Kudos yet.",
      loadMoreError: "Could not load more Kudos.",
      retry: "Try again",
    },
    toast: {
      copied: "Link copied — ready to share!",
      copyFailed: "Could not copy the link",
      heartFailed: "Could not update the heart. Please try again.",
    },
  },
} satisfies Record<Locale, SunKudosBoardCopy>;
