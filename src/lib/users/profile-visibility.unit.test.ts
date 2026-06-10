import { describe, expect, it } from "vitest";

import { canViewUserProfile, isOwnProfile } from "@/lib/users/profile-visibility";

const profileId = "27fa90fe-89eb-49b3-8f94-de17e3e522f7";
const otherUserId = "7fd08bec-9d54-4205-9a72-ae954b76c85b";

describe("isOwnProfile", () => {
  it("matches only the profile owner", () => {
    expect(isOwnProfile({ id: profileId, public: false }, profileId)).toBe(true);
    expect(isOwnProfile({ id: profileId, public: false }, otherUserId)).toBe(false);
    expect(isOwnProfile({ id: profileId, public: false }, null)).toBe(false);
  });
});

describe("canViewUserProfile", () => {
  it("allows anonymous visitors to view public profiles", () => {
    expect(canViewUserProfile({ id: profileId, public: true }, null)).toBe(true);
  });

  it("allows authenticated non-owners to view public profiles", () => {
    expect(canViewUserProfile({ id: profileId, public: true }, otherUserId)).toBe(true);
  });

  it("denies anonymous visitors access to private profiles", () => {
    expect(canViewUserProfile({ id: profileId, public: false }, null)).toBe(false);
  });

  it("denies authenticated non-owners access to private profiles", () => {
    expect(canViewUserProfile({ id: profileId, public: false }, otherUserId)).toBe(false);
  });

  it("allows moderators and admins to view private profiles", () => {
    expect(canViewUserProfile({ id: profileId, public: false }, otherUserId, "moderator")).toBe(true);
    expect(canViewUserProfile({ id: profileId, public: false }, otherUserId, "admin")).toBe(true);
  });

  it("allows the owner to view their own private profile", () => {
    expect(canViewUserProfile({ id: profileId, public: false }, profileId)).toBe(true);
  });

  it("denies missing profiles", () => {
    expect(canViewUserProfile(null, profileId)).toBe(false);
  });
});
