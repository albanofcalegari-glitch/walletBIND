import type { AxiosInstance } from 'axios';
import type {
  ExecuteTransferRequest,
  ExecuteTransferResponse,
  QueryTransfersParams,
} from './types.js';

const TRANSFER_BASE =
  '/cvucollectentidad-financial/v1/v1.201/banks/322/accounts/owner/transaction-request-types/TRANSFER/transaction-requests';

const QUERY_BASE =
  '/cvucollectentidad-financial/v1/v1.201/banks/322/accounts/transfers';

export class BindTransfers {
  constructor(private http: AxiosInstance) {}

  async execute(data: ExecuteTransferRequest): Promise<ExecuteTransferResponse> {
    const res = await this.http.post<ExecuteTransferResponse>(TRANSFER_BASE, data);
    return res.data;
  }

  async query(params?: QueryTransfersParams): Promise<unknown> {
    const query = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) query.set(key, String(value));
      }
    }
    const url = query.toString() ? `${QUERY_BASE}?${query.toString()}` : QUERY_BASE;
    const res = await this.http.get(url);
    return res.data;
  }
}
