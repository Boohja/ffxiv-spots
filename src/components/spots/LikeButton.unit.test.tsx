import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LikeButton } from "@/components/spots/LikeButton";

describe("LikeButton", () => {
  it("keeps card buttons hidden until the card is hovered or focused", () => {
    render(
      <LikeButton
        canLike={false}
        className="absolute right-3 top-3 z-10"
        initialLiked
        initialLikeCount={3}
        spotId="spot-1"
      />,
    );

    expect(screen.getByRole("button", { name: "Unlike spot" }).parentElement).toHaveClass(
      "opacity-0",
      "group-hover:opacity-100",
      "focus-within:opacity-100",
    );
  });

  it("keeps detail buttons visible", () => {
    render(
      <LikeButton
        canLike={false}
        initialLiked={false}
        initialLikeCount={3}
        spotId="spot-1"
        variant="detail"
      />,
    );

    expect(screen.getByRole("button", { name: "Like spot" }).parentElement).toHaveClass("block");
    expect(screen.getByRole("button", { name: "Like spot" }).parentElement).not.toHaveClass("opacity-0");
  });
});
