import type { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";

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
    <div className="flex items-center gap-2">
      <Link href={`/users/${user.id}`} className="flex min-w-0 items-center gap-2">
        <div className="hidden min-w-0 text-right sm:block">
          <p className="truncate text-xs font-semibold text-text-primary">Profile</p>
          <p className="text-[11px] text-text-muted">Discord</p>
        </div>
        <div className="relative h-9 w-9 overflow-hidden rounded-full border border-border-default bg-surface-elevated">
          {appAvatarUrl ? (
            <Image src={appAvatarUrl} alt="" fill sizes="36px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-brand-spark">
              {appName.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
      </Link>
      <form action="/auth/logout" method="post">
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-transparent bg-transparent px-2 text-xs font-semibold text-text-secondary transition hover:border-border-subtle hover:bg-surface-raised hover:text-text-primary"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
