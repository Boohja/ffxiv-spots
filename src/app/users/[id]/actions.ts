"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type ProfileFormState = {
  fieldErrors?: {
    displayname?: string;
    social_x?: string;
    social_instagram?: string;
  };
  message?: string;
  ok?: boolean;
};

const displayNameMaxLength = 80;
const handleMaxLength = 30;

function readString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function normalizeHandle(value: string) {
  return value.replace(/^@+/, "").trim();
}

function validateHandle(value: string, pattern: RegExp, label: string) {
  if (!value) {
    return null;
  }

  if (value.length > handleMaxLength) {
    return `${label} must be ${handleMaxLength} characters or fewer.`;
  }

  if (!pattern.test(value)) {
    return `Not a valid ${label} handle.`;
  }

  return null;
}

export async function updateUserProfile(
  profileId: string,
  _previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== profileId) {
    return { message: "You can only edit your own profile." };
  }

  const displayname = readString(formData, "displayname");
  const socialX = normalizeHandle(readString(formData, "social_x"));
  const socialInstagram = normalizeHandle(readString(formData, "social_instagram"));
  const isPublic = formData.get("public") === "on";
  const fieldErrors: NonNullable<ProfileFormState["fieldErrors"]> = {};

  if (!displayname) {
    fieldErrors.displayname = "Choose a display name.";
  } else if (displayname.length > displayNameMaxLength) {
    fieldErrors.displayname = `Display name must be ${displayNameMaxLength} characters or fewer.`;
  }

  const xError = validateHandle(socialX, /^[a-zA-Z0-9_]{1,15}$/, "X");
  const instagramError = validateHandle(
    socialInstagram,
    /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/,
    "Instagram",
  );

  if (xError) {
    fieldErrors.social_x = xError;
  }

  if (instagramError) {
    fieldErrors.social_instagram = instagramError;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      fieldErrors,
      message: "Check the highlighted fields and try again.",
    };
  }

  const { error } = await supabase
    .from("app_users")
    .update({
      displayname,
      public: isPublic,
      social_x: socialX || null,
      social_instagram: socialInstagram || null,
    })
    .eq("id", user.id);

  if (error) {
    return { message: "Your profile could not be saved. Please try again." };
  }

  revalidatePath(`/users/${profileId}`);

  return { ok: true, message: "Profile saved." };
}
