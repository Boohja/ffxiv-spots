"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { updateUserProfile } from "@/app/users/[id]/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ProfileFormState } from "@/lib/users/profile-form";

type ProfileEditFormProps = Readonly<{
  profile: {
    id: string;
    displayname: string;
    public: boolean;
    social_x: string | null;
    social_instagram: string | null;
  };
}>;

const initialState: ProfileFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save profile"}
    </Button>
  );
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const updateProfile = updateUserProfile.bind(null, profile.id);
  const [state, formAction] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} className="glass-panel rounded-lg p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-spark">Edit</p>
          <h2 className="mt-1 text-2xl font-semibold text-text-primary">Profile settings</h2>
        </div>
        <label className="inline-flex items-center gap-3 rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm font-semibold text-text-primary">
          <input
            name="public"
            type="checkbox"
            defaultChecked={profile.public}
            className="h-4 w-4 accent-brand-cyan"
          />
          Public profile
        </label>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="displayname" className="text-sm font-semibold text-text-primary">
            Display name
          </label>
          <Input
            id="displayname"
            name="displayname"
            defaultValue={profile.displayname}
            maxLength={80}
            required
            aria-describedby={state.fieldErrors?.displayname ? "displayname-error" : undefined}
          />
          {state.fieldErrors?.displayname ? (
            <p id="displayname-error" className="text-sm text-danger">
              {state.fieldErrors.displayname}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="social_x" className="text-sm font-semibold text-text-primary">
            X handle
          </label>
          <Input
            id="social_x"
            name="social_x"
            defaultValue={profile.social_x ?? ""}
            maxLength={30}
            placeholder="handle"
            leading={<span>@</span>}
            aria-describedby={state.fieldErrors?.social_x ? "social-x-error" : undefined}
          />
          {state.fieldErrors?.social_x ? (
            <p id="social-x-error" className="text-sm text-danger">
              {state.fieldErrors.social_x}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="social_instagram" className="text-sm font-semibold text-text-primary">
            Instagram handle
          </label>
          <Input
            id="social_instagram"
            name="social_instagram"
            defaultValue={profile.social_instagram ?? ""}
            maxLength={30}
            placeholder="handle"
            leading={<span>@</span>}
            aria-describedby={
              state.fieldErrors?.social_instagram ? "social-instagram-error" : undefined
            }
          />
          {state.fieldErrors?.social_instagram ? (
            <p id="social-instagram-error" className="text-sm text-danger">
              {state.fieldErrors.social_instagram}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <SubmitButton />
        {state.message ? (
          <p className={`text-sm ${state.ok ? "text-success" : "text-danger"}`} aria-live="polite">
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
