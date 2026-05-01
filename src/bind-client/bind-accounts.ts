import type { AxiosInstance } from 'axios';
import type {
  CreateAccountRequest,
  CreateAccountResponse,
  BalanceResponse,
  CvuLookupResponse,
} from './types.js';

const BASE = '/walletentidad-cuenta/v1/api/v1.201';

export class BindAccounts {
  constructor(private http: AxiosInstance) {}

  async create(data: CreateAccountRequest): Promise<CreateAccountResponse> {
    const res = await this.http.post<CreateAccountResponse>(`${BASE}/Cuenta`, data);
    return res.data;
  }

  async getBalance(accountId: string): Promise<BalanceResponse> {
    const res = await this.http.get<BalanceResponse>(
      `${BASE}/SaldoActualByIdCuenta/${accountId}`,
    );
    return res.data;
  }

  async lookupByCbuCvuOrAlias(params: {
    cbuOrCvu?: string;
    alias?: string;
  }): Promise<CvuLookupResponse> {
    const query = new URLSearchParams();
    if (params.cbuOrCvu) query.set('cbuOrCvu', params.cbuOrCvu);
    if (params.alias) query.set('alias', params.alias);

    const res = await this.http.get<CvuLookupResponse>(
      `${BASE}/CuentaCVUByCbuCvuOrAlias?${query.toString()}`,
    );
    return res.data;
  }
}
