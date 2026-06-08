import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { ProfileEditForm } from "@/components/users/ProfileEditForm";
import { createClient } from "@/lib/supabase/server";

type UserProfilePageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

type PublicProfile = {
  id: string;
  displayname: string | null;
  avatar_url: string | null;
  created_at: string;
  public: boolean;
  social_x: string | null;
  social_instagram: string | null;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const { id } = await params;

  if (!uuidPattern.test(id)) {
    return { title: "User not found | XIVSpots" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("app_users")
    .select("displayname, public")
    .eq("id", id)
    .maybeSingle<Pick<PublicProfile, "displayname" | "public">>();

  if (!profile || (!profile.public && user?.id !== id)) {
    return { title: "User not found | XIVSpots" };
  }

  return {
    title: `${profile.displayname ?? "XIVSpots user"} | XIVSpots`,
    description: "A public XIVSpots community profile.",
  };
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = await params;

  if (!uuidPattern.test(id)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === id;
  const { data: profile, error } = await supabase
    .from("app_users")
    .select("id, displayname, avatar_url, created_at, public, social_x, social_instagram")
    .eq("id", id)
    .maybeSingle<PublicProfile>();

  if (error || !profile || (!profile.public && !isOwnProfile)) {
    notFound();
  }

  const displayname = profile.displayname ?? "XIVSpots user";
  const socialLinks = [
    profile.social_x
      ? {
          label: "X",
          handle: profile.social_x,
          href: `https://x.com/${profile.social_x}`,
        }
      : null,
    profile.social_instagram
      ? {
          label: "Instagram",
          handle: profile.social_instagram,
          href: `https://instagram.com/${profile.social_instagram}`,
        }
      : null,
  ].filter((link): link is { label: string; handle: string; href: string } => Boolean(link));

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
      <section className="glass-panel rounded-lg p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border-default bg-surface-base">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt="" fill sizes="96px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-brand-spark">
                  {displayname.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase text-brand-spark">Discord profile</p>
              <h1 className="mt-1 truncate text-4xl font-semibold text-text-primary">
                {displayname}
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Member since {formatMemberSince(profile.created_at)}
              </p>
            </div>
          </div>

          {isOwnProfile ? (
            <a
              href="#edit-profile"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border-default bg-surface-elevated px-4 text-sm font-semibold text-text-primary transition hover:border-border-active/60 hover:bg-surface-overlay"
            >
              Edit
            </a>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full border border-border-default bg-surface-base px-3 py-1 text-xs font-semibold text-text-secondary">
            {profile.public ? "Public" : "Private"}
          </span>
          {socialLinks.length > 0 ? (
            socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                rel="noreferrer"
                target="_blank"
                className="rounded-full border border-border-default bg-surface-base px-3 py-1 text-xs font-semibold text-text-primary transition hover:border-border-active/70"
              >
                {link.label}: @{link.handle}
              </a>
            ))
          ) : (
            <span className="rounded-full border border-border-default bg-surface-base px-3 py-1 text-xs font-semibold text-text-muted">
              No social handles yet
            </span>
          )}
        </div>
      </section>

      {isOwnProfile ? (
        <section id="edit-profile">
          <ProfileEditForm
            profile={{
              id: profile.id,
              displayname,
              public: profile.public,
              social_x: profile.social_x,
              social_instagram: profile.social_instagram,
            }}
          />
        </section>
      ) : null}
    </main>
  );
}

function formatMemberSince(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}
