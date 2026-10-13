import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { KudosFilterOptions, KudosRead } from "./kudos-card-types";
import { DEPARTMENT_COLUMNS } from "./kudos-card-columns";
import { isHashtagRow, keepValid } from "./kudos-card-mapping";
import { DEPARTMENT_CODE_PATTERN } from "./kudos-filters";
import { getHashtagRowsPerRequest } from "./get-hashtag-rows-per-request";

type DepartmentRow = { code: string };

// A code that the URL filter would refuse is useless as an option.
const isDepartmentRow = (v: unknown): v is DepartmentRow =>
  typeof v === "object" && v !== null &&
  typeof (v as Record<string, unknown>).code === "string" &&
  DEPARTMENT_CODE_PATTERN.test((v as Record<string, string>).code);

/**
 * Values of the Hashtag and Department filter lists (F006 A7, FR-301):
 * `hashtags` by `sort_order` (then slug), `departments` by code (labels are
 * the code only). Read with the request's server client (public read); the
 * hashtag list is the per-request read shared with Highlight and All Kudos.
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
      getHashtagRowsPerRequest(),
      supabase.from("departments").select(DEPARTMENT_COLUMNS).order("code", { ascending: true }),
    ]);
    if (hashtags.status === "error") return queryFailed(hashtags.reason);
    if (departments.error) return queryFailed(`${departments.error.code || "?"} ${departments.error.message}`);

    return {
      status: "ok",
      data: {
        hashtags: keepValid(hashtags.rows, isHashtagRow, "hashtag").map(({ slug, label }) => ({ slug, label })),
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

function queryFailed(reason: string): KudosRead<KudosFilterOptions> {
  console.error(`[kudos] filter options query failed: ${reason}`);
  return { status: "error" };
}
