import type { SupabaseClient, User } from "@supabase/supabase-js";

import { getDiscordProfileFields, getSeedDisplayName } from "@/lib/auth/profile-data";

export async function upsertAppUserProfile(supabase: SupabaseClient, user: User) {
  const {
    avatarUrl,
    discordDisplayName,
    discordId,
    globalName,
    identityData,
    metadata,
    username,
  } = getDiscordProfileFields(user);

  if (!discordId) {
    throw new Error("Could not find a Discord id on the authenticated user.");
  }

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
