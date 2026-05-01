/**
 * Test 3: Consultar saldo de una cuenta
 * GET /walletentidad-cuenta/v1/api/v1.201/SaldoActualByIdCuenta/{id}
 *
 * Uso: npm run test:balance
 * Env: BIND_TEST_ACCOUNT_ID (el ID obtenido al crear cuenta)
 */
import { createClient, printResult, printError } from './helpers.js';

async function main() {
  console.log('=== BIND PSP — Test Saldo ===\n');

  const accountId = process.env.BIND_TEST_ACCOUNT_ID;
  if (!accountId) {
    console.error('  [ERROR] Falta BIND_TEST_ACCOUNT_ID en .env');
    console.error('  Primero corre: npm run test:create-account');
    console.error('  Luego agrega BIND_TEST_ACCOUNT_ID=<id> a tu .env\n');
    process.exit(1);
  }

  const client = createClient();

  console.log(`Consultando saldo para cuenta: ${accountId}...`);

  try {
    const result = await client.accounts.getBalance(accountId);
    printResult('Saldo actual', {
      accountId,
      ...result,
      formatted: `$${result.saldo.toLocaleString('es-AR')} ARS`,
    });
  } catch (err) {
    printError('Error consultando saldo', err);
  }
}

main();
