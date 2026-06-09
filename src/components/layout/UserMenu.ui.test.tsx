import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UserMenu } from "@/components/layout/UserMenu";

describe("UserMenu", () => {
  it("opens from the avatar button and closes from outside clicks", () => {
    render(<UserMenu avatarUrl={null} displayName="Aeron Dawn" profileHref="/users/aeron" />);

    fireEvent.click(screen.getByRole("button", { name: "Open user menu" }));

    expect(screen.getByText("Aeron Dawn")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveAttribute("href", "/users/aeron");
    expect(screen.getByRole("menuitem", { name: "Logout" })).toBeInTheDocument();

    fireEvent.pointerDown(document.body);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes on Escape", () => {
    render(<UserMenu avatarUrl={null} displayName="Aeron Dawn" profileHref="/users/aeron" />);

    fireEvent.click(screen.getByRole("button", { name: "Open user menu" }));
    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
