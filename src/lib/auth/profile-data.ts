import type { User } from "@supabase/supabase-js";

export type JsonRecord = Record<string, unknown>;

export function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

export function getString(record: JsonRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return null;
}

export function getDiscordIdentityData(user: User) {
  const discordIdentity = user.identities?.find((identity) => identity.provider === "discord");

  return asRecord(discordIdentity?.identity_data);
}

export function getSeedDisplayName(
  existingDisplayName: unknown,
  discordDisplayName: string | null,
) {
  if (typeof existingDisplayName === "string" && existingDisplayName !== "XIVSpots user") {
    return existingDisplayName;
  }

  return discordDisplayName ?? "XIVSpots user";
}

export function getDiscordProfileFields(user: User) {
  const metadata = asRecord(user.user_metadata);
  const identityData = getDiscordIdentityData(user);
  const metadataCustomClaims = asRecord(metadata.custom_claims);
  const identityCustomClaims = asRecord(identityData.custom_claims);
  const discordId =
    getString(metadata, ["provider_id", "discord_id", "sub"]) ??
    getString(identityData, ["provider_id", "discord_id", "id", "sub"]);
  const username =
    getString(metadata, ["user_name", "preferred_username", "name"]) ??
    getString(identityData, ["username", "user_name", "preferred_username", "name"]);
  const globalName =
    getString(metadataCustomClaims, ["global_name", "display_name"]) ??
    getString(identityCustomClaims, ["global_name", "display_name"]) ??
    getString(metadata, ["global_name", "display_name"]) ??
    getString(identityData, ["global_name", "display_name"]);
  const discordDisplayName =
    globalName ??
    getString(metadata, ["displayname"]) ??
    getString(identityData, ["displayname"]);
  const avatarUrl =
    getString(metadata, ["avatar_url", "picture"]) ??
    getString(metadataCustomClaims, ["avatar_url"]) ??
    getString(identityData, ["avatar_url", "picture"]);

  return {
    avatarUrl,
    discordDisplayName,
    discordId,
    globalName,
    identityData,
    metadata,
    username,
  };
}
