import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ImageGallery } from "@/components/spots/ImageGallery";
import { LikeButton } from "@/components/spots/LikeButton";
import { SpotGrid } from "@/components/spots/SpotGrid";
import { SpotStateBadge, type SpotStateBadgeState } from "@/components/spots/SpotStateBadge";
import { SearchPill } from "@/components/spots/TagPill";
import { getAcceptedPhotoSpots } from "@/lib/spots/database";
import { absoluteUrl, siteName } from "@/lib/metadata";
import { spotSearchHref } from "@/lib/spots/search-links";
import type { SpotImage, UserRole } from "@/lib/spots/types";
import { createClient } from "@/lib/supabase/server";
import { getZoneMetadata } from "@/lib/spots/zones";
import type { ReactNode } from "react";

type SpotDetailPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

type DatabaseSpot = {
  id: string;
  slug: string;
  state: "draft" | "submitted" | "accepted" | "duplicate";
  zone: string;
  x: number;
  y: number;
  z: number | null;
  title: string;
  description: string | null;
  tags: string[] | null;
  access_notes: string | null;
  landmark_id: number | null;
  submitted_by: string | null;
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
    width: number | null;
    height: number | null;
    sort_order: number;
  }[];
  likeCount?: number;
  likedByViewer?: boolean;
};

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: SpotDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const databaseSpot = await getDatabaseSpotBySlug(slug);

  return {
    title: databaseSpot ? databaseSpot.title : "Spot not found",
    description: databaseSpot ? getSpotMetadataDescription(databaseSpot) : undefined,
    ...(databaseSpot ? buildSpotShareMetadata(databaseSpot) : {}),
  };
}

export default async function SpotDetailPage({ params }: SpotDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const databaseSpot = await getDatabaseSpotBySlug(slug, user?.id);
  if (!databaseSpot) {
    notFound();
  }

  const canEdit = await canViewerEditSpots();
  const related = databaseSpot.state === "accepted" ? await getRelatedAcceptedSpots(databaseSpot.id, user?.id) : [];

  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10">
      <DatabaseSpotDetail canEdit={canEdit} canLike={Boolean(user)} spot={databaseSpot} />

      {related.length > 0 ? (
        <section className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-spark">Related</p>
            <h2 className="mt-1 text-3xl font-semibold text-text-primary">Nearby moods and zones</h2>
          </div>
          <SpotGrid canLike={Boolean(user)} spots={related} />
        </section>
      ) : null}
    </main>
  );
}

async function getDatabaseSpotBySlug(slug: string, viewerId?: string | null) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("spots")
    .select("id,slug,state,zone,x,y,z,title,description,tags,access_notes,landmark_id,submitted_by,landmarks(name),spot_images(url,alt,width,height,sort_order)")
    .eq("slug", slug)
    .maybeSingle<DatabaseSpot>();

  if (error) {
    console.error(error);
    return null;
  }

  if (!data) {
    return data;
  }

  const submitter = data.submitted_by
    ? await getPublicSubmitterProfile(supabase, data.submitted_by)
    : null;
  const spot = {
    ...data,
    submitter,
  };

  const { data: likeCountRow, error: likeCountError } = await supabase
    .from("spots")
    .select("like_count")
    .eq("id", spot.id)
    .maybeSingle<{ like_count: number }>();

  if (likeCountError && !isMissingLikeSchemaError(likeCountError)) {
    throw likeCountError;
  }

  if (!viewerId) {
    return {
      ...spot,
      likeCount: likeCountRow?.like_count ?? 0,
    };
  }

  const { data: like, error: likeError } = await supabase
    .from("spot_likes")
    .select("spot_id")
    .eq("spot_id", spot.id)
    .eq("user_id", viewerId)
    .maybeSingle<{ spot_id: string }>();

  if (likeError && !isMissingLikeSchemaError(likeError)) {
    throw likeError;
  }

  return {
    ...spot,
    likeCount: likeCountRow?.like_count ?? 0,
    likedByViewer: Boolean(like),
  };
}

async function getPublicSubmitterProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  submitterId: string,
) {
  const { data, error } = await supabase
    .from("public_profiles")
    .select("id, displayname")
    .eq("id", submitterId)
    .maybeSingle<{ id: string; displayname: string | null }>();

  if (error) {
    throw error;
  }

  return data;
}

async function canViewerEditSpots() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data } = await supabase
    .from("app_users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: UserRole }>();

  return data?.role === "moderator" || data?.role === "admin";
}

async function getRelatedAcceptedSpots(currentSpotId: string, viewerId?: string | null) {
  const supabase = await createClient();
  const acceptedSpots = await getAcceptedPhotoSpots(supabase, viewerId);

  return acceptedSpots.filter((spot) => spot.id !== currentSpotId).slice(0, 3);
}

