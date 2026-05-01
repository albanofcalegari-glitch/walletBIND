# BIND PSP — API Reference

Documentacion recopilada de los portales publicos de BIND para el proyecto walletBIND.

---

## 1. Ecosistema BIND

BIND (Banco Industrial S.A.) opera multiples plataformas:

| Plataforma | URL | Proposito |
|------------|-----|-----------|
| **BIND PSP (Bind Pagos)** | `psp.bind.com.ar/developers` | Portal principal — wallet, cobros, transfers, QR |
| **bindX Developers** | `developers.bindx.com` | APIs extendidas: FX, crypto, eCheqs, QR PIX |
| **API Bank (legacy)** | `apibank.bind.com.ar` | Open banking original (transfers, DEBIN, eCheqs) |
| **B-Connect** | `connect.bind.com.ar` | Conectividad enterprise |

BIND fue el **primer banco argentino en ofrecer APIs abiertas** (2018). Procesan 340M+ transacciones/mes en toda la infra.

---

## 2. Ambientes

| Ambiente | Base URL |
|----------|----------|
| **Staging** | `https://gw-staging-qrbind.epays.services` |
| **Produccion** | `https://api.bindpagos.com.ar` |

---

## 3. Autenticacion

**Tipo**: OAuth2 Client Credentials (via Microsoft Azure AD)

**Request**:
```
POST {auth_url}  (URL provista por BIND, dominio login.microsoftonline.com)

Content-Type: application/x-www-form-urlencoded

client_id={client_id_provisto_por_bind}
&client_secret={client_secret_provisto_por_bind}
&grant_type=client_credentials
&scope=api://staging-bind.epays.services/.default   (staging)
       api://bindpagos.com.ar/.default               (produccion)
```

**Response**:
```json
{
  "token_type": "Bearer",
  "access_token": "eyJ...",
  "expires_in": 3600
}
```

**Uso**: Todas las llamadas posteriores requieren header `Authorization: Bearer {access_token}`.

**Notas**:
- Token expira en **60 minutos**
- `client_id` y `client_secret` los provee el equipo de integracion de BIND PSP
- No hay signup self-service; hay que contactar comercialmente

---

## 4. Endpoints — Cuentas / Wallet

### 4.1 Crear Cuenta

Crea una cuenta/wallet vinculada a un CUIT/CUIL.

```
POST /walletentidad-cuenta/v1/api/v1.201/Cuenta
```

**Body**:
```json
{
  "cuitCuil": "20-12345678-9",
  "nombre": "Juan",
  "apellido": "Perez",
  "razonSocial": "Empresa SRL",
  "email": "juan@empresa.com",
  "celular": "+5491112345678",
  "fechaNacimiento": "1990-01-15",
  "nacionalidad": "AR",
  "ocupacion": "Empresario",
  "estadoCivil": "Soltero",
  "esPep": false,
  "esFatca": false,
  "esUif": false,
  "datosDomicilio": {
    "calle": "Av. Corrientes",
    "numero": "1234",
    "localidadId": 1,
    "provinciaId": 1,
    "cp": "C1043"
  }
}
```

**Campos opcionales**: `codigo` (ID externo), `habilitado` (boolean), `actividadAfip`.

**Response**:
```json
{
  "id": "account-uuid",
  "habilitado": true
}
```

**Status codes**:
- `200` — Exito
- `400` — Datos invalidos
- `401` — Auth fallida
- `409` — Codigo ya existe

**Nota**: No se usa si la organizacion usa el flujo de Onboarding built-in de BIND.

---

### 4.2 Consultar Saldo

```
GET /walletentidad-cuenta/v1/api/v1.201/SaldoActualByIdCuenta/{idCuenta}
```

**Response**:
```json
{
  "saldo": 15000.50
}
```

---

### 4.3 Buscar Cuenta por CBU/CVU/Alias

```
GET /walletentidad-cuenta/v1/api/v1.201/CuentaCVUByCbuCvuOrAlias?cbuOrCvu={value}&alias={value}
```

**Response**:
```json
{
  "cuentaId": "uuid",
  "cbucvu": "0000322100000000000001",
  "alias": "MI.WALLET.BIND",
  "cuitCuil": "20-12345678-9",
  "nombre": "Juan Perez",
  "bancoNombre": "BIND",
  "activo": true,
  "billeteraId": "uuid",
  "nombreCvu": "WALLET_EMPRESA",
  "entidad": "322",
  "moneda": "ARS"
}
```

**Nota**: Soporta moneda "ARS" y "USD".

---

### 4.4 Consultar Saldo Crypto

```
GET /walletentidad-investment/v1/api/v1.201/Inversion/CotizacionCripto/{idCuenta}
```

**Response**:
```json
{
  "saldosCriptomonedas": [
    { "moneda": "BTC", "saldo": 0.005 },
    { "moneda": "ETH", "saldo": 1.2 }
  ]
}
```

---

## 5. Endpoints — Transferencias

### 5.1 Ejecutar Transferencia

