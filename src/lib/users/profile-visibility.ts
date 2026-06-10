export type ProfileVisibility = {
  id: string;
  public: boolean;
};

export type ProfileViewerRole = "guest" | "submitter" | "trusted_submitter" | "moderator" | "admin";

export function isOwnProfile(profile: ProfileVisibility, viewerId?: string | null) {
  return Boolean(viewerId && profile.id === viewerId);
}

export function canViewPrivateProfiles(role?: ProfileViewerRole | null) {
  return role === "moderator" || role === "admin";
}

export function canViewUserProfile(
  profile: ProfileVisibility | null | undefined,
  viewerId?: string | null,
  viewerRole?: ProfileViewerRole | null,
): profile is ProfileVisibility {
  if (!profile) {
    return false;
  }

  return profile.public || isOwnProfile(profile, viewerId) || canViewPrivateProfiles(viewerRole);
}
