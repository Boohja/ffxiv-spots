"use client";

import { useState } from "react";
import Image from "next/image";

import type { SpotImage } from "@/lib/spots/types";

type ImageGalleryProps = Readonly<{
  images: SpotImage[];
  title: string;
}>;

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];
  const hasMultipleImages = images.length > 1;

  function showPreviousImage() {
    setActiveIndex((currentIndex) => (currentIndex - 1 + images.length) % images.length);
  }

  function showNextImage() {
    setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);
  }

  return (
    <section aria-label={`${title} image gallery`}>
      <figure className="glass-panel overflow-hidden rounded-lg">
        <div className="relative aspect-[16/9] bg-surface-base">
          <Image
            key={activeImage.src}
            src={activeImage.src}
            alt={activeImage.alt}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          {hasMultipleImages ? (
            <>
              <button
                type="button"
                aria-label="Show previous image"
                className="group absolute inset-y-0 left-0 flex w-[32%] items-center justify-start px-4 text-text-primary outline-none"
                onClick={showPreviousImage}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/20 opacity-55 transition group-hover:border-white/35 group-hover:bg-black/55 group-hover:opacity-100">
                  <ChevronLeftIcon />
                </span>
              </button>
              <button
                type="button"
                aria-label="Show next image"
                className="group absolute inset-y-0 right-0 flex w-[32%] items-center justify-end px-4 text-text-primary outline-none"
                onClick={showNextImage}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/20 opacity-55 transition group-hover:border-white/35 group-hover:bg-black/55 group-hover:opacity-100">
                  <ChevronRightIcon />
                </span>
              </button>
            </>
          ) : null}
        </div>
        {activeImage.caption || activeImage.credit ? (
          <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle px-4 py-3 text-xs text-text-muted">
            <span>{activeImage.caption}</span>
            <span>{activeImage.credit}</span>
          </figcaption>
        ) : null}
      </figure>
    </section>
  );
}

function ChevronLeftIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path d="M15 5L8 12L15 19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path d="M9 5L16 12L9 19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}
