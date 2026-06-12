"use client";

import { useState } from "react";

type LikeButtonProps = Readonly<{
  canLike: boolean;
  className?: string;
  initialLiked: boolean;
  initialLikeCount: number;
  showCount?: boolean;
  spotId: string;
  variant?: "card" | "detail";
}>;

export function LikeButton({
  canLike,
  className = "",
  initialLiked,
  initialLikeCount,
  showCount = true,
  spotId,
  variant = "card",
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, setIsPending] = useState(false);

  async function toggleLike() {
    if (!canLike) {
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch(`/api/spots/${spotId}/like`, {
        method: isLiked ? "DELETE" : "POST",
      });
      const payload = (await response.json()) as {
        error?: string;
        liked?: boolean;
        likeCount?: number;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not update like.");
      }

      setIsLiked(Boolean(payload.liked));
      setLikeCount(payload.likeCount ?? likeCount);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }

  const isDetail = variant === "detail";
  const label = isLiked ? "Unlike spot" : "Like spot";
  const heart = <HeartIcon filled={isLiked} />;
  const wrapperClass = isDetail
    ? "block"
    : `${className} opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100`.trim();
  const classes = isDetail
    ? "inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border-default bg-surface-elevated px-4 text-sm font-semibold text-text-primary transition hover:border-border-active/60 hover:bg-surface-overlay disabled:cursor-not-allowed disabled:opacity-60"
    : "inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-full border border-border-default bg-surface-base/90 px-3 text-sm font-semibold text-text-primary shadow-lg backdrop-blur transition hover:border-border-active/70 disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <div className={wrapperClass}>
      <button
        type="button"
        aria-pressed={isLiked}
        aria-label={label}
        className={classes}
        disabled={!canLike || isPending}
        onClick={toggleLike}
      >
        {heart}
        {showCount ? (
          <span>
            {likeCount}
            {isDetail ? ` ${likeCount === 1 ? "Like" : "Likes"}` : null}
          </span>
        ) : null}
      </button>
    </div>
  );
}

function HeartIcon({ filled }: Readonly<{ filled: boolean }>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${filled ? "text-brand-gold" : "text-text-secondary"}`}
    >
      <path
        d="M12 20.25c-.28 0-.55-.1-.76-.29C5.4 14.68 2.25 11.79 2.25 7.73 2.25 4.8 4.52 2.5 7.4 2.5c1.7 0 3.34.8 4.38 2.08A5.73 5.73 0 0 1 16.16 2.5c2.87 0 5.14 2.3 5.14 5.23 0 4.06-3.15 6.95-8.99 12.23-.21.19-.48.29-.76.29Z"
        fill={filled ? "currentColor" : "transparent"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
