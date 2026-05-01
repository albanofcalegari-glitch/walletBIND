import 'dotenv/config';
import { BindClient, type BindClientConfig, type BindEnvironment } from '../src/bind-client/index.js';

export function getConfig(): BindClientConfig {
  const env = (process.env.BIND_ENV || 'staging') as BindEnvironment;
  return {
    environment: env,
    authUrl: requireEnv('BIND_AUTH_URL'),
    clientId: requireEnv('BIND_CLIENT_ID'),
    clientSecret: requireEnv('BIND_CLIENT_SECRET'),
  };
}

export function createClient(): BindClient {
  return new BindClient(getConfig());
}

export function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val || val.startsWith('your_')) {
    console.error(`\n  [ERROR] Falta configurar ${key} en .env`);
    console.error(`  Copia .env.example a .env y completa con las credenciales de BIND.\n`);
    process.exit(1);
  }
  return val;
}

export function printResult(label: string, data: unknown): void {
  console.log(`\n── ${label} ──`);
  console.log(JSON.stringify(data, null, 2));
}

export function printError(label: string, err: unknown): void {
  console.error(`\n[ERROR] ${label}`);
  if (err instanceof Error) {
    console.error(err.message);
    if ('response' in err) {
      const axErr = err as any;
      console.error('Status:', axErr.response?.status);
      console.error('Data:', JSON.stringify(axErr.response?.data, null, 2));
    }
  } else {
    console.error(err);
  }
}
