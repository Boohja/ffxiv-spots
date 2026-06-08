import type { SupabaseClient, User } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { upsertAppUserProfile } from "@/lib/auth/profile";

function makeUser() {
  return {
    id: "27fa90fe-89eb-49b3-8f94-de17e3e522f7",
    app_metadata: {},
    aud: "authenticated",
    created_at: "2026-06-08T00:00:00.000Z",
    user_metadata: {},
    identities: [
      {
        provider: "discord",
        identity_data: {
          avatar_url: "https://cdn.discordapp.com/avatar.png",
          custom_claims: { global_name: "Aeron" },
          name: "aeron9000#0",
          provider_id: "850980511606505494",
        },
      },
    ],
  } as User;
}

function makeSupabase(existingDisplayName: string | null) {
  const upsert = vi.fn().mockResolvedValue({ error: null });
  const maybeSingle = vi.fn().mockResolvedValue({ data: { displayname: existingDisplayName } });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select, upsert });

  return {
    supabase: { from } as unknown as SupabaseClient,
    calls: { eq, from, maybeSingle, select, upsert },
  };
}

describe("upsertAppUserProfile", () => {
  it("upserts Discord identity data and seeds displayname from global_name", async () => {
    const { supabase, calls } = makeSupabase(null);

    await upsertAppUserProfile(supabase, makeUser());

    expect(calls.from).toHaveBeenCalledWith("app_users");
    expect(calls.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        avatar_url: "https://cdn.discordapp.com/avatar.png",
        discord_id: "850980511606505494",
        displayname: "Aeron",
        global_name: "Aeron",
        id: "27fa90fe-89eb-49b3-8f94-de17e3e522f7",
        username: "aeron9000#0",
      }),
    );
  });

  it("preserves a user-edited app displayname", async () => {
    const { supabase, calls } = makeSupabase("Gpose Person");

    await upsertAppUserProfile(supabase, makeUser());

    expect(calls.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        displayname: "Gpose Person",
      }),
    );
  });
});
