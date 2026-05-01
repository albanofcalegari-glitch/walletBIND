import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async listByCompany(companyId: string) {
    return this.prisma.wallet.findMany({
      where: { companyId, type: 'COMPANY', status: { not: 'CLOSED' } },
      select: {
        id: true,
        cvu: true,
        alias: true,
        currency: true,
        cachedBalance: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getBalance(walletId: string, companyId: string) {
    const wallet = await this.prisma.wallet.findUniqueOrThrow({
      where: { id: walletId },
    });
    if (wallet.companyId !== companyId) throw new ForbiddenException();
    return { walletId: wallet.id, balance: wallet.cachedBalance, currency: wallet.currency };
  }

  async getMovements(walletId: string, companyId: string, options: {
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
  }) {
    const wallet = await this.prisma.wallet.findUniqueOrThrow({
      where: { id: walletId },
    });
    if (wallet.companyId !== companyId) throw new ForbiddenException();

    const page = options.page ?? 1;
    const limit = Math.min(options.limit ?? 20, 100);

    const where: any = { walletId };
    if (options.from || options.to) {
      where.createdAt = {};
      if (options.from) where.createdAt.gte = new Date(options.from);
      if (options.to) where.createdAt.lte = new Date(options.to);
    }

    const [entries, total] = await Promise.all([
      this.prisma.ledgerEntry.findMany({
        where,
        include: { transaction: { select: { type: true, description: true, status: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.ledgerEntry.count({ where }),
    ]);

    return {
      data: entries.map((e) => ({
        id: e.id,
        date: e.createdAt,
        type: e.transaction.type,
        description: e.transaction.description,
        amount: e.amount,
        sign: e.entryType === 'CREDIT' ? 'credit' : 'debit',
        balanceAfter: e.balanceAfter,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }
}
