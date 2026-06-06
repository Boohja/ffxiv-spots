import type { DuplicateCandidate, PhotoSpot, SpotSubmission } from "@/lib/spots/types";

export function findPossibleDuplicateSpots(
  submission: SpotSubmission,
  existingSpots: PhotoSpot[],
): DuplicateCandidate[] {
  const submitted = submission.spotData;

  return existingSpots
    .map((spot) => {
      const reasons: string[] = [];
      let score = 0;

      if (spot.zone === submitted.zone) {
        score += 3;
        reasons.push("same zone");
      }

      if (submitted.coordinates && spot.coordinates) {
        const distance = Math.hypot(
          submitted.coordinates.x - spot.coordinates.x,
          submitted.coordinates.y - spot.coordinates.y,
        );

        if (distance <= 2.5) {
          score += 4;
          reasons.push("nearby coordinates");
        }
      }

      if (normalize(spot.title) === normalize(submitted.title)) {
        score += 4;
        reasons.push("similar title");
      }

      const sharedTags = spot.tags.filter((tag) => submitted.tags.includes(tag));
      if (sharedTags.length >= 2) {
        score += Math.min(sharedTags.length, 4);
        reasons.push("overlapping tags");
      }

      // Future image similarity can be added here after upload moderation stores embeddings or perceptual hashes.
      return { spotId: spot.id, score, reasons };
    })
    .filter((candidate) => candidate.score >= 4)
    .sort((a, b) => b.score - a.score);
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
