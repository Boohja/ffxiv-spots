"use client";

/* eslint-disable @next/next/no-img-element -- Local blob preview URLs are not served through next/image. */

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { SpotStateBadge } from "@/components/spots/SpotStateBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  maxSpotAccessNotesLength,
  maxSpotDescriptionLength,
  maxSpotTagsInputLength,
  maxSpotTitleLength,
} from "@/lib/spots/limits";
import { validateSpotTags } from "@/lib/spots/tags";
import { zoneMetadata, type ZoneMetadata } from "@/lib/spots/zones";

type NearbyLandmark = {
  id: number;
  name: string;
  x: number;
  y: number;
  distance: number;
};

type SelectedImage = {
  file: File;
  previewUrl: string;
};

type SubmitFeedback =
  | {
      message: string;
      tone: "success" | "error" | "info";
    }
  | undefined;

type SubmitMode = "draft" | "submitted" | "accepted";
type EditMode = "create" | "ownerDraft" | "ownerSubmitted" | "review";
type EditAction = "save_draft" | "submit" | "revoke" | "save_review" | "accept" | "delete";

type CompletionState =
  | {
      state: SubmitMode;
      slug: string;
    }
  | undefined;

type ExistingSpotImage = {
  id: string;
  url: string;
  alt: string | null;
};

export type EditableSpotFormValue = {
  id: string;
  slug: string;
  state: "draft" | "submitted" | "accepted";
  zone: string;
  x: number;
  y: number;
  z: number | null;
  title: string;
  description: string | null;
  tags: string[] | null;
  access_notes: string | null;
  updated_at?: string | null;
  images: ExistingSpotImage[];
};

type SubmitSpotFormProps = Readonly<{
  canAcceptOnCreate?: boolean;
  mode?: EditMode;
  spot?: EditableSpotFormValue;
}>;

