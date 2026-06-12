import { EmptyState } from "@/components/spots/EmptyState";
import { SpotCard } from "@/components/spots/SpotCard";
import type { PhotoSpot } from "@/lib/spots/types";

type SpotGridProps = Readonly<{
  canLike?: boolean;
  spots: PhotoSpot[];
}>;

export function SpotGrid({ canLike = false, spots }: SpotGridProps) {
  if (spots.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid self-start gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:items-start">
      {spots.map((spot, index) => (
        <SpotCard key={spot.id} canLike={canLike} spot={spot} priority={index < 3} />
      ))}
    </div>
  );
}
