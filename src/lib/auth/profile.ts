import type { SupabaseClient, User } from "@supabase/supabase-js";

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function getString(record: JsonRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return null;
}

function getDiscordIdentityData(user: User) {
  const discordIdentity = user.identities?.find((identity) => identity.provider === "discord");

  return asRecord(discordIdentity?.identity_data);
}

function getSeedDisplayName(existingDisplayName: unknown, discordDisplayName: string | null) {
  if (typeof existingDisplayName === "string" && existingDisplayName !== "XIVSpots user") {
    return existingDisplayName;
  }

  return discordDisplayName ?? "XIVSpots user";
}

export async function upsertAppUserProfile(supabase: SupabaseClient, user: User) {
  const metadata = asRecord(user.user_metadata);
  const identityData = getDiscordIdentityData(user);
  const discordId =
    getString(metadata, ["provider_id", "discord_id", "sub"]) ??
    getString(identityData, ["provider_id", "discord_id", "id", "sub"]);

  if (!discordId) {
    throw new Error("Could not find a Discord id on the authenticated user.");
  }

  const username =
    getString(metadata, ["user_name", "preferred_username", "name"]) ??
    getString(identityData, ["username", "user_name", "preferred_username", "name"]);
  const metadataCustomClaims = asRecord(metadata.custom_claims);
  const identityCustomClaims = asRecord(identityData.custom_claims);
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
  const { data: existingProfile } = await supabase
    .from("app_users")
    .select("displayname")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("app_users").upsert({
    id: user.id,
    discord_id: discordId,
    username,
    global_name: globalName,
    displayname: getSeedDisplayName(existingProfile?.displayname, discordDisplayName),
    avatar_url: avatarUrl,
    raw_discord: {
      identity_data: identityData,
      user_metadata: metadata,
    },
    last_seen_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
}
