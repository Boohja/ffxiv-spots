"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";

export type NotificationRow = {
  id: string;
  title: string;
  message: string | null;
  url: string | null;
  sent_at: string;
  read_at: string | null;
};

type NotificationsTableProps = Readonly<{
  notifications: NotificationRow[];
}>;

export function NotificationsTable({ notifications }: NotificationsTableProps) {
  const [rows, setRows] = useState(notifications);
  const [openNotificationId, setOpenNotificationId] = useState<string | null>(null);
  const openNotification = rows.find((row) => row.id === openNotificationId) ?? null;

  async function openRow(notification: NotificationRow) {
    setOpenNotificationId(notification.id);

    if (notification.read_at) {
      return;
    }

    const fallbackReadAt = new Date().toISOString();
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === notification.id ? { ...row, read_at: fallbackReadAt } : row)),
    );

    try {
      const response = await fetch(`/api/notifications/${notification.id}/read`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Read update failed.");
      }

      const payload = (await response.json()) as { readAt?: string };

      if (payload.readAt) {
        setRows((currentRows) =>
          currentRows.map((row) => (row.id === notification.id ? { ...row, read_at: payload.readAt ?? row.read_at } : row)),
        );
      }
    } catch (error) {
      console.error(error);
      setRows((currentRows) =>
        currentRows.map((row) => (row.id === notification.id ? { ...row, read_at: notification.read_at } : row)),
      );
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-base">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-surface-raised text-xs uppercase text-text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Age</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {rows.map((notification) => (
              <tr key={notification.id} className="transition hover:bg-surface-raised/60">
                <td className="w-28 px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      notification.read_at
                        ? "border-border-default text-text-muted"
                        : "border-brand-spark/45 bg-brand-spark/10 text-brand-spark"
                    }`}
                  >
                    {notification.read_at ? "Read" : "Unread"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="text-left font-semibold text-text-primary transition hover:text-brand-spark"
                    onClick={() => {
                      void openRow(notification);
                    }}
                  >
                    {notification.title}
                  </button>
                </td>
                <td className="w-28 px-4 py-3 text-text-muted">{formatRelativeAge(notification.sent_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openNotification ? (
        <NotificationModal notification={openNotification} onClose={() => setOpenNotificationId(null)} />
      ) : null}
    </>
  );
}

function NotificationModal({
  notification,
  onClose,
}: Readonly<{
  notification: NotificationRow;
  onClose: () => void;
}>) {
  const sentAt = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(notification.sent_at)),
    [notification.sent_at],
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/65 px-4 py-8">
      <div className="w-full max-w-xl rounded-lg border border-border-default bg-surface-elevated p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-brand-spark">Notification</p>
            <h2 className="mt-1 text-2xl font-semibold text-text-primary">{notification.title}</h2>
          </div>
          <button
            type="button"
            aria-label="Close notification"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-default text-lg text-text-secondary transition hover:border-border-active/70 hover:text-text-primary"
            onClick={onClose}
          >
            x
          </button>
        </div>
        {notification.message ? (
          <p className="mt-4 whitespace-pre-line text-sm leading-6 text-text-secondary">{notification.message}</p>
        ) : null}
        <p className="mt-5 text-xs text-text-muted">Sent {sentAt}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          {notification.url ? (
            <Link
              href={notification.url}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-transparent bg-gradient-primary px-4 text-sm font-semibold text-text-primary transition hover:bg-gradient-primary-hover"
            >
              Go to
            </Link>
          ) : null}
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatRelativeAge(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) {
    return "now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 30) {
    return `${diffDays}d`;
  }

  const diffMonths = Math.floor(diffDays / 30);

  if (diffMonths < 12) {
    return `${diffMonths}mo`;
  }

  return `${Math.floor(diffMonths / 12)}y`;
}
