import type { Expansion } from "@/lib/spots/zones";

export type Coordinates = {
  x: number;
  y: number;
  z?: number;
};

export type SpotImage = {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
};

export type PhotoSpot = {
  id: string;
  slug: string;
  title: string;
  description: string;
  region: string;
  zone: string;
  area?: string;
  coordinates?: Coordinates;
  expansion: Expansion;
  tags: string[];
  bestTimeOfDay?: string[];
  bestWeather?: string[];
  accessibilityNotes?: string[];
  images: SpotImage[];
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PhotoSpotInput = Omit<PhotoSpot, "region" | "expansion">;

export type ModerationStatus = "pending" | "approved" | "rejected" | "needs_changes";

export type UserRole = "guest" | "submitter" | "trusted_submitter" | "moderator" | "admin";

export type SpotSubmission = {
  id: string;
  submittedBy?: string;
  status: ModerationStatus;
  spotData: Omit<PhotoSpotInput, "id" | "createdAt" | "updatedAt">;
  possibleDuplicates?: string[];
  reviewerNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type DuplicateCandidate = {
  spotId: string;
  score: number;
  reasons: string[];
};

export type SpotSort = "newest" | "title" | "zone" | "featured";

export type SpotFilters = {
  query?: string;
  region?: string;
  zone?: string;
  tag?: string;
  time?: string;
  weather?: string;
  sort?: SpotSort;
};
