import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SubmitSpotForm } from "@/components/spots/SubmitSpotForm";
import type { EditableSpotFormValue } from "@/components/spots/SubmitSpotForm";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

function getFileInput(container: HTMLElement) {
  const input = container.querySelector('input[type="file"]');

  if (!(input instanceof HTMLInputElement)) {
    throw new Error("File input not found.");
  }

  return input;
}

function chooseFiles(input: HTMLInputElement, files: File[]) {
  fireEvent.change(input, {
    target: {
      files,
    },
  });
}

function expectReviewImageCount(value: string) {
  const imageLabels = screen.getAllByText("Images");
  const reviewImageLabel = imageLabels[imageLabels.length - 1];

  expect(reviewImageLabel.nextElementSibling).toHaveTextContent(value);
}

function makeEditableSpot(overrides: Partial<EditableSpotFormValue> = {}): EditableSpotFormValue {
  return {
    id: "spot-1",
    slug: "accepted-overlook",
    state: "accepted",
    zone: "Upper La Noscea",
    x: 10,
    y: 20,
    z: null,
    title: "Accepted Overlook",
    description: null,
    tags: [],
    access_notes: null,
    updated_at: "2026-06-11T12:00:00.000Z",
    images: [
      {
        id: "image-1",
        url: "https://example.test/spot.webp",
        alt: "Accepted Overlook",
      },
    ],
    ...overrides,
  };
}

describe("SubmitSpotForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn((file: File) => `blob:${file.name}`),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("appends a second screenshot selection, caps at two, and allows removal", async () => {
    const { container } = render(<SubmitSpotForm />);
    const firstImage = new File(["first"], "first.jpg", { type: "image/jpeg" });
    const secondImage = new File(["second"], "second.jpg", { type: "image/jpeg" });
    const thirdImage = new File(["third"], "third.jpg", { type: "image/jpeg" });

    chooseFiles(getFileInput(container), [firstImage]);
    chooseFiles(getFileInput(container), [secondImage, thirdImage]);

    expect(await screen.findByText("first.jpg")).toBeInTheDocument();
    expect(screen.getByText("second.jpg")).toBeInTheDocument();
    expect(screen.queryByText("third.jpg")).not.toBeInTheDocument();
    expect(screen.getByText("Screenshot limit reached")).toBeInTheDocument();
    expectReviewImageCount("2");

    fireEvent.click(screen.getByLabelText("Remove first.jpg"));

    await waitFor(() => {
      expect(screen.queryByText("first.jpg")).not.toBeInTheDocument();
    });
    expect(screen.getByText("second.jpg")).toBeInTheDocument();
    expectReviewImageCount("1");
    expect(screen.getByRole("button", { name: "Browse screenshots" })).toBeEnabled();
  });

  it("normalizes comma coordinates and saves drafts without screenshots", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).startsWith("/api/landmarks/nearest")) {
        return Promise.resolve(Response.json({ landmark: null }));
      }

      if (String(input) === "/api/spots" && init?.method === "POST") {
        const body = init.body;

        expect(body).toBeInstanceOf(FormData);
        expect((body as FormData).get("state")).toBe("draft");
        expect((body as FormData).get("x")).toBe("10.4");
        expect((body as FormData).get("y")).toBe("20.1");
        expect((body as FormData).getAll("images")).toHaveLength(0);

        return Promise.resolve(
          Response.json(
            {
              spot: {
                slug: "upper-la-noscea-photo-spot",
              },
            },
            { status: 201 },
          ),
        );
      }

      return Promise.reject(new Error(`Unexpected fetch ${String(input)}`));
    });

    vi.stubGlobal("fetch", fetchMock);
    render(<SubmitSpotForm />);

    fireEvent.change(screen.getByLabelText("Zone"), { target: { value: "Upper La Noscea" } });
    fireEvent.change(screen.getByLabelText("X"), { target: { value: "10,4" } });
    fireEvent.change(screen.getByLabelText("Y"), { target: { value: "20,1" } });
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    expect(await screen.findByText("Saving draft...")).toBeInTheDocument();
    expect(await screen.findByText("Draft saved")).toBeInTheDocument();
    expect(screen.getByText("Your spot draft was saved.")).toBeInTheDocument();
  });

  it("hides save and accept when reviewing an already accepted spot", () => {
    render(<SubmitSpotForm mode="review" spot={makeEditableSpot()} />);

    expect(screen.queryByRole("button", { name: "Save and accept" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save and return" })).toBeInTheDocument();
  });

  it("shows save and accept for staff creating a new spot", () => {
    render(<SubmitSpotForm canAcceptOnCreate />);

    expect(screen.getByRole("button", { name: "Save and accept" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit spot" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save draft" })).toBeInTheDocument();
  });
});
