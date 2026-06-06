import type { PhotoSpot } from "@/lib/spots/types";

export const photoSpots = [
  {
    id: "spot-001",
    slug: "mistfall-overlook",
    title: "Mistfall Overlook",
    description:
      "A cliffside view with layered sea haze, lantern glow, and enough open sky for dramatic portrait framing.",
    region: "La Noscea",
    zone: "Upper La Noscea",
    area: "Oakwood",
    coordinates: { x: 30.4, y: 22.8 },
    expansion: "A Realm Reborn",
    tags: ["scenery", "sunset", "ocean", "portraits"],
    bestTimeOfDay: ["sunset", "night"],
    bestWeather: ["clear skies", "fair skies"],
    accessibilityNotes: ["Easy access from nearby aetheryte", "No flying required"],
    images: [
      {
        src: "/spots/coastal-overlook.png",
        alt: "A twilight coastal cliff with glowing blue lights and distant fantasy architecture.",
        caption: "Wide coastal framing with a clean horizon line.",
        credit: "Generated placeholder",
      },
    ],
    featured: true,
    createdAt: "2026-05-18T10:00:00.000Z",
    updatedAt: "2026-05-18T10:00:00.000Z",
  },
  {
    id: "spot-002",
    slug: "moonveil-bridge",
    title: "Moonveil Bridge",
    description:
      "A quiet forest crossing where blue flora, still water, and lanterns make low-light portraits feel soft.",
    region: "The Black Shroud",
    zone: "Central Shroud",
    area: "Bentbranch",
    coordinates: { x: 20.8, y: 24.2 },
    expansion: "A Realm Reborn",
    tags: ["forest", "night", "roleplay", "flowers"],
    bestTimeOfDay: ["night"],
    bestWeather: ["fair skies", "fog"],
    accessibilityNotes: ["Easy access", "Good for small roleplay groups"],
    images: [
      {
        src: "/spots/forest-bridge.png",
        alt: "A moonlit fantasy forest bridge with glowing flowers and warm lantern light.",
        caption: "Lantern light gives faces a warmer edge at night.",
        credit: "Generated placeholder",
      },
    ],
    featured: true,
    createdAt: "2026-05-24T12:30:00.000Z",
    updatedAt: "2026-05-24T12:30:00.000Z",
  },
  {
    id: "spot-003",
    slug: "aurora-watch",
    title: "Aurora Watch",
    description:
      "A high terrace with clean silhouettes, aurora color, and a strong leading line toward distant peaks.",
    region: "Coerthas",
    zone: "Coerthas Western Highlands",
    area: "Falcon's Nest",
    coordinates: { x: 15.6, y: 12.1, z: 1.4 },
    expansion: "Heavensward",
    tags: ["snow", "mountains", "night", "wide shots"],
    bestTimeOfDay: ["night", "dawn"],
    bestWeather: ["clear skies", "snow"],
    accessibilityNotes: ["Flying recommended", "Heavensward access required"],
    images: [
      {
        src: "/spots/alpine-observatory.png",
        alt: "A snowy alpine terrace under aurora light with a small observatory tower.",
        caption: "Best when the sky is visible behind the terrace railing.",
        credit: "Generated placeholder",
      },
    ],
    featured: true,
    createdAt: "2026-05-28T09:45:00.000Z",
    updatedAt: "2026-05-28T09:45:00.000Z",
  },
  {
    id: "spot-004",
    slug: "sapphire-market-roofs",
    title: "Sapphire Market Roofs",
    description:
      "Layered rooftops and hanging lamps create compact urban compositions for fashion plates and casual portraits.",
    region: "Thanalan",
    zone: "Ul'dah - Steps of Thal",
    area: "Sapphire Avenue Exchange",
    coordinates: { x: 13.7, y: 10.9 },
    expansion: "A Realm Reborn",
    tags: ["city", "golden hour", "portraits", "easy access"],
    bestTimeOfDay: ["afternoon", "sunset"],
    bestWeather: ["clear skies", "fair skies"],
    accessibilityNotes: ["City-state access", "No combat zone"],
    images: [
      {
        src: "/spots/coastal-overlook.png",
        alt: "A warm, scenic placeholder used for a city rooftop photo spot.",
        caption: "Placeholder image until a curated screenshot is added.",
        credit: "Generated placeholder",
      },
    ],
    createdAt: "2026-06-01T14:10:00.000Z",
    updatedAt: "2026-06-01T14:10:00.000Z",
  },
  {
    id: "spot-005",
    slug: "lilac-rain-pavilion",
    title: "Lilac Rain Pavilion",
    description:
      "A sheltered garden corner with reflective stone, soft blossoms, and a calmer mood during rain or fog.",
    region: "Hingashi",
    zone: "Kugane",
    area: "Bokairo Inn",
    coordinates: { x: 10.2, y: 9.7 },
    expansion: "Stormblood",
    tags: ["garden", "rain", "roleplay", "architecture"],
    bestTimeOfDay: ["morning", "night"],
    bestWeather: ["rain", "fog"],
    accessibilityNotes: ["Stormblood access required", "No flying required"],
    images: [
      {
        src: "/spots/forest-bridge.png",
        alt: "A moody forest and lantern placeholder used for a garden pavilion photo spot.",
        caption: "Placeholder image until a curated screenshot is added.",
        credit: "Generated placeholder",
      },
    ],
    createdAt: "2026-06-03T08:20:00.000Z",
    updatedAt: "2026-06-03T08:20:00.000Z",
  },
  {
    id: "spot-006",
    slug: "last-light-ridge",
    title: "Last Light Ridge",
    description:
      "A sparse ridge with a huge skybox, quiet negative space, and enough distance for scenery-led screenshots.",
    region: "Norvrandt",
    zone: "Lakeland",
    area: "The Ostall Imperative",
    coordinates: { x: 26.8, y: 15.4 },
    expansion: "Shadowbringers",
    tags: ["scenery", "wide shots", "dawn", "relaxing"],
    bestTimeOfDay: ["dawn", "sunset"],
    bestWeather: ["clear skies", "gloom"],
    accessibilityNotes: ["Shadowbringers access required", "Flying helps with framing"],
    images: [
      {
        src: "/spots/alpine-observatory.png",
        alt: "A cool mountain overlook placeholder used for a broad scenic ridge photo spot.",
        caption: "Placeholder image until a curated screenshot is added.",
        credit: "Generated placeholder",
      },
    ],
    createdAt: "2026-06-05T16:00:00.000Z",
    updatedAt: "2026-06-05T16:00:00.000Z",
  },
] satisfies PhotoSpot[];

export function getSpotBySlug(slug: string) {
  return photoSpots.find((spot) => spot.slug === slug);
}

export function getFeaturedSpots() {
  return photoSpots.filter((spot) => spot.featured);
}

export function getRelatedSpots(spot: PhotoSpot, limit = 3) {
  return photoSpots
    .filter((candidate) => candidate.id !== spot.id)
    .map((candidate) => ({
      spot: candidate,
      score:
        (candidate.zone === spot.zone ? 4 : 0) +
        (candidate.region === spot.region ? 2 : 0) +
        candidate.tags.filter((tag) => spot.tags.includes(tag)).length,
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((candidate) => candidate.spot);
}
