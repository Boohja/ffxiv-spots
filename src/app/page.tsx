import Image from "next/image";
import Link from "next/link";

import { FeaturedSection } from "@/components/spots/FeaturedSection";
import { SpotGrid } from "@/components/spots/SpotGrid";
import { TagPill } from "@/components/spots/TagPill";
import { getAcceptedPhotoSpots } from "@/lib/spots/database";
import { getSpotFacets } from "@/lib/spots/filters";
import { createClient } from "@/lib/supabase/server";

const placeholderHero = {
  src: "/spots/placeholder.webp",
  alt: "",
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const acceptedSpots = await getAcceptedPhotoSpots(supabase, user?.id);
  const heroSpot = pickRandomSpot(acceptedSpots);
  const mostLiked = [...acceptedSpots]
    .sort((a, b) => b.likeCount - a.likeCount || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  const recent = acceptedSpots.slice(0, 3);
  const facets = getSpotFacets(acceptedSpots);
  const heroImage = heroSpot?.images[0] ?? placeholderHero;

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border-subtle/70">
        <div className="absolute inset-0 z-0">
          <Image
            aria-hidden="true"
            src={heroImage.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="scale-110 object-cover opacity-55 blur-[2px] saturate-125"
          />
          <div className="absolute inset-0 bg-surface-page/35" />
          <div className="absolute inset-0 bg-gradient-to-b from-surface-page/55 via-transparent to-surface-page/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-page/90 via-surface-page/25 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-7">
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-text-primary md:text-6xl">
                Discover scenic photo <span className="text-gradient-primary">spots</span> across Eorzea and beyond.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-text-secondary">
                Browse community photo spots for screenshots, portraits, roleplay, relaxing, and quiet views worth revisiting.
              </p>
            </div>

            <form action="/spots" className="glass-panel grid gap-3 rounded-lg p-3 sm:grid-cols-[1fr_auto]">
              <label className="sr-only" htmlFor="home-search">
                Search photo spots
              </label>
              <input
                id="home-search"
                name="q"
                placeholder="Search zones, tags, weather, moods..."
                className="h-12 rounded-lg border border-border-default bg-surface-base px-4 text-sm text-text-primary outline-none transition placeholder:text-text-subtle focus:border-border-active focus:ring-2 focus:ring-border-active/35"
              />
              <button
                type="submit"
                className="h-12 rounded-lg border border-transparent bg-gradient-primary px-5 text-sm font-semibold text-text-primary transition hover:bg-gradient-primary-hover"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {facets.tags.slice(0, 8).map((tag) => (
                <TagPill key={tag} label={tag} href={`/spots?tag=${encodeURIComponent(tag)}`} />
              ))}
            </div>
          </div>

          {heroSpot ? (
            <Link
              href={`/spots/${heroSpot.slug}`}
              className="glass-panel group overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-active"
            >
              <HeroImage
                alt={heroImage.alt}
                height={heroImage.height}
                src={heroImage.src}
                subtitle={heroSpot.zone}
                title={heroSpot.title}
                width={heroImage.width}
              />
            </Link>
          ) : (
            <div className="glass-panel overflow-hidden rounded-lg">
              <HeroImage alt={heroImage.alt} src={heroImage.src} />
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-12">
        <FeaturedSection canLike={Boolean(user)} spots={mostLiked} />

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="mt-1 text-3xl font-semibold text-text-primary">Recently added</h2>
            </div>
            <Link href="/spots" className="text-sm font-semibold text-amber-200 hover:text-amber-100">
              View all spots
            </Link>
          </div>
          <SpotGrid canLike={Boolean(user)} spots={recent} />
        </section>
      </div>
    </main>
  );
}

function HeroImage({
  alt,
  height,
  src,
  subtitle,
  title,
  width,
}: Readonly<{
  alt: string;
  height?: number;
  src: string;
  subtitle?: string;
  title?: string;
  width?: number;
}>) {
  const aspectRatio = width && height ? `${width} / ${height}` : "16 / 9";

  return (
    <div
      className="relative w-full overflow-hidden bg-surface-base shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
      style={{ aspectRatio }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(min-width: 1024px) 520px, calc(100vw - 2rem)"
        className="object-cover transition duration-500 group-hover:scale-[1.02]"
      />
      {title ? (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-5 pt-16">
          <p className="text-xs font-semibold uppercase text-amber-200">Spotlight</p>
          <h2 className="mt-1 text-3xl font-semibold text-text-primary">{title}</h2>
          {subtitle ? <p className="mt-2 text-sm text-text-secondary">{subtitle}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function pickRandomSpot<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}
