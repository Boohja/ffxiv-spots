import type { PhotoSpot, SpotImage } from "@/lib/spots/types";
import { getZoneMetadata } from "@/lib/spots/zones";
import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type DatabaseSpotRow = {
  id: string;
  slug: string | null;
  state: "draft" | "submitted" | "accepted" | "duplicate";
  zone: string;
  x: number;
  y: number;
  z: number | null;
  title: string;
  description: string | null;
  tags: string[] | null;
  access_notes: string | null;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  spot_images: {
    url: string;
    alt: string | null;
    sort_order: number;
  }[];
};

const acceptedSpotSelect =
  "id,slug,state,zone,x,y,z,title,description,tags,access_notes,created_at,updated_at,accepted_at,spot_images(url,alt,sort_order)";

export async function getAcceptedPhotoSpots(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("spots")
    .select(acceptedSpotSelect)
    .eq("state", "accepted")
    .order("accepted_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .returns<DatabaseSpotRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(toPhotoSpot);
}

export function toPhotoSpot(spot: DatabaseSpotRow): PhotoSpot {
  const { region, expansion } = getZoneMetadata(spot.zone);

  return {
    id: spot.id,
    slug: spot.slug ?? spot.id,
    title: spot.title,
    description: spot.description ?? "",
    region,
    zone: spot.zone,
    coordinates: {
      x: Number(spot.x),
      y: Number(spot.y),
      ...(spot.z === null ? {} : { z: Number(spot.z) }),
    },
    expansion,
    tags: spot.tags ?? [],
    accessibilityNotes: spot.access_notes ? [spot.access_notes] : undefined,
    images: toSpotImages(spot),
    featured: Boolean(spot.accepted_at),
    createdAt: spot.created_at,
    updatedAt: spot.updated_at,
  };
}

function toSpotImages(spot: DatabaseSpotRow): SpotImage[] {
  const images = [...spot.spot_images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, 2)
    .map((image) => ({
      src: image.url,
      alt: image.alt ?? spot.title,
    }));

  return images.length > 0
    ? images
    : [
        {
          src: "/spots/placeholder.webp",
          alt: spot.title,
        },
      ];
}
