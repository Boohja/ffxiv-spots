import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { parseSpotTags } from "@/lib/spots/tags";
import { createClient } from "@/lib/supabase/server";
import { uploadImageFile, UploadValidationError } from "@/lib/uploads/storage";
import { zonesByName } from "@/lib/spots/zones";

export const runtime = "nodejs";

const maxImages = 2;
const spotStates = new Set(["draft", "submitted", "accepted"]);
const defaultMaxDraftsPerUser = 5;
const defaultMaxPendingSpotsPerUser = 10;

type SpotState = "draft" | "submitted" | "accepted";
type AppRole = "submitter" | "trusted_submitter" | "moderator" | "admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in before submitting a spot." }, { status: 401 });
    }

    const formData = await request.formData();
    const state = parseState(formData.get("state"));
    const zone = stringValue(formData.get("zone"));
    const x = parseCoordinate(formData.get("x"));
    const y = parseCoordinate(formData.get("y"));
    const z = parseOptionalCoordinate(formData.get("z"));
    const submittedTitle = stringValue(formData.get("title"));
    const description = stringValue(formData.get("description"));
    const accessNotes = stringValue(formData.get("accessibilityNotes"));
    const landmarkId = parseOptionalInteger(formData.get("landmarkId"));
    const tags = parseSpotTags(formData.get("tags"));
    const files = formData
      .getAll("images")
      .filter((value): value is File => value instanceof File);
    const viewerRole = await getViewerRole(supabase, user.id);
    const isReviewer = viewerRole === "moderator" || viewerRole === "admin";

    const validationError = validateSpotInput({
      files,
      state,
      x,
      y,
      z,
      zone,
    });

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (state === "accepted" && !isReviewer) {
      return NextResponse.json({ error: "Only reviewers can immediately accept spots." }, { status: 403 });
    }

    const validState = state;
    const validZone = zone;
    const validX = x;
    const validY = y;

    if (!validState || !validZone || validX === undefined || validY === undefined) {
      return NextResponse.json({ error: "Invalid spot submission." }, { status: 400 });
    }

    const validTitle = submittedTitle ?? `${validZone} photo spot`;
    const quotaError =
      validState === "accepted" ? undefined : await validateUserQuota(supabase, user.id, validState);

    if (quotaError) {
      return NextResponse.json({ error: quotaError }, { status: 400 });
    }

    const spotId = randomUUID();
    const slug = await createUniqueSlug(supabase, validTitle);
    const insertState = validState === "accepted" ? "submitted" : validState;

    const { error: spotError } = await supabase.from("spots").insert({
      id: spotId,
      slug,
      submitted_by: user.id,
      state: insertState,
      landmark_id: landmarkId,
      zone: validZone,
      x: validX,
      y: validY,
      z,
      title: validTitle,
      description,
      tags,
      access_notes: accessNotes,
    });

    if (spotError) {
      throw spotError;
    }

    const uploads = await Promise.all(files.map((file) => uploadImageFile(file, { folder: `spots/${spotId}` })));

    if (uploads.length > 0) {
      const { error: imagesError } = await supabase.from("spot_images").insert(
        uploads.map((upload, index) => ({
          spot_id: spotId,
          storage_key: upload.key,
          url: upload.url,
          width: upload.width,
          height: upload.height,
          size: upload.size,
          alt: validTitle,
          sort_order: index,
        })),
      );

      if (imagesError) {
        throw imagesError;
      }
    }

    if (validState === "accepted") {
      const { error: acceptError } = await supabase
        .from("spots")
        .update({
          state: "accepted",
          accepted_at: new Date().toISOString(),
          accepted_by: user.id,
        })
        .eq("id", spotId);

      if (acceptError) {
        throw acceptError;
      }
    }

    return NextResponse.json(
      {
        spot: {
          id: spotId,
          slug,
          state: validState,
        },
        uploads,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: "Could not save spot." }, { status: 500 });
  }
}

async function getViewerRole(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data, error } = await supabase
    .from("app_users")
    .select("role")
    .eq("id", userId)
    .maybeSingle<{ role: AppRole }>();

  if (error) {
    throw error;
  }

  return data?.role ?? null;
}

function validateSpotInput({
  files,
  state,
  x,
  y,
  z,
  zone,
}: {
  files: File[];
  state: SpotState | undefined;
  x: number | undefined;
  y: number | undefined;
  z: number | undefined;
  zone: string | undefined;
}) {
  if (!state) {
    return "Choose whether to submit or save a draft.";
  }

  if (!zone || !zonesByName.has(zone)) {
    return "Choose a known zone from the zone list.";
  }

  if (x === undefined || y === undefined) {
    return "Enter X and Y coordinates.";
  }

  if (z !== undefined && !isValidCoordinate(z, -100, 100)) {
    return "Enter a valid Z coordinate or leave it empty.";
  }

  if ((state === "submitted" || state === "accepted") && files.length === 0) {
    return "Choose a screenshot.";
  }

  if (files.length > maxImages) {
    return "Choose at most two screenshots.";
  }

  return undefined;
}

async function validateUserQuota(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  state: SpotState,
) {
  if (state === "draft") {
    const maxDrafts = getPositiveIntegerEnv("XIVSPOTS_MAX_DRAFTS_PER_USER", defaultMaxDraftsPerUser);
    const { count, error } = await supabase
      .from("spots")
      .select("id", { count: "exact", head: true })
      .eq("submitted_by", userId)
      .eq("state", "draft");

    if (error) {
      throw error;
    }

    if ((count ?? 0) >= maxDrafts) {
      return `You can keep up to ${maxDrafts} drafts.`;
    }
  }

  const maxPendingSpots = getPositiveIntegerEnv(
    "XIVSPOTS_MAX_PENDING_SPOTS_PER_USER",
    defaultMaxPendingSpotsPerUser,
  );
  const { count, error } = await supabase
    .from("spots")
    .select("id", { count: "exact", head: true })
    .eq("submitted_by", userId)
    .in("state", ["draft", "submitted"]);

  if (error) {
    throw error;
  }

  if ((count ?? 0) >= maxPendingSpots) {
    return `You can have up to ${maxPendingSpots} draft or pending spots.`;
  }

  return undefined;
}

function parseState(value: FormDataEntryValue | null): SpotState | undefined {
  if (typeof value !== "string" || !spotStates.has(value)) {
    return undefined;
  }

  return value as SpotState;
}

function stringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parseCoordinate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !/^\d{1,2}(?:\.\d)?$/.test(value.trim())) {
    return undefined;
  }

  const coordinate = Number(value);

  return isValidCoordinate(coordinate, 0, 100) ? coordinate : undefined;
}

function parseOptionalCoordinate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const coordinate = Number(value);

  return Number.isFinite(coordinate) ? coordinate : undefined;
}

function parseOptionalInteger(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return undefined;
  }

  return Number(value);
}

function isValidCoordinate(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function getPositiveIntegerEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);

  return Number.isInteger(value) && value > 0 ? value : fallback;
}

async function createUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  title: string,
) {
  const baseSlug = slugify(title) || "spot";

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const suffix = attempt === 0 ? "" : `-${attempt + 1}`;
    const candidate = `${baseSlug}${suffix}`;
    const { data, error } = await supabase
      .from("spots")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return candidate;
    }
  }

  return `${baseSlug}-${randomUUID().slice(0, 8)}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
