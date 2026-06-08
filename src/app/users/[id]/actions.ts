"use server";

import { revalidatePath } from "next/cache";

import { parseProfileForm, type ProfileFormState } from "@/lib/users/profile-form";
import { createClient } from "@/lib/supabase/server";

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

  const parsedForm = parseProfileForm(formData);

  if (!parsedForm.ok) {
    return parsedForm.state;
  }

  const { error } = await supabase
    .from("app_users")
    .update({
      displayname: parsedForm.values.displayname,
      public: parsedForm.values.public,
      social_x: parsedForm.values.social_x,
      social_instagram: parsedForm.values.social_instagram,
    })
    .eq("id", user.id);

  if (error) {
    return { message: "Your profile could not be saved. Please try again." };
  }

  revalidatePath(`/users/${profileId}`);

  return { ok: true, message: "Profile saved." };
}
