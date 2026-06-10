import type { SupabaseClient } from "@supabase/supabase-js";

export type SpotEntryState = "draft" | "submitted" | "accepted" | "duplicate";

export type SpotEntrySubmitter = {
  id: string;
  displayname: string | null;
  username: string | null;
  avatar_url: string | null;
};

export type SpotEntry = {
  id: string;
  slug: string;
  title: string;
  zone: string;
  x: number;
  y: number;
  z: number | null;
  state: SpotEntryState;
  created_at: string;
  image: {
    url: string;
    alt: string | null;
  } | null;
  submitter?: SpotEntrySubmitter | null;
};

type SpotEntryRow = Omit<SpotEntry, "image" | "submitter"> & {
  spot_images: {
    url: string;
    alt: string | null;
    sort_order: number;
  }[];
};

type SpotEntryWithSubmitterRow = SpotEntryRow & {
  submitter: SpotEntrySubmitter | null;
};

const ownSpotSelect = `
  id,
  slug,
  title,
  zone,
  x,
  y,
  z,
  state,
  created_at,
  spot_images(url, alt, sort_order)
`;

const reviewSpotSelect = `
  ${ownSpotSelect},
  submitter:app_users!spots_submitted_by_fkey(id, displayname, username, avatar_url)
`;

export async function getSpotEntriesForSubmitter(
  supabase: SupabaseClient,
  submitterId: string,
) {
  const { data, error } = await supabase
    .from("spots")
    .select(ownSpotSelect)
    .eq("submitted_by", submitterId)
    .order("created_at", { ascending: false })
    .returns<SpotEntryRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapSpotEntryRow);
}

export async function getPendingSpotEntriesForReview(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("spots")
    .select(reviewSpotSelect)
    .eq("state", "submitted")
    .order("created_at", { ascending: true })
    .returns<SpotEntryWithSubmitterRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    ...mapSpotEntryRow(row),
    submitter: row.submitter,
  }));
}

function mapSpotEntryRow(row: SpotEntryRow): SpotEntry {
  const firstImage =
    row.spot_images.length > 0
      ? [...row.spot_images].sort((a, b) => a.sort_order - b.sort_order)[0]
      : null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    zone: row.zone,
    x: row.x,
    y: row.y,
    z: row.z,
    state: row.state,
    created_at: row.created_at,
    image: firstImage
      ? {
          url: firstImage.url,
          alt: firstImage.alt,
        }
      : null,
  };
}
