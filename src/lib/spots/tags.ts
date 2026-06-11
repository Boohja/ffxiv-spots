const maxTags = 12;

export function parseSpotTags(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  const tags = new Set<string>();

  for (const tag of value.split(",")) {
    const normalizedTag = tag.trim().toLowerCase();

    if (normalizedTag) {
      tags.add(normalizedTag);
    }

    if (tags.size >= maxTags) {
      break;
    }
  }

  return [...tags];
}
