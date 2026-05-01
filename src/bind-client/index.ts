import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { BindAuth } from './bind-auth.js';
import { BindAccounts } from './bind-accounts.js';
import { BindTransfers } from './bind-transfers.js';
import { BindMovements } from './bind-movements.js';
import type { BindClientConfig } from './types.js';

const URLS = {
  staging: {
    baseUrl: 'https://gw-staging-qrbind.epays.services',
    scope: 'api://staging-bind.epays.services/.default',
  },
  production: {
    baseUrl: 'https://api.bindpagos.com.ar',
    scope: 'api://bindpagos.com.ar/.default',
  },
} as const;

export class BindClient {
  private auth: BindAuth;
  private http: AxiosInstance;

  public accounts: BindAccounts;
  public transfers: BindTransfers;
  public movements: BindMovements;

  constructor(config: BindClientConfig) {
    const env = URLS[config.environment];

    this.auth = new BindAuth({
      authUrl: config.authUrl,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      scope: env.scope,
    });

    this.http = axios.create({
      baseURL: env.baseUrl,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30_000,
    });

    this.http.interceptors.request.use(async (reqConfig) => {
      const token = await this.auth.getToken();
      reqConfig.headers.Authorization = `Bearer ${token}`;
      return reqConfig;
    });

    this.http.interceptors.response.use(
      (res) => res,
      (error: AxiosError) => {
        const status = error.response?.status;
        const data = error.response?.data;
        console.error(`[BIND API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${status}`, data);
        throw error;
      },
    );

    this.accounts = new BindAccounts(this.http);
    this.transfers = new BindTransfers(this.http);
    this.movements = new BindMovements(this.http);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.auth.getToken();
      return true;
    } catch {
      return false;
    }
  }
}

export * from './types.js';
export { BindAuth } from './bind-auth.js';
export { BindAccounts } from './bind-accounts.js';
export { BindTransfers } from './bind-transfers.js';
export { BindMovements } from './bind-movements.js';
