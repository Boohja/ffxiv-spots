import { FilterPanel } from "@/components/spots/FilterPanel";
import { SpotGrid } from "@/components/spots/SpotGrid";
import { photoSpots } from "@/lib/spots/data";
import { filterSpots } from "@/lib/spots/filters";
import type { SpotFilters, SpotSort } from "@/lib/spots/types";

type SpotsPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export const metadata = {
  title: "Browse Spots | XIVSpots",
  description: "Search and filter curated Final Fantasy XIV photo spot ideas.",
};

export default async function SpotsPage({ searchParams }: SpotsPageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const spots = filterSpots(photoSpots, filters);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-spark">Browse</p>
          <h1 className="mt-1 text-4xl font-semibold text-text-primary">Photo spot atlas</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Filter curated v1 data by region, zone, tag, time, weather, and sort order.
          </p>
        </div>
        <p className="rounded-full border border-border-default bg-surface-base px-3 py-1 text-sm text-text-secondary">
          {spots.length} of {photoSpots.length} spots
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterPanel filters={filters} />
        <SpotGrid spots={spots} />
      </div>
    </main>
  );
}

function parseFilters(params: Record<string, string | string[] | undefined>): SpotFilters {
  return {
    query: single(params.q),
    region: single(params.region),
    zone: single(params.zone),
    tag: single(params.tag),
    time: single(params.time),
    weather: single(params.weather),
    sort: parseSort(single(params.sort)),
  };
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseSort(value?: string): SpotSort | undefined {
  return value === "title" || value === "zone" || value === "featured" || value === "newest"
    ? value
    : undefined;
}
