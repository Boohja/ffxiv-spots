import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SubmitSpotForm } from "@/components/spots/SubmitSpotForm";
import type { UserRole } from "@/lib/spots/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Submit Spot | XIVSpots",
  description: "Submit a Final Fantasy XIV photo spot for review.",
};

export default async function SubmitSpotPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/spots/submit");
  }

  const viewerRole = await getViewerRole(supabase, user.id);
  const canAcceptOnCreate = viewerRole === "moderator" || viewerRole === "admin";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-spark">Submit</p>
          <h1 className="mt-1 text-4xl font-semibold text-text-primary">Share a photo spot</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Add coordinates, zone context, practical access notes, and a compact screenshot set for review.
          </p>
        </div>
        <p className="rounded-full border border-border-default bg-surface-base px-3 py-1 text-sm text-text-secondary">
          Review queue
        </p>
      </div>

      <SubmitSpotForm canAcceptOnCreate={canAcceptOnCreate} />
    </main>
  );
}

async function getViewerRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data } = await supabase
    .from("app_users")
    .select("role")
    .eq("id", userId)
    .maybeSingle<{ role: UserRole }>();

  return data?.role ?? null;
}
