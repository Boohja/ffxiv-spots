import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProfileEditForm } from "@/components/users/ProfileEditForm";

vi.mock("@/app/users/[id]/actions", () => ({
  updateUserProfile: vi.fn(),
}));

describe("ProfileEditForm", () => {
  it("renders profile values as accessible form controls", () => {
    render(
      <ProfileEditForm
        profile={{
          id: "27fa90fe-89eb-49b3-8f94-de17e3e522f7",
          displayname: "Aeron",
          social_instagram: "aeron.gpose",
          social_x: "aeron_xiv",
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Profile settings" })).toBeInTheDocument();
    expect(screen.getByLabelText("Display name")).toHaveValue("Aeron");
    expect(screen.getByLabelText("X handle")).toHaveValue("aeron_xiv");
    expect(screen.getByLabelText("Instagram handle")).toHaveValue("aeron.gpose");
    expect(screen.getByRole("button", { name: "Save profile" })).toBeEnabled();
  });
});
