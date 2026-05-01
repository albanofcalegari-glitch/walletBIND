/**
 * Test 7: Consultar movimientos
 * GET /walletentidad-operaciones/v1/api/v1.201/Movimientos
 *
 * Uso: npm run test:movements
 * Env: BIND_TEST_ACCOUNT_ID (opcional, filtra por cuenta)
 */
import { createClient, printResult, printError } from './helpers.js';

async function main() {
  console.log('=== BIND PSP — Test Movimientos ===\n');

  const client = createClient();

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const params = {
    fechaDesde: thirtyDaysAgo.toISOString().split('T')[0]!,
    fechaHasta: today.toISOString().split('T')[0]!,
    pageNumber: 1,
    pageSize: 20,
    idCuenta: process.env.BIND_TEST_ACCOUNT_ID,
  };

  console.log('Query params:', JSON.stringify(params, null, 2));
  console.log('\nConsultando movimientos...');

  try {
    const result = await client.movements.query(params);
    printResult('Movimientos', result);
  } catch (err) {
    printError('Error consultando movimientos', err);
  }
}

main();
