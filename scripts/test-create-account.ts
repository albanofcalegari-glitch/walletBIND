/**
 * Test 2: Crear cuenta/wallet en BIND PSP
 * POST /walletentidad-cuenta/v1/api/v1.201/Cuenta
 *
 * Uso: npm run test:create-account
 */
import { createClient, printResult, printError } from './helpers.js';
import type { CreateAccountRequest } from '../src/bind-client/types.js';

async function main() {
  console.log('=== BIND PSP — Test Crear Cuenta ===\n');

  const client = createClient();

  const testAccount: CreateAccountRequest = {
    cuitCuil: '20-99999999-9',
    nombre: 'Test',
    apellido: 'WalletBIND',
    razonSocial: 'WalletBIND Test SRL',
    email: 'test@walletbind.local',
    celular: '+5491100000000',
    fechaNacimiento: '1990-01-15',
    nacionalidad: 'AR',
    ocupacion: 'Testing',
    estadoCivil: 'Soltero',
    esPep: false,
    esFatca: false,
    esUif: false,
    datosDomicilio: {
      calle: 'Av. Test',
      numero: '1234',
      localidadId: 1,
      provinciaId: 1,
      cp: 'C1043',
    },
    codigo: `TEST-${Date.now()}`,
  };

  console.log('Datos de prueba:', JSON.stringify(testAccount, null, 2));
  console.log('\nCreando cuenta...');

  try {
    const result = await client.accounts.create(testAccount);
    printResult('Cuenta creada', result);
    console.log(`\n  Guarda este ID para los proximos tests: ${result.id}\n`);
  } catch (err) {
    printError('Error creando cuenta', err);
  }
}

main();
