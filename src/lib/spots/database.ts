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
  submitter: {
    id: string;
    displayname: string | null;
  } | null;
  landmarks: {
    name: string;
  } | null;
  spot_images: {
    url: string;
    alt: string | null;
    width: number;
    height: number;
    sort_order: number;
  }[];
};

const acceptedSpotSelect =
  "id,slug,state,zone,x,y,z,title,description,tags,access_notes,created_at,updated_at,accepted_at,submitter:app_users!spots_submitted_by_fkey(id,displayname),landmarks(name),spot_images(url,alt,width,height,sort_order)";

export async function getAcceptedPhotoSpots(supabase: SupabaseClient, viewerId?: string | null) {
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

  return hydrateLikeState(supabase, (data ?? []).map(toPhotoSpot), viewerId);
}

export async function getAcceptedPhotoSpotsBySubmitter(
  supabase: SupabaseClient,
  submitterId: string,
  viewerId?: string | null,
) {
  const { data, error } = await supabase
    .from("spots")
    .select(acceptedSpotSelect)
    .eq("state", "accepted")
    .eq("submitted_by", submitterId)
    .order("accepted_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .returns<DatabaseSpotRow[]>();

  if (error) {
    throw error;
  }

  return hydrateLikeState(supabase, (data ?? []).map(toPhotoSpot), viewerId);
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
    landmark: spot.landmarks?.name,
    coordinates: {
      x: Number(spot.x),
      y: Number(spot.y),
      ...(spot.z === null ? {} : { z: Number(spot.z) }),
    },
    expansion,
    tags: spot.tags ?? [],
    accessibilityNotes: spot.access_notes ? [spot.access_notes] : undefined,
    images: toSpotImages(spot),
    likeCount: 0,
    likedByViewer: false,
    createdAt: spot.created_at,
    updatedAt: spot.updated_at,
    submitter: spot.submitter,
  };
}

async function hydrateLikeState(supabase: SupabaseClient, spots: PhotoSpot[], viewerId?: string | null) {
  if (spots.length === 0) {
    return spots;
  }

  const { data: likeCounts, error: likeCountError } = await supabase
    .from("spots")
    .select("id, like_count")
    .in(
      "id",
      spots.map((spot) => spot.id),
    )
    .returns<{ id: string; like_count: number }[]>();

  if (likeCountError && !isMissingLikeSchemaError(likeCountError)) {
    throw likeCountError;
  }

  const countsBySpotId = new Map((likeCounts ?? []).map((spot) => [spot.id, spot.like_count]));

  if (!viewerId) {
    return spots.map((spot) => ({
      ...spot,
      likeCount: countsBySpotId.get(spot.id) ?? 0,
    }));
  }

  const { data: viewerLikes, error: viewerLikesError } = await supabase
    .from("spot_likes")
    .select("spot_id")
    .eq("user_id", viewerId)
    .in(
      "spot_id",
      spots.map((spot) => spot.id),
    )
    .returns<{ spot_id: string }[]>();

  if (viewerLikesError && !isMissingLikeSchemaError(viewerLikesError)) {
    throw viewerLikesError;
  }

  const likedSpotIds = new Set((viewerLikes ?? []).map((like) => like.spot_id));

  return spots.map((spot) => ({
    ...spot,
    likeCount: countsBySpotId.get(spot.id) ?? 0,
    likedByViewer: likedSpotIds.has(spot.id),
  }));
}

function isMissingLikeSchemaError(error: { code?: string }) {
  return error.code === "42703" || error.code === "42P01" || error.code === "PGRST205";
}

function toSpotImages(spot: DatabaseSpotRow): SpotImage[] {
  const images = [...spot.spot_images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, 2)
    .map((image) => ({
      src: image.url,
      alt: image.alt ?? spot.title,
      width: image.width,
      height: image.height,
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
