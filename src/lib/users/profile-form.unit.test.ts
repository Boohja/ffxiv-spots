import { describe, expect, it } from "vitest";

import { normalizeHandle, parseProfileForm } from "@/lib/users/profile-form";

function makeFormData(values: Record<string, string | boolean>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "boolean") {
      if (value) {
        formData.set(key, "on");
      }
    } else {
      formData.set(key, value);
    }
  }

  return formData;
}

describe("normalizeHandle", () => {
  it("strips leading at signs and trims whitespace", () => {
    expect(normalizeHandle("  @@aeron_xiv ")).toBe("aeron_xiv");
  });
});

describe("parseProfileForm", () => {
  it("returns normalized values for a valid profile form", () => {
    const result = parseProfileForm(
      makeFormData({
        displayname: " Aeron ",
        social_instagram: "@aeron.gpose",
        social_x: "@aeron_xiv",
      }),
    );

    expect(result).toEqual({
      ok: true,
      values: {
        displayname: "Aeron",
        social_instagram: "aeron.gpose",
        social_x: "aeron_xiv",
      },
    });
  });

  it("rejects missing display names and full social URLs", () => {
    const result = parseProfileForm(
      makeFormData({
        displayname: " ",
        social_instagram: "https://instagram.com/aeron",
        social_x: "https://x.com/aeron",
      }),
    );

    expect(result).toMatchObject({
      ok: false,
      state: {
        fieldErrors: {
          displayname: "Choose a display name.",
          social_instagram: "Not a valid Instagram handle.",
          social_x: "Not a valid X handle.",
        },
      },
    });
  });
});
