import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const hash = (pw: string) => bcrypt.hashSync(pw, 10);

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

  // ── Demo company: Acme Corp ──
  const acme = await prisma.company.upsert({
    where: { cuit: '30-71234567-9' },
    update: {},
    create: {
      name: 'Acme Corp',
      cuit: '30-71234567-9',
      legalName: 'Acme Corp SRL',
      email: 'admin@acmecorp.com.ar',
      phone: '+5411-4000-0001',
      address: 'Av. Corrientes 1234, CABA',
      status: 'ACTIVE',
    },
  });
  console.log(`  Company Acme: ${acme.id}`);

  // ── Acme ARS wallet ──
  const acmeArs = await prisma.wallet.upsert({
    where: { cvu: '0000322100000000000101' },
    update: {},
    create: {
      type: 'COMPANY',
      companyId: acme.id,
      cvu: '0000322100000000000101',
      alias: 'ACME.OPERATIVA.ARS',
      currency: 'ARS',
      cachedBalance: 850000,
      status: 'ACTIVE',
    },
  });
  console.log(`  Wallet Acme ARS: ${acmeArs.id}`);

  // ── Acme USD wallet ──
  const acmeUsd = await prisma.wallet.upsert({
    where: { cvu: '0000322100000000000102' },
    update: {},
    create: {
      type: 'COMPANY',
      companyId: acme.id,
      cvu: '0000322100000000000102',
      alias: 'ACME.DOLARES.USD',
      currency: 'USD',
      cachedBalance: 420,
      status: 'ACTIVE',
    },
  });
  console.log(`  Wallet Acme USD: ${acmeUsd.id}`);

  // ── Users ──
  const admin = await prisma.user.upsert({
    where: { email: 'admin@acmecorp.com.ar' },
    update: {},
    create: {
      email: 'admin@acmecorp.com.ar',
      password: hash('123456'),
      name: 'Martin Gonzalez',
      role: 'ADMIN',
      companyId: acme.id,
    },
  });

  const juan = await prisma.user.upsert({
    where: { email: 'juan.perez@acmecorp.com.ar' },
    update: {},
    create: {
      email: 'juan.perez@acmecorp.com.ar',
      password: hash('123456'),
      name: 'Juan Perez',
      role: 'OPERATOR',
      companyId: acme.id,
    },
  });

  const ana = await prisma.user.upsert({
    where: { email: 'ana.garcia@acmecorp.com.ar' },
    update: {},
    create: {
      email: 'ana.garcia@acmecorp.com.ar',
      password: hash('123456'),
      name: 'Ana Garcia',
      role: 'OPERATOR',
      companyId: acme.id,
    },
  });

  const carlos = await prisma.user.upsert({
    where: { email: 'carlos.ruiz@acmecorp.com.ar' },
    update: {},
    create: {
      email: 'carlos.ruiz@acmecorp.com.ar',
      password: hash('123456'),
      name: 'Carlos Ruiz',
      role: 'VIEWER',
      companyId: acme.id,
    },
  });
  console.log(`  Users: admin + 3 employees`);

  // ── Corporate cards ──
  await prisma.card.createMany({
    skipDuplicates: true,
    data: [
      {
        walletId: acmeArs.id,
        lastFour: '4589',
        brand: 'VISA',
        cardType: 'VIRTUAL',
        cardName: 'Gastos operativos',
        holderName: 'Juan Perez',
        holderEmail: 'juan.perez@acmecorp.com.ar',
        assignedTo: juan.id,
        dailyLimit: new Prisma.Decimal(100000),
        monthlyLimit: new Prisma.Decimal(500000),
        spentToday: new Prisma.Decimal(23500),
        spentMonth: new Prisma.Decimal(187000),
        status: 'ACTIVE',
      },
      {
        walletId: acmeArs.id,
        lastFour: '7812',
        brand: 'MASTERCARD',
        cardType: 'PHYSICAL',
        cardName: 'Viajes y representacion',
        holderName: 'Ana Garcia',
        holderEmail: 'ana.garcia@acmecorp.com.ar',
        assignedTo: ana.id,
        dailyLimit: new Prisma.Decimal(50000),
        monthlyLimit: new Prisma.Decimal(200000),
        spentToday: new Prisma.Decimal(0),
        spentMonth: new Prisma.Decimal(45200),
        status: 'ACTIVE',
      },
      {
        walletId: acmeArs.id,
        lastFour: '3201',
        brand: 'VISA',
        cardType: 'VIRTUAL',
        cardName: 'Software y suscripciones',
        holderName: 'Carlos Ruiz',
        holderEmail: 'carlos.ruiz@acmecorp.com.ar',
        assignedTo: carlos.id,
        dailyLimit: new Prisma.Decimal(25000),
        monthlyLimit: new Prisma.Decimal(75000),
        spentToday: new Prisma.Decimal(0),
        spentMonth: new Prisma.Decimal(12800),
        status: 'ACTIVE',
      },
    ],
  });
  console.log(`  Cards: 3 corporate cards created`);

  // ── Crypto holdings ──
  await prisma.cryptoHolding.createMany({
    skipDuplicates: true,
    data: [
      {
        walletId: acmeArs.id,
        symbol: 'BTC',
        amount: new Prisma.Decimal('0.00500000'),
        lastPrice: new Prisma.Decimal(95000000),
        lastPriceAt: new Date(),
      },
      {
        walletId: acmeArs.id,
        symbol: 'USDT',
        amount: new Prisma.Decimal('1200.00000000'),
        lastPrice: new Prisma.Decimal(1180),
        lastPriceAt: new Date(),
      },
      {
        walletId: acmeArs.id,
        symbol: 'ETH',
        amount: new Prisma.Decimal('0.75000000'),
        lastPrice: new Prisma.Decimal(3800000),
        lastPriceAt: new Date(),
      },
    ],
  });
  console.log(`  Crypto: BTC + USDT + ETH holdings`);

  // ── Sample ledger entries (simulating recent activity) ──
  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  const tx1 = await prisma.transaction.create({
    data: {
      idempotencyKey: 'SEED-FUND-001',
      type: 'FUNDING',
      status: 'COMPLETED',
      description: 'Ingreso DEBIN desde Santander',
      completedAt: daysAgo(3),
      createdAt: daysAgo(3),
      entries: {
        create: [
          { entryType: 'DEBIT', amount: 500000, balanceAfter: -500000, walletId: externalWallet.id, createdAt: daysAgo(3) },
          { entryType: 'CREDIT', amount: 500000, balanceAfter: 500000, walletId: acmeArs.id, createdAt: daysAgo(3) },
        ],
      },
    },
  });

  const tx2 = await prisma.transaction.create({
    data: {
      idempotencyKey: 'SEED-EXT-001',
      type: 'EXTERNAL',
      status: 'COMPLETED',
      description: 'Pago a Proveedor Logistica SRL',
      completedAt: daysAgo(2),
      createdAt: daysAgo(2),
      entries: {
        create: [
          { entryType: 'DEBIT', amount: 120000, balanceAfter: 380000, walletId: acmeArs.id, createdAt: daysAgo(2) },
          { entryType: 'CREDIT', amount: 120000, balanceAfter: -380000, walletId: externalWallet.id, createdAt: daysAgo(2) },
        ],
      },
    },
  });

  const tx3 = await prisma.transaction.create({
    data: {
      idempotencyKey: 'SEED-FEE-001',
      type: 'FEE',
      status: 'COMPLETED',
      description: 'Comision plataforma - Mayo 2026',
      completedAt: daysAgo(1),
      createdAt: daysAgo(1),
      entries: {
        create: [
          { entryType: 'DEBIT', amount: 500, balanceAfter: 379500, walletId: acmeArs.id, createdAt: daysAgo(1) },
          { entryType: 'CREDIT', amount: 500, balanceAfter: 500, walletId: platformWallet.id, createdAt: daysAgo(1) },
        ],
      },
    },
  });

  const tx4 = await prisma.transaction.create({
    data: {
      idempotencyKey: 'SEED-FUND-002',
      type: 'FUNDING',
      status: 'COMPLETED',
      description: 'Ingreso transferencia Galicia',
      completedAt: daysAgo(0),
      createdAt: daysAgo(0),
      entries: {
        create: [
          { entryType: 'DEBIT', amount: 470500, balanceAfter: -470500 + 380000, walletId: externalWallet.id, createdAt: daysAgo(0) },
          { entryType: 'CREDIT', amount: 470500, balanceAfter: 850000, walletId: acmeArs.id, createdAt: daysAgo(0) },
        ],
      },
    },
  });
  console.log(`  Transactions: 4 sample movements`);

  // ── Second company: TechVentures ──
  const techv = await prisma.company.upsert({
    where: { cuit: '30-78901234-5' },
    update: {},
    create: {
      name: 'TechVentures',
      cuit: '30-78901234-5',
      legalName: 'TechVentures SA',
      email: 'ops@techventures.com.ar',
      status: 'ACTIVE',
    },
  });

  const techvWallet = await prisma.wallet.upsert({
    where: { cvu: '0000322100000000000201' },
    update: {},
    create: {
      type: 'COMPANY',
      companyId: techv.id,
      cvu: '0000322100000000000201',
      alias: 'TECHV.OPS.ARS',
      currency: 'ARS',
      cachedBalance: 320000,
      status: 'ACTIVE',
    },
  });

  await prisma.user.upsert({
    where: { email: 'ops@techventures.com.ar' },
    update: {},
    create: {
      email: 'ops@techventures.com.ar',
      password: hash('123456'),
      name: 'Laura Martinez',
      role: 'ADMIN',
      companyId: techv.id,
    },
  });
  console.log(`  Company TechVentures + wallet + admin`);

  console.log('\n  Seed completed.\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
