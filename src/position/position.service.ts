import { PrismaClient } from '@prisma/client';
import type {
  ConsolidatedPosition,
  AccountSummary,
  CardSummary,
  CryptoSummary,
  RecentMovement,
} from './types';

export class PositionService {
  constructor(private prisma: PrismaClient) {}

  async getConsolidatedPosition(companyId: string): Promise<ConsolidatedPosition> {
    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
    });

    const wallets = await this.prisma.wallet.findMany({
      where: { companyId, type: 'COMPANY', status: { not: 'CLOSED' } },
      include: {
        cards: { where: { status: { not: 'CANCELLED' } } },
        cryptoHoldings: true,
      },
    });

    const walletIds = wallets.map((w) => w.id);

    // â”€â”€ Accounts â”€â”€
    const accounts: AccountSummary[] = wallets.map((w) => ({
      walletId: w.id,
      label: w.alias ?? `Cuenta ${w.currency}`,
      cvu: w.cvu,
      alias: w.alias,
      currency: w.currency,
      balance: Number(w.cachedBalance),
      status: w.status,
    }));

    // â”€â”€ Cards â”€â”€
    const cards: CardSummary[] = wallets.flatMap((w) =>
      w.cards.map((c) => ({
        cardId: c.id,
        lastFour: c.lastFour,
        brand: c.brand,
        cardType: c.cardType,
        cardName: c.cardName,
        holderName: c.holderName,
        dailyLimit: Number(c.dailyLimit),
        monthlyLimit: Number(c.monthlyLimit),
        spentToday: Number(c.spentToday),
        spentMonth: Number(c.spentMonth),
        availableDaily: Number(c.dailyLimit) - Number(c.spentToday),
        availableMonthly: Number(c.monthlyLimit) - Number(c.spentMonth),
        status: c.status,
      })),
    );

    // â”€â”€ Crypto â”€â”€
    const crypto: CryptoSummary[] = wallets.flatMap((w) =>
      w.cryptoHoldings.map((h) => ({
        symbol: h.symbol,
        amount: Number(h.amount),
        lastPrice: Number(h.lastPrice),
        valuationArs: Number(h.amount) * Number(h.lastPrice),
        lastPriceAt: h.lastPriceAt,
      })),
    );

    // â”€â”€ Recent movements (last 20 across all wallets) â”€â”€
    const recentEntries = walletIds.length > 0
      ? await this.prisma.ledgerEntry.findMany({
          where: { walletId: { in: walletIds } },
          include: {
            transaction: true,
            wallet: { select: { currency: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        })
      : [];

    const recentMovements: RecentMovement[] = recentEntries.map((e) => ({
      id: e.id,
      date: e.createdAt,
      type: e.transaction.type,
      description: e.transaction.description,
      amount: Number(e.amount),
      sign: e.entryType === 'CREDIT' ? 'credit' : 'debit',
      balanceAfter: Number(e.balanceAfter),
      walletCurrency: e.wallet.currency,
    }));

    // â”€â”€ Totals â”€â”€
    const totalArs = accounts
      .filter((a) => a.currency === 'ARS')
      .reduce((sum, a) => sum + a.balance, 0);

    const totalUsd = accounts
      .filter((a) => a.currency === 'USD')
      .reduce((sum, a) => sum + a.balance, 0);

    const totalCryptoArs = crypto.reduce((sum, c) => sum + c.valuationArs, 0);

    return {
      company: {
        id: company.id,
        name: company.name,
        cuit: company.cuit,
      },
      totals: {
        ars: totalArs,
        usd: totalUsd,
        crypto_ars: totalCryptoArs,
        total_ars: totalArs + totalCryptoArs,
      },
      accounts,
      cards,
      crypto,
      recentMovements,
      asOf: new Date(),
    };
  }

  async getAccountDetail(walletId: string, options?: {
    movementsLimit?: number;
    from?: Date;
    to?: Date;
  }) {
    const wallet = await this.prisma.wallet.findUniqueOrThrow({
      where: { id: walletId },
      include: {
        company: { select: { id: true, name: true } },
        cards: { where: { status: { not: 'CANCELLED' } } },
        cryptoHoldings: true,
      },
    });

    const entries = await this.prisma.ledgerEntry.findMany({
      where: {
        walletId,
        ...(options?.from || options?.to ? {
          createdAt: {
            ...(options?.from ? { gte: options.from } : {}),
            ...(options?.to ? { lte: options.to } : {}),
          },
        } : {}),
      },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
      take: options?.movementsLimit ?? 50,
    });

    return { wallet, entries };
  }

  async getCardsByCompany(companyId: string) {
    return this.prisma.card.findMany({
      where: {
        wallet: { companyId },
        status: { not: 'CANCELLED' },
      },
      include: {
        wallet: { select: { id: true, currency: true, cvu: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCryptoByCompany(companyId: string) {
    return this.prisma.cryptoHolding.findMany({
      where: { wallet: { companyId } },
      orderBy: { symbol: 'asc' },
    });
  }
}
