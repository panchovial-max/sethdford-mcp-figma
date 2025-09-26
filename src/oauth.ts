import { request } from 'undici';
import pkceChallenge from 'pkce-challenge';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  port: number;
}

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export class FigmaOAuthClient {
  private readonly config: OAuthConfig;
  private readonly baseUrl = 'https://www.figma.com/oauth';

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  /**
   * Generate OAuth authorization URL with PKCE
   */
  async generateAuthUrl(): Promise<{ url: string; codeVerifier: string; state: string }> {
    const { code_verifier, code_challenge } = await pkceChallenge();
    const state = Math.random().toString(36).substring(2, 15);
    
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'file_read',
      state,
      code_challenge,
      code_challenge_method: 'S256',
      response_type: 'code'
    });

    const url = `${this.baseUrl}?${params.toString()}`;
    
    return { url, codeVerifier: code_verifier, state };
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(
    code: string, 
    codeVerifier: string, 
    state: string
  ): Promise<OAuthTokens> {
    const response = await request(`${this.baseUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        code,
        code_verifier: codeVerifier,
        state,
        grant_type: 'authorization_code'
      }).toString()
    });

    if (response.statusCode < 200 || response.statusCode >= 300) {
      const body = await response.body.text();
      throw new Error(`OAuth token exchange failed ${response.statusCode}: ${body}`);
    }

    return response.body.json() as Promise<OAuthTokens>;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<OAuthTokens> {
    const response = await request(`${this.baseUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }).toString()
    });

    if (response.statusCode < 200 || response.statusCode >= 300) {
      const body = await response.body.text();
      throw new Error(`OAuth token refresh failed ${response.statusCode}: ${body}`);
    }

    return response.body.json() as Promise<OAuthTokens>;
  }

  /**
   * Get OAuth configuration for client setup
   */
  getConfig() {
    return {
      clientId: this.config.clientId,
      redirectUri: this.config.redirectUri,
      scope: 'file_read'
    };
  }
}
