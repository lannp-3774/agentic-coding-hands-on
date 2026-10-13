import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { KudosFilterOptions, KudosRead } from "./kudos-card-types";
import { DEPARTMENT_COLUMNS, HASHTAG_COLUMNS } from "./kudos-card-columns";
import { isHashtagRow, keepValid } from "./kudos-card-mapping";
import { DEPARTMENT_CODE_PATTERN } from "./kudos-filters";

type DepartmentRow = { code: string };

// A code that the URL filter would refuse is useless as an option.
const isDepartmentRow = (v: unknown): v is DepartmentRow =>
  typeof v === "object" && v !== null &&
  typeof (v as Record<string, unknown>).code === "string" &&
  DEPARTMENT_CODE_PATTERN.test((v as Record<string, string>).code);

/**
 * Values of the Hashtag and Department filter lists (F006 A7, FR-301):
 * `hashtags` by `sort_order` (then slug), `departments` by code (labels are
 * the code only). Read with the request's server client (public read).
 *
 * Never throws: a failed query or a throw is logged once with `[kudos]` and
 * returns `{status: "error"}`; the filter bar then offers only "Tất cả".
 * Request-time only (call inside `<Suspense>`).
 */
export async function getKudosFilterOptions(): Promise<KudosRead<KudosFilterOptions>> {
  // Outside the try: Next's prerender bail-out must never be swallowed.
  await connection();

  try {
    const supabase = await createClient();
    const [hashtags, departments] = await Promise.all([
      supabase
        .from("hashtags")
        .select(HASHTAG_COLUMNS)
        .order("sort_order", { ascending: true })
        .order("slug", { ascending: true }),
      supabase.from("departments").select(DEPARTMENT_COLUMNS).order("code", { ascending: true }),
    ]);
    const failure = hashtags.error ?? departments.error;
    if (failure) {
      console.error(`[kudos] filter options query failed: ${failure.code || "?"} ${failure.message}`);
      return { status: "error" };
    }

    return {
      status: "ok",
      data: {
        hashtags: keepValid(hashtags.data, isHashtagRow, "hashtag").map(({ slug, label }) => ({ slug, label })),
        departments: keepValid(departments.data, isDepartmentRow, "department").map((row) => row.code),
      },
    };
  } catch (cause) {
    unstable_rethrow(cause);
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error(`[kudos] filter options query threw: ${message}`);
    return { status: "error" };
  }
}
