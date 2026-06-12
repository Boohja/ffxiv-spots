import { NextResponse } from "next/server";

import { createNotification } from "@/lib/notifications/server";
import {
  maxSpotAccessNotesLength,
  maxSpotDescriptionLength,
  maxSpotTitleLength,
} from "@/lib/spots/limits";
import { parseSpotTags, validateSpotTags } from "@/lib/spots/tags";
import { zonesByName } from "@/lib/spots/zones";
import { createClient } from "@/lib/supabase/server";
import { deleteStoredImage, uploadImageFile, UploadValidationError } from "@/lib/uploads/storage";

export const runtime = "nodejs";

const maxImages = 2;
const ownerActions = new Set(["save_draft", "submit", "revoke"]);
const reviewerActions = new Set(["save_review", "accept", "delete"]);

type SpotAction =
  | "save_draft"
  | "submit"
  | "revoke"
  | "save_review"
  | "accept"
  | "delete";

type SpotState = "draft" | "submitted" | "accepted" | "duplicate";
type AppRole = "submitter" | "trusted_submitter" | "moderator" | "admin";

type ExistingSpot = {
  id: string;
  slug: string;
  submitted_by: string | null;
  state: SpotState;
  title: string;
  spot_images: ExistingImage[];
};

type ExistingImage = {
  id: string;
  storage_key: string;
  url: string;
  sort_order: number;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in before editing a spot." }, { status: 401 });
    }

    const [spotResult, roleResult] = await Promise.all([
      getExistingSpot(supabase, id),
      getViewerRole(supabase, user.id),
    ]);

    if (spotResult.error) {
      throw spotResult.error;
    }

    const spot = spotResult.data;

    if (!spot) {
      return NextResponse.json({ error: "Spot not found." }, { status: 404 });
    }

    const viewerRole = roleResult.data?.role ?? null;
    const isReviewer = viewerRole === "moderator" || viewerRole === "admin";
    const isOwner = spot.submitted_by === user.id;
    const formData = await request.formData();
    const action = parseAction(formData.get("action"));

    if (!action) {
      return NextResponse.json({ error: "Choose a valid edit action." }, { status: 400 });
    }

    if (action === "revoke") {
      if (!isOwner || spot.state !== "submitted") {
        return NextResponse.json({ error: "Only the submitter can revoke a submitted spot." }, { status: 403 });
      }

      const { error } = await supabase
        .from("spots")
        .update({ state: "draft" })
        .eq("id", spot.id);

      if (error) {
        throw error;
      }

      return NextResponse.json({ spot: { id: spot.id, slug: spot.slug, state: "draft" } });
    }

    if (action === "delete") {
      if (!isReviewer) {
        return NextResponse.json({ error: "Only reviewers can delete spots." }, { status: 403 });
      }

      const deletionReason = stringValue(formData.get("deletionReason"));

      if (spot.submitted_by !== user.id) {
        await createNotification({
          recipient: spot.submitted_by,
          title: `Your submission "${spot.title}" was deleted`,
          message: buildDeletionMessage(deletionReason),
        });
      }
      await deleteImagesFromStorage(spot.spot_images);
      const { error } = await supabase.from("spots").delete().eq("id", spot.id);

      if (error) {
        throw error;
      }

      return NextResponse.json({ deleted: true });
    }

    if (ownerActions.has(action) && (!isOwner || spot.state !== "draft")) {
      return NextResponse.json({ error: "Only draft owners can edit and submit drafts." }, { status: 403 });
    }

    if (reviewerActions.has(action) && (!isReviewer || !["submitted", "accepted"].includes(spot.state))) {
      return NextResponse.json({ error: "Only reviewers can edit submitted or accepted spots." }, { status: 403 });
    }

    const input = parseSpotInput(formData);
    const files = formData
      .getAll("images")
      .filter((value): value is File => value instanceof File && value.size > 0);
    const keptImageIds = new Set(
      formData
        .getAll("existingImageIds")
        .filter((value): value is string => typeof value === "string" && value.length > 0),
    );
    const keptImages = spot.spot_images.filter((image) => keptImageIds.has(image.id));
    const removedImages = spot.spot_images.filter((image) => !keptImageIds.has(image.id));
    const nextState = getNextState(action, spot.state);
    const validationError = validateEditInput(input, {
      files,
      keptImageCount: keptImages.length,
      state: nextState,
    });

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const uploads = await Promise.all(files.map((file) => uploadImageFile(file, { folder: `spots/${spot.id}` })));
    const finalImages = [
      ...keptImages.map((image) => ({
        id: image.id,
        storage_key: image.storage_key,
        url: image.url,
      })),
      ...uploads.map((upload) => ({
        storage_key: upload.key,
        url: upload.url,
        width: upload.width,
        height: upload.height,
        size: upload.size,
      })),
    ];

    const { error: spotError } = await supabase
      .from("spots")
      .update({
        state: nextState,
        zone: input.zone,
        x: input.x,
        y: input.y,
        z: input.z,
        title: input.title ?? `${input.zone} photo spot`,
        description: input.description,
        tags: input.tags,
        access_notes: input.accessNotes,
        accepted_at: nextState === "accepted" ? new Date().toISOString() : null,
        accepted_by: nextState === "accepted" ? user.id : null,
      })
      .eq("id", spot.id);

    if (spotError) {
      throw spotError;
    }

    if (removedImages.length > 0) {
      await deleteImagesFromStorage(removedImages);
      const { error: deleteImageRowsError } = await supabase
        .from("spot_images")
        .delete()
        .in(
          "id",
          removedImages.map((image) => image.id),
        );

      if (deleteImageRowsError) {
        throw deleteImageRowsError;
      }
    }

    if (uploads.length > 0) {
      const { error: insertImagesError } = await supabase.from("spot_images").insert(
        uploads.map((upload, index) => ({
          spot_id: spot.id,
          storage_key: upload.key,
          url: upload.url,
          width: upload.width,
          height: upload.height,
          size: upload.size,
          alt: input.title ?? spot.title,
          sort_order: keptImages.length + index,
        })),
      );

      if (insertImagesError) {
        throw insertImagesError;
      }
    }

    if (finalImages.length > 0) {
      const sortUpdates = await Promise.all(
        finalImages.map((image, index) =>
          supabase.from("spot_images").update({ sort_order: index }).eq("storage_key", image.storage_key),
        ),
      );
      const sortUpdateError = sortUpdates.find((result) => result.error)?.error;

      if (sortUpdateError) {
        throw sortUpdateError;
      }
    }

    if (action === "accept" && spot.state !== "accepted" && spot.submitted_by !== user.id) {
      await createNotification({
        recipient: spot.submitted_by,
        title: `Your submission "${input.title ?? spot.title}" was accepted`,
        message: "Thank you for sharing this spot with the community. It is now visible to everyone browsing XIVSpots.",
        url: `/spots/${spot.slug}`,
      });
    }

    return NextResponse.json({
      spot: {
        id: spot.id,
        slug: spot.slug,
        state: nextState,
      },
    });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: "Could not update spot." }, { status: 500 });
  }
}

