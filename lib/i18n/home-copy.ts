import type { Locale } from "./locales";

// Homepage (/) copy. Only UI chrome is translated; long body text and the
// event values stay Vietnamese in EN mode, so they are defined once below and
// reused by both locales. Body text is verbatim from MoMorph frame i87tDx10uM
// (items B4, C1, D2, B2) — never paraphrase it here.

export type HomeCopy = {
  nav: { about: string; awards: string; kudos: string; standards: string };
  hero: { title: string; aboutAwards: string; aboutKudos: string };
  countdown: { comingSoon: string; days: string; hours: string; minutes: string };
  eventInfo: {
    timeLabel: string;
    timeValue: string;
    venueLabel: string;
    venueValue: string;
    livestream: string;
  };
  rootFurther: { paragraphs: string[]; quote: string };
  awards: {
    eyebrow: string;
    title: string;
    details: string;
    empty: string;
  };
  kudos: { eyebrow: string; title: string; body: string; details: string };
  widget: { label: string };
};

// B2: values and livestream note (labels are translated per locale).
const EVENT_VALUES = {
  timeValue: "26/12/2025",
  venueValue: "Âu Cơ Art Center",
  livestream: "Tường thuật trực tiếp qua sóng Livestream",
} as const;

// B4: three paragraphs, the quote, then two more paragraphs.
const ROOT_FURTHER = {
  paragraphs: [
    "Đứng trước bối cảnh thay đổi như vũ bão của thời đại AI và yêu cầu ngày càng cao từ khách hàng, Sun* lựa chọn chiến lược đa dạng hóa năng lực để không chỉ nỗ lực trở thành tinh anh trong lĩnh vực của mình, mà còn hướng đến một cái đích cao hơn, nơi mọi Sunner đều là “problem-solver” - chuyên gia trong việc giải quyết mọi vấn đề, tìm lời giải cho mọi bài toán của dự án, khách hàng và xã hội.",
    "Lấy cảm hứng từ sự đa dạng năng lực, khả năng phát triển linh hoạt cùng tinh thần đào sâu để bứt phá trong kỷ nguyên AI, “Root Further” đã được chọn để trở thành chủ đề chính thức của Lễ trao giải Sun* Annual Awards 2025.",
    "Vượt ra khỏi nét nghĩa bề mặt, “Root Further” chính là hành trình chúng ta không ngừng vươn xa hơn, cắm rễ mạnh hơn, chạm đến những tầng “địa chất” ẩn sâu để tiếp tục tồn tại, vươn lên và nuôi dưỡng đam mê kiến tạo giá trị luôn cháy bỏng của người Sun*. Mượn hình ảnh bộ rễ liên tục đâm sâu vào lòng đất, mạnh mẽ len lỏi qua từng lớp “trầm tích” để thẩm thấu những gì tinh tuý nhất, người Sun* cũng đang “hấp thụ” dưỡng chất từ thời đại và những thử thách của thị trường để làm mới mình mỗi ngày, mở rộng năng lực và mạnh mẽ “bén rễ” vào kỷ nguyên AI - một tầng “địa chất” hoàn toàn mới, phức tạp và khó đoán, nhưng cũng hội tụ vô vàn tiềm năng cùng cơ hội.",
    "Trước giông bão, chỉ những tán cây có bộ rễ đủ mạnh mới có thể trụ vững. Một tổ chức với những cá nhân tự tin vào năng lực đa dạng, sẵn sàng kiến tạo và đón nhận thử thách, làm chủ sự thay đổi là tổ chức không chỉ vững vàng trước biến động, mà còn khai thác được mọi lợi thế, chinh phục các thách thức của thời cuộc. Không đơn thuần là tên gọi của chương mới trên hành trình phát triển tổ chức, “Root Further” còn như một lời cổ vũ, động viên mỗi chúng ta hãy dám tin vào bản thân, dám đào sâu, khai mở mọi tiềm năng, dám phá bỏ giới hạn, dám trở thành phiên bản đa nhiệm và xuất sắc nhất của mình. Bởi trong thời đại AI, đa dạng năng lực và tận dụng sức mạnh thời cuộc chính là điều kiện tiên quyết để trường tồn.",
    "Không ai biết trước ẩn sâu trong “lòng đất” của ngành công nghệ và thị trường hiện đại còn biết bao tầng “địa chất” bí ẩn. Chỉ biết rằng khi “Root Further” đã trở thành tinh thần cội rễ, chúng ta sẽ không sợ hãi, mà càng thấy háo hức trước bất cứ vùng vô định nào trên hành trình tiến về phía trước. Vì ta luôn tin rằng, trong chính những miền vô tận đó, là bao điều kỳ diệu và cơ hội vươn mình đang chờ ta.",
  ],
  quote:
    "“A tree with deep roots fears no storm”\n(Cây sâu bén rễ, bão giông chẳng nề - Ngạn ngữ Anh)",
};

// D2: lead line, then the blurb (UI renders with whitespace-pre-line).
const KUDOS_BODY =
  "ĐIỂM MỚI CỦA SAA 2025\nHoạt động ghi nhận và cảm ơn đồng nghiệp - lần đầu tiên được diễn ra dành cho tất cả Sunner. Hoạt động sẽ được triển khai vào tháng 11/2025, khuyến khích người Sun* chia sẻ những lời ghi nhận, cảm ơn đồng nghiệp trên hệ thống do BTC công bố. Đây sẽ là chất liệu để Hội đồng Heads tham khảo trong quá trình lựa chọn người đạt giải.";

export const homeCopy = {
  vi: {
    nav: {
      about: "About SAA 2025",
      awards: "Awards Information",
      kudos: "Sun* Kudos",
      standards: "Tiêu chuẩn chung",
    },
    hero: { title: "ROOT FURTHER", aboutAwards: "ABOUT AWARDS", aboutKudos: "ABOUT KUDOS" },
    countdown: { comingSoon: "Coming soon", days: "DAYS", hours: "HOURS", minutes: "MINUTES" },
    eventInfo: { timeLabel: "Thời gian:", venueLabel: "Địa điểm:", ...EVENT_VALUES },
    rootFurther: ROOT_FURTHER,
    awards: {
      eyebrow: "Sun* annual awards 2025",
      title: "Hệ thống giải thưởng",
      details: "Chi tiết",
      empty: "Thông tin giải thưởng sẽ sớm được cập nhật.",
    },
    kudos: {
      eyebrow: "Phong trào ghi nhận",
      title: "Sun* Kudos",
      body: KUDOS_BODY,
      details: "Chi tiết",
    },
    widget: { label: "Hành động nhanh" },
  },
  en: {
    nav: {
      about: "About SAA 2025",
      awards: "Awards Information",
      kudos: "Sun* Kudos",
      standards: "General Standards",
    },
    hero: { title: "ROOT FURTHER", aboutAwards: "ABOUT AWARDS", aboutKudos: "ABOUT KUDOS" },
    countdown: { comingSoon: "Coming soon", days: "DAYS", hours: "HOURS", minutes: "MINUTES" },
    eventInfo: { timeLabel: "Time:", venueLabel: "Venue:", ...EVENT_VALUES },
    rootFurther: ROOT_FURTHER,
    awards: {
      eyebrow: "Sun* annual awards 2025",
      title: "Awards System",
      details: "Details",
      empty: "Award information will be updated soon.",
    },
    kudos: {
      eyebrow: "Recognition movement",
      title: "Sun* Kudos",
      body: KUDOS_BODY,
      details: "Details",
    },
    widget: { label: "Quick actions" },
  },
} satisfies Record<Locale, HomeCopy>;
