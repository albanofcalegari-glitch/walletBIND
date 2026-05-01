import type { AxiosInstance } from 'axios';
import type { QueryMovementsParams } from './types';

const BASE = '/walletentidad-operaciones/v1/api/v1.201';

export class BindMovements {
  constructor(private http: AxiosInstance) {}

  async query(params: QueryMovementsParams): Promise<unknown> {
    const query = new URLSearchParams();
    query.set('fechaDesde', params.fechaDesde);
    query.set('fechaHasta', params.fechaHasta);
    query.set('pageNumber', String(params.pageNumber));
    query.set('pageSize', String(params.pageSize));
    if (params.idCuenta) query.set('idCuenta', params.idCuenta);
    if (params.idTipoComprobante !== undefined)
      query.set('idTipoComprobante', String(params.idTipoComprobante));
    if (params.orderByDesc !== undefined)
      query.set('orderByDesc', String(params.orderByDesc));
    if (params.signo !== undefined)
      query.set('signo', String(params.signo));

    const res = await this.http.get(`${BASE}/Movimientos?${query.toString()}`);
    return res.data;
  }
}
