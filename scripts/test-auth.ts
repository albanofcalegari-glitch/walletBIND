/**
 * Test 1: Autenticacion OAuth2 contra BIND PSP
 * Obtiene un Bearer token usando client_credentials.
 *
 * Uso: npm run test:auth
 */
import { createClient, printResult, printError } from './helpers.js';

async function main() {
  console.log('=== BIND PSP — Test Auth ===\n');
  console.log('Intentando obtener token OAuth2...');

  const client = createClient();

  try {
    const ok = await client.healthCheck();
    if (ok) {
      printResult('Auth exitoso', {
        status: 'OK',
        message: 'Token obtenido correctamente. Expira en ~60 min.',
        environment: process.env.BIND_ENV || 'staging',
      });
    } else {
      printError('Auth fallido', 'No se pudo obtener el token. Verifica credenciales en .env');
    }
  } catch (err) {
    printError('Auth fallido', err);
  }
}

main();
