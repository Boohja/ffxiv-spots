export type ProfileVisibility = {
  id: string;
  public: boolean;
};

export function isOwnProfile(profile: ProfileVisibility, viewerId?: string | null) {
  return Boolean(viewerId && profile.id === viewerId);
}

export function canViewUserProfile(
  profile: ProfileVisibility | null | undefined,
  viewerId?: string | null,
): profile is ProfileVisibility {
  if (!profile) {
    return false;
  }

  return profile.public || isOwnProfile(profile, viewerId);
}
