import axios from 'axios';
import type { BindAuthConfig, BindTokenResponse } from './types';

export class BindAuth {
  private token: string | null = null;
  private expiresAt: number = 0;

  constructor(private config: BindAuthConfig) {}

  async getToken(): Promise<string> {
    if (this.token && Date.now() < this.expiresAt) {
      return this.token;
    }
    return this.refreshToken();
  }

  private async refreshToken(): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'client_credentials',
      scope: this.config.scope,
    });

    const response = await axios.post<BindTokenResponse>(
      this.config.authUrl,
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    this.token = response.data.access_token;
    // Refresh 5 min before actual expiry
    this.expiresAt = Date.now() + (response.data.expires_in - 300) * 1000;

    return this.token;
  }

  clearToken(): void {
    this.token = null;
    this.expiresAt = 0;
  }
}
