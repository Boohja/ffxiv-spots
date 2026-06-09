import type { User } from "@supabase/supabase-js";

import { UserMenu } from "@/components/layout/UserMenu";
import { createClient } from "@/lib/supabase/server";

function getDisplayName(user: User) {
  return (
    user.user_metadata.full_name ??
    user.user_metadata.global_name ??
    user.user_metadata.display_name ??
    "Signed in"
  );
}

function getAvatarUrl(user: User) {
  return (
    user.user_metadata.avatar_url ??
    user.user_metadata.picture ??
    user.user_metadata.custom_claims?.avatar_url ??
    null
  );
}

export async function AuthMenu() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <a
        href="/auth/login"
        className="inline-flex h-9 items-center justify-center rounded-lg border border-border-default bg-surface-elevated px-3 text-xs font-semibold text-text-primary transition hover:border-border-active/60 hover:bg-surface-overlay"
      >
        Sign in with Discord
      </a>
    );
  }

  const name = getDisplayName(user);
  const avatarUrl = getAvatarUrl(user);
  const { data: appProfile } = await supabase
    .from("app_users")
    .select("displayname, avatar_url")
    .eq("id", user.id)
    .maybeSingle<{ displayname: string | null; avatar_url: string | null }>();
  const appName = appProfile?.displayname ?? name;
  const appAvatarUrl = appProfile?.avatar_url ?? avatarUrl;

  return (
    <UserMenu avatarUrl={appAvatarUrl} displayName={appName} profileHref={`/users/${user.id}`} />
  );
}
