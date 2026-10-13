import type { KudosEmptyStateProps } from "./board-types";

/**
 * No kudos match (Highlight or All Kudos, spec E24): the message replaces the
 * carousel or the list. Wording comes from the caller ("Hiện tại chưa có Kudos nào.").
 */
export function KudosEmptyState({ message }: KudosEmptyStateProps) {
  return (
    <p className="w-full px-4 py-10 text-center text-base leading-6 font-bold tracking-[0.5px] text-white lg:px-0">
      {message}
    </p>
  );
}
