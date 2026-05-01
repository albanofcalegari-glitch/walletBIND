/**
 * Test suite completo — corre todos los tests en secuencia.
 * Se detiene en el primer error de auth.
 *
 * Uso: npm run test:all
 */
import { createClient, printResult, printError } from './helpers.js';

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   walletBIND — BIND PSP Test Suite       ║');
  console.log('║   Ambiente: ' + (process.env.BIND_ENV || 'staging').padEnd(28) + '║');
  console.log('╚══════════════════════════════════════════╝\n');

  const client = createClient();

  // ── 1. Auth ──
  console.log('─── [1/5] Autenticacion ───');
  try {
    const ok = await client.healthCheck();
    if (!ok) throw new Error('Token no obtenido');
    printResult('Auth', { status: 'OK' });
  } catch (err) {
    printError('Auth FALLIDO — abortando', err);
    process.exit(1);
  }

  // ── 2. Lookup CVU ──
  console.log('\n─── [2/5] Lookup CVU/Alias ───');
  const testCvu = process.env.BIND_TEST_CVU;
  const testAlias = process.env.BIND_TEST_ALIAS;
  if (testCvu || testAlias) {
    try {
      const lookup = await client.accounts.lookupByCbuCvuOrAlias({
        cbuOrCvu: testCvu,
        alias: testAlias,
      });
      printResult('Lookup', lookup);
    } catch (err) {
      printError('Lookup', err);
    }
  } else {
    console.log('  [SKIP] No hay BIND_TEST_CVU ni BIND_TEST_ALIAS en .env');
  }

  // ── 3. Balance ──
  console.log('\n─── [3/5] Saldo ───');
  const accountId = process.env.BIND_TEST_ACCOUNT_ID;
  if (accountId) {
    try {
      const balance = await client.accounts.getBalance(accountId);
      printResult('Saldo', balance);
    } catch (err) {
      printError('Saldo', err);
    }
  } else {
    console.log('  [SKIP] No hay BIND_TEST_ACCOUNT_ID en .env');
  }

  // ── 4. Query Transfers ──
  console.log('\n─── [4/5] Transferencias ───');
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const transfers = await client.transfers.query({
      fromDate: thirtyDaysAgo.toISOString().split('T')[0],
      toDate: today.toISOString().split('T')[0],
      start: 0,
      length: 5,
    });
    printResult('Transfers (ultimos 30 dias, top 5)', transfers);
  } catch (err) {
    printError('Transfers', err);
  }

  // ── 5. Movimientos ──
  console.log('\n─── [5/5] Movimientos ───');
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const movements = await client.movements.query({
      fechaDesde: sevenDaysAgo.toISOString().split('T')[0]!,
      fechaHasta: today.toISOString().split('T')[0]!,
      pageNumber: 1,
      pageSize: 10,
      idCuenta: accountId,
    });
    printResult('Movimientos (ultimos 7 dias)', movements);
  } catch (err) {
    printError('Movimientos', err);
  }

  console.log('\n══════════════════════════════════════════');
  console.log('  Test suite finalizado.');
  console.log('══════════════════════════════════════════\n');
}

main();
