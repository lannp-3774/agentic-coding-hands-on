// Shared contracts for the "Viết Kudo" modal (MoMorph ihQ26W78P2). Pure types:
// imported with `import type` by the presentational views (Track A), the
// Server Actions / routes (Track B) and the modal wiring (integration).

/** A Sunner offered by the recipient search and the @mention suggestions. */
export type SunnerOption = {
  id: string;
  name: string;
  /** Department code only; null hides the line. */
  department: string | null;
  /** Already passed through `safeAvatarUrl`; null renders the initial. */
  avatarUrl: string | null;
};

/** One attached image, before or after upload. */
export type WriteKudosImage = {
  /** Client key for list rendering and removal. */
  key: string;
  /** Object URL for the thumbnail while editing. */
  previewUrl: string;
  /** `/api/kudos/images/<uuid>.<jpg|png>` once uploaded (no user id); null while uploading. */
  path: string | null;
  status: "uploading" | "ready" | "error";
};

/** Toolbar actions (C.1–C.6). */
export type MarkdownFormat = "bold" | "italic" | "strike" | "orderedList" | "link" | "quote";

/** Field keys that can carry a validation error. */
export type WriteKudosField = "recipient" | "title" | "body" | "hashtags" | "images" | "anonymousName";

/** Error codes; the views map them to copy. */
export type WriteKudosErrorCode =
  | "required"
  | "tooLong"
  | "selfRecipient"
  | "maxHashtags"
  | "maxImages"
  | "invalidFileType"
  | "fileTooLarge"
  | "uploadFailed";

export type WriteKudosFieldErrors = Partial<Record<WriteKudosField, WriteKudosErrorCode>>;

/** What the modal submits (also the Server Action input). */
export type SendKudosInput = {
  recipientId: string;
  title: string;
  /** Markdown subset source (see `kudos-markdown.ts`). */
  body: string;
  hashtagSlugs: string[];
  imagePaths: string[];
  isAnonymous: boolean;
  /** Ignored unless `isAnonymous`; empty means "show the default alias". */
  anonymousName: string;
};

export type SendKudosResult =
  | { status: "ok"; kudosId: string }
  | { status: "invalid"; errors: WriteKudosFieldErrors }
  | { status: "unauthenticated" }
  | { status: "noSunner" }
  | { status: "error" };

/** Inline Markdown node rendered on cards (no HTML, ever). */
export type KudosInline =
  | { kind: "text"; text: string }
  | { kind: "bold" | "italic" | "strike"; children: KudosInline[] }
  /** `href` is http(s) only; anything else is parsed as text. */
  | { kind: "link"; href: string; children: KudosInline[] };

/** Block-level Markdown node. */
export type KudosBlock =
  | { kind: "paragraph"; children: KudosInline[] }
  | { kind: "quote"; children: KudosInline[] }
  | { kind: "orderedList"; items: KudosInline[][] };
