import type { SpotFilters } from "@/lib/spots/types";

type SearchFilterName = keyof Pick<SpotFilters, "expansion" | "landmark" | "region" | "tag" | "zone">;

export function spotSearchHref(filterName: SearchFilterName, value: string) {
  const params = new URLSearchParams({ [filterName]: value });

  return `/spots?${params.toString()}`;
}
