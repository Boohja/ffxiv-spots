import Image from "next/image";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

type SpotCardProps = Readonly<{
  title: string;
  zone: string;
  imageSrc: string;
  rating: number;
}>;

export function SpotCard({ title, zone, imageSrc, rating }: Readonly<SpotCardProps>) {
  return (
    <article className="glass-panel overflow-hidden rounded-2xl">
      <div className="grid gap-4 p-4 md:grid-cols-[280px_1fr]">
        <div className="relative overflow-hidden rounded-xl border border-border-subtle">
          <Image
            src={imageSrc}
            alt={title}
            width={560}
            height={320}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
            <p className="text-sm text-text-secondary">{zone}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-brand-spark">{rating.toFixed(1)} stars</span>
            <Badge label="Verified" variant="verified" />
            <Badge label="Active" variant="active" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip active>Scenic</Chip>
            <Chip>Sunset</Chip>
            <Chip>Mountain</Chip>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button size="sm">View on Map</Button>
            <Button variant="secondary" size="sm">
              Save Spot
            </Button>
            <Button variant="icon" aria-label="More options" size="sm">
              ...
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
