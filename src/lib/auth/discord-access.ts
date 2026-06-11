import type { UserRole } from "@/lib/spots/types";

export type DiscordLoginFailureReason = "registration_disabled" | "login_restricted";

export type DiscordAccessConfig = {
  allowRegistration: boolean;
  allowNonStaffLogin: boolean;
};

export type DiscordAccessProfile = {
  role: UserRole;
} | null;

const staffRoles = new Set<UserRole>(["moderator", "admin"]);

export function getDiscordAccessConfig(env: NodeJS.ProcessEnv = process.env): DiscordAccessConfig {
  return {
    allowRegistration: readBooleanEnv(env.XIVSPOTS_ALLOW_DISCORD_REGISTRATION, true),
    allowNonStaffLogin: readBooleanEnv(env.XIVSPOTS_ALLOW_NON_STAFF_DISCORD_LOGIN, true),
  };
}

export function getDiscordLoginFailureReason(
  profile: DiscordAccessProfile,
  config: DiscordAccessConfig,
): DiscordLoginFailureReason | null {
  if (!profile && !config.allowRegistration) {
    return "registration_disabled";
  }

  if (!profile && !config.allowNonStaffLogin) {
    return "login_restricted";
  }

  if (profile && !config.allowNonStaffLogin && !staffRoles.has(profile.role)) {
    return "login_restricted";
  }

  return null;
}

function readBooleanEnv(value: string | undefined, fallback: boolean) {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  switch (value.trim().toLowerCase()) {
    case "1":
    case "true":
    case "yes":
    case "on":
      return true;
    case "0":
    case "false":
    case "no":
    case "off":
      return false;
    default:
      return fallback;
  }
}
