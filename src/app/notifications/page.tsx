import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NotificationsTable, type NotificationRow } from "@/components/notifications/NotificationsTable";
import { isMissingRelationError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Notifications | XIVSpots",
  description: "Review your XIVSpots notifications.",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/notifications");
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, message, url, sent_at, read_at")
    .eq("recipient", user.id)
    .order("sent_at", { ascending: false })
    .returns<NotificationRow[]>();

  if (error) {
    if (isMissingRelationError(error, "notifications")) {
      return <NotificationsPageShell notifications={[]} />;
    }

    throw error;
  }

  const notifications = data ?? [];

  return <NotificationsPageShell notifications={notifications} />;
}

function NotificationsPageShell({ notifications }: Readonly<{ notifications: NotificationRow[] }>) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase text-brand-spark">Notifications</p>
        <h1 className="mt-1 text-4xl font-semibold text-text-primary">Your notifications</h1>
      </div>

      {notifications.length > 0 ? (
        <NotificationsTable notifications={notifications} />
      ) : (
        <section className="rounded-lg border border-border-subtle bg-surface-base px-5 py-10 text-center">
          <h2 className="text-xl font-semibold text-text-primary">No notifications</h2>
          <p className="mt-2 text-sm text-text-secondary">You do not have any notifications right now.</p>
        </section>
      )}
    </main>
  );
}
