// Clipboard write with a fallback for pages that are not a secure context
// (e.g. the app served over plain http from Docker), where
// `navigator.clipboard` is undefined (F006 INT-002, DEC-006).

/** Legacy path: a hidden <textarea> selected and copied with execCommand. */
function copyWithTextarea(text: string): boolean {
  const previouslyFocused = document.activeElement;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
  document.body.appendChild(textarea);
  try {
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
    if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
  }
}

/**
 * Copies `text` to the clipboard and reports whether it worked. Call it
 * straight from the click handler (user gesture). Never throws: a refused or
 * missing clipboard resolves `false` so the caller can show an error toast.
 */
export async function copyText(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Permission denied or document not focused: try the legacy path.
    }
  }
  return copyWithTextarea(text);
}