```
POST /cvucollectentidad-financial/v1/v1.201/banks/322/accounts/owner/transaction-request-types/TRANSFER/transaction-requests
```

**Body**:
```json
{
  "origin_id": "TXN-001-ABC12",
  "to": {
    "cbu": "0140000000000000000001"
  },
  "value": {
    "currency": "ARS",
    "amount": 5000.00
  },
  "concepto": "VAR",
  "description": "Pago proveedor Marzo"
}
```

**Campos**:
| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `origin_id` | string (max 15) | Si | **Idempotente**: si se reenvia, devuelve el original |
| `to.cbu` | string | Si* | CBU o CVU destino |
| `to.alias` | string | Si* | Alternativa a CBU |
| `value.currency` | "ARS" / "USD" | Si | |
| `value.amount` | decimal | Si | |
| `concepto` | string | Si | ALQ, CUO, EXP, FAC, PRE, SEG, HON, HAB, VAR |
| `description` | string (max 100) | No | Descripcion libre |
| `emails` | string[] | No | Emails para recibo |

*Uno de `cbu` o `alias` es requerido.

**Conceptos**:
- `ALQ` — Alquiler
- `CUO` — Cuota
- `EXP` — Expensas
- `FAC` — Factura
- `PRE` — Prestamo
- `SEG` — Seguro
- `HON` — Honorarios
- `HAB` — Haberes
- `VAR` — Varios

**Response**:
```json
{
  "id": "transfer-uuid",
  "type": "TRANSFER",
  "from": { "account_id": "..." },
  "counterparty": { "name": "...", "cbu": "..." },
  "status": "COMPLETED",
  "charge": { "summary": "...", "value": { "amount": 5000.00, "currency": "ARS" } },
  "transaction_ids": ["..."],
  "start_date": "2026-05-01T10:00:00Z",
  "end_date": "2026-05-01T10:00:01Z"
}
```

**Status posibles**: `COMPLETED`, `PENDING`, `IN_PROGRESS`, `UNKNOWN`, `FAILED`, `UNKNOWN_FOREVER`

---

### 5.2 Consultar Transferencias

```
GET /cvucollectentidad-financial/v1/v1.201/banks/322/accounts/transfers
```

**Query params**:
| Param | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `start` | int | No | Offset paginacion |
| `length` | int | No | Page size |
| `type` | string | No | `TRANSFERENCIAS_RECIBIDAS` o `TRANSFER` |
| `fromDate` | date | No | Fecha desde |
| `toDate` | date | No | Fecha hasta |
| `cvu` | string | No | Filtro por CVU |
| `clientId` | string | No | Filtro por cliente |
| `transferenceId` | string | No | ID transferencia especifica |

---

## 6. Endpoints — Movimientos / Transacciones

### 6.1 Consultar Movimientos

```
GET /walletentidad-operaciones/v1/api/v1.201/Movimientos
```

**Query params**:
| Param | Tipo | Requerido |
|-------|------|-----------|
| `fechaDesde` | date | Si |
| `fechaHasta` | date | Si |
| `pageNumber` | int | Si |
| `pageSize` | int | Si |
| `idCuenta` | string | No |
| `idTipoComprobante` | int | No |
| `orderByDesc` | bool | No |
| `signo` | int | No | 1=credito, -1=debito |
| `coelsaId` | string | No |

---

### 6.2 Consultar Transacciones (detallado)

```
GET /bindentidad-transaccionquery-v2/v2/api/v1.201/transacciones-pag
```

Filtros: `fechaNegocioDesde/Hasta`, `estado` (ACREDITADO/RECHAZADA/DEVUELTA), `codigoComercio`, paginacion.

Response incluye datos completos de tarjeta (`marca`, `tipoTarjeta`, `cuotas`), fechas de liquidacion, retenciones.

---

## 7. Endpoints — DEBIN (Debito Inmediato)

### 7.1 Crear Pedido DEBIN

```
POST /walletentidad-cuenta/v1/api/v1.201/Organizacion/CrearPedidoDebin
```

**Body**: `descripcion`, `cbuOrigen` o `alias`, `monto`.

**Prerequisito**: Suscripcion DEBIN recurrente activa en la cuenta origen.

### 7.2 Consultar DEBIN

```
GET /walletentidad-cuenta/v1/api/v1.201/Organizacion/GetDebinPedidoById/{id}
```

**Status**: `COMPLETED`, `PENDING`, `IN_PROGRESS`, `UNKNOWN`, `UNKNOWN_FOREVER`.

---

## 8. Endpoints — Links de Pago ("Boton Simple")

### 8.1 Crear Link de Pago

```
POST /bindentidad-cardnotpresent-v2/v2/api/v1.201/payments/create
```

**Body**:
```json
{
  "collector_cuit": "30-12345678-9",
  "collector_branchOffice": "001",
  "description": "Recarga wallet",
  "totalAmount": 10000.00,
  "currency": "ARS",
  "channel": 1,
  "successUrl": "https://app.com/success",
  "errorUrl": "https://app.com/error",
  "clientReference": "REF-001",
  "items": []
}
```

