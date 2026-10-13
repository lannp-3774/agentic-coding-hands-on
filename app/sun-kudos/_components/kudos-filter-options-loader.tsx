import { KudosFilterBar } from "@/app/_components/sun-kudos-behaviour/kudos-filter-bar";
import type { SunKudosCopy } from "@/lib/i18n/sun-kudos-copy-types";
import type { KudosFilterOptions, KudosFilters } from "@/lib/kudos/kudos-card-types";
import { getKudosFilterOptions } from "@/lib/kudos/get-kudos-filter-options";

const NO_OPTIONS: KudosFilterOptions = { hashtags: [], departments: [] };

type KudosFilterOptionsLoaderProps = {
  filters: KudosFilters;
  copy: SunKudosCopy["filters"];
};

/**
 * F006 A7 (FR-301): values of the Hashtag and Phòng ban lists. A failed read
 * keeps both buttons, each list then offers only "Tất cả". The getter never
 * throws. Request-time read: render inside `<Suspense>`.
 */
export async function KudosFilterOptionsLoader({ filters, copy }: KudosFilterOptionsLoaderProps) {
  const result = await getKudosFilterOptions();
  const options = result.status === "ok" ? result.data : NO_OPTIONS;
  return <KudosFilterBar filters={filters} options={options} copy={copy} />;
}
