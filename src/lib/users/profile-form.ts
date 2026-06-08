export type ProfileFormState = {
  fieldErrors?: {
    displayname?: string;
    social_x?: string;
    social_instagram?: string;
  };
  message?: string;
  ok?: boolean;
};

export type ValidProfileFormValues = {
  displayname: string;
  public: boolean;
  social_x: string | null;
  social_instagram: string | null;
};

const displayNameMaxLength = 80;
const handleMaxLength = 30;

function readString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export function normalizeHandle(value: string) {
  return value.trim().replace(/^@+/, "");
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

export function parseProfileForm(formData: FormData):
  | { ok: true; values: ValidProfileFormValues }
  | { ok: false; state: ProfileFormState } {
  const displayname = readString(formData, "displayname");
  const socialX = normalizeHandle(readString(formData, "social_x"));
  const socialInstagram = normalizeHandle(readString(formData, "social_instagram"));
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
      ok: false,
      state: {
        fieldErrors,
        message: "Check the highlighted fields and try again.",
      },
    };
  }

  return {
    ok: true,
    values: {
      displayname,
      public: formData.get("public") === "on",
      social_x: socialX || null,
      social_instagram: socialInstagram || null,
    },
  };
}