export function SubmitSpotForm({ canAcceptOnCreate = false, mode = "create", spot }: SubmitSpotFormProps) {
  const router = useRouter();
  const isCreateMode = mode === "create";
  const isEditable = mode !== "ownerSubmitted";
  const isReviewMode = mode === "review";
  const sortedZones = useMemo(
    () => [...zoneMetadata].sort((a, b) => a.zone.localeCompare(b.zone)),
    [],
  );
  const [zoneQuery, setZoneQuery] = useState(spot?.zone ?? "");
  const [xCoordinate, setXCoordinate] = useState(spot ? String(spot.x) : "");
  const [yCoordinate, setYCoordinate] = useState(spot ? String(spot.y) : "");
  const [isZoneListOpen, setIsZoneListOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingSpotImage[]>(spot?.images ?? []);
  const [nearbyLandmark, setNearbyLandmark] = useState<NearbyLandmark | null>(null);
  const [isLandmarkLookupPending, setIsLandmarkLookupPending] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<SubmitFeedback>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [completion, setCompletion] = useState<CompletionState>();
  const [imageInputKey, setImageInputKey] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletionReason, setDeletionReason] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const selectedImagesRef = useRef<SelectedImage[]>([]);
  const pendingDeleteFormRef = useRef<HTMLFormElement | null>(null);

  const filteredZones = useMemo(() => {
    const query = zoneQuery.trim().toLowerCase();

    if (!query) {
      return sortedZones;
    }

    return sortedZones.filter(
      (zone) =>
        zone.zone.toLowerCase().includes(query) ||
        zone.region.toLowerCase().includes(query) ||
        zone.expansion.toLowerCase().includes(query),
    );
  }, [sortedZones, zoneQuery]);
  const metadata = zoneMetadata.find((zone) => zone.zone === zoneQuery);
  const canLookupLandmark = Boolean(
    metadata && isValidCoordinateString(xCoordinate) && isValidCoordinateString(yCoordinate),
  );
  const visibleLandmark = canLookupLandmark ? nearbyLandmark : null;
  const suggestedTitle = visibleLandmark?.name ?? (metadata ? `${zoneQuery} photo spot` : "Sunny beach spot");

  useEffect(() => {
    if (!canLookupLandmark) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLandmarkLookupPending(true);

      try {
        const params = new URLSearchParams({
          zone: zoneQuery,
          x: xCoordinate,
          y: yCoordinate,
        });
        const response = await fetch(`/api/landmarks/nearest?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Landmark lookup failed.");
        }

        const payload = (await response.json()) as { landmark: NearbyLandmark | null };
        setNearbyLandmark(payload.landmark);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setNearbyLandmark(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLandmarkLookupPending(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [canLookupLandmark, xCoordinate, yCoordinate, zoneQuery]);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(
    () => () => {
      for (const image of selectedImagesRef.current) {
        URL.revokeObjectURL(image.previewUrl);
      }
    },
    [],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveSpot(isReviewMode ? "save_review" : "submit", event.currentTarget);
  }

  async function saveSpot(
    action: SubmitMode | EditAction,
    form: HTMLFormElement,
    options: { deletionReason?: string; skipDeleteDialog?: boolean } = {},
  ) {
    if (!isEditable && action !== "revoke") {
      return;
    }

    if (action === "delete" && !options.skipDeleteDialog) {
      pendingDeleteFormRef.current = form;
      setDeletionReason("");
      setIsDeleteDialogOpen(true);
      return;
    }

    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "").trim() || suggestedTitle;
    const validationError = validateSubmission(action, title, formData);

    if (isCreateMode) {
      formData.set("state", action === "accept" ? "accepted" : action === "save_draft" || action === "draft" ? "draft" : "submitted");
    } else {
      formData.set("action", normalizeEditAction(action));
    }

    formData.set("title", title);

    if (action === "delete") {
      formData.set("deletionReason", options.deletionReason?.trim() ?? "");
    }

    formData.delete("images");
    formData.delete("existingImageIds");

    for (const image of existingImages) {
      formData.append("existingImageIds", image.id);
    }

    for (const image of selectedImages) {
      formData.append("images", image.file);
    }

    setHasSubmitted(true);
    setSubmitFeedback({
      message: getPendingMessage(action),
      tone: "info",
    });
    setIsSubmitting(true);

    await new Promise((resolve) => window.setTimeout(resolve, 250));

    if (validationError) {
      setSubmitFeedback({ message: validationError, tone: "error" });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(isCreateMode ? "/api/spots" : `/api/spots/${spot?.id}`, {
        method: isCreateMode ? "POST" : "PATCH",
        body: formData,
      });
      const payload = (await response.json()) as { deleted?: boolean; spot?: { slug: string }; error?: string };

      if (!response.ok || (!payload.spot && !payload.deleted)) {
        throw new Error(payload.error ?? "Could not save spot.");
      }

      if (payload.deleted) {
        router.push("/moderation/spots");
        return;
      }

      const savedSlug = payload.spot?.slug ?? spot?.slug ?? "";

      if (!isCreateMode) {
        if (mode === "review") {
          router.push("/moderation/spots");
        } else {
          router.push(`/spots/${savedSlug}/edit`);
          router.refresh();
        }

        return;
      }

      const savedState = formData.get("state");

      setCompletion({
        state: savedState === "accepted" ? "accepted" : savedState === "draft" ? "draft" : "submitted",
        slug: savedSlug,
      });
      window.setTimeout(() => {
        router.push(`/spots/${savedSlug}`);
      }, 5000);
    } catch (error) {
      setSubmitFeedback({
        message: error instanceof Error ? error.message : "Could not save spot.",
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function validateSubmission(action: SubmitMode | EditAction, title: string, formData: FormData) {
    if (action === "revoke" || action === "delete") {
      return undefined;
    }

    if (title.length > maxSpotTitleLength) {
      return `Keep the title to ${maxSpotTitleLength} characters or fewer.`;
    }

    const description = String(formData.get("description") ?? "").trim();

    if (description.length > maxSpotDescriptionLength) {
      return `Keep the description to ${maxSpotDescriptionLength} characters or fewer.`;
    }

    const accessNotes = String(formData.get("accessibilityNotes") ?? "").trim();

    if (accessNotes.length > maxSpotAccessNotesLength) {
      return `Keep access notes to ${maxSpotAccessNotesLength} characters or fewer.`;
    }

    const tagError = validateSpotTags(formData.get("tags"));

    if (tagError) {
      return tagError;
    }

    if (!metadata) {
      return "Choose a known zone from the zone list.";
    }

    if (!isValidCoordinateString(xCoordinate) || !isValidCoordinateString(yCoordinate)) {
      return "Enter X and Y coordinates.";
    }

    const finalState = action === "save_draft" || action === "draft" ? "draft" : "submitted";

    if (finalState === "submitted" && !title) {
      return "Add a spot title or use the suggested title.";
    }

    if (finalState === "submitted" && selectedImages.length + existingImages.length === 0) {
      return "Choose a screenshot.";
    }

    if (selectedImages.length + existingImages.length > 2) {
      return "Choose at most two screenshots.";
    }

    return undefined;
  }

  if (mode === "ownerSubmitted" && spot) {
    return (
      <section className="glass-panel rounded-lg p-6">
        <SectionHeading eyebrow="Submitted" title="This spot is waiting for review" />
        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
          Submitted spots are locked while they are in review. You can revoke the submission to move it back to drafts.
        </p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          <SummaryItem label="Zone" value={spot.zone} />
          <SummaryItem label="Coordinates" value={`X ${spot.x}, Y ${spot.y}`} />
          <SummaryItem label="Images" value={String(spot.images.length)} />
        </dl>
        {submitFeedback && hasSubmitted ? (
          <p
            className={`mt-5 rounded-lg border px-3 py-2 text-sm leading-6 ${
              submitFeedback.tone === "error"
                ? "border-danger/50 bg-danger/10 text-text-primary"
                : "border-border-default bg-surface-base text-text-secondary"
            }`}
          >
            {submitFeedback.message}
          </p>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          className="mt-5"
          disabled={isSubmitting}
          onClick={(event) => {
            const form = event.currentTarget.form ?? document.createElement("form");
            void saveSpot("revoke", form);
          }}
        >
          {isSubmitting ? "Processing..." : "Revoke submission"}
        </Button>
      </section>
    );
  }

  if (completion) {
    return <SubmissionCompleteCard state={completion.state} slug={completion.slug} />;
  }

  const totalImages = existingImages.length + selectedImages.length;
  const statusLabel = getStatusLabel(spot?.state ?? "draft");
  const updatedLabel = spot?.updated_at ? formatDateTime(spot.updated_at) : "Not saved yet";

  return (
    <>
      <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" onSubmit={handleSubmit}>
        <div className="space-y-6">
        <section className="glass-panel rounded-lg p-5">
          <SectionHeading eyebrow="Location" title="Where is the spot?" />
          <div className="mt-5 grid gap-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
              <ZoneField
                id="spot-zone"
                filteredZones={filteredZones}
                isOpen={isZoneListOpen}
                onOpenChange={setIsZoneListOpen}
                onZoneChange={setZoneQuery}
                value={zoneQuery}
              />
              <DerivedField label="Region" value={metadata?.region ?? ""} />
              <DerivedField label="Expansion" value={metadata?.expansion ?? ""} />
            </div>

            <div className="grid gap-3 sm:grid-cols-[112px_112px_112px_minmax(0,1fr)]">
              <Field label="X" htmlFor="spot-x">
                <Input
                  id="spot-x"
                  name="x"
                  inputMode="decimal"
                  placeholder=""
                  value={xCoordinate}
                  onChange={(event) => setXCoordinate(normalizeCoordinateInput(event.target.value))}
                />
              </Field>
              <Field label="Y" htmlFor="spot-y">
                <Input
                  id="spot-y"
                  name="y"
                  inputMode="decimal"
                  placeholder=""
                  value={yCoordinate}
                  onChange={(event) => setYCoordinate(normalizeCoordinateInput(event.target.value))}
                />
              </Field>
              <Field label="Z (optional)" htmlFor="spot-z">
                <Input
                  id="spot-z"
                  name="z"
                  inputMode="decimal"
                  placeholder=""
                  defaultValue={spot?.z ?? ""}
                />
              </Field>
              <Field
                label={
                  <span className="flex items-center gap-2">
                    Landmark
                    {canLookupLandmark && isLandmarkLookupPending ? (
                      <span className="h-2 w-2 animate-pulse rounded-full bg-brand-spark" aria-label="Looking up landmark" />
                    ) : null}
                  </span>
                }
                htmlFor="spot-landmark"
              >
                <DerivedField id="spot-landmark" name="landmark" value={visibleLandmark?.name ?? ""} />
              </Field>
            </div>
            <input type="hidden" name="landmarkId" value={visibleLandmark?.id ?? ""} />

            <Field label="Access notes (optional)" htmlFor="spot-access">
              <Textarea
                id="spot-access"
                name="accessibilityNotes"
                maxLength={maxSpotAccessNotesLength}
                rows={3}
                defaultValue={spot?.access_notes ?? ""}
                placeholder="Nearest aetheryte, flying needs, quest access, party size notes..."
              />
            </Field>
          </div>
        </section>

        <section className="glass-panel rounded-lg p-5">
          <SectionHeading eyebrow="Details" title="What makes it worth visiting?" />
          <div className="mt-5 space-y-4">
            <Field label="Spot title" htmlFor="spot-title">
              <Input
                id="spot-title"
                name="title"
                defaultValue={spot?.title ?? ""}
                maxLength={maxSpotTitleLength}
                placeholder={suggestedTitle}
              />
            </Field>
            <Field label="Description (optional)" htmlFor="spot-description">
              <Textarea
                id="spot-description"
                name="description"
                maxLength={maxSpotDescriptionLength}
                rows={5}
                defaultValue={spot?.description ?? ""}
                placeholder="A cliffside view with layered sea haze, lantern glow, and open sky for portraits."
              />
            </Field>
            <Field label="Tags (optional)" htmlFor="spot-tags">
              <Input
                id="spot-tags"
                name="tags"
                defaultValue={spot?.tags?.join(", ") ?? ""}
                maxLength={maxSpotTagsInputLength}
                placeholder="scenery, sunset, ocean, portraits"
              />
            </Field>
          </div>
        </section>

        <section className="glass-panel rounded-lg p-5">
          <SectionHeading eyebrow="Images" title="Upload screenshots" />
          <div
            className={`mt-5 flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center transition ${
              totalImages >= 2
                ? "border-border-subtle bg-surface-base/70 opacity-70"
                : "border-border-strong bg-surface-base"
            }`}
          >
            <span className="text-sm font-semibold text-text-primary">
              {totalImages >= 2 ? "Screenshot limit reached" : "Choose images"}
            </span>
            <span className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
              {totalImages >= 2
                ? "Remove one screenshot to choose a different image."
                : ""}
            </span>
            <ul className="mt-4 max-w-md space-y-1 text-left text-sm leading-5 text-text-muted">
              <li>Use unedited game screenshots without shaders, filters, or post-processing.</li>
              <li>Keep the focus on the landscape; avoid characters and creatures when possible.</li>
            </ul>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              disabled={totalImages >= 2}
              onClick={() => imageInputRef.current?.click()}
            >
              Browse screenshots
            </Button>
            <input
              key={imageInputKey}
              ref={imageInputRef}
              name="images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={totalImages >= 2}
              className="hidden"
              onChange={(event) => {
                const pickedFiles = Array.from(event.currentTarget.files ?? []);

                setSelectedImages((currentImages) => {
                  const nextImages = [...currentImages];
                  const currentKeys = new Set(currentImages.map((image) => fileKey(image.file)));

                  for (const file of pickedFiles) {
                    if (nextImages.length + existingImages.length >= 2) {
                      break;
                    }

                    const key = fileKey(file);

                    if (currentKeys.has(key)) {
                      continue;
                    }

                    currentKeys.add(key);
                    nextImages.push({
                      file,
                      previewUrl: URL.createObjectURL(file),
                    });
                  }

                  return nextImages.slice(0, Math.max(0, 2 - existingImages.length));
                });
                setImageInputKey((key) => key + 1);
              }}
            />
          </div>
          {existingImages.length > 0 ? (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {existingImages.map((image) => (
                <li key={image.id} className="overflow-hidden rounded-lg border border-border-subtle bg-surface-base">
                  <div className="relative">
                    <img src={image.url} alt={image.alt ?? ""} className="aspect-video w-full object-cover" />
                    <button
                      type="button"
                      aria-label="Remove existing screenshot"
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-border-default bg-surface-base/90 text-lg leading-none text-text-primary backdrop-blur transition hover:border-danger/70 hover:text-danger"
                      onClick={() => {
                        if (
                          isReviewMode &&
                          !window.confirm("Remove this screenshot from the submission and storage bucket?")
                        ) {
                          return;
                        }

                        setExistingImages((currentImages) =>
                          currentImages.filter((currentImage) => currentImage.id !== image.id),
                        );
                      }}
                    >
                      x
                    </button>
                  </div>
                  <div className="space-y-1 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-text-primary">Existing screenshot</p>
                    <p className="text-xs text-text-muted">Kept unless removed</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          {selectedImages.length > 0 ? (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {selectedImages.map((image) => (
                <li key={image.previewUrl} className="overflow-hidden rounded-lg border border-border-subtle bg-surface-base">
                  <div className="relative">
                    <img src={image.previewUrl} alt="" className="aspect-video w-full object-cover" />
                    <button
                      type="button"
                      aria-label={`Remove ${image.file.name}`}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-border-default bg-surface-base/90 text-lg leading-none text-text-primary backdrop-blur transition hover:border-danger/70 hover:text-danger"
                      onClick={() => {
                        setSelectedImages((currentImages) => {
                          URL.revokeObjectURL(image.previewUrl);
                          return currentImages.filter((currentImage) => currentImage.previewUrl !== image.previewUrl);
                        });
                        setImageInputKey((key) => key + 1);
                      }}
                    >
                      x
                    </button>
                  </div>
                  <div className="space-y-1 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-text-primary">{image.file.name}</p>
                    <p className="text-xs text-text-muted">{formatFileSize(image.file.size)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-4 lg:self-start">
        <section className="glass-panel rounded-lg p-5">
          <SectionHeading eyebrow="Review" title="Submission status" />
          <dl className="mt-5 space-y-3">
            <SummaryRow label="Status" value={<SpotStateBadge label={statusLabel} state={spot?.state ?? "draft"} />} />
            <SummaryRow label="Images" value={totalImages ? String(totalImages) : "None"} />
            <SummaryRow label="Updated" value={updatedLabel} />
          </dl>
          {submitFeedback && hasSubmitted ? (
            <p
              className={`mt-5 rounded-lg border px-3 py-2 text-sm leading-6 ${
                submitFeedback.tone === "success"
                  ? "border-success/40 bg-success/10 text-text-primary"
                  : submitFeedback.tone === "error"
                    ? "border-danger/50 bg-danger/10 text-text-primary"
                    : "border-border-default bg-surface-base text-text-secondary"
              }`}
            >
              {submitFeedback.message}
            </p>
          ) : null}
          <div className="mt-5 grid gap-2">
            {isReviewMode ? (
              <>
                {spot?.state !== "accepted" ? (
                  <Button
                    type="button"
                    size="lg"
                    disabled={isSubmitting}
                    onClick={(event) => {
                      const form = event.currentTarget.form;

                      if (form) {
                        void saveSpot("accept", form);
                      }
                    }}
                  >
                    {isSubmitting ? "Processing..." : "Save and accept"}
                  </Button>
                ) : null}
                <Button type="submit" variant="secondary" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Save and return"}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  disabled={isSubmitting}
                  onClick={(event) => {
                    const form = event.currentTarget.form;

                    if (form) {
                      void saveSpot("delete", form);
                    }
                  }}
                >
                  {isSubmitting ? "Processing..." : "Delete"}
                </Button>
              </>
            ) : (
              <>
                {isCreateMode && canAcceptOnCreate ? (
                  <Button
                    type="button"
                    size="lg"
                    disabled={isSubmitting}
                    onClick={(event) => {
                      const form = event.currentTarget.form;

                      if (form) {
                        void saveSpot("accept", form);
                      }
                    }}
                  >
                    {isSubmitting ? "Processing..." : "Save and accept"}
                  </Button>
                ) : (
                  <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : "Submit spot"}
                  </Button>
                )}
                {isCreateMode && canAcceptOnCreate ? (
                  <Button type="submit" variant="secondary" disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : "Submit spot"}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSubmitting}
                  onClick={(event) => {
                    const form = event.currentTarget.form;

                    if (form) {
                      void saveSpot("draft", form);
                    }
                  }}
                >
                  {isSubmitting ? "Processing..." : "Save draft"}
                </Button>
              </>
            )}
          </div>
        </section>
        </aside>
      </form>

      {isDeleteDialogOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/65 px-4 py-8">
          <div className="w-full max-w-lg rounded-lg border border-danger/50 bg-surface-elevated p-5 shadow-2xl">
            <p className="text-sm font-semibold uppercase text-danger">Delete submission</p>
            <h2 className="mt-1 text-2xl font-semibold text-text-primary">Remove this spot?</h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              This permanently deletes the spot and its screenshots. The submitter will receive your comment.
            </p>
            <Field label="Reviewer comment" htmlFor="spot-delete-reason" className="mt-5">
              <Textarea
                id="spot-delete-reason"
                rows={4}
                value={deletionReason}
                onChange={(event) => setDeletionReason(event.target.value)}
                placeholder="Briefly explain why this submission was removed."
              />
            </Field>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  pendingDeleteFormRef.current = null;
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={isSubmitting}
                onClick={() => {
                  const form = pendingDeleteFormRef.current;

                  if (!form) {
                    return;
                  }

                  setIsDeleteDialogOpen(false);
                  void saveSpot("delete", form, {
                    deletionReason,
                    skipDeleteDialog: true,
                  });
                }}
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SectionHeading({ eyebrow, title }: Readonly<{ eyebrow: string; title: string }>) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase text-brand-spark">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-semibold text-text-primary">{title}</h2>
    </div>
  );
}

function SummaryItem({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-base px-3 py-2">
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-text-primary">{value}</dd>
    </div>
  );
}

function normalizeEditAction(action: SubmitMode | EditAction): EditAction {
  if (action === "draft") {
    return "save_draft";
  }

  if (action === "submitted") {
    return "submit";
  }

  if (action === "accepted") {
    return "accept";
  }

  return action;
}

function getPendingMessage(action: SubmitMode | EditAction) {
  switch (action) {
    case "draft":
    case "save_draft":
      return "Saving draft...";
    case "revoke":
      return "Revoking submission...";
    case "save_review":
      return "Saving review changes...";
    case "accept":
      return "Accepting spot...";
    case "delete":
      return "Deleting spot...";
    default:
      return "Submitting spot...";
  }
}

function getStatusLabel(state: EditableSpotFormValue["state"]) {
  switch (state) {
    case "accepted":
      return "Accepted";
    case "submitted":
      return "Submitted";
    default:
      return "Draft";
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function SubmissionCompleteCard({ state, slug }: Readonly<{ state: SubmitMode; slug: string }>) {
  const isDraft = state === "draft";
  const isAccepted = state === "accepted";
  const href = `/spots/${slug}`;

  return (
    <section
      className={`glass-panel mx-auto max-w-2xl rounded-lg p-6 ${
        isDraft ? "border-info/50" : "border-success/50"
      }`}
    >
      <p className={`text-sm font-semibold uppercase ${isDraft ? "text-info" : "text-success"}`}>
        {isDraft ? "Draft saved" : isAccepted ? "Spot accepted" : "Spot submitted"}
      </p>
      <h2 className="mt-2 text-3xl font-semibold text-text-primary">
        {isDraft
          ? "Your spot draft was saved."
          : isAccepted
            ? "Your spot is live."
            : "Your spot is waiting for review."}
      </h2>
      <p className="mt-3 text-sm leading-6 text-text-secondary">
        {isDraft
          ? "You can come back and edit it whenever the draft editor is available."
          : isAccepted
            ? "It is now visible to everyone browsing XIVSpots."
            : "A privileged member can review and accept it before it appears publicly."}
      </p>
      <p className="mt-5 rounded-lg border border-border-subtle bg-surface-base px-3 py-2 text-sm text-text-muted">
        Redirecting to the spot page in 5 seconds.
      </p>
      <Link
        href={href}
        className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-border-default bg-surface-elevated px-4 text-sm font-semibold text-text-primary transition hover:border-border-active/60 hover:bg-surface-overlay"
      >
        Open spot page now
      </Link>
    </section>
  );
}

function Field({
  children,
  className = "",
  htmlFor,
  label,
}: Readonly<{
  children: ReactNode;
  className?: string;
  htmlFor: string;
  label: ReactNode;
}>) {
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-semibold text-text-secondary ${className}`.trim()}>
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  );
}

function ZoneField({
  filteredZones,
  id,
  isOpen,
  onOpenChange,
  onZoneChange,
  value,
}: Readonly<{
  filteredZones: ZoneMetadata[];
  id: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onZoneChange: (value: string) => void;
  value: string;
}>) {
  return (
    <div className="relative">
      <Field label="Zone" htmlFor={id}>
        <Input
          id={id}
          name="zone"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          aria-expanded={isOpen}
          autoComplete="off"
          placeholder="Start typing a zone..."
          value={value}
          onBlur={() => onOpenChange(false)}
          onChange={(event) => {
            onZoneChange(event.target.value);
            onOpenChange(true);
          }}
          onFocus={() => onOpenChange(true)}
        />
      </Field>

      {isOpen ? (
        <div
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-border-default bg-surface-elevated p-1 shadow-2xl"
        >
          {filteredZones.length > 0 ? (
            filteredZones.slice(0, 12).map((zone) => (
              <button
                key={zone.zone}
                type="button"
                role="option"
                aria-selected={zone.zone === value}
                className="flex w-full flex-col rounded-md px-3 py-2 text-left text-sm text-text-secondary transition hover:bg-surface-overlay hover:text-text-primary"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onZoneChange(zone.zone);
                  onOpenChange(false);
                }}
              >
                <span className="font-semibold text-text-primary">{zone.zone}</span>
                <span className="mt-0.5 text-xs text-text-muted">
                  {zone.region} / {zone.expansion}
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm text-text-muted">No matching zone found.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function DerivedField({
  id,
  label,
  name,
  value,
}: Readonly<{
  id?: string;
  label?: string;
  name?: string;
  value: string;
}>) {
  return (
    <div className="block text-sm font-semibold text-text-secondary">
      {label ? <span className="mb-2 block">{label}</span> : null}
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <div
        id={id}
        aria-readonly="true"
        className="flex h-10 items-center rounded-lg border border-border-subtle bg-surface-raised/70 px-3 text-sm text-text-primary"
      >
        <span className={value ? "truncate" : "text-text-subtle"}>{value || "Not detected"}</span>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: Readonly<{ label: string; value: ReactNode }>) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border-subtle/70 pb-3 last:border-0 last:pb-0">
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="text-right text-sm font-semibold text-text-primary">{value}</dd>
    </div>
  );
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.ceil(size / 1024)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function normalizeCoordinateInput(value: string) {
  return value.replace(/,/g, ".");
}

function isValidCoordinateString(value: string) {
  return /^\d{1,2}(?:\.\d)?$/.test(value.trim());
}
