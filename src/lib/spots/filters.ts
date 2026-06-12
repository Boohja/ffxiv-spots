import type { PhotoSpot, SpotFilters, SpotSort } from "@/lib/spots/types";

export const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "title", label: "Title" },
  { value: "zone", label: "Zone" },
] satisfies { value: SpotSort; label: string }[];

export function getSpotFacets(spots: PhotoSpot[]) {
  return {
    expansions: unique(spots.map((spot) => spot.expansion)),
    regions: unique(spots.map((spot) => spot.region)),
    zones: unique(spots.map((spot) => spot.zone)),
    landmarks: unique(spots.map((spot) => spot.landmark).filter((landmark): landmark is string => Boolean(landmark))),
    tags: unique(spots.flatMap((spot) => spot.tags)),
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
      spot.landmark,
      spot.area,
      spot.expansion,
      ...spot.tags,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (!query || haystack.includes(query)) &&
      (!filters.expansion || spot.expansion === filters.expansion) &&
      (!filters.region || spot.region === filters.region) &&
      (!filters.zone || spot.zone === filters.zone) &&
      (!filters.landmark || spot.landmark === filters.landmark) &&
      (!filters.tag || spot.tags.includes(filters.tag))
    );
  });

  return sortSpots(filtered, filters.sort ?? "newest");
}

function sortSpots(spots: PhotoSpot[], sort: SpotSort) {
  return [...spots].sort((a, b) => {
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
