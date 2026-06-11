import Image from "next/image";
import Link from "next/link";

import { FeaturedSection } from "@/components/spots/FeaturedSection";
import { SpotGrid } from "@/components/spots/SpotGrid";
import { TagPill } from "@/components/spots/TagPill";
import { getFeaturedSpots, photoSpots } from "@/lib/spots/data";
import { getSpotFacets } from "@/lib/spots/filters";

export default function Home() {
  const featured = getFeaturedSpots();
  const recent = [...photoSpots]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  const facets = getSpotFacets(photoSpots);

  return (
    <main>
      <section className="border-b border-border-subtle/70">
        <div className="mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-7">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase text-brand-spark">XIVSpots</p>
              <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-text-primary md:text-6xl">
                Discover scenic photo spots across Eorzea and beyond.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-text-secondary">
                Browse curated places for screenshots, portraits, roleplay, relaxing, and quiet views worth revisiting.
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

          <Link
            href={`/spots/${featured[0].slug}`}
            className="glass-panel group overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-active"
          >
            <div className="relative aspect-[4/5] min-h-[420px] bg-surface-base">
              <Image
                src={featured[0].images[0].src}
                alt={featured[0].images[0].alt}
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface-page via-surface-page/75 to-transparent p-5">
                <p className="text-xs font-semibold uppercase text-amber-200">Featured</p>
                <h2 className="mt-1 text-3xl font-semibold text-text-primary">{featured[0].title}</h2>
                <p className="mt-2 text-sm text-text-secondary">{featured[0].zone}</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-12">
        <FeaturedSection spots={featured} />

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase text-brand-spark">Recently added</p>
              <h2 className="mt-1 text-3xl font-semibold text-text-primary">Fresh from the atlas</h2>
            </div>
            <Link href="/spots" className="text-sm font-semibold text-amber-200 hover:text-amber-100">
              View all spots
            </Link>
          </div>
          <SpotGrid spots={recent} />
        </section>
      </div>
    </main>
  );
}
