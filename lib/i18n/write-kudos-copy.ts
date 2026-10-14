import type { Locale } from "./locales";
import type { WriteKudosCopy } from "./write-kudos-copy-types";

export type { WriteKudosCopy } from "./write-kudos-copy-types";

// "Viết Kudo" modal copy (F010). Source: MoMorph frame ihQ26W78P2 (Figma 520:11602:
// title, field labels and placeholders, Danh hiệu helper lines, the @-mention hint,
// "Tiêu chuẩn cộng đồng", "Tối đa 5", Hủy / Gửi) plus clarifications (error texts,
// "Người gửi ẩn danh"). VN is verbatim from Figma; the EN values are translations.
// "Hashtag" and "Image" are Figma labels and stay unchanged in EN. Remove buttons
// start with "Xóa" (ó + a): the selector contract's /^X(oá|óa)\b/ only matches that
// spelling, because JS `\b` treats "á" as a non-word character.

export const writeKudosCopy = {
  vi: {
    title: "Gửi lời cám ơn và ghi nhận đến đồng đội",
    recipient: {
      label: "Người nhận",
      placeholder: "Tìm kiếm",
      listLabel: "Gợi ý Sunner",
      noResults: "Không tìm thấy Sunner phù hợp",
    },
    titleField: {
      label: "Danh hiệu",
      placeholder: "Dành tặng một danh hiệu cho đồng đội",
      helper: ["Ví dụ: Người truyền động lực cho tôi.", "Danh hiệu sẽ hiển thị làm tiêu đề Kudos của bạn."],
    },
    toolbar: {
      label: "Định dạng văn bản",
      bold: "Đậm",
      italic: "Nghiêng",
      strike: "Gạch ngang",
      orderedList: "Danh sách đánh số",
      link: "Liên kết",
      quote: "Trích dẫn",
      linkPrompt: "Nhập đường dẫn (https://...)",
      communityStandards: "Tiêu chuẩn cộng đồng",
    },
    body: {
      label: "Lời cảm ơn",
      placeholder: "Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!",
      hint: "Bạn có thể “@ + tên” để nhắc tới đồng nghiệp khác",
      mentionListLabel: "Gợi ý nhắc tên",
    },
    hashtags: {
      label: "Hashtag",
      add: "Hashtag",
      maxNote: "Tối đa 5",
      listLabel: "Danh sách hashtag",
      remove: "Xóa {label}",
    },
    images: {
      label: "Image",
      add: "Image",
      maxNote: "Tối đa 5",
      thumbnailAlt: "Ảnh đính kèm {n}",
      remove: "Xóa ảnh {n}",
      uploading: "Đang tải ảnh…",
    },
    anonymous: {
      checkbox: "Gửi lời cám ơn và ghi nhận ẩn danh",
      nameLabel: "Tên hiển thị ẩn danh",
      namePlaceholder: "Người gửi ẩn danh",
      defaultAlias: "Người gửi ẩn danh",
    },
    actions: { cancel: "Hủy", submit: "Gửi", sending: "Đang gửi…" },
    errors: {
      required: "Không được để trống",
      tooLong: "Tối đa {max} ký tự",
      selfRecipient: "Bạn không thể gửi Kudos cho chính mình",
      maxHashtags: "Tối đa 5 hashtag",
      maxImages: "Tối đa 5 ảnh",
      invalidFileType: "Chỉ chấp nhận ảnh JPG hoặc PNG",
      fileTooLarge: "Ảnh không được vượt quá 5 MB",
      uploadFailed: "Tải ảnh lên không thành công. Vui lòng thử lại.",
    },
    toast: {
      sent: "Gửi Kudos thành công!",
      failed: "Gửi Kudos không thành công. Vui lòng thử lại.",
      noSunner: "Tài khoản của bạn chưa được liên kết với hồ sơ Sunner.",
    },
  },
  en: {
    title: "Send thanks and recognition to a teammate",
    recipient: {
      label: "Recipient",
      placeholder: "Search",
      listLabel: "Suggested Sunners",
      noResults: "No matching Sunner",
    },
    titleField: {
      label: "Title",
      placeholder: "Give your teammate a title",
      helper: ["Example: The person who keeps me motivated.", "The title is shown as the heading of your Kudos."],
    },
    toolbar: {
      label: "Text formatting",
      bold: "Bold",
      italic: "Italic",
      strike: "Strikethrough",
      orderedList: "Numbered list",
      link: "Link",
      quote: "Quote",
      linkPrompt: "Enter a link (https://...)",
      communityStandards: "Community standards",
    },
    body: {
      label: "Message",
      placeholder: "Write your thanks and recognition to your teammate here!",
      hint: "Type “@ + name” to mention another colleague",
      mentionListLabel: "Mention suggestions",
    },
    hashtags: {
      label: "Hashtag",
      add: "Hashtag",
      maxNote: "Max 5",
      listLabel: "Hashtag list",
      remove: "Remove {label}",
    },
    images: {
      label: "Image",
      add: "Image",
      maxNote: "Max 5",
      thumbnailAlt: "Attached image {n}",
      remove: "Remove image {n}",
      uploading: "Uploading image…",
    },
    anonymous: {
      checkbox: "Send thanks and recognition anonymously",
      nameLabel: "Anonymous display name",
      namePlaceholder: "Anonymous sender",
      defaultAlias: "Anonymous sender",
    },
    actions: { cancel: "Cancel", submit: "Send", sending: "Sending…" },
    errors: {
      required: "This field is required",
      tooLong: "At most {max} characters",
      selfRecipient: "You cannot send a Kudos to yourself",
      maxHashtags: "At most 5 hashtags",
      maxImages: "At most 5 images",
      invalidFileType: "Only JPG or PNG images are accepted",
      fileTooLarge: "Images must be 5 MB or smaller",
      uploadFailed: "The image could not be uploaded. Please try again.",
    },
    toast: {
      sent: "Kudos sent!",
      failed: "Your Kudos could not be sent. Please try again.",
      noSunner: "Your account is not linked to a Sunner profile yet.",
    },
  },
} satisfies Record<Locale, WriteKudosCopy>;
