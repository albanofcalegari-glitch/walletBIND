# walletBIND — Diseno del Ledger

## Principio fundamental

**Toda plata que se mueve genera exactamente 2 asientos: un debito y un credito.**

El saldo de una wallet no es un campo que se incrementa/decrementa. Es el resultado de sumar todos los creditos y restar todos los debitos. Esto garantiza:

- **Auditabilidad**: cada centavo tiene origen y destino
- **Consistencia**: SUM(debitos) === SUM(creditos) siempre
- **Inmutabilidad**: los asientos nunca se editan ni borran, solo se agregan

---

## Wallets del sistema

Ademas de las wallets de las empresas, existen wallets "sistema" que representan el mundo exterior:

| Wallet | Tipo | Proposito |
|--------|------|-----------|
| Company wallets | `COMPANY` | Una por empresa, vinculada a CVU BIND |
| EXTERNAL | `SYSTEM` | Representa dinero fuera del sistema (BIND/bancos) |
| PLATFORM | `SYSTEM` | Revenue de la plataforma (comisiones, fees) |

---

## Flujos de plata

### 1. Ingreso de fondos (empresa carga su wallet)

La empresa transfiere desde su banco al CVU de su wallet via DEBIN o transferencia.

```
EXTERNAL  ──debito──►  LedgerEntry (DEBIT,  wallet=EXTERNAL,  $10.000)
COMPANY_A ──credito──►  LedgerEntry (CREDIT, wallet=COMPANY_A, $10.000)
```

Resultado: COMPANY_A +$10.000, EXTERNAL -$10.000

### 2. Transferencia entre empresas (on-platform)

Company A le paga a Company B dentro de la plataforma.

```
COMPANY_A ──debito──►  LedgerEntry (DEBIT,  wallet=COMPANY_A, $5.000)
COMPANY_B ──credito──►  LedgerEntry (CREDIT, wallet=COMPANY_B, $5.000)
```

Resultado: A -$5.000, B +$5.000. Neto del sistema = 0.

### 3. Transferencia a CBU externo (via BIND)

Company A envia plata a un CBU/CVU externo (proveedor, etc).

```
COMPANY_A ──debito──►  LedgerEntry (DEBIT,  wallet=COMPANY_A, $3.000)
EXTERNAL  ──credito──►  LedgerEntry (CREDIT, wallet=EXTERNAL,  $3.000)
```

Resultado: A -$3.000, la plata sale del sistema via BIND transfer.

### 4. Cobro de comision

La plataforma cobra fee por una operacion.

```
COMPANY_A ──debito──►  LedgerEntry (DEBIT,  wallet=COMPANY_A, $50)
PLATFORM  ──credito──►  LedgerEntry (CREDIT, wallet=PLATFORM,  $50)
```

### 5. Transferencia externa + fee (compuesto)

Una sola Transaction puede tener 4 entries (2 pares):

```
Transaction: "Company A paga proveedor + fee"
  Entry 1: DEBIT  COMPANY_A  $3.000  (transferencia)
  Entry 2: CREDIT EXTERNAL   $3.000
  Entry 3: DEBIT  COMPANY_A  $50     (fee)
  Entry 4: CREDIT PLATFORM   $50
```

---

## Modelo de datos

```
Company 1──N User
Company 1──N Wallet(COMPANY)

Wallet 1──N LedgerEntry
Transaction 1──N LedgerEntry  (minimo 2: debit + credit)
Transaction 1──0..1 Transfer   (si involucra BIND)

Transfer: tracking del ciclo de vida con BIND API
```

### Balance

```sql
-- Balance de una wallet = SUM(credits) - SUM(debits)
SELECT
  SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END) -
  SUM(CASE WHEN type = 'DEBIT'  THEN amount ELSE 0 END) as balance
FROM ledger_entries
WHERE wallet_id = ?
```

Para performance, cada wallet tiene `cached_balance` que se actualiza dentro de la misma transaccion DB.

### Idempotencia

Toda Transaction tiene un `idempotency_key` unico. Si llega un request duplicado, se retorna la Transaction original sin crear asientos nuevos. Esto es critico para:
- Retries de red
- Webhooks duplicados de BIND
- Race conditions en UI

### Concurrencia

El `cached_balance` se actualiza con `SELECT FOR UPDATE` (pessimistic lock) en la wallet dentro de la transaccion DB. Esto previene:
- Doble gasto (dos transfers que ven el mismo saldo)
- Balance negativo (se valida antes de insertar asientos)

---

## Invariantes

1. **SUM(DEBIT) === SUM(CREDIT)** siempre, en toda la base
2. **cached_balance >= 0** para wallets COMPANY (las SYSTEM pueden ser negativas)
3. **Entries son inmutables** — nunca UPDATE/DELETE
4. **Una Transaction tiene N entries donde N es par** (siempre pares debit/credit)
5. **idempotency_key es unico** — duplicados retornan el original
