import type { Expansion } from "@/lib/spots/zones";

export type Coordinates = {
  x: number;
  y: number;
  z?: number;
};

export type SpotImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
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
  landmark?: string;
  area?: string;
  coordinates?: Coordinates;
  expansion: Expansion;
  tags: string[];
  bestTimeOfDay?: string[];
  bestWeather?: string[];
  accessibilityNotes?: string[];
  images: SpotImage[];
  createdAt: string;
  updatedAt: string;
  submitter?: {
    id: string;
    displayname: string | null;
  } | null;
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

export type SpotSort = "newest" | "title" | "zone";

export type SpotFilters = {
  query?: string;
  expansion?: Expansion;
  region?: string;
  zone?: string;
  landmark?: string;
  tag?: string;
  sort?: SpotSort;
};
