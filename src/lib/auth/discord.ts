export type DiscordAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export function getDiscordAuthUrl(config: DiscordAuthConfig) {
  if (!config.clientId || !config.clientSecret || !config.redirectUri) {
    throw new Error("Missing Discord auth configuration.");
  }

  // Next step: Build the OAuth authorization URL from your Discord app settings.
  // Hint: include client_id, redirect_uri, response_type=code, and scopes.
  throw new Error("Not implemented yet. Build Discord OAuth URL here.");
}

export async function exchangeDiscordCode(code: string) {
  if (!code) {
    throw new Error("Missing OAuth code.");
  }

  // Next step: Exchange an OAuth code for access/refresh tokens.
  // Hint: POST to Discord token endpoint with client credentials.
  throw new Error("Not implemented yet. Exchange code for token here.");
}
