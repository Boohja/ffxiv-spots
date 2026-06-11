import { describe, expect, it } from "vitest";

import {
  getDiscordAccessConfig,
  getDiscordLoginFailureReason,
  type DiscordAccessConfig,
} from "@/lib/auth/discord-access";

const openConfig: DiscordAccessConfig = {
  allowRegistration: true,
  allowNonStaffLogin: true,
};

describe("getDiscordAccessConfig", () => {
  it("defaults to allowing the current Discord auth behavior", () => {
    expect(getDiscordAccessConfig({})).toEqual(openConfig);
  });

  it("parses explicit maintenance toggles", () => {
    expect(
      getDiscordAccessConfig({
        XIVSPOTS_ALLOW_DISCORD_REGISTRATION: "false",
        XIVSPOTS_ALLOW_NON_STAFF_DISCORD_LOGIN: "0",
      }),
    ).toEqual({
      allowRegistration: false,
      allowNonStaffLogin: false,
    });
  });
});

describe("getDiscordLoginFailureReason", () => {
  it("allows new users when registration is enabled", () => {
    expect(getDiscordLoginFailureReason(null, openConfig)).toBeNull();
  });

  it("blocks new users when registration is disabled", () => {
    expect(
      getDiscordLoginFailureReason(null, {
        allowRegistration: false,
        allowNonStaffLogin: true,
      }),
    ).toBe("registration_disabled");
  });

  it("blocks new users when only staff may log in", () => {
    expect(
      getDiscordLoginFailureReason(null, {
        allowRegistration: true,
        allowNonStaffLogin: false,
      }),
    ).toBe("login_restricted");
  });

  it("blocks existing non-staff users when only staff may log in", () => {
    expect(
      getDiscordLoginFailureReason(
        { role: "submitter" },
        {
          allowRegistration: true,
          allowNonStaffLogin: false,
        },
      ),
    ).toBe("login_restricted");
  });

  it("allows moderators and admins when only staff may log in", () => {
    const config = {
      allowRegistration: true,
      allowNonStaffLogin: false,
    };

    expect(getDiscordLoginFailureReason({ role: "moderator" }, config)).toBeNull();
    expect(getDiscordLoginFailureReason({ role: "admin" }, config)).toBeNull();
  });
});
