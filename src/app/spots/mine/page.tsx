import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SpotEntryList } from "@/components/spots/SpotEntryList";
import { getSpotEntriesForSubmitter } from "@/lib/spots/entry-list";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Spots | XIVSpots",
  description: "Review your submitted XIVSpots entries and drafts.",
};

export default async function MySpotsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/spots/mine");
  }

  const entries = await getSpotEntriesForSubmitter(supabase, user.id);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-spark">My spots</p>
          <h1 className="mt-1 text-4xl font-semibold text-text-primary">Submitted entries</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Drafts, submitted spots, accepted entries, and duplicate-marked submissions.
          </p>
        </div>
        <Link
          href="/spots/submit"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border-default bg-surface-elevated px-4 text-sm font-semibold text-text-primary transition hover:border-border-active/60 hover:bg-surface-overlay"
        >
          Submit spot
        </Link>
      </div>

      <SpotEntryList entries={entries} emptyMessage="You have not created any spot entries yet." />
    </main>
  );
}
