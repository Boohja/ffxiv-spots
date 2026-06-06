import { photoSpots } from "@/lib/spots/data";
import type { PhotoSpot, SpotFilters, SpotSort } from "@/lib/spots/types";

export const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "featured", label: "Curated" },
  { value: "title", label: "Title" },
  { value: "zone", label: "Zone" },
] satisfies { value: SpotSort; label: string }[];

export function getSpotFacets() {
  return {
    regions: unique(photoSpots.map((spot) => spot.region)),
    zones: unique(photoSpots.map((spot) => spot.zone)),
    tags: unique(photoSpots.flatMap((spot) => spot.tags)),
    times: unique(photoSpots.flatMap((spot) => spot.bestTimeOfDay ?? [])),
    weather: unique(photoSpots.flatMap((spot) => spot.bestWeather ?? [])),
  };
}

export function filterSpots(spots: PhotoSpot[], filters: SpotFilters) {
  const query = filters.query?.trim().toLowerCase();

  const filtered = spots.filter((spot) => {
    const haystack = [
      spot.title,
      spot.description,
      spot.region,
      spot.zone,
      spot.area,
      spot.expansion,
      ...spot.tags,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (!query || haystack.includes(query)) &&
      (!filters.region || spot.region === filters.region) &&
      (!filters.zone || spot.zone === filters.zone) &&
      (!filters.tag || spot.tags.includes(filters.tag)) &&
      (!filters.time || spot.bestTimeOfDay?.includes(filters.time)) &&
      (!filters.weather || spot.bestWeather?.includes(filters.weather))
    );
  });

  return sortSpots(filtered, filters.sort ?? "newest");
}

function sortSpots(spots: PhotoSpot[], sort: SpotSort) {
  return [...spots].sort((a, b) => {
    if (sort === "featured") {
      return Number(b.featured ?? false) - Number(a.featured ?? false) || newestFirst(a, b);
    }

    if (sort === "title") {
      return a.title.localeCompare(b.title);
    }

    if (sort === "zone") {
      return a.zone.localeCompare(b.zone) || a.title.localeCompare(b.title);
    }

    return newestFirst(a, b);
  });
}

function newestFirst(a: PhotoSpot, b: PhotoSpot) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function unique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}
