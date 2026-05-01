import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding walletBIND database...\n');

  // ── System wallets ──
  const externalWallet = await prisma.wallet.upsert({
    where: { systemCode: 'EXTERNAL' },
    update: {},
    create: {
      type: 'SYSTEM',
      systemCode: 'EXTERNAL',
      currency: 'ARS',
      cachedBalance: 0,
      status: 'ACTIVE',
    },
  });
  console.log(`  Wallet EXTERNAL: ${externalWallet.id}`);

  const platformWallet = await prisma.wallet.upsert({
    where: { systemCode: 'PLATFORM' },
    update: {},
    create: {
      type: 'SYSTEM',
      systemCode: 'PLATFORM',
      currency: 'ARS',
      cachedBalance: 0,
      status: 'ACTIVE',
    },
  });
  console.log(`  Wallet PLATFORM: ${platformWallet.id}`);

  // ── Demo company ──
  const demoCompany = await prisma.company.upsert({
    where: { cuit: '30-99999999-9' },
    update: {},
    create: {
      name: 'Demo Corp',
      cuit: '30-99999999-9',
      legalName: 'Demo Corp SRL',
      email: 'admin@democorp.test',
      status: 'ACTIVE',
    },
  });
  console.log(`  Company Demo: ${demoCompany.id}`);

  // ── Demo company wallet ──
  const demoWallet = await prisma.wallet.upsert({
    where: { systemCode: 'DEMO_COMPANY' },
    update: {},
    create: {
      type: 'COMPANY',
      companyId: demoCompany.id,
      systemCode: 'DEMO_COMPANY',
      currency: 'ARS',
      cachedBalance: 0,
      status: 'ACTIVE',
    },
  });
  console.log(`  Wallet Demo: ${demoWallet.id}`);

  // ── Demo admin user ──
  const demoUser = await prisma.user.upsert({
    where: { email: 'admin@democorp.test' },
    update: {},
    create: {
      email: 'admin@democorp.test',
      password: '$2b$10$placeholder_hash_replace_with_real_bcrypt',
      name: 'Admin Demo',
      role: 'ADMIN',
      companyId: demoCompany.id,
    },
  });
  console.log(`  User Admin: ${demoUser.id}`);

  console.log('\nSeed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
