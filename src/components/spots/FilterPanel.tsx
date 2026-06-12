import Link from "next/link";

import { sortOptions } from "@/lib/spots/filters";
import type { SpotFilters } from "@/lib/spots/types";

type FilterPanelProps = Readonly<{
  canShowLikedOnly?: boolean;
  facets: {
    expansions: string[];
    regions: string[];
    zones: string[];
    landmarks: string[];
    tags: string[];
  };
  filters: SpotFilters;
}>;

export function FilterPanel({ canShowLikedOnly = false, facets, filters }: FilterPanelProps) {
  return (
    <form action="/spots" className="glass-panel sticky top-4 space-y-4 rounded-lg p-4">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Filter spots</h2>
        <p className="mt-1 text-sm text-text-secondary">Search by title, place, landmark, or tag.</p>
      </div>
      <label className="block text-sm font-semibold text-text-secondary">
        Search
        <input
          name="q"
          defaultValue={filters.query}
          className="mt-2 w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary outline-none transition placeholder:text-text-subtle focus:border-border-active focus:ring-2 focus:ring-border-active/35"
        />
      </label>
      <SelectFilter name="expansion" label="Expansion" value={filters.expansion} options={facets.expansions} />
      <SelectFilter name="region" label="Region" value={filters.region} options={facets.regions} />
      <SelectFilter name="zone" label="Zone" value={filters.zone} options={facets.zones} />
      <SelectFilter name="landmark" label="Landmark" value={filters.landmark} options={facets.landmarks} />
      <SelectFilter name="tag" label="Tag" value={filters.tag} options={facets.tags} />
      <label className="block text-sm font-semibold text-text-secondary">
        Sort
        <select
          name="sort"
          defaultValue={filters.sort ?? "newest"}
          className="mt-2 h-10 w-full rounded-lg border border-border-default bg-surface-base px-3 text-sm text-text-primary outline-none transition focus:border-border-active focus:ring-2 focus:ring-border-active/35"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {canShowLikedOnly ? (
        <label className="flex items-center gap-3 rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm font-semibold text-text-secondary">
          <input
            name="liked"
            type="checkbox"
            value="true"
            defaultChecked={filters.liked}
            className="h-4 w-4 accent-brand-gold"
          />
          Liked by me
        </label>
      ) : null}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <Link
          href="/spots"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border-default px-3 text-sm font-semibold text-text-secondary transition hover:border-border-active/60 hover:text-text-primary"
        >
          Reset
        </Link>
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-transparent bg-gradient-primary px-3 text-sm font-semibold text-text-primary transition hover:bg-gradient-primary-hover"
        >
          Apply
        </button>
      </div>
    </form>
  );
}

function SelectFilter({
  name,
  label,
  value,
  options,
}: Readonly<{
  name: string;
  label: string;
  value?: string;
  options: string[];
}>) {
  return (
    <label className="block text-sm font-semibold text-text-secondary">
      {label}
      <select
        name={name}
        defaultValue={value ?? ""}
        className="mt-2 h-10 w-full rounded-lg border border-border-default bg-surface-base px-3 text-sm text-text-primary outline-none transition focus:border-border-active focus:ring-2 focus:ring-border-active/35"
      >
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
