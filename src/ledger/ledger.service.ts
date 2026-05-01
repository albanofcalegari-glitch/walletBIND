import { PrismaClient, Prisma, TransactionType, TransactionStatus } from '@prisma/client';

interface PostEntryPair {
  debitWalletId: string;
  creditWalletId: string;
  amount: Prisma.Decimal | number;
}

interface CreateTransactionInput {
  idempotencyKey: string;
  type: TransactionType;
  description?: string;
  metadata?: Prisma.InputJsonValue;
  entries: PostEntryPair[];
}

export class LedgerService {
  constructor(private prisma: PrismaClient) {}

  async postTransaction(input: CreateTransactionInput) {
    const existing = await this.prisma.transaction.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
      include: { entries: true },
    });
    if (existing) return existing;

    return this.prisma.$transaction(async (tx) => {
      const ledgerEntries: Prisma.LedgerEntryCreateManyInput[] = [];

      for (const pair of input.entries) {
        const amount = new Prisma.Decimal(pair.amount.toString());
        if (amount.lte(0)) throw new Error('Amount must be positive');

        // Lock wallets in consistent order to prevent deadlocks
        const [walletA, walletB] = pair.debitWalletId < pair.creditWalletId
          ? [pair.debitWalletId, pair.creditWalletId]
          : [pair.creditWalletId, pair.debitWalletId];

        await tx.$queryRawUnsafe(
          `SELECT id FROM wallets WHERE id IN ($1, $2) FOR UPDATE`,
          walletA, walletB,
        );

        const debitWallet = await tx.wallet.findUniqueOrThrow({
          where: { id: pair.debitWalletId },
        });
        const creditWallet = await tx.wallet.findUniqueOrThrow({
          where: { id: pair.creditWalletId },
        });

        // Company wallets cannot go negative
        if (debitWallet.type === 'COMPANY') {
          const newBalance = debitWallet.cachedBalance.sub(amount);
          if (newBalance.lt(0)) {
            throw new Error(
              `Insufficient funds in wallet ${debitWallet.id}: ` +
              `balance=${debitWallet.cachedBalance}, amount=${amount}`,
            );
          }
        }

        const debitBalanceAfter = debitWallet.cachedBalance.sub(amount);
        const creditBalanceAfter = creditWallet.cachedBalance.add(amount);

        await tx.wallet.update({
          where: { id: pair.debitWalletId },
          data: { cachedBalance: debitBalanceAfter },
        });
        await tx.wallet.update({
          where: { id: pair.creditWalletId },
          data: { cachedBalance: creditBalanceAfter },
        });

        ledgerEntries.push(
          {
            entryType: 'DEBIT',
            amount,
            balanceAfter: debitBalanceAfter,
            walletId: pair.debitWalletId,
            transactionId: '',  // placeholder, filled below
          },
          {
            entryType: 'CREDIT',
            amount,
            balanceAfter: creditBalanceAfter,
            walletId: pair.creditWalletId,
            transactionId: '',
          },
        );
      }

      const transaction = await tx.transaction.create({
        data: {
          idempotencyKey: input.idempotencyKey,
          type: input.type,
          status: TransactionStatus.COMPLETED,
          description: input.description,
          metadata: input.metadata ?? Prisma.JsonNull,
          completedAt: new Date(),
        },
      });

      for (const entry of ledgerEntries) {
        entry.transactionId = transaction.id;
      }

      await tx.ledgerEntry.createMany({ data: ledgerEntries });

      return tx.transaction.findUniqueOrThrow({
        where: { id: transaction.id },
        include: { entries: true },
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  }

  async getWalletBalance(walletId: string) {
    const wallet = await this.prisma.wallet.findUniqueOrThrow({
      where: { id: walletId },
    });
    return wallet.cachedBalance;
  }

  async getWalletEntries(walletId: string, options?: {
    limit?: number;
    offset?: number;
    from?: Date;
    to?: Date;
  }) {
    return this.prisma.ledgerEntry.findMany({
      where: {
        walletId,
        ...(options?.from || options?.to ? {
          createdAt: {
            ...(options.from ? { gte: options.from } : {}),
            ...(options.to ? { lte: options.to } : {}),
          },
        } : {}),
      },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });
  }

  async verifyIntegrity(): Promise<{
    ok: boolean;
    totalDebits: Prisma.Decimal;
    totalCredits: Prisma.Decimal;
    diff: Prisma.Decimal;
  }> {
    const result = await this.prisma.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: { entryType: 'DEBIT' },
    });
    const totalDebits = result._sum.amount ?? new Prisma.Decimal(0);

    const result2 = await this.prisma.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: { entryType: 'CREDIT' },
    });
    const totalCredits = result2._sum.amount ?? new Prisma.Decimal(0);

    const diff = totalDebits.sub(totalCredits).abs();

    return {
      ok: diff.eq(0),
      totalDebits,
      totalCredits,
      diff,
    };
  }
}
