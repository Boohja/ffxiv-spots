import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { SpotEntryList } from "@/components/spots/SpotEntryList";
import { getPendingSpotEntriesForReview } from "@/lib/spots/entry-list";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/spots/types";

export const metadata: Metadata = {
  title: "Review Spots | XIVSpots",
  description: "Moderator review queue for pending XIVSpots submissions.",
};

type AppUserRole = {
  role: UserRole;
};

const reviewerRoles = new Set<UserRole>(["moderator", "admin"]);

export default async function SpotReviewQueuePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/moderation/spots");
  }

  const { data: profile, error: profileError } = await supabase
    .from("app_users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<AppUserRole>();

  if (profileError || !profile || !reviewerRoles.has(profile.role)) {
    notFound();
  }

  const entries = await getPendingSpotEntriesForReview(supabase);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-spark">Moderation</p>
          <h1 className="mt-1 text-4xl font-semibold text-text-primary">Pending submissions</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Submitted spots waiting for review, oldest first, with submitter profile links.
          </p>
        </div>
        <p className="rounded-full border border-border-default bg-surface-base px-3 py-1 text-sm text-text-secondary">
          {entries.length} pending
        </p>
      </div>

      <SpotEntryList
        entries={entries}
        emptyMessage="There are no pending spot submissions right now."
        showSubmitter
      />
    </main>
  );
}