**Response**:
```json
{
  "url": "https://bindpagos.com.ar/pay/...",
  "expirationDate": "2026-05-02T10:00:00Z",
  "paymentId": "guid",
  "qr": "base64-encoded-qr-image"
}
```

---

## 9. Endpoints — Notificaciones de Pago

### 9.1 Consultar Pagos Pendientes

```
PATCH /bindentidad-notificacion-v2/v2/api/v1.201/notificaciones-pagos
```

**Body**: `TipoDestino` (ENTIDAD/COMERCIO/CAJA), `KeyDestino`.

Retorna pagos de las ultimas 24hs en estado `PENDIENTE`. Una vez leidos, pasan a `ENTREGADO`.

Tipos de transaccion: `Transferencia30` (QR), `BotonSimple`, `CVUCollect`, `MPOS`.

---

## 10. Endpoints — QR

### 10.1 QR PIX (pagos a Brasil)

```
POST /walletentidad-operaciones/v1/api/v1.201/ProcesarPagoQRPix
Body: { idCuenta, idPix, montoBRL }
```

### 10.2 Devolucion QR

```
POST /bindentidad-workflow-v2/v2/api/v1.201/contracargo-qr-v31
Body: { qrIdTrx, codigoComercio, parcial: boolean, importe, motivo }
```

Devoluciones parciales permitidas hasta 30 dias.

---

## 11. Endpoints — Deuda / Cobro de Servicios

```
GET /bindentidad-deuda-v2/v2/api/v1.201/Deuda?DeudaId={id}&IdentificadorOrden={orden}
```

**Estados**: Precargado (1), Pendiente (2), En proceso (3), Pagada (4), Pagada parcialmente (5), Cancelada manual (6), Cancelado (7).

---

## 12. Dolar CCL

Dos modelos:
- **Standard**: Horario de mercado, pricing real-time
- **Combi**: Cualquier hora, cotizacion con expiracion

El saldo CVU se debita/acredita automaticamente.

---

## 13. Archivos de Conciliacion

Archivos generados diariamente (dias habiles), publicados al dia siguiente.

Descarga via API en 2 pasos: obtener codigo encriptado → descargar archivo.

- **Movimientos**: `XXXXMOVIMIENTOSCUENTASDDMMAA.zip`
- **Saldos**: `XXXXXXXSALDOCUENTASDDMMAA.zip`

---

## 14. Informacion Operativa

| Dato | Valor |
|------|-------|
| Volumen | 340M+ tx/mes (total), 70M+ via API Bank, 250M+ via PSP |
| Clientes integrados | 200+ (MercadoPago, Ripio, Cencosud, Cocos Capital) |
| Uptime SLA | 99.8% |
| Seguridad | OAuth2, triple security scheme, HSM, SOC 2 Type II, AWS |
| Onboarding | ~1 mes con equipo dedicado |
| SDKs oficiales | Ninguno (solo community PHP y .NET connector) |

---

## 15. WaaS (Wallet as a Service)

URL: `bind.com.ar/fintech/waas-fintech`

Producto donde **no necesitas ser PSP autorizado** para operar como wallet. Incluye:
- Cuentas con CVU
- Transferencias instantaneas
- QR payments
- Administracion de cobros y pagos

Ideal si no tenes licencia PSP propia.

---

## 16. Links Utiles

| Recurso | URL |
|---------|-----|
| BIND PSP Developers | https://psp.bind.com.ar/developers |
| BIND PSP Auth | https://psp.bind.com.ar/developers/apis/autenticacion |
| BIND PSP Ambientes | https://psp.bind.com.ar/developers/apis/guia-ambientes |
| BIND PSP Crear Cuenta | https://psp.bind.com.ar/developers/apis/crear-cuenta |
| BIND PSP Transfers | https://psp.bind.com.ar/developers/apis/transfer-transferir |
| BIND PSP Movimientos | https://psp.bind.com.ar/developers/apis/consultar-movimientos |
| BIND PSP Transacciones | https://psp.bind.com.ar/developers/apis/consultar-transacciones |
| BIND PSP DEBIN | https://psp.bind.com.ar/developers/apis/fondear-cuenta-recaudadora-con-debin |
| BIND PSP Boton Simple | https://psp.bind.com.ar/developers/apis/boton-crearlinkdepago |
| BIND PSP Notificaciones | https://psp.bind.com.ar/developers/apis/notificacion-consultarpagospendientes |
| BIND WaaS | https://bind.com.ar/fintech/waas-fintech |
| BIND BaaS | https://bind.com.ar/fintech/baas |
| bindX Developers | https://developers.bindx.com |
| Sandbox Docs | https://sandbox.bind.com.ar/apidoc/ |
| PHP SDK (community) | https://github.com/mchojrin/apibank |
| .NET Connector (Matba Rofex) | https://github.com/matbarofex/UniversalAPIBankConnector |
