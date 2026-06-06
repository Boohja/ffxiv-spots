import { EmptyState } from "@/components/spots/EmptyState";
import { SpotCard } from "@/components/spots/SpotCard";
import type { PhotoSpot } from "@/lib/spots/types";

type SpotGridProps = Readonly<{
  spots: PhotoSpot[];
}>;

export function SpotGrid({ spots }: SpotGridProps) {
  if (spots.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {spots.map((spot, index) => (
        <SpotCard key={spot.id} spot={spot} priority={index < 3} />
      ))}
    </div>
  );
}
