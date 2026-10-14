import type { WriteKudosModalLabels } from "./write-kudos-modal-types";

/**
 * Figma-verbatim Vietnamese copy of the "Viết Kudo" frame (520:11602), kept as a typed reference
 * for the integration step and for design previews. Nothing imports it at runtime. The remove verb
 * is "Xóa" (not "Xoá"): the e2e regex /^X(oá|óa)\b/ only matches the "óa" spelling.
 */
export const WRITE_KUDOS_SAMPLE_LABELS: WriteKudosModalLabels = {
  title: "Gửi lời cám ơn và ghi nhận đến đồng đội",
  recipientLabel: "Người nhận",
  recipientPlaceholder: "Tìm kiếm",
  recipientListLabel: "Gợi ý người nhận",
  recipientNoResults: "Không tìm thấy",
  titleFieldLabel: "Danh hiệu",
  titleFieldPlaceholder: "Dành tặng một danh hiệu cho đồng đội",
  titleFieldHelper: "Ví dụ: Người truyền động lực cho tôi.\nDanh hiệu sẽ hiển thị làm tiêu đề Kudos của bạn.",
  toolbarLabel: "Định dạng văn bản",
  toolbar: {
    bold: "Đậm",
    italic: "Nghiêng",
    strike: "Gạch ngang",
    orderedList: "Danh sách",
    link: "Liên kết",
    quote: "Trích dẫn",
  },
  communityStandards: "Tiêu chuẩn cộng đồng",
  bodyLabel: "Nội dung lời cám ơn",
  bodyPlaceholder: "Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!",
  mentionHint: "Bạn có thể “@ + tên” để nhắc tới đồng nghiệp khác",
  mentionListLabel: "Gợi ý đồng nghiệp",
  hashtagLabel: "Hashtag",
  hashtagAdd: "Hashtag",
  hashtagLimitNote: "Tối đa 5",
  hashtagPickerLabel: "Chọn hashtag",
  imageLabel: "Image",
  imageAdd: "Image",
  imageLimitNote: "Tối đa 5",
  imageAlt: "Ảnh",
  removeAction: "Xóa",
  anonymousLabel: "Gửi lời cám ơn và ghi nhận ẩn danh",
  anonymousNameLabel: "Tên hiển thị khi gửi ẩn danh",
  anonymousNamePlaceholder: "Người gửi ẩn danh",
  anonymousLockedHint: "Bạn chưa đăng nhập nên Kudos sẽ được gửi ẩn danh.",
  cancel: "Hủy",
  send: "Gửi",
  errors: {
    required: "Không được để trống",
    tooLong: "Nội dung quá dài",
    selfRecipient: "Bạn không thể gửi kudos cho chính mình",
    maxHashtags: "Tối đa 5 hashtag",
    maxImages: "Tối đa 5 ảnh",
    invalidFileType: "Chỉ chấp nhận ảnh JPG hoặc PNG",
    fileTooLarge: "Mỗi ảnh tối đa 5 MB",
    uploadFailed: "Tải ảnh lên không thành công, vui lòng thử lại",
  },
  tooLong: { title: "Tối đa 50 ký tự", body: "Tối đa 2000 ký tự", anonymousName: "Tối đa 50 ký tự" },
};