function DatabaseSpotDetail({
  canEdit,
  canLike,
  spot,
}: Readonly<{
  canEdit: boolean;
  canLike: boolean;
  spot: DatabaseSpot;
}>) {
  const zone = getZoneMetadata(spot.zone);
  const images = toSpotImages(spot);
  const accessNotes = spot.access_notes ? [spot.access_notes] : undefined;

  return (
    <div className="space-y-6">
      <SpotDetailLayout
        accessNotes={accessNotes}
        breadcrumb={
          <>
            <SearchTextLink filter="expansion" label={zone.expansion} /> /{" "}
            <SearchTextLink filter="region" label={zone.region} /> /{" "}
            <SearchTextLink filter="zone" label={spot.zone} />
          </>
        }
        description={spot.description ?? undefined}
        editHref={canEdit ? `/spots/${spot.slug}/edit` : undefined}
        images={images}
        likeButton={spot.state === "accepted" ? (
          <LikeButton
            canLike={canLike}
            initialLiked={Boolean(spot.likedByViewer)}
            initialLikeCount={spot.likeCount ?? 0}
            spotId={spot.id}
            variant="detail"
          />
        ) : null}
        locationRows={[
          ["Expansion", <SearchTextLink key="expansion" filter="expansion" label={zone.expansion} />],
          ["Region", <SearchTextLink key="region" filter="region" label={zone.region} />],
          ["Zone", <SearchTextLink key="zone" filter="zone" label={spot.zone} />],
          ["Coordinates", formatCoordinates({ x: spot.x, y: spot.y })],
          ...(spot.z === null ? [] : [["Elevation", `Z ${spot.z}`] as [string, string]]),
          ...(spot.landmarks?.name
            ? [["Landmark", <SearchTextLink key="landmark" filter="landmark" label={spot.landmarks.name} />] as [string, ReactNode]]
            : []),
          ...(spot.submitted_by
            ? [
                [
                  "By",
                  <Link key="submitter" href={`/users/${spot.submitted_by}`} className="transition hover:text-amber-100">
                    {spot.submitter?.displayname ?? "XIVSpots user"}
                  </Link>,
                ] as [string, ReactNode],
              ]
            : []),
        ]}
        secondaryDetails={[]}
        statusLabel={getStateLabel(spot.state)}
        statusState={spot.state}
        tags={spot.tags ?? []}
        title={spot.title}
      />
    </div>
  );
}

function isMissingLikeSchemaError(error: { code?: string }) {
  return error.code === "42703" || error.code === "42P01" || error.code === "PGRST205";
}

function buildSpotShareMetadata(spot: DatabaseSpot): Metadata {
  const description = getSpotMetadataDescription(spot);
  const image = getSpotMetadataImage(spot);
  const url = `/spots/${spot.slug ?? spot.id}`;

  return {
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: spot.title,
      description,
      url,
      siteName,
      type: "article",
      images: [
        {
          url: image.src,
          width: image.width,
          height: image.height,
          alt: image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: spot.title,
      description,
      images: [absoluteUrl(image.src)],
    },
  };
}

function getSpotMetadataDescription(spot: DatabaseSpot) {
  const description = spot.description?.trim();

  if (description) {
    return description;
  }

  const zone = getZoneMetadata(spot.zone);
  return `A scenic photo spot in ${spot.zone}, ${zone.region}.`;
}

function getSpotMetadataImage(spot: DatabaseSpot) {
  const image = [...spot.spot_images].sort((a, b) => a.sort_order - b.sort_order)[0];

  return image
    ? {
        src: image.url,
        alt: image.alt ?? spot.title,
        width: image.width ?? undefined,
        height: image.height ?? undefined,
      }
    : {
        src: "/spots/placeholder.webp",
        alt: spot.title,
        width: 1254,
        height: 1254,
      };
}

function SpotDetailLayout({
  accessNotes,
  breadcrumb,
  description,
  editHref,
  images,
  likeButton,
  locationRows,
  secondaryDetails,
  statusLabel,
  statusState,
  tags,
  title,
}: Readonly<{
  accessNotes?: string[];
  breadcrumb: ReactNode;
  description?: string;
  editHref?: string;
  images: SpotImage[];
  likeButton?: ReactNode;
  locationRows: [string, ReactNode | undefined][];
  secondaryDetails: [string, ReactNode | undefined][];
  statusLabel?: string;
  statusState: SpotStateBadgeState;
  tags: string[];
  title: string;
}>) {
  const hasDescription = Boolean(description?.trim());

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{breadcrumb}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="min-w-0 flex-1 text-3xl font-semibold text-text-primary">{title}</h1>
          <div className="ml-auto">
            <SpotStateBadge label={statusLabel} state={statusState} />
          </div>
        </div>
      </header>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="space-y-4">
            <ImageGallery images={images} title={title} />
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <SearchPill key={tag} filter="tag" label={tag} />
                ))}
              </div>
            ) : null}
          </div>
          <section className="glass-panel rounded-lg p-5">
            <h2 className="text-2xl font-semibold text-text-primary">Description</h2>
            <p
              className={`mt-3 whitespace-pre-line leading-7 ${
                hasDescription ? "text-text-secondary" : "italic text-text-muted"
              }`}
            >
              {hasDescription ? description : "No description has been added yet."}
            </p>
            {accessNotes?.length ? (
              <>
                <h2 className="mt-6 text-lg font-semibold text-text-primary">Access notes</h2>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-text-secondary">
                  {accessNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </>
            ) : null}
            {secondaryDetails.some(([, value]) => Boolean(value)) ? (
              <>
                <h2 className="mt-6 text-lg font-semibold text-text-primary">Conditions</h2>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  {secondaryDetails
                    .filter(([, value]) => Boolean(value))
                    .map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-border-subtle bg-surface-base px-3 py-2">
                        <dt className="text-xs text-text-muted">{label}</dt>
                        <dd className="mt-1 text-sm font-semibold text-text-primary">{value}</dd>
                      </div>
                    ))}
                </dl>
              </>
            ) : null}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <LocationPanel rows={locationRows} />
          {editHref ? (
            <Link
              href={editHref}
              className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border-default bg-surface-elevated px-4 text-sm font-semibold text-text-primary transition hover:border-border-active/60 hover:bg-surface-overlay"
            >
              Edit
            </Link>
          ) : null}
          {likeButton}
        </aside>
      </div>
    </div>
  );
}

