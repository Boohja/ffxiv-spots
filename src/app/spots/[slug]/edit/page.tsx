import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SubmitSpotForm, type EditableSpotFormValue } from "@/components/spots/SubmitSpotForm";
import type { UserRole } from "@/lib/spots/types";
import { createClient } from "@/lib/supabase/server";

type SpotEditPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

type DatabaseSpotForEdit = {
  id: string;
  slug: string;
  submitted_by: string | null;
  state: "draft" | "submitted" | "accepted" | "duplicate";
  zone: string;
  x: number;
  y: number;
  z: number | null;
  title: string;
  description: string | null;
  tags: string[] | null;
  access_notes: string | null;
  updated_at: string;
  spot_images: {
    id: string;
    url: string;
    alt: string | null;
    sort_order: number;
  }[];
};

export async function generateMetadata({ params }: SpotEditPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("spots")
    .select("title")
    .eq("slug", slug)
    .maybeSingle<{ title: string }>();

  return {
    title: data ? `Edit ${data.title}` : "Edit spot",
  };
}

export default async function SpotEditPage({ params }: SpotEditPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/spots/${slug}/edit`);
  }

  const [spotResult, viewerRole] = await Promise.all([
    supabase
      .from("spots")
      .select(
        "id, slug, submitted_by, state, zone, x, y, z, title, description, tags, access_notes, updated_at, spot_images(id, url, alt, sort_order)",
      )
      .eq("slug", slug)
      .maybeSingle<DatabaseSpotForEdit>(),
    getViewerRole(supabase, user.id),
  ]);

  if (spotResult.error || !spotResult.data) {
    notFound();
  }

  const spot = spotResult.data;
  const isOwner = spot.submitted_by === user.id;
  const isReviewer = viewerRole === "moderator" || viewerRole === "admin";
  const mode =
    isReviewer && (spot.state === "submitted" || spot.state === "accepted")
      ? "review"
      : isOwner && spot.state === "draft"
        ? "ownerDraft"
        : isOwner && spot.state === "submitted"
          ? "ownerSubmitted"
          : null;

  if (!mode) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-spark">
            {mode === "review" ? "Review" : "Edit"}
          </p>
          <h1 className="mt-1 text-4xl font-semibold text-text-primary">{spot.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            {mode === "review"
              ? "Adjust the entry, keep its review state, accept it, or delete it permanently."
              : "Update your draft or move it into the review queue."}
          </p>
        </div>
        <Link
          href={mode === "review" ? "/moderation/spots" : "/spots/mine"}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border-default bg-surface-elevated px-4 text-sm font-semibold text-text-primary transition hover:border-border-active/60 hover:bg-surface-overlay"
        >
          Back
        </Link>
      </div>

      <SubmitSpotForm mode={mode} spot={toEditableSpot(spot)} />
    </main>
  );
}

async function getViewerRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data } = await supabase
    .from("app_users")
    .select("role")
    .eq("id", userId)
    .maybeSingle<{ role: UserRole }>();

  return data?.role ?? null;
}

function toEditableSpot(spot: DatabaseSpotForEdit): EditableSpotFormValue {
  return {
    id: spot.id,
    slug: spot.slug,
    state: spot.state === "draft" ? "draft" : spot.state === "accepted" ? "accepted" : "submitted",
    zone: spot.zone,
    x: spot.x,
    y: spot.y,
    z: spot.z,
    title: spot.title,
    description: spot.description,
    tags: spot.tags,
    access_notes: spot.access_notes,
    updated_at: spot.updated_at,
    images: [...spot.spot_images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt,
      })),
  };
}
