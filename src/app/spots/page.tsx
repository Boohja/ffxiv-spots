import { FilterPanel } from "@/components/spots/FilterPanel";
import { SpotGrid } from "@/components/spots/SpotGrid";
import { getAcceptedPhotoSpots } from "@/lib/spots/database";
import { filterSpots, getSpotFacets } from "@/lib/spots/filters";
import type { SpotFilters, SpotSort } from "@/lib/spots/types";
import { createClient } from "@/lib/supabase/server";
import { type Expansion, expansions } from "@/lib/spots/zones";

type SpotsPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export const metadata = {
  title: "Browse Spots",
  description: "Search and filter accepted Final Fantasy XIV photo spot ideas.",
};

export default async function SpotsPage({ searchParams }: SpotsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const filters = parseFilters(params, Boolean(user));
  const allSpots = await getAcceptedPhotoSpots(supabase, user?.id);
  const spots = filterSpots(allSpots, filters);
  const facets = getSpotFacets(allSpots);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-spark">Browse</p>
          <h1 className="mt-1 text-4xl font-semibold text-text-primary">Photo spot atlas</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Filter accepted community photo spots by region, zone, tag, and sort order.
          </p>
        </div>
        <p className="rounded-full border border-border-default bg-surface-base px-3 py-1 text-sm text-text-secondary">
          {spots.length} of {allSpots.length} spots
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
        <FilterPanel canShowLikedOnly={Boolean(user)} facets={facets} filters={filters} />
        <SpotGrid canLike={Boolean(user)} spots={spots} />
      </div>
    </main>
  );
}

function parseFilters(params: Record<string, string | string[] | undefined>, canFilterLiked: boolean): SpotFilters {
  return {
    query: single(params.q),
    expansion: parseExpansion(single(params.expansion)),
    region: single(params.region),
    zone: single(params.zone),
    landmark: single(params.landmark),
    tag: single(params.tag),
    liked: canFilterLiked && single(params.liked) === "true",
    sort: parseSort(single(params.sort) ?? single(params.sortby)),
  };
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseSort(value?: string): SpotSort | undefined {
  return value === "likes" || value === "title" || value === "newest" ? value : undefined;
}

function parseExpansion(value?: string): Expansion | undefined {
  return expansions.includes(value as Expansion) ? (value as Expansion) : undefined;
}
