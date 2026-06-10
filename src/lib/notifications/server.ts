import { createAdminClient } from "@/lib/supabase/admin";

type CreateNotificationInput = {
  recipient: string | null;
  title: string;
  message?: string;
  url?: string;
};

export async function createNotification({ recipient, title, message, url }: CreateNotificationInput) {
  if (!recipient) {
    return;
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("notifications").insert({
      recipient,
      title,
      message,
      url,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Could not create notification.", error);
  }
}

export async function deleteExpiredNotifications() {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("notifications")
    .delete({ count: "exact" })
    .lte("delete_at", new Date().toISOString());

  if (error) {
    throw error;
  }

  return count ?? 0;
}
