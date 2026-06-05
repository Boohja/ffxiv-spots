export type DiscordAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export function getDiscordAuthUrl(_config: DiscordAuthConfig) {
  // TODO: Build the OAuth authorization URL using your Discord app settings.
  // Hint: include client_id, redirect_uri, response_type=code, and scopes.
  throw new Error("Not implemented yet. Build Discord OAuth URL here.");
}

export async function exchangeDiscordCode(_code: string) {
  // TODO: Exchange an OAuth code for access/refresh tokens.
  // Hint: POST to Discord token endpoint with client credentials.
  throw new Error("Not implemented yet. Exchange code for token here.");
}
