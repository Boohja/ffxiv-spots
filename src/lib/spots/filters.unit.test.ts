import { describe, expect, it } from "vitest";

import { filterSpots } from "@/lib/spots/filters";
import type { PhotoSpot } from "@/lib/spots/types";

const baseSpot = {
  description: "",
  images: [],
  tags: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
} satisfies Pick<PhotoSpot, "createdAt" | "description" | "images" | "tags" | "updatedAt">;

describe("filterSpots", () => {
  it("matches text search against title, zone, expansion, region, landmark, and tags", () => {
    const spots = [
      spot({
        id: "title",
        title: "Amber Chapel overlook",
        zone: "Central Thanalan",
        expansion: "A Realm Reborn",
        region: "Thanalan",
        tags: ["sunset"],
      }),
      spot({
        id: "zone",
        title: "Quiet river bend",
        zone: "Elpis",
        expansion: "Endwalker",
        region: "The World Unsundered",
        tags: ["pastoral"],
      }),
      spot({
        id: "expansion",
        title: "Blue rooftops",
        zone: "Foundation",
        expansion: "Heavensward",
        region: "Coerthas",
        tags: ["snow"],
      }),
      spot({
        id: "region",
        title: "Dawn garden",
        zone: "Old Sharlayan",
        expansion: "Endwalker",
        region: "The Northern Empty",
        tags: ["library"],
      }),
      spot({
        id: "landmark",
        title: "Desert prayer",
        zone: "Eastern Thanalan",
        expansion: "A Realm Reborn",
        landmark: "Final Prayer",
        region: "Thanalan",
        tags: ["ruins"],
      }),
      spot({
        id: "tag",
        title: "Hidden cove",
        zone: "Lower La Noscea",
        expansion: "A Realm Reborn",
        region: "La Noscea",
        tags: ["Beach"],
      }),
    ];

    expect(filterSpots(spots, { query: "chapel" }).map((matchedSpot) => matchedSpot.id)).toEqual(["title"]);
    expect(filterSpots(spots, { query: "elp" }).map((matchedSpot) => matchedSpot.id)).toEqual(["zone"]);
    expect(filterSpots(spots, { query: "ward" }).map((matchedSpot) => matchedSpot.id)).toEqual(["expansion"]);
    expect(filterSpots(spots, { query: "northern" }).map((matchedSpot) => matchedSpot.id)).toEqual(["region"]);
    expect(filterSpots(spots, { query: "prayer" }).map((matchedSpot) => matchedSpot.id)).toEqual(["landmark"]);
    expect(filterSpots(spots, { query: "beach" }).map((matchedSpot) => matchedSpot.id)).toEqual(["tag"]);
  });

  it("combines text search with explicit filters", () => {
    const spots = [
      spot({
        id: "matching",
        title: "Golden lookout",
        zone: "Central Thanalan",
        expansion: "A Realm Reborn",
        region: "Thanalan",
        tags: ["sunset"],
      }),
      spot({
        id: "wrong-region",
        title: "Golden lookout",
        zone: "Middle La Noscea",
        expansion: "A Realm Reborn",
        region: "La Noscea",
        tags: ["sunset"],
      }),
    ];

    expect(filterSpots(spots, { query: "gold", region: "Thanalan" }).map((matchedSpot) => matchedSpot.id)).toEqual([
      "matching",
    ]);
  });
});

function spot(spotFields: Pick<PhotoSpot, "expansion" | "id" | "region" | "title" | "zone"> & Partial<PhotoSpot>): PhotoSpot {
  return {
    ...baseSpot,
    slug: spotFields.id,
    ...spotFields,
  };
}
