import { SpotlightSearchIcon } from "./spotlight-icons";
import type { SpotlightCopy, SpotlightSearchState } from "./spotlight-view-types";

const ERROR_ID = "spotlight-search-error";

type SpotlightSearchBoxProps = {
  search: SpotlightSearchState;
  copy: SpotlightCopy;
  /** Omitted by the empty state, where the box is disabled. */
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  /** Compact layout: fills its row at full size (44px pill, 14px text) instead of the 219px board pill. */
  flow?: boolean;
};

/**
 * mm:2940:14833 (B.7.3) search pill, top-left of the board. No `maxLength` and no
 * `required`: the 100-character and empty rules are checked on submit (BR-006).
 */
export function SpotlightSearchBox({ search, copy, onChange, onSubmit, flow = false }: SpotlightSearchBoxProps) {
  const { value, error, status, disabled } = search;
  // "No match" is shown; the match count is only announced to screen readers.
  const statusVisible = status !== null && status === copy.noMatch;
  return (
    // mm:2940:14833
    <div className={`z-10 ${flow ? "min-w-0 flex-1" : "absolute top-[26px] left-[25px] w-[219px]"}`}>
      <form
        role="search"
        // Handlers are attached only when given: the empty state renders this on the
        // server, where a function prop on a DOM element cannot be serialised.
        onSubmit={
          onSubmit
            ? (event) => {
                event.preventDefault();
                onSubmit();
              }
            : undefined
        }
        className={`flex ${flow ? "h-11" : "h-[39px]"} items-center gap-[11px] rounded-full border border-[#998C5F] bg-[#FFEA9E]/10 px-[11px] text-white focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#FFEA9E]`}
      >
        {/* mm:I2940:14833;186:2759 */}
        <button
          type="submit"
          disabled={disabled}
          aria-label={copy.searchPlaceholder}
          className={`flex ${flow ? "size-7" : "size-4"} shrink-0 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <SpotlightSearchIcon />
        </button>
        {/* mm:I2940:14833;186:2760 */}
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          placeholder={copy.searchPlaceholder}
          aria-label={copy.searchPlaceholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? ERROR_ID : undefined}
          autoComplete="off"
          className={`min-w-0 flex-1 bg-transparent ${flow ? "text-sm leading-5" : "text-[11px] leading-4"} font-medium tracking-[0.1px] text-white outline-none placeholder:text-white disabled:cursor-not-allowed disabled:opacity-50`}
        />
      </form>
      {error ? (
        <p id={ERROR_ID} role="alert" className={`mt-1 px-3 font-medium text-[#F17676] ${flow ? "text-sm leading-5" : "text-xs leading-4"}`}>
          {error}
        </p>
      ) : null}
      <p
        role="status"
        aria-live="polite"
        className={
          statusVisible ? `mt-1 px-3 font-medium text-white ${flow ? "text-sm leading-5" : "text-xs leading-4"}` : "sr-only"
        }
      >
        {status}
      </p>
    </div>
  );
}
