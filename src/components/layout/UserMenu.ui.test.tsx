import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UserMenu } from "@/components/layout/UserMenu";

describe("UserMenu", () => {
  beforeEach(() => {
    document.title = "XIVSpots";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ count: 2 }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens from the avatar button and closes from outside clicks", async () => {
    render(<UserMenu avatarUrl={null} displayName="Aeron Dawn" profileHref="/users/aeron" />);

    fireEvent.click(screen.getByRole("button", { name: "Open user menu" }));

    expect(screen.getByText("Aeron Dawn")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveAttribute("href", "/users/aeron");
    expect(await screen.findByRole("menuitem", { name: /Notifications/ })).toHaveAttribute("href", "/notifications");
    expect(screen.getByText("2")).toBeInTheDocument();
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
