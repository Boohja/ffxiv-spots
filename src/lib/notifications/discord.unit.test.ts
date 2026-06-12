import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { notifyReviewSubmission } from "@/lib/notifications/discord";

describe("notifyReviewSubmission", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    delete process.env.XIVSPOTS_REVIEW_DISCORD_WEBHOOK_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://xivspots.example";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    if (originalFetch) {
      vi.stubGlobal("fetch", originalFetch);
    } else {
      vi.unstubAllGlobals();
    }

    delete process.env.XIVSPOTS_REVIEW_DISCORD_WEBHOOK_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    vi.restoreAllMocks();
  });

  it("does nothing when the webhook URL is not configured", async () => {
    const notified = await notifyReviewSubmission({
      slug: "bright",
      submitter: {
        id: "user-1",
        displayname: "Aeron",
      },
      title: "Bright Perch",
    });

    expect(notified).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("posts the absolute review URL to the configured Discord webhook", async () => {
    process.env.XIVSPOTS_REVIEW_DISCORD_WEBHOOK_URL = "https://discord.example/webhook";
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));

    const notified = await notifyReviewSubmission({
      slug: "bright",
      submitter: {
        id: "user-1",
        displayname: "Aeron",
      },
      title: "Bright Perch",
    });

    expect(notified).toBe(true);
    expect(fetch).toHaveBeenCalledWith("https://discord.example/webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        content:
          "New submission by [Aeron](https://xivspots.example/users/user-1): [Bright Perch](https://xivspots.example/spots/bright/edit)",
        allowed_mentions: {
          parse: [],
        },
      }),
    });
  });

  it("does not throw when Discord rejects the request", async () => {
    process.env.XIVSPOTS_REVIEW_DISCORD_WEBHOOK_URL = "https://discord.example/webhook";
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(
      notifyReviewSubmission({
        slug: "bright",
        submitter: {
          id: "user-1",
          displayname: "Aeron",
        },
        title: "Bright Perch",
      }),
    ).resolves.toBe(false);
    expect(consoleError).toHaveBeenCalledWith("Discord review webhook failed with status 500.");
  });

  it("escapes markdown link labels from submitted text", async () => {
    process.env.XIVSPOTS_REVIEW_DISCORD_WEBHOOK_URL = "https://discord.example/webhook";
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));

    const notified = await notifyReviewSubmission({
      slug: "bright",
      submitter: {
        id: "user-1",
        displayname: "Aeron [Crystal]",
      },
      title: "View [North]",
    });

    expect(notified).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "https://discord.example/webhook",
      expect.objectContaining({
        body: JSON.stringify({
          content:
            "New submission by [Aeron \\[Crystal\\]](https://xivspots.example/users/user-1): [View \\[North\\]](https://xivspots.example/spots/bright/edit)",
          allowed_mentions: {
            parse: [],
          },
        }),
      }),
    );
  });
});
