/**
 * Test 6: Consultar transferencias
 * GET /cvucollectentidad-financial/v1/v1.201/banks/322/accounts/transfers
 *
 * Uso: npm run test:query-transfers
 */
import { createClient, printResult, printError } from './helpers.js';

async function main() {
  console.log('=== BIND PSP — Test Query Transfers ===\n');

  const client = createClient();

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const params = {
    fromDate: thirtyDaysAgo.toISOString().split('T')[0],
    toDate: today.toISOString().split('T')[0],
    start: 0,
    length: 20,
    type: 'TRANSFER' as const,
  };

  console.log('Query params:', JSON.stringify(params, null, 2));
  console.log('\nConsultando transferencias...');

  try {
    const result = await client.transfers.query(params);
    printResult('Transferencias', result);
  } catch (err) {
    printError('Error consultando transferencias', err);
  }
}

main();
