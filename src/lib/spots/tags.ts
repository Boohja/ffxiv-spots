import { maxSpotTagLength, maxSpotTags } from "@/lib/spots/limits";

export function parseSpotTags(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  const tags = new Set<string>();

  for (const tag of value.split(",")) {
    const normalizedTag = tag.trim().toLowerCase();

    if (normalizedTag && normalizedTag.length <= maxSpotTagLength) {
      tags.add(normalizedTag);
    }

    if (tags.size >= maxSpotTags) {
      break;
    }
  }

  return [...tags];
}

export function validateSpotTags(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const normalizedTags = value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (normalizedTags.length > maxSpotTags) {
    return `Use at most ${maxSpotTags} tags.`;
  }

  if (normalizedTags.some((tag) => tag.length > maxSpotTagLength)) {
    return `Keep each tag to ${maxSpotTagLength} characters or fewer.`;
  }

  return undefined;
}
