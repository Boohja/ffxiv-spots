"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

type UserMenuProps = Readonly<{
  avatarUrl: string | null;
  displayName: string;
  profileHref: string;
}>;

export function UserMenu({ avatarUrl, displayName, profileHref }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    let controller = new AbortController();

    async function refreshUnreadCount() {
      controller.abort();
      controller = new AbortController();
      const activeController = controller;

      try {
        const response = await fetch("/api/notifications/unread-count", {
          signal: activeController.signal,
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { count?: number };

        if (isMounted) {
          setUnreadCount(payload.count ?? 0);
        }
      } catch (error) {
        if (!activeController.signal.aborted) {
          console.error(error);
        }
      }
    }

    function handleFocus() {
      void refreshUnreadCount();
    }

    void refreshUnreadCount();
    const interval = window.setInterval(() => {
      void refreshUnreadCount();
    }, 5 * 60 * 1000);
    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    const baseTitle = document.title.replace(/^\(\d+\)\s+/, "");
    document.title = unreadCount > 0 ? `(${unreadCount}) ${baseTitle}` : baseTitle;
  }, [unreadCount]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative flex h-9 items-center">
      <button
        type="button"
        aria-label="Open user menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        className="relative z-50 inline-flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border-default bg-surface-elevated text-brand-spark transition hover:border-border-active/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-active/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page"
        onClick={() => setIsOpen((current) => !current)}
      >
        {avatarUrl ? (
          <Image src={avatarUrl} alt="" fill sizes="36px" className="object-cover" />
        ) : (
          <FallbackAvatar />
        )}
      </button>
      {unreadCount > 0 ? (
        <span
          className="absolute -right-0.5 -top-0.5 z-50 h-3 w-3 rounded-full border-2 border-surface-base bg-brand-spark"
          aria-label={`${unreadCount} unread notifications`}
        />
      ) : null}
      {isOpen ? (
        <div
          id={menuId}
          className="absolute right-0 top-11 z-50 w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-border-default bg-surface-elevated shadow-[0_22px_48px_-24px_rgba(0,0,0,0.9)]"
          role="menu"
        >
          <div className="border-b border-border-subtle px-3 py-2">
            <p className="truncate text-sm font-semibold text-text-primary">{displayName}</p>
          </div>
          <Link
            href={profileHref}
            className="block px-3 py-2 text-sm font-semibold text-text-secondary transition hover:bg-surface-overlay hover:text-text-primary"
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>
          <Link
            href="/notifications"
            className="flex items-center justify-between gap-3 px-3 py-2 text-sm font-semibold text-text-secondary transition hover:bg-surface-overlay hover:text-text-primary"
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            <span>Notifications</span>
            {unreadCount > 0 ? (
              <span className="rounded-full border border-brand-spark/45 bg-brand-spark/10 px-2 py-0.5 text-xs text-brand-spark">
                {unreadCount}
              </span>
            ) : null}
          </Link>
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="block w-full px-3 py-2 text-left text-sm font-semibold text-text-secondary transition hover:bg-surface-overlay hover:text-text-primary"
              role="menuitem"
            >
              Logout
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function FallbackAvatar() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 12.5C14.0711 12.5 15.75 10.8211 15.75 8.75C15.75 6.67893 14.0711 5 12 5C9.92893 5 8.25 6.67893 8.25 8.75C8.25 10.8211 9.92893 12.5 12 12.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M5.75 19C6.69675 16.8316 9.01234 15.5 12 15.5C14.9877 15.5 17.3033 16.8316 18.25 19"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}
