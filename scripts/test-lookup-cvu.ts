/**
 * Test 4: Buscar cuenta por CBU/CVU o Alias
 * GET /walletentidad-cuenta/v1/api/v1.201/CuentaCVUByCbuCvuOrAlias
 *
 * Uso: npm run test:lookup-cvu
 * Env: BIND_TEST_CVU o BIND_TEST_ALIAS
 */
import { createClient, printResult, printError } from './helpers.js';

async function main() {
  console.log('=== BIND PSP — Test Lookup CBU/CVU/Alias ===\n');

  const cvu = process.env.BIND_TEST_CVU;
  const alias = process.env.BIND_TEST_ALIAS;

  if (!cvu && !alias) {
    console.error('  [ERROR] Falta BIND_TEST_CVU o BIND_TEST_ALIAS en .env');
    console.error('  Agrega al menos uno de los dos para buscar.\n');
    process.exit(1);
  }

  const client = createClient();

  console.log(`Buscando cuenta por ${cvu ? `CVU: ${cvu}` : `Alias: ${alias}`}...`);

  try {
    const result = await client.accounts.lookupByCbuCvuOrAlias({
      cbuOrCvu: cvu,
      alias: alias,
    });
    printResult('Cuenta encontrada', result);
  } catch (err) {
    printError('Error en lookup', err);
  }
}

main();
