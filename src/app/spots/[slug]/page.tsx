import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ImageGallery } from "@/components/spots/ImageGallery";
import { SpotGrid } from "@/components/spots/SpotGrid";
import { SpotStateBadge, type SpotStateBadgeState } from "@/components/spots/SpotStateBadge";
import { TagPill } from "@/components/spots/TagPill";
import { getRelatedSpots, getSpotBySlug, photoSpots } from "@/lib/spots/data";
import type { SpotImage, UserRole } from "@/lib/spots/types";
import { createClient } from "@/lib/supabase/server";
import { getZoneMetadata } from "@/lib/spots/zones";

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
  landmarks: {
    name: string;
  } | null;
  spot_images: {
    url: string;
    alt: string | null;
    sort_order: number;
  }[];
};

export function generateStaticParams() {
  return photoSpots.map((spot) => ({ slug: spot.slug }));
}

export async function generateMetadata({ params }: SpotDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const spot = getSpotBySlug(slug);

  if (!spot) {
    const databaseSpot = await getDatabaseSpotBySlug(slug);

    return {
      title: databaseSpot ? `${databaseSpot.title} | XIVSpots` : "Spot not found | XIVSpots",
      description: databaseSpot?.description ?? undefined,
    };
  }

  return {
    title: `${spot.title} | XIVSpots`,
    description: spot.description,
  };
}

export default async function SpotDetailPage({ params }: SpotDetailPageProps) {
  const { slug } = await params;
  const spot = getSpotBySlug(slug);

  if (!spot) {
    const databaseSpot = await getDatabaseSpotBySlug(slug);

    if (!databaseSpot) {
      notFound();
    }

    const canEdit = await canViewerEditSpots();

    return <DatabaseSpotPlaceholder canEdit={canEdit} spot={databaseSpot} />;
  }

  const related = getRelatedSpots(spot);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10">
      <SpotDetailLayout
        accessNotes={spot.accessibilityNotes}
        breadcrumb={`${spot.expansion} / ${spot.region} / ${spot.zone}`}
        description={spot.description}
        editHref={undefined}
        images={spot.images}
        locationRows={[
          ["Zone", spot.area ? `${spot.zone} / ${spot.area}` : spot.zone],
          ["Coordinates", formatCoordinates(spot.coordinates)],
        ]}
        secondaryDetails={[
          ["Best time", spot.bestTimeOfDay?.join(", ")],
          ["Best weather", spot.bestWeather?.join(", ")],
        ]}
        statusState="accepted"
        tags={spot.tags}
        title={spot.title}
      />

      <section className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-spark">Related</p>
          <h2 className="mt-1 text-3xl font-semibold text-text-primary">Nearby moods and zones</h2>
        </div>
        <SpotGrid spots={related} />
      </section>
    </main>
  );
}

async function getDatabaseSpotBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("spots")
    .select("id,slug,state,zone,x,y,z,title,description,tags,access_notes,landmark_id,landmarks(name),spot_images(url,alt,sort_order)")
    .eq("slug", slug)
    .maybeSingle<DatabaseSpot>();

  if (error) {
    console.error(error);
    return null;
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

function DatabaseSpotPlaceholder({
  canEdit,
  spot,
}: Readonly<{
  canEdit: boolean;
  spot: DatabaseSpot;
}>) {
  const zone = getZoneMetadata(spot.zone);
  const images = toSpotImages(spot);
  const accessNotes = spot.access_notes ? [spot.access_notes] : undefined;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10">
      <SpotDetailLayout
        accessNotes={accessNotes}
        breadcrumb={`${zone.expansion} / ${zone.region} / ${spot.zone}`}
        description={spot.description ?? undefined}
        editHref={canEdit ? `/spots/${spot.slug}/edit` : undefined}
        images={images}
        locationRows={[
          ["Zone", spot.zone],
          ["Coordinates", formatCoordinates({ x: spot.x, y: spot.y })],
          ...(spot.z === null ? [] : [["Elevation", `Z ${spot.z}`] as [string, string]]),
          ...(spot.landmarks?.name ? [["Landmark", spot.landmarks.name] as [string, string]] : []),
        ]}
        secondaryDetails={[]}
        statusLabel={getStateLabel(spot.state)}
        statusState={spot.state}
        tags={spot.tags ?? []}
        title={spot.title}
      />
    </main>
  );
}

function SpotDetailLayout({
  accessNotes,
  breadcrumb,
  description,
  editHref,
  images,
  locationRows,
  secondaryDetails,
  statusLabel,
  statusState,
  tags,
  title,
}: Readonly<{
  accessNotes?: string[];
  breadcrumb: string;
  description?: string;
  editHref?: string;
  images: SpotImage[];
  locationRows: [string, string | undefined][];
  secondaryDetails: [string, string | undefined][];
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
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <SpotStateBadge label={statusLabel} state={statusState} />
          <h1 className="text-3xl font-semibold text-text-primary">{title}</h1>
        </div>
      </header>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="space-y-4">
            <ImageGallery images={images} title={title} />
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <TagPill key={tag} label={tag} href={`/spots?tag=${encodeURIComponent(tag)}`} />
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
        </aside>
      </div>
    </div>
  );
}

function LocationPanel({
  rows,
}: Readonly<{
  rows: [string, string | undefined][];
}>) {
  const primaryLabels = new Set(["Zone", "Coordinates", "Elevation", "Landmark"]);
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

  return coordinates.z
    ? `X ${coordinates.x}, Y ${coordinates.y}, Z ${coordinates.z}`
    : `X ${coordinates.x}, Y ${coordinates.y}`;
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
