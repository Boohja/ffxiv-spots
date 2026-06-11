import Image from "next/image";
import Link from "next/link";

import { TagPill } from "@/components/spots/TagPill";
import type { PhotoSpot } from "@/lib/spots/types";

type SpotCardProps = Readonly<{
  spot: PhotoSpot;
  priority?: boolean;
}>;

export function SpotCard({ spot, priority = false }: SpotCardProps) {
  const image = spot.images[0];
  const description = spot.description.trim();

  return (
    <article className="glass-panel group overflow-hidden rounded-lg">
      <Link href={`/spots/${spot.slug}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-active">
        <div className="relative aspect-[16/10] overflow-hidden border-b border-border-subtle bg-surface-base">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className="space-y-3 p-4">
          <div>
            <p className="text-xs font-semibold uppercase text-brand-spark">{spot.region}</p>
            <h3 className="mt-1 text-xl font-semibold text-text-primary">{spot.title}</h3>
            <p className="mt-1 text-sm text-text-secondary">{spot.zone}</p>
          </div>
          <p className="min-h-[4.5rem] text-sm leading-6 text-text-secondary">
            {description ? <span className="line-clamp-3">{description}</span> : null}
          </p>
          <div className="flex flex-wrap gap-2">
            {spot.tags.slice(0, 4).map((tag) => (
              <TagPill key={tag} label={tag} />
            ))}
          </div>
        </div>
      </Link>
    </article>
  );
}
