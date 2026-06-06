import Image from "next/image";

import type { SpotImage } from "@/lib/spots/types";

type ImageGalleryProps = Readonly<{
  images: SpotImage[];
  title: string;
}>;

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [primary, ...rest] = images;

  return (
    <section aria-label={`${title} image gallery`} className="space-y-3">
      <figure className="glass-panel overflow-hidden rounded-lg">
        <div className="relative aspect-[16/9] bg-surface-base">
          <Image
            src={primary.src}
            alt={primary.alt}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        </div>
        {(primary.caption || primary.credit) ? (
          <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle px-4 py-3 text-xs text-text-muted">
            <span>{primary.caption}</span>
            <span>{primary.credit}</span>
          </figcaption>
        ) : null}
      </figure>
      {rest.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {rest.map((image) => (
            <div key={image.src} className="relative aspect-[16/10] overflow-hidden rounded-lg border border-border-subtle">
              <Image src={image.src} alt={image.alt} fill sizes="33vw" className="object-cover" />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
