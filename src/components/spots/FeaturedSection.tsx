import Link from "next/link";

import { SpotGrid } from "@/components/spots/SpotGrid";
import type { PhotoSpot } from "@/lib/spots/types";

type FeaturedSectionProps = Readonly<{
  spots: PhotoSpot[];
}>;

export function FeaturedSection({ spots }: FeaturedSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-spark">Most liked</p>
          <h2 className="mt-1 text-3xl font-semibold text-text-primary">Community favorites</h2>
        </div>
        <Link href="/spots" className="text-sm font-semibold text-amber-200 hover:text-amber-100">
          View all spots
        </Link>
      </div>
      <SpotGrid spots={spots} />
    </section>
  );
}
