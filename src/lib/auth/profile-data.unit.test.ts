import type { User } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { getDiscordProfileFields, getSeedDisplayName } from "@/lib/auth/profile-data";

function makeUser(overrides: Partial<User> = {}) {
  return {
    id: "user-1",
    app_metadata: {},
    aud: "authenticated",
    created_at: "2026-06-08T00:00:00.000Z",
    user_metadata: {},
    ...overrides,
  } as User;
}

describe("getDiscordProfileFields", () => {
  it("prefers Discord global_name from identity custom claims for public display", () => {
    const user = makeUser({
      identities: [
        {
          provider: "discord",
          identity_data: {
            avatar_url: "https://cdn.discordapp.com/avatar.png",
            custom_claims: { global_name: "Aeron" },
            name: "aeron9000#0",
            provider_id: "850980511606505494",
            sub: "850980511606505494",
          },
        },
      ],
    });

    expect(getDiscordProfileFields(user)).toMatchObject({
      avatarUrl: "https://cdn.discordapp.com/avatar.png",
      discordDisplayName: "Aeron",
      discordId: "850980511606505494",
      globalName: "Aeron",
      username: "aeron9000#0",
    });
  });

  it("does not treat the unique Discord username as a display name fallback", () => {
    const user = makeUser({
      identities: [
        {
          provider: "discord",
          identity_data: {
            name: "aeron9000#0",
            provider_id: "850980511606505494",
          },
        },
      ],
    });

    expect(getDiscordProfileFields(user).discordDisplayName).toBeNull();
  });
});

describe("getSeedDisplayName", () => {
  it("keeps a user-edited app display name", () => {
    expect(getSeedDisplayName("My XIV name", "Aeron")).toBe("My XIV name");
  });

  it("replaces the neutral placeholder when Discord later provides a display name", () => {
    expect(getSeedDisplayName("XIVSpots user", "Aeron")).toBe("Aeron");
  });

  it("uses a neutral fallback when Discord has no display name", () => {
    expect(getSeedDisplayName(null, null)).toBe("XIVSpots user");
  });
});
