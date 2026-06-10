import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ImageGallery } from "@/components/spots/ImageGallery";
import { SpotGrid } from "@/components/spots/SpotGrid";
import { TagPill } from "@/components/spots/TagPill";
import { getRelatedSpots, getSpotBySlug, photoSpots } from "@/lib/spots/data";
import type { UserRole } from "@/lib/spots/types";
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
      <Link href="/spots" className="text-sm font-semibold text-amber-200 hover:text-amber-100">
        Back to spots
      </Link>

      <div className="grid gap-7 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <ImageGallery images={spot.images} title={spot.title} />
          <section className="glass-panel rounded-lg p-5">
            <h2 className="text-2xl font-semibold text-text-primary">Description</h2>
            <p className="mt-3 leading-7 text-text-secondary">{spot.description}</p>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="glass-panel rounded-lg p-5">
            <p className="text-sm font-semibold uppercase text-brand-spark">{spot.region}</p>
            <h1 className="mt-1 text-4xl font-semibold text-text-primary">{spot.title}</h1>
            <p className="mt-3 text-text-secondary">
              {spot.zone}
              {spot.area ? ` / ${spot.area}` : ""}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {spot.tags.map((tag) => (
                <TagPill key={tag} label={tag} href={`/spots?tag=${encodeURIComponent(tag)}`} />
              ))}
            </div>
          </section>

          <InfoPanel
            title="Location"
            rows={[
              ["Expansion", spot.expansion],
              ["Coordinates", formatCoordinates(spot.coordinates)],
              ["Best time", spot.bestTimeOfDay?.join(", ")],
              ["Best weather", spot.bestWeather?.join(", ")],
            ]}
          />

          <section className="glass-panel rounded-lg p-5">
            <h2 className="text-lg font-semibold text-text-primary">Accessibility</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-text-secondary">
              {(spot.accessibilityNotes ?? ["No special notes yet"]).map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

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
    .select("id,slug,state,zone,x,y,z,title,description,tags,access_notes,landmark_id,spot_images(url,alt,sort_order)")
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
  const statusLabel = spot.state === "submitted" ? "Waiting for review" : spot.state;

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
      <Link href="/spots" className="text-sm font-semibold text-amber-200 hover:text-amber-100">
        Back to spots
      </Link>
      <section className="glass-panel rounded-lg p-6">
        <p className="text-sm font-semibold uppercase text-brand-spark">{statusLabel}</p>
        <h1 className="mt-2 text-4xl font-semibold text-text-primary">{spot.title}</h1>
        <p className="mt-3 text-text-secondary">
          {spot.zone} / {zone.region} / {zone.expansion}
        </p>
        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          <SummaryItem label="Coordinates" value={formatCoordinates({ x: spot.x, y: spot.y, z: spot.z ?? undefined }) ?? ""} />
          <SummaryItem label="Images" value={String(spot.spot_images.length)} />
          <SummaryItem label="State" value={spot.state} />
        </dl>
        <p className="mt-6 text-sm leading-6 text-text-secondary">
          {spot.description ?? "The full spot view for database-backed submissions is coming next."}
        </p>
        {canEdit ? (
          <Link
            href={`/spots/${spot.slug}/edit`}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-border-default bg-surface-elevated px-4 text-sm font-semibold text-text-primary transition hover:border-border-active/60 hover:bg-surface-overlay"
          >
            Edit
          </Link>
        ) : null}
      </section>
    </main>
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

function InfoPanel({
  title,
  rows,
}: Readonly<{
  title: string;
  rows: [string, string | undefined][];
}>) {
  return (
    <section className="glass-panel rounded-lg p-5">
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      <dl className="mt-3 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 border-b border-border-subtle/70 pb-3 last:border-0 last:pb-0">
            <dt className="text-sm text-text-muted">{label}</dt>
            <dd className="text-right text-sm font-semibold text-text-primary">{value ?? "Not specified"}</dd>
          </div>
        ))}
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
