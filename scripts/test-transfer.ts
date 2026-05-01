/**
 * Test 5: Ejecutar transferencia
 * POST /cvucollectentidad-financial/v1/v1.201/banks/322/accounts/owner/
 *       transaction-request-types/TRANSFER/transaction-requests
 *
 * Uso: npm run test:transfer
 * Env: BIND_TEST_DEST_CBU (CBU/CVU destino para test)
 *
 * ATENCION: En staging, esto puede generar una transaccion real de sandbox.
 *           Usa montos bajos ($1) y CBUs de test.
 */
import { createClient, printResult, printError } from './helpers.js';
import type { ExecuteTransferRequest } from '../src/bind-client/types.js';

async function main() {
  console.log('=== BIND PSP — Test Transfer ===\n');

  const destCbu = process.env.BIND_TEST_DEST_CBU;
  if (!destCbu) {
    console.error('  [ERROR] Falta BIND_TEST_DEST_CBU en .env');
    console.error('  Agrega un CBU/CVU destino de prueba.\n');
    process.exit(1);
  }

  const client = createClient();

  const originId = `TST${Date.now().toString().slice(-12)}`;

  const transfer: ExecuteTransferRequest = {
    origin_id: originId,
    to: { cbu: destCbu },
    value: { currency: 'ARS', amount: 1.00 },
    concepto: 'VAR',
    description: 'Test walletBIND transfer',
  };

  console.log('Transfer request:', JSON.stringify(transfer, null, 2));
  console.log(`\norigin_id (idempotente): ${originId}`);
  console.log('Ejecutando transferencia...');

  try {
    const result = await client.transfers.execute(transfer);
    printResult('Transferencia ejecutada', result);
    console.log(`\n  Status: ${result.status}`);
    console.log(`  Transfer ID: ${result.id}\n`);
  } catch (err) {
    printError('Error en transferencia', err);
  }
}

main();
