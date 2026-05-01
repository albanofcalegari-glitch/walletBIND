// ── Auth ──

export interface BindAuthConfig {
  authUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
}

export interface BindTokenResponse {
  token_type: string;
  access_token: string;
  expires_in: number;
}

// ── Accounts ──

export interface BindAddress {
  calle: string;
  numero: string;
  localidadId: number;
  provinciaId: number;
  cp: string;
}

export interface CreateAccountRequest {
  cuitCuil: string;
  nombre: string;
  apellido: string;
  razonSocial?: string;
  email: string;
  celular: string;
  fechaNacimiento: string;
  nacionalidad: string;
  ocupacion: string;
  estadoCivil: string;
  esPep: boolean;
  esFatca: boolean;
  esUif: boolean;
  datosDomicilio: BindAddress;
  codigo?: string;
  habilitado?: boolean;
  actividadAfip?: string;
}

export interface CreateAccountResponse {
  id: string;
  habilitado: boolean;
}

export interface BalanceResponse {
  saldo: number;
}

export interface CvuLookupResponse {
  cuentaId: string;
  cbucvu: string;
  alias: string;
  cuitCuil: string;
  nombre: string;
  bancoNombre: string;
  activo: boolean;
  billeteraId: string;
  nombreCvu: string;
  entidad: string;
  moneda: 'ARS' | 'USD';
}

// ── Transfers ──

export type TransferConcepto = 'ALQ' | 'CUO' | 'EXP' | 'FAC' | 'PRE' | 'SEG' | 'HON' | 'HAB' | 'VAR';

export type TransferStatus = 'COMPLETED' | 'PENDING' | 'IN_PROGRESS' | 'UNKNOWN' | 'FAILED' | 'UNKNOWN_FOREVER';

export interface TransferDestination {
  cbu?: string;
  alias?: string;
}

export interface TransferValue {
  currency: 'ARS' | 'USD';
  amount: number;
}

export interface ExecuteTransferRequest {
  origin_id: string;
  to: TransferDestination;
  value: TransferValue;
  concepto: TransferConcepto;
  description?: string;
  emails?: string[];
}

export interface ExecuteTransferResponse {
  id: string;
  type: string;
  from: Record<string, unknown>;
  counterparty: Record<string, unknown>;
  status: TransferStatus;
  charge: Record<string, unknown>;
  transaction_ids: string[];
  start_date: string;
  end_date: string;
}

export interface QueryTransfersParams {
  start?: number;
  length?: number;
  type?: 'TRANSFERENCIAS_RECIBIDAS' | 'TRANSFER';
  fromDate?: string;
  toDate?: string;
  cvu?: string;
  clientId?: string;
  transferenceId?: string;
}

// ── Movements ──

export interface QueryMovementsParams {
  fechaDesde: string;
  fechaHasta: string;
  pageNumber: number;
  pageSize: number;
  idCuenta?: string;
  idTipoComprobante?: number;
  orderByDesc?: boolean;
  signo?: 1 | -1;
}

// ── Client Config ──

export type BindEnvironment = 'staging' | 'production';

export interface BindClientConfig {
  environment: BindEnvironment;
  authUrl: string;
  clientId: string;
  clientSecret: string;
}
