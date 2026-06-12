import { describe, expect, it } from "vitest";

import { filterSpots } from "@/lib/spots/filters";
import type { PhotoSpot } from "@/lib/spots/types";

const baseSpot = {
  description: "",
  images: [],
  likeCount: 0,
  likedByViewer: false,
  tags: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
} satisfies Pick<
  PhotoSpot,
  "createdAt" | "description" | "images" | "likeCount" | "likedByViewer" | "tags" | "updatedAt"
>;

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

  it("can filter to only spots liked by the current viewer", () => {
    const spots = [
      spot({
        id: "liked",
        title: "Liked spot",
        zone: "Central Thanalan",
        expansion: "A Realm Reborn",
        likedByViewer: true,
        region: "Thanalan",
      }),
      spot({
        id: "not-liked",
        title: "Not liked spot",
        zone: "Middle La Noscea",
        expansion: "A Realm Reborn",
        likedByViewer: false,
        region: "La Noscea",
      }),
    ];

    expect(filterSpots(spots, { liked: true }).map((matchedSpot) => matchedSpot.id)).toEqual(["liked"]);
  });

  it("sorts by likes before falling back to newest", () => {
    const spots = [
      spot({
        id: "old-liked",
        title: "Old liked",
        zone: "Central Thanalan",
        expansion: "A Realm Reborn",
        likeCount: 2,
        region: "Thanalan",
        createdAt: "2026-01-01T00:00:00.000Z",
      }),
      spot({
        id: "new-liked",
        title: "New liked",
        zone: "Central Thanalan",
        expansion: "A Realm Reborn",
        likeCount: 2,
        region: "Thanalan",
        createdAt: "2026-02-01T00:00:00.000Z",
      }),
      spot({
        id: "most-liked",
        title: "Most liked",
        zone: "Central Thanalan",
        expansion: "A Realm Reborn",
        likeCount: 3,
        region: "Thanalan",
        createdAt: "2026-01-15T00:00:00.000Z",
      }),
    ];

    expect(filterSpots(spots, { sort: "likes" }).map((matchedSpot) => matchedSpot.id)).toEqual([
      "most-liked",
      "new-liked",
      "old-liked",
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