async function getExistingSpot(supabase: Awaited<ReturnType<typeof createClient>>, id: string) {
  return supabase
    .from("spots")
    .select("id, slug, submitted_by, state, title, spot_images(id, storage_key, url, sort_order)")
    .eq("id", id)
    .maybeSingle<ExistingSpot>();
}

async function getViewerRole(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  return supabase
    .from("app_users")
    .select("role")
    .eq("id", userId)
    .maybeSingle<{ role: AppRole }>();
}

function parseAction(value: FormDataEntryValue | null): SpotAction | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return ownerActions.has(value) || reviewerActions.has(value) ? (value as SpotAction) : undefined;
}

function parseSpotInput(formData: FormData) {
  const tagsValue = formData.get("tags");

  return {
    zone: stringValue(formData.get("zone")),
    x: parseCoordinate(formData.get("x")),
    y: parseCoordinate(formData.get("y")),
    z: parseOptionalCoordinate(formData.get("z")),
    title: stringValue(formData.get("title")),
    description: stringValue(formData.get("description")),
    accessNotes: stringValue(formData.get("accessibilityNotes")),
    tags: parseSpotTags(tagsValue),
    tagsValue,
  };
}

function validateEditInput(
  input: ReturnType<typeof parseSpotInput>,
  {
    files,
    keptImageCount,
    state,
  }: {
    files: File[];
    keptImageCount: number;
    state: SpotState;
  },
) {
  if (input.title && input.title.length > maxSpotTitleLength) {
    return `Keep the title to ${maxSpotTitleLength} characters or fewer.`;
  }

  if (input.description && input.description.length > maxSpotDescriptionLength) {
    return `Keep the description to ${maxSpotDescriptionLength} characters or fewer.`;
  }

  if (input.accessNotes && input.accessNotes.length > maxSpotAccessNotesLength) {
    return `Keep access notes to ${maxSpotAccessNotesLength} characters or fewer.`;
  }

  const tagError = validateSpotTags(input.tagsValue);

  if (tagError) {
    return tagError;
  }

  if (!input.zone || !zonesByName.has(input.zone)) {
    return "Choose a known zone from the zone list.";
  }

  if (input.x === undefined || input.y === undefined) {
    return "Enter X and Y coordinates.";
  }

  if (input.z !== undefined && !isValidCoordinate(input.z, -100, 100)) {
    return "Enter a valid Z coordinate or leave it empty.";
  }

  if (keptImageCount + files.length > maxImages) {
    return `Keep or upload at most ${maxImages} screenshots.`;
  }

  if ((state === "submitted" || state === "accepted") && keptImageCount + files.length === 0) {
    return "Choose a screenshot.";
  }

  return undefined;
}

function getNextState(action: SpotAction, currentState: SpotState): SpotState {
  if (action === "save_draft") {
    return "draft";
  }

  if (action === "accept") {
    return "accepted";
  }

  if (action === "save_review") {
    return currentState === "accepted" ? "accepted" : "submitted";
  }

  return "submitted";
}

function buildDeletionMessage(reason: string | undefined) {
  const baseMessage = "A reviewer removed this submission because it was not a fit for XIVSpots right now.";

  if (!reason) {
    return baseMessage;
  }

  return `${baseMessage}\n\nReviewer's comment:\n${reason}`;
}

async function deleteImagesFromStorage(images: ExistingImage[]) {
  await Promise.all(images.map((image) => deleteStoredImage(image.storage_key)));
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

function isValidCoordinate(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max;
}