function LocationPanel({
  rows,
}: Readonly<{
  rows: [string, ReactNode | undefined][];
}>) {
  const primaryLabels = new Set(["Expansion", "Region", "Zone", "By", "Coordinates", "Elevation", "Landmark"]);
  const primaryRows = rows.filter(([label, value]) => primaryLabels.has(label) && value);
  const secondaryRows = rows.filter(([label, value]) => !primaryLabels.has(label) && value);

  return (
    <section className="glass-panel rounded-lg p-5">
      <h2 className="text-lg font-semibold text-text-primary">Location</h2>
      <dl className="mt-4 space-y-3">
        {primaryRows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 border-b border-border-subtle/70 pb-3 last:border-0 last:pb-0">
            <dt className="text-sm text-text-muted">{label}</dt>
            <dd className="text-right text-sm font-semibold text-text-primary">{value}</dd>
          </div>
        ))}
        {secondaryRows.length > 0 ? (
          <div className="space-y-3 border-t border-border-subtle/70 pt-4">
            {secondaryRows.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 border-b border-border-subtle/70 pb-3 last:border-0 last:pb-0">
                <dt className="text-sm text-text-muted">{label}</dt>
                <dd className="text-right text-sm font-semibold text-text-primary">{value}</dd>
              </div>
            ))}
          </div>
        ) : null}
      </dl>
    </section>
  );
}

function formatCoordinates(coordinates?: { x: number; y: number; z?: number }) {
  if (!coordinates) {
    return undefined;
  }

  return (
    <>
      <span className="text-text-muted">X</span> {coordinates.x},{" "}
      <span className="text-text-muted">Y</span> {coordinates.y}
      {coordinates.z ? (
        <>
          , <span className="text-text-muted">Z</span> {coordinates.z}
        </>
      ) : null}
    </>
  );
}

function getStateLabel(state: DatabaseSpot["state"]) {
  switch (state) {
    case "accepted":
      return "Accepted";
    case "submitted":
      return "Waiting for review";
    case "duplicate":
      return "Duplicate";
    default:
      return "Draft";
  }
}

function toSpotImages(spot: DatabaseSpot): SpotImage[] {
  const images = [...spot.spot_images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, 2)
    .map((image) => ({
      src: image.url,
      alt: image.alt ?? spot.title,
      width: image.width ?? undefined,
      height: image.height ?? undefined,
    }));

  return images.length > 0
    ? images
    : [
        {
          src: "/spots/placeholder.webp",
          alt: "",
        },
      ];
}

function SearchTextLink({
  filter,
  label,
}: Readonly<{
  filter: "expansion" | "landmark" | "region" | "zone";
  label: string;
}>) {
  return (
    <Link href={spotSearchHref(filter, label)} className="transition hover:text-amber-100">
      {label}
    </Link>
  );
}
