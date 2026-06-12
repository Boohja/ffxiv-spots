import Image from "next/image";
import Link from "next/link";

import { LikeButton } from "@/components/spots/LikeButton";
import { TagPill } from "@/components/spots/TagPill";
import type { PhotoSpot } from "@/lib/spots/types";

type SpotCardProps = Readonly<{
  canLike?: boolean;
  spot: PhotoSpot;
  priority?: boolean;
}>;

export function SpotCard({ canLike = false, spot, priority = false }: SpotCardProps) {
  const image = spot.images[0];

  return (
    <article className="glass-panel group relative overflow-hidden rounded-lg">
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
          <div className="flex flex-wrap gap-2">
            {spot.tags.slice(0, 4).map((tag) => (
              <TagPill key={tag} label={tag} />
            ))}
          </div>
        </div>
      </Link>
      <LikeButton
        canLike={canLike}
        className="absolute right-3 top-3 z-10"
        initialLiked={spot.likedByViewer}
        initialLikeCount={spot.likeCount}
        spotId={spot.id}
      />
    </article>
  );
}
